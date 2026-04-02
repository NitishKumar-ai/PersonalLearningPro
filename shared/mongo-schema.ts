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
  role: { type: String, enum: ["student", "teacher", "parent", "principal", "school_admin", "admin"], default: "student" },
  status: { type: String, enum: ["active", "pending", "suspended", "rejected"], default: "active" },
  school_code: { type: String, default: null },
  grade: { type: String, default: null },
  board: { type: String, default: null },
  subjects: [{ type: String }],
  district: { type: String, default: null },
  avatar: String,
  class: String,
  subject: String,
  // Firebase auth bridge (to be deprecated once full migration is complete)
  firebaseUid: { type: String, default: null, sparse: true },
  displayName: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  lastLoginAt: { type: Date, default: null },
});

// ─── Authentication Schemas ──────────────────────────────────────────────────
const SessionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  refreshTokenHash: { type: String, required: true },
  deviceInfo: { type: String, default: null },
  ipAddress: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

const OtpSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  otpHash: { type: String, required: true },
  type: { type: String, enum: ["registration", "password_reset", "2fa"], required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
});

// Indexes for Auth lookup
SessionSchema.index({ userId: 1 });
SessionSchema.index({ refreshTokenHash: 1 });
OtpSchema.index({ userId: 1, type: 1, used: 1 });

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

// ─── Test Assignment Schema ─────────────────────────────────────────────────

const TestAssignmentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  testId: { type: Number, required: true },
  studentId: { type: Number, required: true },
  assignedBy: { type: Number, required: true },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["pending", "started", "completed", "overdue"], default: "pending" },
  notificationSent: { type: Boolean, default: false },
});

// Indexes for efficient queries
TestAssignmentSchema.index({ studentId: 1, status: 1 });
TestAssignmentSchema.index({ testId: 1 });
TestAssignmentSchema.index({ dueDate: 1, status: 1 });

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
  senderRole: { type: String, enum: ['student', 'teacher', 'parent', 'principal', 'school_admin', 'admin'], default: 'student' },
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
export const MongoSession = mongoose.model("Session", SessionSchema);
export const MongoOtp = mongoose.model("Otp", OtpSchema);
export const MongoTest = mongoose.model("Test", TestSchema);
export const MongoQuestion = mongoose.model("Question", QuestionSchema);
export const MongoTestAttempt = mongoose.model("TestAttempt", TestAttemptSchema);
export const MongoAnswer = mongoose.model("Answer", AnswerSchema);
export const MongoAnalytics = mongoose.model("Analytics", AnalyticsSchema);
export const MongoTestAssignment = mongoose.model("TestAssignment", TestAssignmentSchema);
export const MongoWorkspace = mongoose.model("Workspace", WorkspaceSchema);
export const MongoChannel = mongoose.model("Channel", ChannelSchema);
export const MongoMessage = mongoose.model("Message", MessageSchema);

const LiveClassSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: null },
  teacherId: { type: Number, required: true },
  class: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  status: { type: String, enum: ["scheduled", "live", "completed", "cancelled"], default: "scheduled" },
  dailyRoomName: { type: String, default: null },
  dailyRoomUrl: { type: String, default: null },
  startedAt: { type: Date, default: null },
  endedAt: { type: Date, default: null },
  recordingUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export const MongoLiveClass = mongoose.model("LiveClass", LiveClassSchema);

const LiveSessionAttendanceSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  sessionId: { type: Number, required: true },
  studentId: { type: Number, required: true },
  joinedAt: { type: Date, default: Date.now },
  leftAt: { type: Date, default: null },
  durationMinutes: { type: Number, default: 0 },
});

export const MongoLiveSessionAttendance = mongoose.model("LiveSessionAttendance", LiveSessionAttendanceSchema);

const FcmTokenSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true },
  token: { type: String, required: true },
  deviceType: { type: String, default: null },
  updatedAt: { type: Date, default: Date.now },
});

export const MongoFcmToken = mongoose.model("FcmToken", FcmTokenSchema);

// ─── Task Schema ─────────────────────────────────────────────────────────────

const TaskSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, index: true },
  title: { type: String, required: true },
  status: { type: String, enum: ["backlog", "todo", "in-progress", "review", "done"], default: "todo" },
  priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
  tags: [{ type: String }],
  dueDate: { type: String, default: null },
  comments: { type: Number, default: 0 },
  attachments: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});
export const MongoTask = mongoose.model("Task", TaskSchema);

// ─── Notification Schema ──────────────────────────────────────────────────────

const NotificationSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, index: true },
  type: { type: String, enum: ["test", "result", "announcement", "message", "achievement", "reminder"], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  meta: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});
NotificationSchema.index({ userId: 1, createdAt: -1 });
export const MongoNotification = mongoose.model("Notification", NotificationSchema);

// ─── Focus Session Schema ─────────────────────────────────────────────────────

const FocusSessionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  userId: { type: Number, required: true, index: true },
  subject: { type: String, required: true },
  mode: { type: String, enum: ["work", "short", "long"], required: true },
  durationSeconds: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
});
FocusSessionSchema.index({ userId: 1, completedAt: -1 });
export const MongoFocusSession = mongoose.model("FocusSession", FocusSessionSchema);

export { getNextSequenceValue };
