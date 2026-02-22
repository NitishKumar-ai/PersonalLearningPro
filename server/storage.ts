import {
  type User, type InsertUser,
  type Test, type InsertTest,
  type Question, type InsertQuestion,
  type TestAttempt, type InsertTestAttempt,
  type Answer, type InsertAnswer,
  type Analytics, type InsertAnalytics,
  type Workspace, type InsertWorkspace,
  type Channel, type InsertChannel,
  type Message, type InsertMessage,
} from "@shared/schema";
import {
  MongoUser, MongoTest, MongoQuestion, MongoTestAttempt, MongoAnswer, MongoAnalytics,
  MongoWorkspace, MongoChannel, MongoMessage,
  getNextSequenceValue
} from "@shared/mongo-schema";
import session from "express-session";
import MongoStore from "connect-mongo";

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

  // Workspace operations
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspaces(userId: number): Promise<Workspace[]>;
  addMemberToWorkspace(workspaceId: number, userId: number): Promise<Workspace | undefined>;
  removeMemberFromWorkspace(workspaceId: number, userId: number): Promise<Workspace | undefined>;

  // Channel operations
  createChannel(channel: InsertChannel): Promise<Channel>;
  getChannel(id: number): Promise<Channel | undefined>;
  getChannelsByWorkspace(workspaceId: number): Promise<Channel[]>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByChannel(channelId: number, limit?: number, before?: number): Promise<Message[]>;
  deleteMessage(id: number): Promise<boolean>;
  pinMessage(channelId: number, messageId: number): Promise<Channel | undefined>;
  unpinMessage(channelId: number, messageId: number): Promise<Channel | undefined>;
  getPinnedMessages(channelId: number): Promise<Message[]>;
}

export class MongoStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      collectionName: 'sessions',
      ttl: 24 * 60 * 60 // 1 day
    });
  }

  private mapMongoDoc<T>(doc: any): T {
    if (!doc) return undefined as any;
    const { _id, __v, ...rest } = doc.toObject ? doc.toObject() : doc;
    return { ...rest } as T;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await MongoUser.findOne({ id });
    return this.mapMongoDoc<User>(user);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await MongoUser.findOne({ username });
    return this.mapMongoDoc<User>(user);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await MongoUser.findOne({ email });
    return this.mapMongoDoc<User>(user);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = await getNextSequenceValue("user_id");
    const newUser = new MongoUser({ ...user, id });
    await newUser.save();
    return this.mapMongoDoc<User>(newUser);
  }

  async getUsers(role?: string): Promise<User[]> {
    const filter = role ? { role } : {};
    const users = await MongoUser.find(filter);
    return users.map((u: any) => this.mapMongoDoc<User>(u));
  }

  async getUsersByClass(className: string): Promise<User[]> {
    const users = await MongoUser.find({ role: 'student', class: className });
    return users.map((u: any) => this.mapMongoDoc<User>(u));
  }

  // Test operations
  async createTest(test: InsertTest): Promise<Test> {
    const id = await getNextSequenceValue("test_id");
    const newTest = new MongoTest({ ...test, id });
    await newTest.save();
    return this.mapMongoDoc<Test>(newTest);
  }

  async getTest(id: number): Promise<Test | undefined> {
    const test = await MongoTest.findOne({ id });
    return test ? this.mapMongoDoc<Test>(test) : undefined;
  }

  async getTests(teacherId?: number, status?: string): Promise<Test[]> {
    const filter: any = {};
    if (teacherId) filter.teacherId = teacherId;
    if (status) filter.status = status;
    const tests = await MongoTest.find(filter);
    return tests.map((t: any) => this.mapMongoDoc<Test>(t));
  }

  async getTestsByClass(className: string): Promise<Test[]> {
    const tests = await MongoTest.find({ class: className });
    return tests.map((t: any) => this.mapMongoDoc<Test>(t));
  }

  async updateTest(id: number, testUpdate: Partial<InsertTest>): Promise<Test | undefined> {
    const test = await MongoTest.findOneAndUpdate({ id }, testUpdate, { new: true });
    return test ? this.mapMongoDoc<Test>(test) : undefined;
  }

  // Question operations
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = await getNextSequenceValue("question_id");
    const newQuestion = new MongoQuestion({ ...question, id });
    await newQuestion.save();
    return this.mapMongoDoc<Question>(newQuestion);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const question = await MongoQuestion.findOne({ id });
    return question ? this.mapMongoDoc<Question>(question) : undefined;
  }

  async getQuestionsByTest(testId: number): Promise<Question[]> {
    const questions = await MongoQuestion.find({ testId }).sort({ order: 1 });
    return questions.map((q: any) => this.mapMongoDoc<Question>(q));
  }
  async updateQuestion(id: number, questionUpdate: Partial<InsertQuestion>): Promise<Question | undefined> {
    const question = await MongoQuestion.findOneAndUpdate({ id }, questionUpdate, { new: true });
    return question ? this.mapMongoDoc<Question>(question) : undefined;
  }

  // Test Attempt operations
  async createTestAttempt(attempt: InsertTestAttempt): Promise<TestAttempt> {
    const id = await getNextSequenceValue("attempt_id");
    const newAttempt = new MongoTestAttempt({ ...attempt, id });
    await newAttempt.save();
    return this.mapMongoDoc<TestAttempt>(newAttempt);
  }

  async getTestAttempt(id: number): Promise<TestAttempt | undefined> {
    const attempt = await MongoTestAttempt.findOne({ id });
    return attempt ? this.mapMongoDoc<TestAttempt>(attempt) : undefined;
  }

  async getTestAttemptsByStudent(studentId: number): Promise<TestAttempt[]> {
    const attempts = await MongoTestAttempt.find({ studentId });
    return attempts.map((a: any) => this.mapMongoDoc<TestAttempt>(a));
  }

  async getTestAttemptsByTest(testId: number): Promise<TestAttempt[]> {
    const attempts = await MongoTestAttempt.find({ testId });
    return attempts.map((a: any) => this.mapMongoDoc<TestAttempt>(a));
  }

  async updateTestAttempt(id: number, attemptUpdate: Partial<InsertTestAttempt>): Promise<TestAttempt | undefined> {
    const attempt = await MongoTestAttempt.findOneAndUpdate({ id }, attemptUpdate, { new: true });
    return attempt ? this.mapMongoDoc<TestAttempt>(attempt) : undefined;
  }

  // Answer operations
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = await getNextSequenceValue("answer_id");
    const newAnswer = new MongoAnswer({ ...answer, id });
    await newAnswer.save();
    return this.mapMongoDoc<Answer>(newAnswer);
  }

  async getAnswer(id: number): Promise<Answer | undefined> {
    const answer = await MongoAnswer.findOne({ id });
    return answer ? this.mapMongoDoc<Answer>(answer) : undefined;
  }

  async getAnswersByAttempt(attemptId: number): Promise<Answer[]> {
    const answers = await MongoAnswer.find({ attemptId });
    return answers.map((a: any) => this.mapMongoDoc<Answer>(a));
  }

  async updateAnswer(id: number, answerUpdate: Partial<InsertAnswer>): Promise<Answer | undefined> {
    const answer = await MongoAnswer.findOneAndUpdate({ id }, answerUpdate, { new: true });
    return answer ? this.mapMongoDoc<Answer>(answer) : undefined;
  }

  // Analytics operations
  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = await getNextSequenceValue("analytics_id");
    const analyticsResult = new MongoAnalytics({ ...insertAnalytics, id });
    await analyticsResult.save();
    return this.mapMongoDoc<Analytics>(analyticsResult);
  }

  async getAnalyticsByUser(userId: number): Promise<Analytics[]> {
    const results = await MongoAnalytics.find({ userId });
    return results.map((r: any) => this.mapMongoDoc<Analytics>(r));
  }

  async getAnalyticsByTest(testId: number): Promise<Analytics[]> {
    const results = await MongoAnalytics.find({ testId });
    return results.map((r: any) => this.mapMongoDoc<Analytics>(r));
  }

  // ─── Workspace operations ─────────────────────────────────────────────────

  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const id = await getNextSequenceValue("workspace_id");
    const members = Array.from(new Set([workspace.ownerId, ...(workspace.members || [])]));
    const newWorkspace = new MongoWorkspace({ ...workspace, members, id });
    await newWorkspace.save();
    return this.mapMongoDoc<Workspace>(newWorkspace);
  }

  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const ws = await MongoWorkspace.findOne({ id });
    return ws ? this.mapMongoDoc<Workspace>(ws) : undefined;
  }

  async getWorkspaces(userId: number): Promise<Workspace[]> {
    const workspaces = await MongoWorkspace.find({ members: userId });
    return workspaces.map((w: any) => this.mapMongoDoc<Workspace>(w));
  }

  async addMemberToWorkspace(workspaceId: number, userId: number): Promise<Workspace | undefined> {
    const ws = await MongoWorkspace.findOneAndUpdate(
      { id: workspaceId },
      { $addToSet: { members: userId } },
      { new: true }
    );
    return ws ? this.mapMongoDoc<Workspace>(ws) : undefined;
  }

  async removeMemberFromWorkspace(workspaceId: number, userId: number): Promise<Workspace | undefined> {
    const ws = await MongoWorkspace.findOneAndUpdate(
      { id: workspaceId },
      { $pull: { members: userId } },
      { new: true }
    );
    return ws ? this.mapMongoDoc<Workspace>(ws) : undefined;
  }

  // ─── Channel operations ──────────────────────────────────────────────────

  async createChannel(channel: InsertChannel): Promise<Channel> {
    const id = await getNextSequenceValue("channel_id");
    const newChannel = new MongoChannel({ ...channel, pinnedMessages: [], id });
    await newChannel.save();
    return this.mapMongoDoc<Channel>(newChannel);
  }

  async getChannel(id: number): Promise<Channel | undefined> {
    const ch = await MongoChannel.findOne({ id });
    return ch ? this.mapMongoDoc<Channel>(ch) : undefined;
  }

  async getChannelsByWorkspace(workspaceId: number): Promise<Channel[]> {
    const channels = await MongoChannel.find({ workspaceId }).sort({ createdAt: 1 });
    return channels.map((c: any) => this.mapMongoDoc<Channel>(c));
  }

  // ─── Message operations ──────────────────────────────────────────────────

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = await getNextSequenceValue("message_id");
    const newMessage = new MongoMessage({ ...message, isPinned: false, id });
    await newMessage.save();
    return this.mapMongoDoc<Message>(newMessage);
  }

  async getMessagesByChannel(channelId: number, limit = 50, before?: number): Promise<Message[]> {
    const filter: any = { channelId };
    if (before !== undefined) {
      filter.id = { $lt: before };
    }
    const messages = await MongoMessage.find(filter)
      .sort({ id: -1 })
      .limit(limit);
    // Return in ascending order so clients render oldest→newest
    return messages.reverse().map((m: any) => this.mapMongoDoc<Message>(m));
  }

  async deleteMessage(id: number): Promise<boolean> {
    const result = await MongoMessage.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async pinMessage(channelId: number, messageId: number): Promise<Channel | undefined> {
    await MongoMessage.findOneAndUpdate({ id: messageId }, { isPinned: true });
    const ch = await MongoChannel.findOneAndUpdate(
      { id: channelId },
      { $addToSet: { pinnedMessages: messageId } },
      { new: true }
    );
    return ch ? this.mapMongoDoc<Channel>(ch) : undefined;
  }

  async unpinMessage(channelId: number, messageId: number): Promise<Channel | undefined> {
    await MongoMessage.findOneAndUpdate({ id: messageId }, { isPinned: false });
    const ch = await MongoChannel.findOneAndUpdate(
      { id: channelId },
      { $pull: { pinnedMessages: messageId } },
      { new: true }
    );
    return ch ? this.mapMongoDoc<Channel>(ch) : undefined;
  }

  async getPinnedMessages(channelId: number): Promise<Message[]> {
    const messages = await MongoMessage.find({ channelId, isPinned: true }).sort({ id: 1 });
    return messages.map((m: any) => this.mapMongoDoc<Message>(m));
  }
}

export const storage = new MongoStorage();
