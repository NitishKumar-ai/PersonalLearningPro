import {
  users, type User, type InsertUser,
  tests, type Test, type InsertTest,
  questions, type Question, type InsertQuestion,
  testAttempts, type TestAttempt, type InsertTestAttempt,
  answers, type Answer, type InsertAnswer,
  analytics, type Analytics, type InsertAnalytics
} from "@shared/schema";

export interface IStorage {
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tests: Map<number, Test>;
  private questions: Map<number, Question>;
  private testAttempts: Map<number, TestAttempt>;
  private answers: Map<number, Answer>;
  private analytics: Map<number, Analytics>;
  
  private userIdCounter: number;
  private testIdCounter: number;
  private questionIdCounter: number;
  private attemptIdCounter: number;
  private answerIdCounter: number;
  private analyticsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.tests = new Map();
    this.questions = new Map();
    this.testAttempts = new Map();
    this.answers = new Map();
    this.analytics = new Map();
    
    this.userIdCounter = 1;
    this.testIdCounter = 1;
    this.questionIdCounter = 1;
    this.attemptIdCounter = 1;
    this.answerIdCounter = 1;
    this.analyticsIdCounter = 1;
    
    // Add demo users
    this.createUser({
      username: "teacher1",
      password: "password123",
      name: "John Doe",
      email: "teacher1@example.com",
      role: "teacher",
      subject: "Physics",
      avatar: "",
      class: ""
    });
    
    this.createUser({
      username: "student1",
      password: "password123",
      name: "Rahul Patel",
      email: "student1@example.com",
      role: "student",
      class: "Grade 11-A",
      avatar: "",
      subject: ""
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(role?: string): Promise<User[]> {
    if (role) {
      return Array.from(this.users.values()).filter(user => user.role === role);
    }
    return Array.from(this.users.values());
  }
  
  async getUsersByClass(className: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === "student" && user.class === className,
    );
  }
  
  // Test operations
  async createTest(insertTest: InsertTest): Promise<Test> {
    const id = this.testIdCounter++;
    const test: Test = { ...insertTest, id };
    this.tests.set(id, test);
    return test;
  }
  
  async getTest(id: number): Promise<Test | undefined> {
    return this.tests.get(id);
  }
  
  async getTests(teacherId?: number, status?: string): Promise<Test[]> {
    let tests = Array.from(this.tests.values());
    
    if (teacherId) {
      tests = tests.filter(test => test.teacherId === teacherId);
    }
    
    if (status) {
      tests = tests.filter(test => test.status === status);
    }
    
    return tests;
  }
  
  async getTestsByClass(className: string): Promise<Test[]> {
    return Array.from(this.tests.values()).filter(
      (test) => test.class === className,
    );
  }
  
  async updateTest(id: number, testUpdate: Partial<InsertTest>): Promise<Test | undefined> {
    const test = this.tests.get(id);
    if (!test) return undefined;
    
    const updatedTest = { ...test, ...testUpdate };
    this.tests.set(id, updatedTest);
    return updatedTest;
  }
  
  // Question operations
  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.questionIdCounter++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }
  
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }
  
  async getQuestionsByTest(testId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.testId === testId)
      .sort((a, b) => a.order - b.order);
  }
  
  async updateQuestion(id: number, questionUpdate: Partial<InsertQuestion>): Promise<Question | undefined> {
    const question = this.questions.get(id);
    if (!question) return undefined;
    
    const updatedQuestion = { ...question, ...questionUpdate };
    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }
  
  // Test Attempt operations
  async createTestAttempt(insertAttempt: InsertTestAttempt): Promise<TestAttempt> {
    const id = this.attemptIdCounter++;
    const attempt: TestAttempt = { ...insertAttempt, id };
    this.testAttempts.set(id, attempt);
    return attempt;
  }
  
  async getTestAttempt(id: number): Promise<TestAttempt | undefined> {
    return this.testAttempts.get(id);
  }
  
  async getTestAttemptsByStudent(studentId: number): Promise<TestAttempt[]> {
    return Array.from(this.testAttempts.values())
      .filter(attempt => attempt.studentId === studentId);
  }
  
  async getTestAttemptsByTest(testId: number): Promise<TestAttempt[]> {
    return Array.from(this.testAttempts.values())
      .filter(attempt => attempt.testId === testId);
  }
  
  async updateTestAttempt(id: number, attemptUpdate: Partial<InsertTestAttempt>): Promise<TestAttempt | undefined> {
    const attempt = this.testAttempts.get(id);
    if (!attempt) return undefined;
    
    const updatedAttempt = { ...attempt, ...attemptUpdate };
    this.testAttempts.set(id, updatedAttempt);
    return updatedAttempt;
  }
  
  // Answer operations
  async createAnswer(insertAnswer: InsertAnswer): Promise<Answer> {
    const id = this.answerIdCounter++;
    const answer: Answer = { ...insertAnswer, id };
    this.answers.set(id, answer);
    return answer;
  }
  
  async getAnswer(id: number): Promise<Answer | undefined> {
    return this.answers.get(id);
  }
  
  async getAnswersByAttempt(attemptId: number): Promise<Answer[]> {
    return Array.from(this.answers.values())
      .filter(answer => answer.attemptId === attemptId);
  }
  
  async updateAnswer(id: number, answerUpdate: Partial<InsertAnswer>): Promise<Answer | undefined> {
    const answer = this.answers.get(id);
    if (!answer) return undefined;
    
    const updatedAnswer = { ...answer, ...answerUpdate };
    this.answers.set(id, updatedAnswer);
    return updatedAnswer;
  }
  
  // Analytics operations
  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsIdCounter++;
    const analytics: Analytics = { ...insertAnalytics, id };
    this.analytics.set(id, analytics);
    return analytics;
  }
  
  async getAnalyticsByUser(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.userId === userId);
  }
  
  async getAnalyticsByTest(testId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values())
      .filter(analytics => analytics.testId === testId);
  }
}

export const storage = new MemStorage();
