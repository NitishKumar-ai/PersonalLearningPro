import { z } from "zod";

// Zod schemas for validation (previously drizzle-zod)
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["student", "teacher"]).default("student"),
  avatar: z.string().optional().nullable(),
  class: z.string().optional().nullable(),
  subject: z.string().optional().nullable(),
});

export const insertTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  subject: z.string().min(1),
  class: z.string().min(1),
  teacherId: z.number(),
  totalMarks: z.number().default(100),
  duration: z.number().default(60),
  testDate: z.string().or(z.date()),
  questionTypes: z.array(z.string()),
  status: z.enum(["draft", "published", "completed"]).default("draft"),
});

export const insertQuestionSchema = z.object({
  testId: z.number(),
  type: z.enum(["mcq", "short", "long", "numerical"]),
  text: z.string().min(1),
  options: z.any().optional().nullable(),
  correctAnswer: z.string().optional().nullable(),
  marks: z.number().default(1),
  order: z.number(),
  aiRubric: z.string().optional().nullable(),
});

export const insertTestAttemptSchema = z.object({
  testId: z.number(),
  studentId: z.number(),
  startTime: z.string().or(z.date()).optional(),
  endTime: z.string().or(z.date()).optional().nullable(),
  score: z.number().optional().nullable(),
  status: z.enum(["in_progress", "completed", "evaluated"]).default("in_progress"),
});

export const insertAnswerSchema = z.object({
  attemptId: z.number(),
  questionId: z.number(),
  text: z.string().optional().nullable(),
  selectedOption: z.number().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ocrText: z.string().optional().nullable(),
  score: z.number().optional().nullable(),
  aiConfidence: z.number().optional().nullable(),
  aiFeedback: z.string().optional().nullable(),
  isCorrect: z.boolean().optional().nullable(),
});

export const insertAnalyticsSchema = z.object({
  userId: z.number(),
  testId: z.number(),
  weakTopics: z.array(z.string()),
  strongTopics: z.array(z.string()),
  recommendedResources: z.array(z.string()),
  insightDate: z.string().or(z.date()).optional(),
});

// Types inferred from Zod schemas
export type User = z.infer<typeof insertUserSchema> & { id: number };
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Test = z.infer<typeof insertTestSchema> & { id: number; createdAt: Date };
export type InsertTest = z.infer<typeof insertTestSchema>;

export type Question = z.infer<typeof insertQuestionSchema> & { id: number };
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type TestAttempt = z.infer<typeof insertTestAttemptSchema> & { id: number };
export type InsertTestAttempt = z.infer<typeof insertTestAttemptSchema>;

export type Answer = z.infer<typeof insertAnswerSchema> & { id: number };
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Analytics = z.infer<typeof insertAnalyticsSchema> & { id: number };
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
