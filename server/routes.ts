import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTestSchema, insertQuestionSchema, insertTestAttemptSchema, insertAnswerSchema, insertAnalyticsSchema, insertWorkspaceSchema, insertChannelSchema } from "@shared/schema";
import { z } from "zod";
import { processOCRImage } from "./lib/tesseract";
import { evaluateSubjectiveAnswer, aiChat, generateStudyPlan, analyzeTestPerformance } from "./lib/openai";

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

  // DELETE /api/messages/:id — Delete a message (author or teacher)
  app.delete("/api/messages/:id", async (req: Request, res: Response) => {
    try {
      if (!req.session?.userId) return res.status(401).json({ message: "Not authenticated" });

      const messageId = parseInt(req.params.id);
      const messages = await storage.getMessagesByChannel(0); // we'll look it up differently

      // Fetch the message directly from Mongo to check ownership
      const { MongoMessage } = await import("@shared/mongo-schema");
      const msg = await (MongoMessage as any).findOne({ id: messageId });
      if (!msg) return res.status(404).json({ message: "Message not found" });

      const isAuthor = msg.authorId === req.session.userId;
      const isTeacher = req.session.userRole === "teacher";

      if (!isAuthor && !isTeacher) {
        return res.status(403).json({ message: "You can only delete your own messages" });
      }

      await storage.deleteMessage(messageId);
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

  const httpServer = createServer(app);
  return httpServer;
}
