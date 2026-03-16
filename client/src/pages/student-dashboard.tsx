import { useState } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Brain,
  Trophy,
  Clock,
  Calendar,
  TrendingUp,
  Target,
  Flame,
  Star,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Zap,
  Users,
  Play,
  Atom,
  FlaskConical,
  Calculator,
  Leaf,
  Code2,
  Headphones,
  UserCheck,
  Bot,
  Timer,
  BellRing,
  Sparkles,
  Video,
  Lightbulb,
  Award,
  Gamepad2,
  Heart,
  MessageSquare,
  BarChart3,
  Activity,
  Compass,
  Target as TargetIcon,
  BookMarked,
  RefreshCw,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Volume2,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { PageHeader } from "@/components/layout/page-header";
import { SmartCard } from "@/components/ui/smart-card";
import { StreakWidget } from "@/components/student/StreakWidget";
import { XPProgressBar } from "@/components/student/XPProgressBar";
import { BadgePop } from "@/components/student/animations/BadgePop";
import { motion } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
// ─── Helpers ────────────────────────────────────────────────────────────────

const subjectMeta: Record<
  string,
  {
    icon: React.ReactNode;
    textColor: string;
    bgColor: string;
    accentColor: string;
  }
> = {
  Physics: {
    icon: <Atom className="h-5 w-5" />,
    textColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-500/10",
    accentColor: "bg-blue-500/30",
  },
  Chemistry: {
    icon: <FlaskConical className="h-5 w-5" />,
    textColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-500/10",
    accentColor: "bg-orange-500/30",
  },
  Mathematics: {
    icon: <Calculator className="h-5 w-5" />,
    textColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-500/10",
    accentColor: "bg-indigo-500/30",
  },
  Biology: {
    icon: <Leaf className="h-5 w-5" />,
    textColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10",
    accentColor: "bg-emerald-500/30",
  },
  "Computer Science": {
    icon: <Code2 className="h-5 w-5" />,
    textColor: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-500/10",
    accentColor: "bg-purple-500/30",
  },
};

const getTimetableCellColor = (name: string) => {
  const colors: Record<string, string> = {
    Physics: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    Chemistry: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    Mathematics: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    Biology: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    CS: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    English: "bg-muted text-muted-foreground",
    Lunch: "bg-muted text-muted-foreground font-medium",
  };
  return colors[name] || "bg-card text-muted-foreground";
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { currentUser } = useFirebaseAuth();
  const [communitiesOpen, setCommunitiesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [focusMode, setFocusMode] = useState(false);
  const [studyRoomJoined, setStudyRoomJoined] = useState(false);
  const [showBadge, setShowBadge] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<{name: string, emoji: string, description: string} | null>(null);

  const triggerBadge = () => {
    setEarnedBadge({
      name: "Knowledge Seeker",
      emoji: "📚",
      description: "You've successfully refactored the EduAI design guide! Your dedication to student psychology is unmatched."
    });
    setShowBadge(true);
  };

  // ── Data ──────────────────────────────────────────────────────────────────

  const heroSession = {
    subject: "Physics",
    topic: "Kinematics Review",
    progress: 60,
    examIn: "2 days",
    isExamSoon: true,
    lastStudied: "Yesterday, 8:30 PM",
  };

  const subjects = [
    { name: "Physics", progress: 72, grade: "A-" },
    { name: "Chemistry", progress: 65, grade: "B+" },
    { name: "Mathematics", progress: 88, grade: "A" },
    { name: "Biology", progress: 78, grade: "A-" },
    { name: "Computer Science", progress: 91, grade: "A+" },
  ];

  const todaySchedule = [
    { time: "8:00", subject: "Physics" },
    { time: "9:00", subject: "Mathematics" },
    { time: "10:00", subject: "Chemistry" },
    { time: "11:00", subject: "English" },
    { time: "12:00", subject: "Lunch" },
    { time: "1:00", subject: "Computer Science" },
    { time: "2:00", subject: "Biology" },
  ];

  const liveRooms = [
    {
      title: "Physics Doubts Session",
      host: "Mrs. Sharma",
      role: "teacher" as const,
      participants: 14,
      duration: "22m",
      subject: "Physics",
    },
    {
      title: "Calculus Study Group",
      host: "Aryan & Group",
      role: "student" as const,
      participants: 6,
      duration: "8m",
      subject: "Mathematics",
    },
    {
      title: "AI Chemistry Tutor",
      host: "AI Tutor",
      role: "ai" as const,
      participants: 3,
      duration: "15m",
      subject: "Chemistry",
    },
  ];

  const upcomingTests = [
    {
      subject: "Physics",
      topic: "Electromagnetic Waves",
      date: "Tomorrow",
      type: "Quiz",
      href: "/test/1",
      isUrgent: true,
      isAnnounced: true,
    },
    {
      subject: "Mathematics",
      topic: "Calculus — Integration",
      date: "In 3 days",
      type: "Unit Test",
      isUrgent: false,
      isAnnounced: false,
    },
    {
      subject: "Chemistry",
      topic: "Organic Chemistry",
      date: "Next week",
      type: "Mid-term",
      isUrgent: false,
      isAnnounced: false,
    },
  ];

  const recentResults = [
    { subject: "Mathematics", topic: "Trigonometry", score: 92, total: 100, date: "2 days ago" },
    { subject: "Physics", topic: "Kinematics", score: 78, total: 100, date: "5 days ago" },
    { subject: "Computer Science", topic: "Data Structures", score: 95, total: 100, date: "1 week ago" },
  ];

  const achievements = [
    {
      title: "Perfect Score",
      desc: "100% on Computer Science quiz",
      icon: <Star className="h-5 w-5" />,
      color: "from-amber-400 to-yellow-500",
    },
    {
      title: "6 Day Streak",
      desc: "Studied 6 days in a row",
      icon: <Flame className="h-5 w-5" />,
      color: "from-orange-400 to-red-500",
    },
    {
      title: "Quick Learner",
      desc: "Completed 3 topics this week",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "from-blue-400 to-indigo-500",
    },
  ];

  const timetable = [
    { time: "8:00", mon: "Physics", tue: "Mathematics", wed: "Chemistry", thu: "Physics", fri: "Biology" },
    { time: "9:00", mon: "Mathematics", tue: "English", wed: "Physics", thu: "Chemistry", fri: "CS" },
    { time: "10:00", mon: "Chemistry", tue: "Physics", wed: "Mathematics", thu: "Biology", fri: "Mathematics" },
    { time: "11:00", mon: "English", tue: "Biology", wed: "CS", thu: "English", fri: "Physics" },
    { time: "12:00", mon: "Lunch", tue: "Lunch", wed: "Lunch", thu: "Lunch", fri: "Lunch" },
    { time: "1:00", mon: "CS", tue: "Chemistry", wed: "English", thu: "Mathematics", fri: "Chemistry" },
    { time: "2:00", mon: "Biology", tue: "CS", wed: "Biology", thu: "CS", fri: "English" },
  ];

  const quickActions = [
    {
      title: "Ask AI Tutor",
      desc: "Get instant help",
      icon: <Brain className="h-6 w-6" />,
      href: "/ai-tutor",
      gradient: "from-violet-500 to-purple-600",
      isPrimary: true,
    },
    {
      title: "Join Room",
      desc: "Study with peers",
      icon: <Video className="h-6 w-6" />,
      href: "/messages",
      gradient: "from-blue-500 to-cyan-600",
      isPrimary: false,
    },
    {
      title: "Focus Session",
      desc: "Timed deep work",
      icon: <Headphones className="h-6 w-6" />,
      href: "/focus",
      gradient: "from-emerald-500 to-teal-600",
      isPrimary: false,
    },
    {
      title: "Find Partner",
      desc: "Match study buddy",
      icon: <UserCheck className="h-6 w-6" />,
      href: "/partners",
      gradient: "from-rose-500 to-pink-600",
      isPrimary: false,
    },
  ];

  const communities = [
    { name: "Physics IIT Prep", members: 420, icon: <Atom className="h-5 w-5" /> },
    { name: "Maths Olympiad", members: 215, icon: <Calculator className="h-5 w-5" /> },
    { name: "Bio NEET Warriors", members: 318, icon: <Leaf className="h-5 w-5" /> },
  ];

  // ── Role badges ────────────────────────────────────────────────────────────

  const roleBadge = (role: "teacher" | "student" | "ai") => {
    if (role === "teacher")
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
          <UserCheck className="h-3 w-3" /> Teacher Session
        </span>
      );
    if (role === "student")
      return (
        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
          <Users className="h-3 w-3" /> Student Session
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
        <Bot className="h-3 w-3" /> AI Session
      </span>
    );
  };

  const heroMeta = subjectMeta[heroSession.subject];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ────────────────────────────────────────────────────────────────────
          PAGE HEADER
      ──────────────────────────────────────────────────────────────────── */}
      <PageHeader
        title={`Welcome back, ${currentUser?.profile?.displayName || "Student"} 👋`}
        subtitle="Keep up the great work! Here's your learning overview."
        className="animate-fade-in-up"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Student Dashboard" },
        ]}
      >
        <Button asChild variant="default" className="rounded-full shadow-soft bg-accent hover:bg-accent-hover">
          <Link href="/ai-tutor">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Tutor
          </Link>
        </Button>
      </PageHeader>

      {/* ────────────────────────────────────────────────────────────────────
          1. EMOTIONAL STATS (Psychology: Row 1)
      ──────────────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <StreakWidget 
          streak={6} 
          activity={[true, true, true, true, true, true, false]} 
          className="lg:col-span-1"
        />
        <XPProgressBar 
          currentXP={450} 
          nextLevelXP={1000} 
          level={12} 
          className="lg:col-span-2"
        />
        <SmartCard type="flat" className="flex flex-col justify-center items-center text-center">
          <div className="p-3 rounded-full bg-progress-soft text-progress mb-2">
            <Trophy className="h-6 w-6" />
          </div>
          <div className="stat-number leading-none text-2xl">#4</div>
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Class Rank</div>
        </SmartCard>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          2. TODAY SUMMARY STRIP
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-wrap items-center gap-6 px-8 py-5 rounded-2xl bg-muted/50 border border-border shadow-sm">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4" /> Today
          </span>
          <div className="h-6 w-px bg-muted hidden md:block" />
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="h-4 w-4 text-accent" />
            <span>2 sessions complete</span>
          </span>
          <div className="h-6 w-px bg-muted hidden md:block" />
          <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span>45m of deep study</span>
          </span>
          <div className="ml-auto">
            <Badge variant="accent" className="rounded-full px-4 py-1 text-[10px] font-bold">
              🎯 ON TRACK
            </Badge>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          2. HERO CARD + QUICK ACTIONS  (Priority Zone 1 + 2)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-7">
        {/* ── Hero Card ── */}
        <div
          className="lg:col-span-3 animate-fade-in-up rounded-2xl border border-border bg-card overflow-hidden shadow-soft"
          style={{ animationDelay: "100ms" }}
        >
          <div className="p-8">
            {/* Header row */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="default">
                    Current Topic
                  </Badge>
                  {heroSession.isExamSoon && (
                    <Badge variant="live">
                      Exam in {heroSession.examIn}
                    </Badge>
                  )}
                </div>
                <h2 className="text-3xl font-display text-foreground tracking-tight leading-tight">{heroSession.topic}</h2>
                <p className="text-base font-medium text-muted-foreground mt-1">{heroSession.subject}</p>
              </div>
              {/* Subject icon */}
              <div
                className={`p-4 rounded-2xl ${heroMeta.bgColor} ${heroMeta.textColor} shadow-soft flex-shrink-0`}
              >
                {heroMeta.icon}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2.5">
                <span>Course Progress</span>
                <span className="text-accent">{heroSession.progress}%</span>
              </div>
              <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-accent transition-all duration-1000 ease-out"
                  style={{ width: `${heroSession.progress}%` }}
                />
              </div>
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-6">
              <Button
                asChild
                className="flex-1 shadow-card"
              >
                <Link href="/ai-tutor">
                  <Play className="h-4 w-4 mr-2" />
                  Continue Learning
                </Link>
              </Button>
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-0.5">Last Study</div>
                <div className="text-sm font-medium text-foreground">{heroSession.lastStudied}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)]">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <Card
                  className={`group cursor-pointer hover:-translate-y-1 hover:shadow-card transition-all duration-200 h-full border-border ${action.isPrimary
                    ? "bg-accent-soft border-accent/10"
                    : "bg-card"
                    }`}
                >
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div
                      className={`p-2.5 rounded-xl bg-background/50 backdrop-blur-sm shadow-soft group-hover:shadow-md transition-shadow w-fit ${action.isPrimary ? "text-accent" : "text-muted-foreground"}`}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground leading-tight">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{action.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          3. TODAY'S SCHEDULE (horizontal strip)
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today's Schedule
          </h2>
          <span className="text-xs text-muted-foreground font-medium">Wednesday, Oct 24</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {todaySchedule.map((slot, i) => {
            const meta = subjectMeta[slot.subject];
            const isNow = i === 2; // Mock: 3rd slot is current
            return (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-5 py-4 rounded-2xl border transition-all ${isNow
                  ? "bg-accent-soft border-accent/20 shadow-soft"
                  : slot.subject === "Lunch"
                    ? "bg-muted border-transparent opacity-60"
                    : "bg-card border-border hover:bg-muted"
                  }`}
              >
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">{slot.time}</span>
                {meta ? (
                  <span className={`${meta.textColor}`}>{meta.icon}</span>
                ) : <span className="h-5 w-5" />}
                <span
                  className={`text-sm font-semibold ${meta ? "text-foreground" : "text-muted-foreground"
                    }`}
                >
                  {slot.subject}
                </span>
                {isNow && (
                  <Badge variant="accent" className="mt-1 text-[9px] px-1.5 py-0">NOW</Badge>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          4. LIVE ROOMS
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            Live Now
            <Badge variant="default" className="ml-1">
              {liveRooms.length} active
            </Badge>
          </h2>
          <Link href="/messages" className="text-xs text-accent font-semibold hover:underline flex items-center gap-1">
            View All Rooms <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {liveRooms.map((room, i) => {
            const meta = subjectMeta[room.subject];
            return (
              <Card
                key={i}
                className="group hover:-translate-y-1 hover:shadow-card transition-all duration-200 border-border overflow-hidden"
              >
                <CardContent className="p-6">
                  {/* Live badge row */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="live">Live</Badge>
                    </div>
                    {room.role === "teacher" ? (
                      <Badge variant="accent">Instructor</Badge>
                    ) : (
                      <Badge variant="default">Group Study</Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-lg text-foreground mb-1 leading-snug">{room.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5">{room.host}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {room.participants}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Timer className="h-4 w-4 text-muted-foreground" />
                      {room.duration}
                    </span>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className="w-full bg-accent text-white hover:bg-accent-hover shadow-soft"
                  >
                    <Link href="/messages">Join Room</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          5. SUBJECT PROGRESS
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Course Progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {subjects.map((subject, index) => {
            const meta = subjectMeta[subject.name];
            const type = subject.name.split(" ")[0].toLowerCase() as any;
            return (
              <SmartCard
                key={subject.name}
                type={type}
                className="group hover:-translate-y-2"
                style={{ animationDelay: `${300 + index * 50}ms` }}
              >
                {/* Icon + grade */}
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-2.5 rounded-xl bg-background/50 backdrop-blur-sm shadow-soft transition-transform group-hover:scale-110`}
                  >
                    <span className={meta.textColor}>{meta.icon}</span>
                  </div>
                  <span
                    className="text-sm font-bold text-foreground bg-background/50 backdrop-blur-sm px-2 py-0.5 rounded-full"
                  >
                    {subject.grade}
                  </span>
                </div>

                <div className="font-bold text-sm text-foreground mb-4 truncate" title={subject.name}>{subject.name}</div>

                {/* Progress bar */}
                <div className="relative h-1.5 rounded-full bg-black/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className={`absolute inset-y-0 left-0 rounded-full ${meta.accentColor}`}
                  />
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                  {subject.progress}% Complete
                </div>
              </SmartCard>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          6. TESTS
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Tests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Upcoming Evaluations
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingTests.map((test, i) => {
                const meta = subjectMeta[test.subject];
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-soft ${test.isUrgent
                      ? "border-red-200 bg-red-500/10"
                      : "border-border bg-card"
                      }`}
                  >
                    <div className={`p-3 rounded-xl ${meta?.bgColor} ${meta?.textColor} flex-shrink-0 shadow-soft`}>
                      {meta?.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold text-sm text-foreground truncate">{test.topic}</span>
                        {test.isUrgent && (
                          <Badge variant="live" className="animate-none">Urgent</Badge>
                        )}
                        {test.isAnnounced && (
                          <Badge variant="warning">Posted</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {test.subject} · {test.type}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-foreground mb-2">{test.date}</div>
                      <Button variant="outline" size="sm" className="h-8 px-4" asChild>
                        <Link href={test.href || "/tests"}>Prepare</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Recent Achievements
              </h2>
            </div>
            <div className="space-y-3">
              {recentResults.map((result, i) => {
                const pct = (result.score / result.total) * 100;
                const scoreColor =
                  pct >= 90
                    ? "text-emerald-700"
                    : pct >= 70
                      ? "text-blue-700"
                      : "text-amber-700";
                const bgColor =
                  pct >= 90
                    ? "bg-emerald-500/10"
                    : pct >= 70
                      ? "bg-blue-500/10"
                      : "bg-amber-500/10";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-soft transition-all"
                  >
                    <div className={`p-3 rounded-xl ${bgColor} ${scoreColor} flex-shrink-0 shadow-soft`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate mb-1">{result.topic}</div>
                      <div className="text-xs text-muted-foreground font-medium font-body">
                        {result.subject} · {result.date}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-display text-foreground leading-tight">
                        {result.score}
                        <span className="text-sm text-muted-foreground font-body">/{result.total}</span>
                      </div>
                      <div className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${scoreColor}`}>
                        {pct >= 90 ? "Excellent" : pct >= 70 ? "Stable" : "Needs Review"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          7. ACHIEVEMENTS + ANALYTICS
      ──────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">
        {/* Achievements */}
        <Card className="animate-fade-in-up hover:shadow-md transition-all duration-300" style={{ animationDelay: "400ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base font-semibold">Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`p-2 rounded-xl bg-gradient-to-br ${achievement.color} text-white shadow-sm flex-shrink-0`}
                  >
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">{achievement.desc}</div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-1" asChild>
                <Link href="/achievements">
                  View All
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analytics + Progress Detail */}
        <Card className="lg:col-span-2 animate-fade-in-up hover:shadow-card transition-all duration-300" style={{ animationDelay: "420ms" }}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Learning Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stats */}
              <div>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    { label: "Avg. Score", value: "82%", change: "+5%", positive: true },
                    { label: "Tests", value: "24", change: "3 new", positive: true },
                    { label: "Study hrs", value: "18h", change: "-2h", positive: false },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl bg-muted border border-border text-center">
                      <div className="text-xl font-display text-foreground leading-none">{stat.value}</div>
                      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold mt-1.5 whitespace-nowrap">
                        {stat.label}
                      </div>
                      <div
                        className={`text-[9px] mt-1 font-bold ${stat.positive ? "text-emerald-700" : "text-amber-700"
                          }`}
                      >
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="text-[10px] font-bold flex items-center gap-2 mb-4 text-muted-foreground uppercase tracking-widest">
                  <TrendingUp className="h-4 w-4" />
                  Performance by Subject
                </h4>
                <div className="space-y-4">
                  {subjects.slice(0, 4).map((subject) => {
                    const meta = subjectMeta[subject.name];
                    return (
                      <div key={subject.name} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium">
                          <span className="text-foreground">{subject.name}</span>
                          <span className={`${meta.textColor} font-bold`}>{subject.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${meta.accentColor} transition-all duration-1000`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar chart */}
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    data={subjects.map((s) => ({ subject: s.name.split(" ")[0], fullMark: 100, score: s.progress }))}
                  >
                    <PolarGrid stroke="#E6E0D4" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "#4A4947", fontSize: 10, fontWeight: 500 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke="#CC7B5C"
                      fill="#CC7B5C"
                      fillOpacity={0.15}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFF9F0",
                        borderColor: "#E6E0D4",
                        borderRadius: "1rem",
                        fontSize: "12px",
                        boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)"
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          8. COMMUNITIES
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
        <button
          onClick={() => setCommunitiesOpen((v) => !v)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors w-full mb-4 group"
        >
          <Users className="h-4 w-4" />
          Network & Communities
          <div className="h-px flex-1 bg-border ml-2 group-hover:bg-accent/20 transition-colors" />
          <ChevronDown
            className={`h-4 w-4 ml-2 transition-transform duration-200 ${communitiesOpen ? "rotate-180" : ""}`}
          />
        </button>

        {communitiesOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in">
            {communities.map((c, i) => (
              <Card key={i} className="hover:-translate-y-1 hover:shadow-soft transition-all duration-200 cursor-pointer border-border bg-card">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-accent-soft text-accent shadow-soft">{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground font-medium">{c.members} members</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          9. WEEKLY TIMETABLE
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <Card className="border-border bg-card shadow-soft">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent" />
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Weekly Curriculum
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" className="h-8">
                <RefreshCw className="h-3 w-3 mr-2" />
                Update
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left py-4 px-6 text-muted-foreground font-bold text-[10px] uppercase tracking-widest border-r border-border sticky left-0 z-20 bg-muted">
                        Time Block
                      </th>
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                        <th
                          key={day}
                          className="text-center py-4 px-4 text-muted-foreground font-bold text-[10px] uppercase tracking-widest"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-400">
                    {timetable.map((row, i) => (
                      <tr key={i} className="hover:bg-muted transition-colors">
                        <td className="py-4 px-6 font-bold text-[10px] uppercase tracking-tighter text-accent sticky left-0 z-20 bg-background border-r border-border">
                          {row.time}
                        </td>
                        {[row.mon, row.tue, row.wed, row.thu, row.fri].map((subject, j) => (
                          <td key={j} className="text-center py-3 px-2">
                            <span
                              className={`inline-block px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${getTimetableCellColor(subject)}`}
                            >
                              {subject}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Learning Tools */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: "600ms" }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Productivity Suite
            <Badge variant="live" className="ml-1 uppercase tracking-widest text-[9px]">
              New
            </Badge>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: <BookMarked className="h-5 w-5" />, title: "Smart Notes", desc: "AI Summaries" },
            { icon: <TargetIcon className="h-5 w-5" />, title: "Practice Hub", desc: "Adaptive Drill" },
            { icon: <BarChart3 className="h-5 w-5" />, title: "Insights", desc: "Real-time Data" },
            { icon: <Award className="h-5 w-5" />, title: "Skill Lab", desc: "Earn Badges" },
          ].map((tool, i) => (
            <Card key={i} className="group hover:-translate-y-1 hover:shadow-card transition-all duration-200 cursor-pointer border-border bg-card">
              <CardContent className="p-6 text-center">
                <div className="p-4 rounded-2xl bg-muted text-accent mx-auto mb-4 w-fit group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-soft">
                  {tool.icon}
                </div>
                <div className="font-semibold text-sm text-foreground mb-1 leading-tight">{tool.title}</div>
                <div className="text-xs text-muted-foreground font-medium">{tool.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Focus Mode Toggle */}
      {focusMode && (
        <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in p-6">
          <Card className="w-full max-w-2xl border border-border bg-muted shadow-modal overflow-hidden">
            <CardContent className="p-10">
              <div className="text-center mb-10">
                <div className="p-6 rounded-full bg-accent text-white mx-auto mb-6 w-fit shadow-soft animate-pulse-live">
                  <Headphones className="h-10 w-10" />
                </div>
                <h2 className="text-4xl font-display text-foreground mb-2 tracking-tight">Deep Focus Active</h2>
                <p className="text-lg text-muted-foreground font-body">Minimal environment enabled • All distractions silenced</p>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-soft">
                  <div className="text-3xl font-display text-accent mb-1 leading-none">25:00</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Time Left</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-soft">
                  <div className="text-xl font-display text-foreground mb-1 leading-none">Physics</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Subject</div>
                </div>
                <div className="text-center p-6 rounded-2xl bg-card border border-border shadow-soft">
                  <div className="text-2xl font-display text-foreground mb-1 leading-none">87</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score</div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 h-12 text-sm font-bold uppercase tracking-widest" onClick={() => setFocusMode(false)}>
                  End Session
                </Button>
                <Button className="flex-1 h-12 text-sm font-bold uppercase tracking-widest shadow-soft">
                  Add 10 Minutes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Badge Achievement Overlay */}
      <BadgePop 
        badge={earnedBadge} 
        isOpen={showBadge} 
        onClose={() => setShowBadge(false)} 
      />

      {/* Mock Trigger for Demo - Floating Button */}
      {!showBadge && (
        <Button 
          onClick={triggerBadge}
          className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-modal bg-energy hover:bg-energy-dark border-2 border-white/20 animate-bounce"
        >
          <Award className="h-7 w-7 text-white" />
        </Button>
      )}
    </>
  );
}