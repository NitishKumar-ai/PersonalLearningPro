import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - both students and teachers
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull().default("student"), // "student" or "teacher"
  avatar: text("avatar"),
  class: text("class"), // For students, e.g., "Grade 10-A"
  subject: text("subject"), // For teachers, e.g., "Physics"
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
  avatar: true,
  class: true,
  subject: true,
});

// Tests table
export const tests = pgTable("tests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  class: text("class").notNull(),
  teacherId: integer("teacher_id").notNull(), // The teacher who created the test
  totalMarks: integer("total_marks").notNull().default(100),
  duration: integer("duration").notNull().default(60), // in minutes
  testDate: timestamp("test_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  questionTypes: json("question_types").notNull(), // Array of question types included
  status: text("status").notNull().default("draft"), // draft, published, completed
});

export const insertTestSchema = createInsertSchema(tests).pick({
  title: true,
  description: true,
  subject: true,
  class: true,
  teacherId: true,
  totalMarks: true,
  duration: true,
  testDate: true,
  questionTypes: true,
  status: true,
});

// Questions table
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  type: text("type").notNull(), // "mcq", "short", "long", "numerical"
  text: text("text").notNull(),
  options: json("options"), // For MCQs, array of option objects
  correctAnswer: text("correct_answer"), // For MCQs and numerical
  marks: integer("marks").notNull().default(1),
  order: integer("order").notNull(),
  aiRubric: text("ai_rubric"), // Guidelines for AI evaluation of subjective answers
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  testId: true,
  type: true,
  text: true,
  options: true,
  correctAnswer: true,
  marks: true,
  order: true,
  aiRubric: true,
});

// Student Test Attempts
export const testAttempts = pgTable("test_attempts", {
  id: serial("id").primaryKey(),
  testId: integer("test_id").notNull(),
  studentId: integer("student_id").notNull(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  score: integer("score"),
  status: text("status").notNull().default("in_progress"), // in_progress, completed, evaluated
});

export const insertTestAttemptSchema = createInsertSchema(testAttempts).pick({
  testId: true,
  studentId: true,
  startTime: true,
  endTime: true,
  score: true,
  status: true,
});

// Student Answers
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  attemptId: integer("attempt_id").notNull(),
  questionId: integer("question_id").notNull(),
  text: text("text"), // For written answers
  selectedOption: integer("selected_option"), // For MCQs
  imageUrl: text("image_url"), // For scanned handwritten answers
  ocrText: text("ocr_text"), // Text extracted from handwritten answers
  score: integer("score"), // Marks given for this answer
  aiConfidence: integer("ai_confidence"), // AI confidence in the OCR and evaluation (0-100)
  aiFeedback: text("ai_feedback"), // Feedback from AI
  isCorrect: boolean("is_correct"), // For auto-evaluated questions like MCQs
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  attemptId: true,
  questionId: true,
  text: true,
  selectedOption: true,
  imageUrl: true,
  ocrText: true,
  score: true,
  aiConfidence: true,
  aiFeedback: true,
  isCorrect: true,
});

// Analytics and Insights
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  testId: integer("test_id").notNull(),
  weakTopics: json("weak_topics").notNull(), // Array of topics needing improvement
  strongTopics: json("strong_topics").notNull(), // Array of topics where student excels
  recommendedResources: json("recommended_resources").notNull(), // Study materials suggested by AI
  insightDate: timestamp("insight_date").notNull().defaultNow(),
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  userId: true,
  testId: true,
  weakTopics: true,
  strongTopics: true,
  recommendedResources: true,
  insightDate: true,
});

// Export the types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Test = typeof tests.$inferSelect;
export type InsertTest = z.infer<typeof insertTestSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type TestAttempt = typeof testAttempts.$inferSelect;
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
