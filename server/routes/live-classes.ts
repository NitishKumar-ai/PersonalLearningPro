import { Router, Request, Response } from "express";
import { authenticateToken } from "../routes"; // Will use existing auth middleware
import { MongoLiveClass, getNextSequenceValue } from "@shared/mongo-schema";
import { insertLiveClassSchema } from "@shared/schema";
import { storage } from "../storage";
import { createMeeting, getJoinUrl } from "../lib/bbb";

const router = Router();

// GET /api/live-classes
// List live classes (Teachers see their own + school's, Students see their class's)
router.get("/", authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await storage.getUser(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let classes;
        if (user.role === "teacher") {
            // Teachers see the classes they've created
            classes = await MongoLiveClass.find({ teacherId: user.id }).sort({ scheduledTime: 1 });
        } else {
            // Students see classes assigned to their subject/class
            if (!user.class) {
                return res.status(400).json({ message: "User class not set" });
            }
            classes = await MongoLiveClass.find({ class: user.class }).sort({ scheduledTime: 1 });
        }

        res.json(classes);
    } catch (error) {
        console.error("Error fetching live classes:", error);
        res.status(500).json({ message: "Failed to fetch live classes" });
    }
});

// POST /api/live-classes
// Create a new scheduled live class (Teachers only)
router.post("/", authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await storage.getUser(req.session.userId);
        if (!user || user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can schedule live classes" });
        }

        const validData = insertLiveClassSchema.parse(req.body);
        const numericId = await getNextSequenceValue("liveClassId");

        // Generate secure passwords and meeting ID
        const meetingId = `class-${numericId}-${Date.now()}`;
        const moderatorPassword = Math.random().toString(36).substring(2, 10);
        const attendeePassword = Math.random().toString(36).substring(2, 10);

        const liveClass = new MongoLiveClass({
            id: numericId,
            ...validData,
            teacherId: user.id,
            meetingId,
            moderatorPassword,
            attendeePassword
        });

        await liveClass.save();

        res.status(201).json(liveClass);
    } catch (error) {
        console.error("Error creating live class:", error);
        res.status(500).json({ message: "Failed to create live class" });
    }
});

// POST /api/live-classes/:id/start
// Start the scheduled meeting on BBB (Teachers only)
router.post("/:id/start", authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const liveClassId = parseInt(req.params.id);
        const liveClass = await MongoLiveClass.findOne({ id: liveClassId });

        if (!liveClass) {
            return res.status(404).json({ message: "Live class not found" });
        }

        if (liveClass.teacherId !== req.session.userId) {
            return res.status(403).json({ message: "Not your live class" });
        }

        // Call BBB to create meeting
        const bbbResponse = await createMeeting(
            liveClass.meetingId as string,
            liveClass.title as string,
            liveClass.attendeePassword as string,
            liveClass.moderatorPassword as string,
            `Welcome to ${liveClass.title}!`
        );

        if (bbbResponse.success) {
            liveClass.status = "live";
            await liveClass.save();

            const teacher = await storage.getUser(req.session.userId);
            const joinUrl = getJoinUrl(
                liveClass.meetingId as string,
                teacher?.name || 'Teacher',
                liveClass.moderatorPassword as string,
                'moderator'
            );

            return res.json({ joinUrl });
        } else {
            return res.status(500).json({ message: "Failed to start meeting on BigBlueButton" });
        }
    } catch (error) {
        console.error("Error starting live class:", error);
        res.status(500).json({ message: "Failed to start live class" });
    }
});

// GET /api/live-classes/:id/join
// Join an active meeting (Students & Teachers)
router.get("/:id/join", authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.session?.userId) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const liveClassId = parseInt(req.params.id);
        const liveClass = await MongoLiveClass.findOne({ id: liveClassId });

        if (!liveClass) {
            return res.status(404).json({ message: "Live class not found" });
        }

        const user = await storage.getUser(req.session.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        let joinUrl = "";

        if (user.role === "teacher" && liveClass.teacherId === user.id) {
            // Teacher joins as moderator
            joinUrl = getJoinUrl(
                liveClass.meetingId as string,
                user.name,
                liveClass.moderatorPassword as string,
                'moderator'
            );
        } else {
            // Standard student check
            if (user.role === "student" && user.class !== liveClass.class) {
                return res.status(403).json({ message: "This class is not for your section" });
            }

            if (liveClass.status !== "live") {
                return res.status(400).json({ message: "This class hasn't started yet" });
            }

            // Student joins as attendee
            joinUrl = getJoinUrl(
                liveClass.meetingId as string,
                user.name,
                liveClass.attendeePassword as string,
                'attendee'
            );
        }

        res.json({ joinUrl });
    } catch (error) {
        console.error("Error joining live class:", error);
        res.status(500).json({ message: "Failed to join live class" });
    }
});

export default router;
