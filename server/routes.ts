import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTestSchema, insertQuestionSchema, insertTestAttemptSchema, insertAnswerSchema, insertAnalyticsSchema, insertWorkspaceSchema, insertChannelSchema, insertMessageSchema, type Channel } from "@shared/schema";
import { z } from "zod";
import { processOCRImage } from "./lib/tesseract";
import { evaluateSubjectiveAnswer, aiChat, generateStudyPlan, analyzeTestPerformance } from "./lib/openai";
import { upload, diskPathToUrl } from "./lib/upload";
import { verifyFirebaseToken } from "./lib/firebase-admin";
import { MongoUser, MongoWorkspace, MongoChannel } from "@shared/mongo-schema";
import { getNextSequenceValue } from "@shared/mongo-schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Create user
      const user = await storage.createUser(userData);

      // Don't return the password
      const { password, ...userWithoutPassword } = user;

      // Set session
      if (req.session) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
      }

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);

      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      if (req.session) {
        req.session.userId = user.id;
        req.session.userRole = user.role;
      }

      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session?.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // User routes
  app.get("/api/users/me", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return the password
      const { password, ...userWithoutPassword } = user;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Test routes
  app.post("/api/tests", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId || req.session.userRole !== "teacher") {
        return res.status(401).json({ message: "Unauthorized: Only teachers can create tests" });
      }

      const testData = insertTestSchema.parse(req.body);

      // Ensure the teacher is creating their own test
      if (testData.teacherId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Can only create tests for yourself" });
      }

      const test = await storage.createTest(testData);

      res.status(201).json(test);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test" });
    }
  });

  app.get("/api/tests", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { teacherId, status } = req.query;

      // Convert teacherId to number if it exists
      const teacherIdNum = teacherId ? parseInt(teacherId as string) : undefined;

      // For teachers: get their own tests or all tests if admin
      // For students: get tests for their class
      let tests;
      if (req.session.userRole === "teacher") {
        tests = await storage.getTests(
          teacherIdNum || req.session.userId,
          status as string | undefined
        );
      } else {
        // Get user to find their class
        const user = await storage.getUser(req.session.userId);
        if (!user || !user.class) {
          return res.status(400).json({ message: "User class not found" });
        }

        // Get tests for the student's class
        tests = await storage.getTestsByClass(user.class);

        // Filter by status if provided
        if (status) {
          tests = tests.filter(test => test.status === status);
        }
      }

      res.status(200).json(tests);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tests" });
    }
  });

  app.get("/api/tests/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const testId = parseInt(req.params.id);

      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }

      const test = await storage.getTest(testId);

      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      // Check if user has access to this test
      if (req.session.userRole === "teacher" && test.teacherId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Not your test" });
      } else if (req.session.userRole === "student") {
        // Get user to check their class
        const user = await storage.getUser(req.session.userId);

        if (!user || user.class !== test.class) {
          return res.status(403).json({ message: "Forbidden: Not your class's test" });
        }
      }

      res.status(200).json(test);
    } catch (error) {
      res.status(500).json({ message: "Failed to get test" });
    }
  });

  app.patch("/api/tests/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId || req.session.userRole !== "teacher") {
        return res.status(401).json({ message: "Unauthorized: Only teachers can update tests" });
      }

      const testId = parseInt(req.params.id);

      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }

      const test = await storage.getTest(testId);

      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      // Check if user owns this test
      if (test.teacherId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Not your test" });
      }

      // Validate the update data
      const updateData = insertTestSchema.partial().parse(req.body);

      // Update test
      const updatedTest = await storage.updateTest(testId, updateData);

      res.status(200).json(updatedTest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update test" });
    }
  });

  // Question routes
  app.post("/api/questions", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId || req.session.userRole !== "teacher") {
        return res.status(401).json({ message: "Unauthorized: Only teachers can create questions" });
      }

      const questionData = insertQuestionSchema.parse(req.body);

      // Check if teacher owns the test
      const test = await storage.getTest(questionData.testId);

      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      if (test.teacherId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Not your test" });
      }

      const question = await storage.createQuestion(questionData);

      res.status(201).json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  app.get("/api/tests/:testId/questions", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const testId = parseInt(req.params.testId);

      if (isNaN(testId)) {
        return res.status(400).json({ message: "Invalid test ID" });
      }

      const test = await storage.getTest(testId);

      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      // Check if user has access to this test
      if (req.session.userRole === "teacher" && test.teacherId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Not your test" });
      } else if (req.session.userRole === "student") {
        // Get user to check their class
        const user = await storage.getUser(req.session.userId);

        if (!user || user.class !== test.class) {
          return res.status(403).json({ message: "Forbidden: Not your class's test" });
        }
      }

      const questions = await storage.getQuestionsByTest(testId);

      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get questions" });
    }
  });

  // Test Attempt routes
  app.post("/api/test-attempts", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId || req.session.userRole !== "student") {
        return res.status(401).json({ message: "Unauthorized: Only students can attempt tests" });
      }

      const attemptData = insertTestAttemptSchema.parse(req.body);

      // Ensure the student is creating their own attempt
      if (attemptData.studentId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Can only create attempts for yourself" });
      }

      // Check if test exists and is available for this student
      const test = await storage.getTest(attemptData.testId);

      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      if (test.status !== "published") {
        return res.status(400).json({ message: "Test is not published yet" });
      }

      // Check if student's class matches test class
      const student = await storage.getUser(req.session.userId);

      if (!student || student.class !== test.class) {
        return res.status(403).json({ message: "Forbidden: Test not available for your class" });
      }

      // Check if student already has an attempt for this test
      const existingAttempts = await storage.getTestAttemptsByStudent(req.session.userId);
      const hasAttempt = existingAttempts.some(attempt =>
        attempt.testId === attemptData.testId &&
        attempt.status !== "completed"
      );

      if (hasAttempt) {
        return res.status(400).json({ message: "You already have an in-progress attempt for this test" });
      }

      const attempt = await storage.createTestAttempt(attemptData);

      res.status(201).json(attempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create test attempt" });
    }
  });

  app.patch("/api/test-attempts/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const attemptId = parseInt(req.params.id);

      if (isNaN(attemptId)) {
        return res.status(400).json({ message: "Invalid attempt ID" });
      }

      const attempt = await storage.getTestAttempt(attemptId);

      if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
      }

      // Check if user owns this attempt or is the teacher for this test
      if (req.session.userRole === "student" && attempt.studentId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Not your attempt" });
      } else if (req.session.userRole === "teacher") {
        const test = await storage.getTest(attempt.testId);

        if (!test || test.teacherId !== req.session.userId) {
          return res.status(403).json({ message: "Forbidden: Not your test" });
        }
      }

      // Validate the update data
      const updateData = insertTestAttemptSchema.partial().parse(req.body);

      // Update attempt
      const updatedAttempt = await storage.updateTestAttempt(attemptId, updateData);

      res.status(200).json(updatedAttempt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update test attempt" });
    }
  });

  // Answer routes
  app.post("/api/answers", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId || req.session.userRole !== "student") {
        return res.status(401).json({ message: "Unauthorized: Only students can submit answers" });
      }

      const answerData = insertAnswerSchema.parse(req.body);

      // Check if attempt exists and belongs to student
      const attempt = await storage.getTestAttempt(answerData.attemptId);

      if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
      }

      if (attempt.studentId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Not your test attempt" });
      }

      if (attempt.status === "completed") {
        return res.status(400).json({ message: "Test attempt is already completed" });
      }

      // Get question to check type
      const question = await storage.getQuestion(answerData.questionId);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // For MCQ questions, automatically evaluate answer
      if (question.type === "mcq" && answerData.selectedOption != null) {
        const isCorrect = answerData.selectedOption.toString() === question.correctAnswer;
        answerData.isCorrect = isCorrect;
        answerData.score = isCorrect ? question.marks : 0;
      }

      const answer = await storage.createAnswer(answerData);

      res.status(201).json(answer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit answer" });
    }
  });

  // OCR routes
  app.post("/api/ocr", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { imageData } = req.body;

      if (!imageData) {
        return res.status(400).json({ message: "Image data is required" });
      }

      // Process image with OCR
      const result = await processOCRImage(imageData);

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: "Failed to process OCR" });
    }
  });

  // AI evaluation routes
  app.post("/api/evaluate", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId || req.session.userRole !== "teacher") {
        return res.status(401).json({ message: "Unauthorized: Only teachers can evaluate answers" });
      }

      const { answerId } = req.body;

      if (!answerId) {
        return res.status(400).json({ message: "Answer ID is required" });
      }

      // Get answer
      const answer = await storage.getAnswer(answerId);

      if (!answer) {
        return res.status(404).json({ message: "Answer not found" });
      }

      // Get question for rubric
      const question = await storage.getQuestion(answer.questionId);

      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }

      // Get attempt to check test
      const attempt = await storage.getTestAttempt(answer.attemptId);

      if (!attempt) {
        return res.status(404).json({ message: "Test attempt not found" });
      }

      // Get test to check teacher
      const test = await storage.getTest(attempt.testId);

      if (!test) {
        return res.status(404).json({ message: "Test not found" });
      }

      // Check if user is the teacher for this test
      if (test.teacherId !== req.session.userId) {
        return res.status(403).json({ message: "Forbidden: Not your test" });
      }

      let text: string = answer.text ?? "";

      // If we have OCR text, use that
      if (answer.ocrText) {
        text = answer.ocrText;
      }

      // Evaluate with AI
      const evaluation = await evaluateSubjectiveAnswer(
        text,
        question.text,
        question.aiRubric || "Score based on accuracy and completeness",
        question.marks
      );

      // Update answer with AI evaluation
      const updatedAnswer = await storage.updateAnswer(answerId, {
        score: evaluation.score,
        aiConfidence: evaluation.confidence,
        aiFeedback: evaluation.feedback
      });

      res.status(200).json(updatedAnswer);
    } catch (error) {
      res.status(500).json({ message: "Failed to evaluate answer" });
    }
  });

  // AI Chat route
  app.post("/api/ai-chat", async (req: Request, res: Response) => {
    try {
      // No longer relying on session auth, Firebase auth is handled client-side
      // We'll add Firebase verification middleware later if needed

      const { messages } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Invalid messages format" });
      }

      const response = await aiChat(messages);

      res.status(200).json(response);
    } catch (error) {
      console.error("AI chat error:", error);
      res.status(500).json({ message: "Failed to generate AI response" });
    }
  });

  // ─── Chat: Workspace routes ───────────────────────────────────────────────────

  // POST /api/workspaces — Create a new workspace
  app.post("/api/workspaces", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const body = insertWorkspaceSchema.parse({
        ...req.body,
        ownerId: req.session.userId,
        members: [],
      });

      const workspace = await storage.createWorkspace(body);
      return res.status(201).json(workspace);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: error.errors });
      return res.status(500).json({ message: "Failed to create workspace" });
    }
  });

  // GET /api/workspaces — List workspaces the current user belongs to
  app.get("/api/workspaces", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const workspaces = await storage.getWorkspaces(req.session.userId);
      return res.status(200).json(workspaces);
    } catch {
      return res.status(500).json({ message: "Failed to fetch workspaces" });
    }
  });

  // GET /api/workspaces/:id — Get a single workspace
  app.get("/api/workspaces/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const workspace = await storage.getWorkspace(parseInt(req.params.id));
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });
      if (!workspace.members.includes(req.session.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      return res.status(200).json(workspace);
    } catch {
      return res.status(500).json({ message: "Failed to fetch workspace" });
    }
  });

  // POST /api/workspaces/:id/members — Add a member (teacher or owner only)
  app.post("/api/workspaces/:id/members", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });

      // Only owner or teacher can add members
      if (workspace.ownerId !== req.session.userId && req.session.userRole !== "teacher") {
        return res.status(403).json({ message: "Only the workspace owner or teachers can add members" });
      }

      const { userId } = req.body;
      if (!userId || typeof userId !== "number") {
        return res.status(400).json({ message: "userId (number) is required" });
      }

      const updated = await storage.addMemberToWorkspace(workspaceId, userId);
      return res.status(200).json(updated);
    } catch {
      return res.status(500).json({ message: "Failed to add member" });
    }
  });

  // DELETE /api/workspaces/:id/members/:userId — Remove a member (teacher or owner)
  app.delete("/api/workspaces/:id/members/:userId", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const workspaceId = parseInt(req.params.id);
      const targetUserId = parseInt(req.params.userId);

      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });

      if (workspace.ownerId !== req.session.userId && req.session.userRole !== "teacher") {
        return res.status(403).json({ message: "Only the workspace owner or teachers can remove members" });
      }

      const updated = await storage.removeMemberFromWorkspace(workspaceId, targetUserId);
      return res.status(200).json(updated);
    } catch {
      return res.status(500).json({ message: "Failed to remove member" });
    }
  });

  // ─── Chat: Channel routes ───────────────────────────────────────────────────

  // POST /api/workspaces/:id/channels — Create a channel (teachers only)
  app.post("/api/workspaces/:id/channels", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      if (req.session.userRole !== "teacher") {
        return res.status(403).json({ message: "Only teachers can create channels" });
      }

      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });
      if (!workspace.members.includes(req.session.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const body = insertChannelSchema.parse({ ...req.body, workspaceId });
      const channel = await storage.createChannel(body);
      return res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: error.errors });
      return res.status(500).json({ message: "Failed to create channel" });
    }
  });

  // GET /api/workspaces/:id/channels — List channels in a workspace
  app.get("/api/workspaces/:id/channels", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const workspaceId = parseInt(req.params.id);
      const workspace = await storage.getWorkspace(workspaceId);
      if (!workspace) return res.status(404).json({ message: "Workspace not found" });
      if (!workspace.members.includes(req.session.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }
      const channels = await storage.getChannelsByWorkspace(workspaceId);
      return res.status(200).json(channels);
    } catch {
      return res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // ─── Chat: Message routes ───────────────────────────────────────────────────

  // GET /api/channels/:id/messages — Paginated message history
  app.get("/api/channels/:id/messages", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const channelId = parseInt(req.params.id);
      const channel = await storage.getChannel(channelId);
      if (!channel) return res.status(404).json({ message: "Channel not found" });

      if (channel.workspaceId === null || channel.workspaceId === undefined) return res.status(403).json({ message: "Access denied" });
      const workspace = await storage.getWorkspace(channel.workspaceId);
      if (!workspace || !workspace.members.includes(req.session.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const before = req.query.before ? parseInt(req.query.before as string) : undefined;

      const messages = await storage.getMessagesByChannel(channelId, limit, before);
      return res.status(200).json(messages);
    } catch {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // GET /api/messages/:channelId — Alias for channel messages used by frontend
  app.get("/api/messages/:channelId", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const channelId = parseInt(req.params.channelId);
      const channel = await storage.getChannel(channelId);
      if (!channel) return res.status(404).json({ message: "Channel not found" });

      if (channel.type !== "dm") {
        if (!channel.workspaceId) return res.status(403).json({ message: "Access denied" });
        const workspace = await storage.getWorkspace(channel.workspaceId);
        if (!workspace || !workspace.members.includes(req.session.userId)) {
          return res.status(403).json({ message: "Access denied" });
        }
      } else {
        // DM check: name is dm_ID1_ID2
        if (!channel.name.includes(req.session.userId.toString())) {
          return res.status(403).json({ message: "Access denied" });
        }
      }

      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const before = req.query.before ? parseInt(req.query.before as string) : undefined;

      const messages = await storage.getMessagesByChannel(channelId, limit, before);
      return res.status(200).json(messages);
    } catch {
      return res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // POST /api/messages — Send message via HTTP
  app.post("/api/messages", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const body = insertMessageSchema.parse({
        ...req.body,
        authorId: req.session.userId,
      });

      const message = await storage.createMessage(body);

      // We should also broadcast this via WebSocket if the server is available
      // For now, it's saved in DB and client-side optimistic UI handles it.
      // But we need the WS server to broadcast to OTHER users.
      // Since ws setup is in chat-ws.ts, we might need a way to trigger broadcast.
      // For simplicity, let's assume the client will also send via WS or poll.
      // However, the frontend code calls BOTH (apiRequest and ws.send if available).
      // Actually frontend calls apiRequest ONLY when sending.

      return res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: error.errors });
      return res.status(500).json({ message: "Failed to create message" });
    }
  });

  // POST /api/channels/dm — Create or get a DM channel
  app.post("/api/channels/dm", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length < 2) {
        return res.status(400).json({ message: "At least two userIds are required" });
      }

      const id1 = parseInt(userIds[0]);
      const id2 = parseInt(userIds[1]);

      if (isNaN(id1) || isNaN(id2)) {
        return res.status(400).json({ message: "Invalid user IDs" });
      }

      const channel = await storage.getOrCreateDMChannel(id1, id2);
      return res.status(200).json(channel);
    } catch {
      return res.status(500).json({ message: "Failed to create/fetch DM channel" });
    }
  });

  // GET /api/users/me/dms — Get all DMs for the current user, enriched with partner info
  app.get("/api/users/me/dms", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const currentUserId = req.session.userId;
      const dms = await storage.getDMsByUser(currentUserId);

      const enrichedDms = await Promise.all(dms.map(async (dm) => {
        // dm.name is 'dm_ID1_ID2'
        const parts = dm.name.split('_');
        if (parts.length === 3) {
          const id1 = parseInt(parts[1]);
          const id2 = parseInt(parts[2]);
          const partnerId = id1 === currentUserId ? id2 : id1;

          const partner = await storage.getUser(partnerId);
          if (partner) {
            return {
              ...dm,
              partner: {
                id: partner.id,
                username: partner.username,
                avatar: partner.avatar,
                role: partner.role
              }
            };
          }
        }
        return dm;
      }));

      return res.status(200).json(enrichedDms);
    } catch {
      return res.status(500).json({ message: "Failed to fetch DMs" });
    }
  });

  // DELETE /api/messages/:id — Delete a message (author or teacher)
  app.delete("/api/messages/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) return res.status(400).json({ message: "Invalid message ID" });

      // Fetch the message directly from Mongo to check ownership
      const { MongoMessage } = await import("@shared/mongo-schema");
      const msg = await (MongoMessage as any).findOne({ id: messageId });
      if (!msg) return res.status(404).json({ message: "Message not found" });

      const isAuthor = msg.authorId === req.session.userId;
      const isTeacher = req.session.userRole === "teacher";

      if (!isAuthor && !isTeacher) {
        return res.status(403).json({ message: "You can only delete your own messages" });
      }

      // Pass channelId so Cassandra delete uses the correct partition key
      await storage.deleteMessage(messageId, msg.channelId);
      return res.status(200).json({ message: "Message deleted" });
    } catch {
      return res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // POST /api/channels/:id/pin/:messageId — Pin a message (teachers only)
  app.post("/api/channels/:id/pin/:messageId", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      if (req.session.userRole !== "teacher") {
        return res.status(403).json({ message: "Only teachers can pin messages" });
      }

      const channelId = parseInt(req.params.id);
      const messageId = parseInt(req.params.messageId);

      const channel = await storage.pinMessage(channelId, messageId);
      if (!channel) return res.status(404).json({ message: "Channel or message not found" });

      return res.status(200).json(channel);
    } catch {
      return res.status(500).json({ message: "Failed to pin message" });
    }
  });

  // DELETE /api/channels/:id/pin/:messageId — Unpin a message (teachers only)
  app.delete("/api/channels/:id/pin/:messageId", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      if (req.session.userRole !== "teacher") {
        return res.status(403).json({ message: "Only teachers can unpin messages" });
      }

      const channelId = parseInt(req.params.id);
      const messageId = parseInt(req.params.messageId);

      const channel = await storage.unpinMessage(channelId, messageId);
      if (!channel) return res.status(404).json({ message: "Channel or message not found" });

      return res.status(200).json(channel);
    } catch {
      return res.status(500).json({ message: "Failed to unpin message" });
    }
  });

  // GET /api/channels/:id/pinned — Get pinned messages
  app.get("/api/channels/:id/pinned", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const channelId = parseInt(req.params.id);
      const channel = await storage.getChannel(channelId);
      if (!channel) return res.status(404).json({ message: "Channel not found" });

      if (channel.workspaceId === null || channel.workspaceId === undefined) return res.status(403).json({ message: "Access denied" });
      const workspace = await storage.getWorkspace(channel.workspaceId);
      if (!workspace || !workspace.members.includes(req.session.userId)) {
        return res.status(403).json({ message: "Access denied" });
      }

      const pinned = await storage.getPinnedMessages(channelId);
      return res.status(200).json(pinned);
    } catch {
      return res.status(500).json({ message: "Failed to fetch pinned messages" });
    }
  });

  // GET /api/channels/query/:classOrUser — Filtered channels
  app.get("/api/channels/query/:classOrUser", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const { classOrUser } = req.params;

      const allWorkspaces = await storage.getWorkspaces(req.session.userId);
      let allChannels: Channel[] = [];

      for (const ws of allWorkspaces) {
        const wsChannels = await storage.getChannelsByWorkspace(ws.id);
        allChannels = [...allChannels, ...wsChannels];
      }

      const filtered = allChannels.filter(c =>
        !classOrUser || c.class === classOrUser || c.name.toLowerCase().includes(classOrUser.toLowerCase()) || (c.subject && c.subject.toLowerCase().includes(classOrUser.toLowerCase()))
      );

      return res.status(200).json(filtered);
    } catch {
      return res.status(500).json({ message: "Failed to fetch channels" });
    }
  });

  // GET /api/channels/:id/unread — Get unread count for a channel
  app.get("/api/channels/:id/unread", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const channelId = parseInt(req.params.id);

      const channel = await storage.getChannel(channelId);
      if (!channel) return res.status(404).json({ message: "Channel not found" });

      // Count unread in last 50 messages
      const messages = await storage.getMessagesByChannel(channelId, 50);
      const unreadCount = messages.filter(m => !m.readBy?.includes(req.session!.userId!)).length;

      return res.status(200).json({ unreadCount });
    } catch {
      return res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });

  // POST /api/messages/:id/grade — Grade homework (teachers only)
  app.post("/api/messages/:id/grade", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId || req.session.userRole !== "teacher") {
        return res.status(401).json({ message: "Only teachers can grade homework" });
      }

      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) return res.status(400).json({ message: "Invalid message ID" });

      const { status, channelId } = req.body;

      if (!['pending', 'graded'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Pass channelId so Cassandra uses the correct partition key
      const updated = await storage.gradeMessage(messageId, status, channelId ? parseInt(channelId) : undefined);
      if (!updated) return res.status(404).json({ message: "Message not found" });

      return res.status(200).json(updated);
    } catch {
      return res.status(500).json({ message: "Failed to grade message" });
    }
  });

  // POST /api/channels — Create a new channel
  app.post("/api/channels", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const channelData = insertChannelSchema.parse(req.body);

      // Check if user is member of the workspace
      if (!channelData.workspaceId) return res.status(400).json({ message: "Workspace ID is required" });
      const workspace = await storage.getWorkspace(channelData.workspaceId);
      if (!workspace || !workspace.members.includes(req.session.userId)) {
        return res.status(403).json({ message: "You are not a member of this workspace" });
      }

      const channel = await storage.createChannel(channelData);
      return res.status(201).json(channel);
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid input", errors: error.errors });
      return res.status(500).json({ message: "Failed to create channel" });
    }
  });

  // POST /api/messages/:id/read — Mark message as read
  app.post("/api/messages/:id/read", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });
      const messageId = parseInt(req.params.id);
      if (isNaN(messageId)) return res.status(400).json({ message: "Invalid message ID" });
      const { channelId } = req.body;
      // Pass channelId so Cassandra uses the correct partition key
      const updated = await storage.markMessageAsRead(messageId, req.session.userId, channelId ? parseInt(channelId) : undefined);
      if (!updated) return res.status(404).json({ message: "Message not found" });
      return res.status(200).json(updated);
    } catch {
      return res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // POST /api/upload — Real multipart file upload (multer disk storage)
  app.post(
    "/api/upload",
    (req: Request, res: Response, next) => {
      // Auth guard before multer processes the body
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      next();
    },
    upload.single("file"),
    (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file provided. Send a multipart/form-data request with field name 'file'." });
        }

        const url = diskPathToUrl(req.file.path);
        console.log(`[upload] User ${req.session!.userId} uploaded ${req.file.originalname} → ${url}`);

        return res.status(200).json({
          url,
          name: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
        });
      } catch {
        return res.status(500).json({ message: "Upload failed" });
      }
    }
  );

  // ─── Phase 1: Firebase Auth Bridge ──────────────────────────────────────────
  //
  // POST /api/auth/firebase
  // Client sends { idToken } after Firebase login. We verify with firebase-admin,
  // then find-or-create a MongoDB user and establish an Express session.

  app.post("/api/auth/firebase", async (req: Request, res: Response) => {
    try {
      const { idToken } = req.body;
      if (!idToken || typeof idToken !== "string") {
        return res.status(400).json({ message: "idToken is required" });
      }

      const decoded = await verifyFirebaseToken(idToken);
      if (!decoded) {
        return res.status(401).json({ message: "Invalid or expired Firebase ID token" });
      }

      const { uid, email, name, picture } = decoded;
      if (!email) {
        return res.status(400).json({ message: "Firebase account must have an email address" });
      }

      // Find by firebaseUid or email
      let mongoUser: any = await (MongoUser as any).findOne({ firebaseUid: uid });
      if (!mongoUser) mongoUser = await (MongoUser as any).findOne({ email });

      if (!mongoUser) {
        const id = await getNextSequenceValue("user_id");
        mongoUser = new (MongoUser as any)({
          id,
          username: email.split("@")[0] + "_" + id,
          password: "firebase-" + uid,
          name: name || email.split("@")[0],
          email,
          role: "student",
          avatar: picture || null,
          firebaseUid: uid,
          displayName: name || null,
        });
        await mongoUser.save();
        console.log(`[auth/firebase] Created new user ${email} (id=${id})`);
      } else if (!mongoUser.firebaseUid) {
        mongoUser.firebaseUid = uid;
        if (picture && !mongoUser.avatar) mongoUser.avatar = picture;
        await mongoUser.save();
      }

      if (req.session) {
        req.session.userId = mongoUser.id;
        req.session.userRole = mongoUser.role;
      }

      return res.status(200).json({
        userId: mongoUser.id,
        displayName: mongoUser.displayName || mongoUser.name,
        role: mongoUser.role,
        avatar: mongoUser.avatar,
      });
    } catch (err) {
      console.error("[auth/firebase] Error:", err);
      return res.status(500).json({ message: "Firebase auth bridge failed" });
    }
  });

  // ─── Phase 2: Chat Conversations API ────────────────────────────────────────
  //
  // GET /api/chat/conversations — Returns all channels accessible to the user.
  // Seeds a default School workspace on first login if the user has none.

  app.get("/api/chat/conversations", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const role = user.role ?? "student";

      // Seed default workspace on first access
      let workspaces = await storage.getWorkspaces(userId);
      if (workspaces.length === 0) {
        const wsId = await getNextSequenceValue("workspace_id");
        const newWs = new (MongoWorkspace as any)({
          id: wsId,
          name: "School",
          description: "Default school workspace",
          ownerId: userId,
          members: [userId],
        });
        await newWs.save();

        const defaultChannels = [
          { name: "school-announcements", type: "announcement", category: "announcement", isReadOnly: true },
          { name: "class-10a-mathematics", type: "text", category: "class", isReadOnly: false, subject: "Mathematics" },
          { name: "class-10a-science", type: "text", category: "class", isReadOnly: false, subject: "Science" },
          { name: "class-10a-english", type: "text", category: "class", isReadOnly: false, subject: "English" },
        ];

        for (const ch of defaultChannels) {
          const chId = await getNextSequenceValue("channel_id");
          const newCh = new (MongoChannel as any)({
            id: chId, workspaceId: wsId,
            name: ch.name, type: ch.type,
            category: ch.category, isReadOnly: ch.isReadOnly,
            subject: (ch as any).subject || null,
            pinnedMessages: [],
          });
          await newCh.save();
        }

        workspaces = await storage.getWorkspaces(userId);
        console.log(`[chat/conversations] Seeded workspace for user ${userId}`);
      }

      // Gather all channels across workspaces
      let allChannels: any[] = [];
      for (const ws of workspaces) {
        const channels = await storage.getChannelsByWorkspace(ws.id);
        allChannels = [...allChannels, ...channels];
      }

      // Role-based filtering
      const accessible = allChannels.filter((ch: any) => {
        const category = ch.category ?? "class";
        if (category === "announcement") return true;
        if (category === "class" && (role === "student" || role === "teacher")) return true;
        if (category === "teacher" && role === "student") return true;
        if (category === "parent" && role === "teacher") return true;
        if (category === "friend" && role === "student") return true;
        return false;
      });

      // Shape into frontend Conversation format
      const conversations = accessible.map((ch: any) => ({
        id: String(ch.id),
        name: ch.name,
        category: ch.category ?? "class",
        isGroup: ch.type !== "dm",
        isReadOnly: ch.isReadOnly ?? false,
        participants: [],
        lastMessage: undefined,
        unreadCount: 0,
        subject: ch.subject ?? undefined,
      }));

      return res.status(200).json(conversations);
    } catch (err) {
      console.error("[chat/conversations] Error:", err);
      return res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // POST /api/chat/conversations/:id/read — mark all messages in a conversation as read
  app.post("/api/chat/conversations/:id/read", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const channelId = parseInt(req.params.id);
      if (isNaN(channelId)) return res.status(400).json({ message: "Invalid conversation ID" });

      const messages = await storage.getMessagesByChannel(channelId, 100);
      await Promise.all(
        messages
          .filter((m: any) => !m.readBy?.includes(req.session!.userId))
          .map((m: any) => storage.markMessageAsRead(m.id, req.session!.userId!))
      );

      await (MongoChannel as any).findOneAndUpdate(
        { id: channelId },
        { $set: { [`unreadCounts.${req.session.userId}`]: 0 } }
      );

      return res.status(200).json({ message: "Marked as read" });
    } catch {
      return res.status(500).json({ message: "Failed to mark conversation as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
