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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { PageHeader } from "@/components/layout/page-header";
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
    gradient: string;
    glow: string;
    icon: React.ReactNode;
    textColor: string;
    bgColor: string;
    color: string;
    lightBg: string;
  }
> = {
  Physics: {
    gradient: "from-blue-500 to-indigo-600",
    glow: "glow-border-blue",
    icon: <Atom className="h-6 w-6" />,
    textColor: "text-blue-500",
    bgColor: "bg-blue-500/10",
    color: "from-blue-500 to-indigo-600",
    lightBg: "from-blue-500/10 to-indigo-500/10",
  },
  Chemistry: {
    gradient: "from-orange-500 to-amber-500",
    glow: "glow-border-orange",
    icon: <FlaskConical className="h-6 w-6" />,
    textColor: "text-orange-500",
    bgColor: "bg-orange-500/10",
    color: "from-orange-500 to-amber-500",
    lightBg: "from-orange-500/10 to-amber-500/10",
  },
  Mathematics: {
    gradient: "from-indigo-500 to-purple-600",
    glow: "glow-border-purple",
    icon: <Calculator className="h-6 w-6" />,
    textColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    color: "from-indigo-500 to-purple-600",
    lightBg: "from-indigo-500/10 to-purple-500/10",
  },
  Biology: {
    gradient: "from-emerald-500 to-teal-600",
    glow: "glow-border-green",
    icon: <Leaf className="h-6 w-6" />,
    textColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    color: "from-emerald-500 to-teal-600",
    lightBg: "from-emerald-500/10 to-teal-500/10",
  },
  "Computer Science": {
    gradient: "from-purple-500 to-violet-600",
    glow: "glow-border-purple",
    icon: <Code2 className="h-6 w-6" />,
    textColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    color: "from-purple-500 to-violet-600",
    lightBg: "from-purple-500/10 to-violet-500/10",
  },
};

const getTimetableCellColor = (name: string) => {
  const colors: Record<string, string> = {
    Physics: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    Chemistry: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
    Mathematics: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
    Biology: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    CS: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    English: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
    Lunch: "bg-muted text-muted-foreground",
  };
  return colors[name] || "bg-muted text-muted-foreground";
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { currentUser } = useFirebaseAuth();
  const [communitiesOpen, setCommunitiesOpen] = useState(false);

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
        title={`Welcome back, ${currentUser?.profile?.displayName || "Student"} 🎓`}
        subtitle="Keep up the great work! Here's your learning overview."
        className="animate-fade-in-up"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Student Dashboard" },
        ]}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20 border border-orange-500/20">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <div className="text-base font-bold leading-none">6</div>
            <div className="text-[10px] text-muted-foreground leading-tight">Day Streak</div>
          </div>
        </div>
        <Button asChild>
          <Link href="/ai-tutor">
            <Brain className="h-4 w-4 mr-2" />
            AI Tutor
          </Link>
        </Button>
      </PageHeader>

      {/* ────────────────────────────────────────────────────────────────────
          1. TODAY SUMMARY STRIP
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-6 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
        <div className="flex flex-wrap items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-primary/5 via-primary/8 to-violet-500/5 border border-primary/15">
          <span className="text-sm font-semibold text-foreground/80">📅 Today</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>2 sessions</span>
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Timer className="h-4 w-4 text-blue-500" />
            <span>45m studied</span>
          </span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Flame className="h-4 w-4 text-orange-500" />
            <span>Streak: 6 days</span>
          </span>
          <div className="ml-auto">
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15 text-xs font-semibold">
              🎯 On Track
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
          className={`lg:col-span-3 animate-fade-in-up rounded-2xl border bg-card ${heroMeta.glow} overflow-hidden`}
          style={{ animationDelay: "100ms" }}
        >
          {/* Top gradient accent */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${heroMeta.gradient}`} />

          <div className="p-6">
            {/* Header row */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold border-0 ${heroMeta.bgColor} ${heroMeta.textColor}`}
                  >
                    CURRENT TOPIC
                  </Badge>
                  {heroSession.isExamSoon && (
                    <Badge className="text-[10px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20">
                      🔥 Exam in {heroSession.examIn}
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{heroSession.topic}</h2>
                <p className={`text-sm mt-0.5 font-medium ${heroMeta.textColor}`}>{heroSession.subject}</p>
              </div>
              {/* Floating subject icon */}
              <div
                className={`p-4 rounded-2xl bg-gradient-to-br ${heroMeta.gradient} text-white shadow-lg animate-float flex-shrink-0`}
              >
                {heroMeta.icon}
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className={`font-bold ${heroMeta.textColor}`}>{heroSession.progress}% Complete</span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${heroMeta.gradient} transition-all duration-1000`}
                  style={{ width: `${heroSession.progress}%` }}
                />
              </div>
              {/* Progress labels */}
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                <span>Start</span>
                <span className="font-semibold">{heroSession.progress}%</span>
                <span>Complete</span>
              </div>
            </div>

            {/* CTA row */}
            <div className="flex items-center gap-3">
              <Button
                asChild
                className={`flex-1 bg-gradient-to-r ${heroMeta.gradient} hover:opacity-90 transition-opacity text-white border-0 shadow-md font-semibold`}
              >
                <Link href="/ai-tutor">
                  <Play className="h-4 w-4 mr-2 fill-white" />
                  Resume Session
                </Link>
              </Button>
              <div className="text-right text-xs text-muted-foreground">
                <div className="font-medium">Last studied</div>
                <div>{heroSession.lastStudied}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)]">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <Card
                  className={`group cursor-pointer hover:-translate-y-1.5 hover:shadow-xl transition-all duration-250 h-full border ${action.isPrimary
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10 hover:bg-primary/10"
                      : "hover:border-border/80"
                    }`}
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div
                      className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-sm group-hover:shadow-md transition-shadow w-fit`}
                    >
                      {action.icon}
                    </div>
                    <div>
                      <div className="font-semibold text-sm leading-tight">{action.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{action.desc}</div>
                    </div>
                    {action.isPrimary && (
                      <Badge className="w-fit text-[9px] font-bold bg-primary/10 text-primary border-primary/20 px-1.5 py-0">
                        ⭐ POPULAR
                      </Badge>
                    )}
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
      <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today's Schedule
          </h2>
          <span className="text-xs text-muted-foreground">Wednesday</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
          {todaySchedule.map((slot, i) => {
            const meta = subjectMeta[slot.subject];
            const isNow = i === 2; // Mock: 3rd slot is current
            return (
              <div
                key={i}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all ${isNow
                    ? `bg-gradient-to-b ${meta?.lightBg || "from-primary/10 to-primary/5"} border-primary/30 shadow-sm`
                    : slot.subject === "Lunch"
                      ? "bg-muted/50 border-border/50 opacity-70"
                      : "bg-card hover:bg-muted/40 border-border/50"
                  }`}
              >
                <span className="text-[10px] text-muted-foreground font-medium">{slot.time}</span>
                {meta ? (
                  <span className={`${meta.textColor}`}>{meta.icon && <span className="scale-75 inline-block">{meta.icon}</span>}</span>
                ) : null}
                <span
                  className={`text-[11px] font-semibold ${meta ? meta.textColor : "text-muted-foreground"
                    }`}
                >
                  {slot.subject}
                </span>
                {isNow && (
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 rounded-full">NOW</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          4. LIVE ROOMS
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "250ms" }}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            Live Rooms
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
              {liveRooms.length} active
            </Badge>
          </h2>
          <Link href="/messages" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {liveRooms.map((room, i) => {
            const meta = subjectMeta[room.subject];
            return (
              <Card
                key={i}
                className="group hover:-translate-y-1 hover:shadow-lg transition-all duration-250 border overflow-hidden"
              >
                {/* Accent bar */}
                <div className={`h-0.5 w-full bg-gradient-to-r ${meta?.gradient || "from-primary to-primary"}`} />
                <CardContent className="p-4">
                  {/* Live badge row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="animate-pulse-live inline-block w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        Live
                      </span>
                    </div>
                    {roleBadge(room.role)}
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-sm mb-1 leading-snug">{room.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{room.host}</p>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <strong className="text-foreground">{room.participants}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" />
                      <strong className="text-foreground">{room.duration}</strong>
                    </span>
                  </div>

                  <Button
                    asChild
                    size="sm"
                    className={`w-full bg-gradient-to-r ${meta?.gradient || "from-primary to-primary"} text-white border-0 hover:opacity-90 font-semibold`}
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
      <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Subject Progress
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {subjects.map((subject, index) => {
            const meta = subjectMeta[subject.name];
            return (
              <Card
                key={subject.name}
                className="group hover:-translate-y-1 hover:shadow-md transition-all duration-250 animate-fade-in-up"
                style={{ animationDelay: `${300 + index * 60}ms` }}
              >
                <CardContent className="p-5">
                  {/* Icon + grade */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-br ${meta.gradient} text-white shadow-sm group-hover:shadow-md transition-shadow`}
                    >
                      <span className="block [&>svg]:h-4 [&>svg]:w-4">{meta.icon}</span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${meta.bgColor} ${meta.textColor}`}
                    >
                      {subject.grade}
                    </span>
                  </div>

                  <div className="font-semibold text-sm mb-2">{subject.name}</div>

                  {/* Progress bar */}
                  <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${meta.color} transition-all duration-1000`}
                      style={{ width: `${subject.progress}%` }}
                    />
                  </div>
                  <div className={`text-xs font-semibold mt-1.5 ${meta.textColor}`}>
                    {subject.progress}%
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          6. TESTS
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "350ms" }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Upcoming Tests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <BellRing className="h-4 w-4" />
                Upcoming Tests
              </h2>
            </div>
            <div className="space-y-3">
              {upcomingTests.map((test, i) => {
                const meta = subjectMeta[test.subject];
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${test.isUrgent
                        ? "border-red-500/20 bg-red-500/5 dark:bg-red-500/10"
                        : "border-border/60 bg-card"
                      }`}
                  >
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${meta?.gradient} text-white flex-shrink-0 shadow-sm`}>
                      <span className="block [&>svg]:h-4 [&>svg]:w-4">{meta?.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm truncate">{test.topic}</span>
                        {test.isUrgent && (
                          <Badge className="text-[9px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 px-1.5 py-0 flex-shrink-0">
                            🔥 Tomorrow!
                          </Badge>
                        )}
                        {test.isAnnounced && (
                          <Badge className="text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 px-1.5 py-0 flex-shrink-0">
                            📌 Teacher Announced
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {test.subject} · {test.type}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-semibold text-foreground">{test.date}</div>
                      <Button variant="outline" size="sm" className="mt-1.5 h-7 text-xs px-2.5" asChild>
                        <Link href="/tests">Prepare</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Recent Results
              </h2>
            </div>
            <div className="space-y-3">
              {recentResults.map((result, i) => {
                const pct = (result.score / result.total) * 100;
                const scoreColor =
                  pct >= 90
                    ? "text-emerald-600 dark:text-emerald-400"
                    : pct >= 70
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-amber-600 dark:text-amber-400";
                const bgColor =
                  pct >= 90
                    ? "bg-emerald-500/10"
                    : pct >= 70
                      ? "bg-blue-500/10"
                      : "bg-amber-500/10";
                const meta = subjectMeta[result.subject];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card hover:shadow-sm transition-all"
                  >
                    <div className={`p-2.5 rounded-xl ${bgColor} ${scoreColor} flex-shrink-0`}>
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{result.topic}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {result.subject} · {result.date}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold">
                        {result.score}
                        <span className="text-sm text-muted-foreground font-normal">/{result.total}</span>
                      </div>
                      <div className={`text-[11px] font-bold ${scoreColor}`}>
                        {pct >= 90 ? "🏆 Excellent" : pct >= 70 ? "👍 Good" : "📚 Needs work"}
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

        {/* Radar Analytics */}
        <Card className="lg:col-span-2 animate-fade-in-up hover:shadow-md transition-all duration-300" style={{ animationDelay: "420ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold">Learning Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats */}
              <div>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: "Avg. Score", value: "82%", change: "+5%", positive: true },
                    { label: "Tests", value: "24", change: "3 new", positive: true },
                    { label: "Study hrs", value: "18h", change: "-2h", positive: false },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl bg-muted/50 border border-border/50 text-center">
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">
                        {stat.label}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 font-bold ${stat.positive ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                          }`}
                      >
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="text-xs font-semibold flex items-center gap-2 mb-3 text-muted-foreground uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Subject Performance
                </h4>
                <div className="space-y-2.5">
                  {subjects.slice(0, 4).map((subject) => {
                    const meta = subjectMeta[subject.name];
                    return (
                      <div key={subject.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{subject.name}</span>
                          <span className={`font-bold ${meta.textColor}`}>{subject.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${meta.color} transition-all duration-1000`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar chart */}
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="78%"
                    data={subjects.map((s) => ({ subject: s.name.split(" ")[0], fullMark: 100, score: s.progress }))}
                  >
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
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
          8. COMMUNITIES (collapsed by default)
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "450ms" }}>
        <button
          onClick={() => setCommunitiesOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors w-full mb-3"
        >
          <Users className="h-4 w-4" />
          Discover Communities
          <ChevronDown
            className={`h-4 w-4 ml-auto transition-transform duration-200 ${communitiesOpen ? "rotate-180" : ""}`}
          />
        </button>

        {communitiesOpen && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up">
            {communities.map((c, i) => (
              <Card key={i} className="hover:-translate-y-1 hover:shadow-md transition-all duration-250 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">{c.icon}</div>
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.members} members</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* ────────────────────────────────────────────────────────────────────
          9. WEEKLY TIMETABLE (de-emphasized, at bottom)
      ──────────────────────────────────────────────────────────────────── */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base font-semibold text-muted-foreground">
                Weekly Timetable
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-lg border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-md">
                    <tr className="border-b border-border/50">
                      <th className="text-left py-2.5 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider sticky left-0 z-20 bg-muted/80 backdrop-blur-md border-r border-border/50">
                        Time
                      </th>
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                        <th
                          key={day}
                          className="text-center py-2.5 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-xs text-primary sticky left-0 z-20 bg-muted/80 backdrop-blur-sm border-r border-border/50">
                          {row.time}
                        </td>
                        {[row.mon, row.tue, row.wed, row.thu, row.fri].map((subject, j) => (
                          <td key={j} className="text-center py-2 px-2">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold transition-transform hover:scale-105 cursor-default ${getTimetableCellColor(subject)}`}
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
    </>
  );
}