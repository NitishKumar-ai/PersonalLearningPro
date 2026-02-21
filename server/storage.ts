import {
  users, type User, type InsertUser,
  tests, type Test, type InsertTest,
  questions, type Question, type InsertQuestion,
  testAttempts, type TestAttempt, type InsertTestAttempt,
  answers, type Answer, type InsertAnswer,
  analytics, type Analytics, type InsertAnalytics,
  channels, type Channel, type InsertChannel,
  messages, type Message, type InsertMessage
} from "@shared/schema";
import session from "express-session";

export interface IStorage {
  // Session store
  sessionStore: session.Store;
  // User operations
  getUser(id: number | string): Promise<User | undefined>;
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

  // Channel operations
  createChannel(channel: InsertChannel): Promise<Channel>;
  getChannel(id: number): Promise<Channel | undefined>;
  getChannelsByClass(className: string): Promise<Channel[]>;
  getDMChannelsForUser(userId: string): Promise<Channel[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChannel(channelId: number): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tests: Map<number, Test>;
  private questions: Map<number, Question>;
  private testAttempts: Map<number, TestAttempt>;
  private answers: Map<number, Answer>;
  private analytics: Map<number, Analytics>;
  private channels: Map<number, Channel>;
  private messages: Map<number, Message>;

  sessionStore: session.Store;

  private userIdCounter: number;
  private testIdCounter: number;
  private questionIdCounter: number;
  private attemptIdCounter: number;
  private answerIdCounter: number;
  private analyticsIdCounter: number;
  private channelIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    // Initialize session store
    // Import MemoryStore dynamically for ES modules
    import('memorystore').then(memorystore => {
      const MemoryStore = memorystore.default(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    });

    // Create a temporary sessionStore until the import completes
    this.sessionStore = new session.MemoryStore();

    this.users = new Map();
    this.tests = new Map();
    this.questions = new Map();
    this.testAttempts = new Map();
    this.answers = new Map();
    this.analytics = new Map();
    this.channels = new Map();
    this.messages = new Map();

    this.userIdCounter = 1;
    this.testIdCounter = 1;
    this.questionIdCounter = 1;
    this.attemptIdCounter = 1;
    this.answerIdCounter = 1;
    this.analyticsIdCounter = 1;
    this.channelIdCounter = 1;
    this.messageIdCounter = 1;

    // Demo seed data for development — NOT production credentials.
    // These users are created in-memory and reset on every restart.
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

    // Seed Demo Channels
    this.createChannel({
      name: "general",
      type: "text",
      class: "Grade 11-A",
      subject: "General",
    });
    this.createChannel({
      name: "homework-help",
      type: "text",
      class: "Grade 11-A",
      subject: "Physics",
    });
    this.createChannel({
      name: "announcements",
      type: "announcement",
      class: "Grade 11-A",
      subject: "General",
    });
  }

  // User operations
  async getUser(id: number | string): Promise<User | undefined> {
    // If id is a string but parses as a number, check number map. Otherwise search by something else.
    // For this demo with purely local + mostly mocked Firebase data, we will convert back to number 
    // or just return the current session user since we mocked local login data with demo users.
    if (typeof id === 'number') {
      return this.users.get(id);
    } else {
      // Local demo fallback: Try to return a default user if Firebase UID is passed
      const userList = Array.from(this.users.values());
      return userList[0]; // just return a dummy user for the messaging demo
    }
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
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role ?? "student", // Apply default if undefined
      avatar: insertUser.avatar ?? null,
      class: insertUser.class ?? null,
      subject: insertUser.subject ?? null,
    };
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
    const test: Test = {
      ...insertTest,
      id,
      createdAt: new Date(),
      status: insertTest.status ?? "draft",
      duration: insertTest.duration ?? 60,
      totalMarks: insertTest.totalMarks ?? 100,
      description: insertTest.description ?? null,
    };
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
    const question: Question = {
      ...insertQuestion,
      id,
      marks: insertQuestion.marks ?? 1,
      options: insertQuestion.options ?? null,
      correctAnswer: insertQuestion.correctAnswer ?? null,
      aiRubric: insertQuestion.aiRubric ?? null,
    };
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
    const attempt: TestAttempt = {
      ...insertAttempt,
      id,
      status: insertAttempt.status ?? "in_progress",
      startTime: insertAttempt.startTime ?? new Date(),
      endTime: insertAttempt.endTime ?? null,
      score: insertAttempt.score ?? null,
    };
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
    const answer: Answer = {
      ...insertAnswer,
      id,
      text: insertAnswer.text ?? null,
      selectedOption: insertAnswer.selectedOption ?? null,
      imageUrl: insertAnswer.imageUrl ?? null,
      ocrText: insertAnswer.ocrText ?? null,
      score: insertAnswer.score ?? null,
      aiConfidence: insertAnswer.aiConfidence ?? null,
      aiFeedback: insertAnswer.aiFeedback ?? null,
      isCorrect: insertAnswer.isCorrect ?? null,
    };
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
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      insightDate: insertAnalytics.insightDate ?? new Date(),
    };
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

  // Channel operations
  async createChannel(insertChannel: InsertChannel): Promise<Channel> {
    const id = this.channelIdCounter++;
    const channel: Channel = {
      ...insertChannel,
      id,
      type: insertChannel.type ?? "text",
      class: insertChannel.class ?? null,
      subject: insertChannel.subject ?? null,
      members: insertChannel.members ?? null,
    };
    this.channels.set(id, channel);
    return channel;
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    return this.channels.get(id);
  }

  async getChannelsByClass(className: string): Promise<Channel[]> {
    return Array.from(this.channels.values())
      .filter(channel => channel.class === className);
  }

  async getDMChannelsForUser(userId: string): Promise<Channel[]> {
    return Array.from(this.channels.values()).filter(
      (channel) =>
        channel.type === "dm" &&
        Array.isArray(channel.members) &&
        channel.members.includes(userId)
    );
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      ...insertMessage,
      id,
      senderName: insertMessage.senderName ?? null,
      senderRole: insertMessage.senderRole ?? null,
      avatar: insertMessage.avatar ?? null,
      timestamp: insertMessage.timestamp ?? new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByChannel(channelId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.channelId === channelId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();
