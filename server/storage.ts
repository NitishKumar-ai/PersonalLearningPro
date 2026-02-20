import {
  type User, type InsertUser,
  type Test, type InsertTest,
  type Question, type InsertQuestion,
  type TestAttempt, type InsertTestAttempt,
  type Answer, type InsertAnswer,
  type Analytics, type InsertAnalytics
} from "@shared/schema";
import {
  MongoAnalytics, getNextSequenceValue
} from "@shared/mongo-schema";
import session from "express-session";
import { pgQuery, pool } from "./db";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(role?: string): Promise<User[]>;
  getUsersByClass(className: string): Promise<User[]>;

  // Test operations
  createTest(test: InsertTest): Promise<Test>;
  getTest(id: number): Promise<Test | undefined>;
  getTests(teacherId?: number, status?: string): Promise<Test[]>;
  getTestsByClass(className: string): Promise<Test[]>;
  updateTest(id: number, test: Partial<InsertTest>): Promise<Test | undefined>;

  // Question operations
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByTest(testId: number): Promise<Question[]>;
  updateQuestion(id: number, question: Partial<InsertQuestion>): Promise<Question | undefined>;

  // Test Attempt operations
  createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt>;
  getTestAttempt(id: number): Promise<TestAttempt | undefined>;
  getTestAttemptsByStudent(studentId: number): Promise<TestAttempt[]>;
  getTestAttemptsByTest(testId: number): Promise<TestAttempt[]>;
  updateTestAttempt(id: number, attempt: Partial<InsertTestAttempt>): Promise<TestAttempt | undefined>;

  // Answer operations
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  getAnswer(id: number): Promise<Answer | undefined>;
  getAnswersByAttempt(attemptId: number): Promise<Answer[]>;
  updateAnswer(id: number, answer: Partial<InsertAnswer>): Promise<Answer | undefined>;

  // Analytics operations
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByUser(userId: number): Promise<Analytics[]>;
  getAnalyticsByTest(testId: number): Promise<Analytics[]>;
}

export class HybridStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: pool,
      createTableIfMissing: true,
    });
  }

  // User operations (PostgreSQL - Native SQL)
  async getUser(id: number): Promise<User | undefined> {
    const res = await pgQuery('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const res = await pgQuery('SELECT * FROM users WHERE username = $1', [username]);
    return res.rows[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const res = await pgQuery('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const { username, password, name, email, role, avatar, class: className, subject } = user;
    const res = await pgQuery(
      `INSERT INTO users (username, password, name, email, role, avatar, class, subject)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [username, password, name, email, role, avatar, className, subject]
    );
    return res.rows[0];
  }

  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      const res = await pgQuery('SELECT * FROM users WHERE role = $1', [role]);
      return res.rows;
    }
    const res = await pgQuery('SELECT * FROM users');
    return res.rows;
  }

  async getUsersByClass(className: string): Promise<User[]> {
    const res = await pgQuery(
      'SELECT * FROM users WHERE role = $1 AND class = $2',
      ['student', className]
    );
    return res.rows;
  }

  // Test operations (PostgreSQL - Native SQL)
  async createTest(test: InsertTest): Promise<Test> {
    const { title, description, subject, class: className, teacherId, totalMarks, duration, testDate, questionTypes, status } = test;
    const res = await pgQuery(
      `INSERT INTO tests (title, description, subject, class, teacher_id, total_marks, duration, test_date, question_types, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [title, description, subject, className, teacherId, totalMarks, duration, testDate, JSON.stringify(questionTypes), status]
    );
    return res.rows[0];
  }

  async getTest(id: number): Promise<Test | undefined> {
    const res = await pgQuery('SELECT * FROM tests WHERE id = $1', [id]);
    return res.rows[0];
  }

  async getTests(teacherId?: number, status?: string): Promise<Test[]> {
    let query = 'SELECT * FROM tests WHERE 1=1';
    const params = [];
    if (teacherId) {
      params.push(teacherId);
      query += ` AND teacher_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }
    const res = await pgQuery(query, params);
    return res.rows;
  }

  async getTestsByClass(className: string): Promise<Test[]> {
    const res = await pgQuery('SELECT * FROM tests WHERE class = $1', [className]);
    return res.rows;
  }

  async updateTest(id: number, testUpdate: Partial<InsertTest>): Promise<Test | undefined> {
    const keys = Object.keys(testUpdate);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const params = [id, ...Object.values(testUpdate)];
    const res = await pgQuery(`UPDATE tests SET ${setClause} WHERE id = $1 RETURNING *`, params);
    return res.rows[0];
  }

  // Question operations (PostgreSQL - Native SQL)
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const { testId, type, text, options, correctAnswer, marks, order, aiRubric } = question;
    const res = await pgQuery(
      `INSERT INTO questions (test_id, type, text, options, correct_answer, marks, "order", ai_rubric)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [testId, type, text, JSON.stringify(options), correctAnswer, marks, order, aiRubric]
    );
    return res.rows[0];
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const res = await pgQuery('SELECT * FROM questions WHERE id = $1', [id]);
    return res.rows[0];
  }

  async getQuestionsByTest(testId: number): Promise<Question[]> {
    const res = await pgQuery('SELECT * FROM questions WHERE test_id = $1 ORDER BY "order" ASC', [testId]);
    return res.rows;
  }

  async updateQuestion(id: number, questionUpdate: Partial<InsertQuestion>): Promise<Question | undefined> {
    const keys = Object.keys(questionUpdate);
    const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
    const params = [id, ...Object.values(questionUpdate)];
    const res = await pgQuery(`UPDATE questions SET ${setClause} WHERE id = $1 RETURNING *`, params);
    return res.rows[0];
  }

  // Test Attempt operations (PostgreSQL)
  async createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt> {
    const { testId, studentId, startTime, status } = attempt;
    const res = await pgQuery(
      `INSERT INTO test_attempts (test_id, student_id, start_time, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [testId, studentId, startTime || new Date(), status]
    );
    return res.rows[0];
  }

  async getTestAttempt(id: number): Promise<TestAttempt | undefined> {
    const res = await pgQuery('SELECT * FROM test_attempts WHERE id = $1', [id]);
    return res.rows[0];
  }

  async getTestAttemptsByStudent(studentId: number): Promise<TestAttempt[]> {
    const res = await pgQuery('SELECT * FROM test_attempts WHERE student_id = $1', [studentId]);
    return res.rows;
  }

  async getTestAttemptsByTest(testId: number): Promise<TestAttempt[]> {
    const res = await pgQuery('SELECT * FROM test_attempts WHERE test_id = $1', [testId]);
    return res.rows;
  }

  async updateTestAttempt(id: number, attemptUpdate: Partial<InsertTestAttempt>): Promise<TestAttempt | undefined> {
    const keys = Object.keys(attemptUpdate);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const params = [id, ...Object.values(attemptUpdate)];
    const res = await pgQuery(`UPDATE test_attempts SET ${setClause} WHERE id = $1 RETURNING *`, params);
    return res.rows[0];
  }

  // Answer operations (PostgreSQL)
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const { attemptId, questionId, text, selectedOption, imageUrl, ocrText, score, aiConfidence, aiFeedback, isCorrect } = answer;
    const res = await pgQuery(
      `INSERT INTO answers (attempt_id, question_id, text, selected_option, image_url, ocr_text, score, ai_confidence, ai_feedback, is_correct)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [attemptId, questionId, text, selectedOption, imageUrl, ocrText, score, aiConfidence, aiFeedback, isCorrect]
    );
    return res.rows[0];
  }

  async getAnswer(id: number): Promise<Answer | undefined> {
    const res = await pgQuery('SELECT * FROM answers WHERE id = $1', [id]);
    return res.rows[0];
  }

  async getAnswersByAttempt(attemptId: number): Promise<Answer[]> {
    const res = await pgQuery('SELECT * FROM answers WHERE attempt_id = $1', [attemptId]);
    return res.rows;
  }

  async updateAnswer(id: number, answerUpdate: Partial<InsertAnswer>): Promise<Answer | undefined> {
    const keys = Object.keys(answerUpdate);
    const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const params = [id, ...Object.values(answerUpdate)];
    const res = await pgQuery(`UPDATE answers SET ${setClause} WHERE id = $1 RETURNING *`, params);
    return res.rows[0];
  }

  // Analytics operations (MongoDB - Mongoose)
  private mapMongoDoc<T>(doc: any): T {
    if (!doc) return undefined as any;
    const { _id, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { ...rest } as T;
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = await getNextSequenceValue("analytics_id");
    const analyticsResult = new MongoAnalytics({ ...insertAnalytics, id });
    await analyticsResult.save();
    return this.mapMongoDoc<Analytics>(analyticsResult);
  }

  async getAnalyticsByUser(userId: number): Promise<Analytics[]> {
    const results = await MongoAnalytics.find({ userId });
    return results.map(r => this.mapMongoDoc<Analytics>(r));
  }

  async getAnalyticsByTest(testId: number): Promise<Analytics[]> {
    const results = await MongoAnalytics.find({ testId });
    return results.map(r => this.mapMongoDoc<Analytics>(r));
  }
}

export const storage = new HybridStorage();
