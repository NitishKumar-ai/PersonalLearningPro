import mongoose from "mongoose";

const AnalyticsSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  testId: { type: Number, required: true },
  weakTopics: [String],
  strongTopics: [String],
  recommendedResources: [String],
  insightDate: { type: Date, default: Date.now },
});

const UserSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["student", "teacher", "parent", "principal", "admin"], default: "student" },
  avatar: String,
  class: String,
  subject: String,
  // Firebase auth bridge
  firebaseUid: { type: String, default: null, sparse: true },
  displayName: { type: String, default: null },
});

const TestSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: String,
  subject: { type: String, required: true },
  class: { type: String, required: true },
  teacherId: { type: Number, required: true },
  totalMarks: { type: Number, default: 100 },
  duration: { type: Number, default: 60 },
  testDate: { type: Date, required: true },
  questionTypes: [String],
  status: { type: String, enum: ["draft", "published", "completed"], default: "draft" },
  createdAt: { type: Date, default: Date.now },
});

const QuestionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  testId: { type: Number, required: true },
  type: { type: String, enum: ["mcq", "short", "long", "numerical"], required: true },
  text: { type: String, required: true },
  options: mongoose.Schema.Types.Mixed,
  correctAnswer: String,
  marks: { type: Number, default: 1 },
  order: { type: Number, required: true },
  aiRubric: String,
});

const TestAttemptSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  testId: { type: Number, required: true },
  studentId: { type: Number, required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  score: Number,
  status: { type: String, enum: ["in_progress", "completed", "evaluated"], default: "in_progress" },
});

const AnswerSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  attemptId: { type: Number, required: true },
  questionId: { type: Number, required: true },
  text: String,
  selectedOption: Number,
  imageUrl: String,
  ocrText: String,
  score: Number,
  aiConfidence: Number,
  aiFeedback: String,
  isCorrect: Boolean,
});

// Auto-increment counter for MongoDB IDs
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', CounterSchema);

async function getNextSequenceValue(sequenceName: string) {
  const sequenceDocument = await Counter.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return sequenceDocument.seq;
}

// ─── Chat Feature Schemas ───────────────────────────────────────────────────

const WorkspaceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: null },
  ownerId: { type: Number, required: true },
  members: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
});

const ChannelSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  workspaceId: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["text", "announcement", "dm"], default: "text" },
  class: { type: String, default: null },
  subject: { type: String, default: null },
  pinnedMessages: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
  // Phase 3: Messaging feature extensions
  category: { type: String, enum: ['announcement', 'class', 'teacher', 'friend', 'parent'], default: 'class' },
  isReadOnly: { type: Boolean, default: false },
  participants: [{ type: String }],   // firebase UIDs (for DMs between two users)
  unreadCounts: { type: Map, of: Number, default: {} }, // firebaseUid → unread count
  typingUsers: [{ type: String }],   // firebase UIDs currently typing
});

const MessageSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  channelId: { type: Number, required: true },
  authorId: { type: Number, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ["text", "file", "image"], default: "text" },
  fileUrl: { type: String, default: null },
  isPinned: { type: Boolean, default: false },
  isHomework: { type: Boolean, default: false },
  gradingStatus: { type: String, enum: ["pending", "graded", null], default: null },
  readBy: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
  // Phase 3: Messaging feature extensions
  senderRole: { type: String, enum: ['student', 'teacher', 'parent', 'principal', 'admin'], default: 'student' },
  messageType: { type: String, enum: ['text', 'doubt', 'assignment', 'announcement', 'system'], default: 'text' },
  replyTo: { type: Number, default: null },          // message id being replied to
  mentions: [{ type: String }],                      // firebase UIDs mentioned
  isDoubtAnswered: { type: Boolean, default: false },
  assignmentData: {
    title: { type: String },
    dueDate: { type: Date },
    fileUrl: { type: String },
    subject: { type: String },
  },
  deliveredTo: [{ type: String }],                   // firebase UIDs message was delivered to
});


export const MongoUser = mongoose.model("User", UserSchema);
export const MongoTest = mongoose.model("Test", TestSchema);
export const MongoQuestion = mongoose.model("Question", QuestionSchema);
export const MongoTestAttempt = mongoose.model("TestAttempt", TestAttemptSchema);
export const MongoAnswer = mongoose.model("Answer", AnswerSchema);
export const MongoAnalytics = mongoose.model("Analytics", AnalyticsSchema);
export const MongoWorkspace = mongoose.model("Workspace", WorkspaceSchema);
export const MongoChannel = mongoose.model("Channel", ChannelSchema);
export const MongoMessage = mongoose.model("Message", MessageSchema);

export { getNextSequenceValue };
