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
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [showBadge, setShowBadge] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState<{name: string, emoji: string, description: string} | null>(null);

  const { data: dashboardData, isLoading } = useQuery<any>({
    queryKey: ["/api/dashboards/student"],
  });

  const triggerBadge = () => {
    setEarnedBadge({
      name: "Knowledge Seeker",
      emoji: "📚",
      description: "You've successfully refactored the EduAI design guide! Your dedication to student psychology is unmatched."
    });
    setShowBadge(true);
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const {
    profile,
    subjects = [],
    upcomingTests = [],
    recentResults = [],
    tasks = []
  } = dashboardData || {};

  const heroSession = upcomingTests[0] ? {
    subject: upcomingTests[0].subject,
    topic: upcomingTests[0].testTitle || upcomingTests[0].topic,
    progress: 0,
    examIn: new Date(upcomingTests[0].dueDate).toLocaleDateString(),
    isExamSoon: true,
    lastStudied: "N/A",
  } : null;

  const quickActions = [
    {
      title: "Ask AI Tutor",
      desc: "Get instant help",
      icon: <Brain className="h-6 w-6" />,
      href: "/ai-tutor",
      isPrimary: true,
    },
    {
      title: "Join Room",
      desc: "Study with peers",
      icon: <Video className="h-6 w-6" />,
      href: "/messages",
      isPrimary: false,
    },
    {
      title: "Focus Session",
      desc: "Timed deep work",
      icon: <Headphones className="h-6 w-6" />,
      href: "/focus",
      isPrimary: false,
    },
    {
      title: "Find Partner",
      desc: "Match study buddy",
      icon: <UserCheck className="h-6 w-6" />,
      href: "/partners",
      isPrimary: false,
    },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${profile?.displayName } 👋`}
        subtitle="Keep up the great work! Here's your learning overview."
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

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
        <StreakWidget 
          streak={profile?.streak || 0} 
          activity={[true, true, true, true, true, true, false]} 
          className="lg:col-span-1"
        />
        <XPProgressBar 
          currentXP={profile?.xp || 0} 
          nextLevelXP={1000} 
          level={profile?.level || 1} 
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-7">
        {heroSession ? (
          <div className="lg:col-span-3 animate-fade-in-up rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
            <div className="p-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="default">Current Topic</Badge>
                    <Badge variant="live">Exam in {heroSession.examIn}</Badge>
                  </div>
                  <h2 className="text-3xl font-display text-foreground tracking-tight leading-tight">{heroSession.topic}</h2>
                  <p className="text-base font-medium text-muted-foreground mt-1">{heroSession.subject}</p>
                </div>
                <div className={`p-4 rounded-2xl ${subjectMeta[heroSession.subject]?.bgColor || 'bg-muted'} ${subjectMeta[heroSession.subject]?.textColor || 'text-foreground'} shadow-soft flex-shrink-0`}>
                  {subjectMeta[heroSession.subject]?.icon || <BookOpen className="h-5 w-5" />}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Button asChild className="flex-1 shadow-card">
                  <Link href="/ai-tutor">
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl bg-card/50">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground">No upcoming tests</h3>
            <p className="text-sm text-muted-foreground">Take a break or review your notes.</p>
          </div>
        )}

        <div className="lg:col-span-2 animate-fade-in-up">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3 h-[calc(100%-2rem)]">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <Card className={`group cursor-pointer hover:-translate-y-1 hover:shadow-card transition-all duration-200 h-full border-border ${action.isPrimary ? "bg-accent-soft border-accent/10" : "bg-card"}`}>
                  <CardContent className="p-5 flex flex-col gap-3">
                    <div className={`p-2.5 rounded-xl bg-background/50 backdrop-blur-sm shadow-soft group-hover:shadow-md transition-shadow w-fit ${action.isPrimary ? "text-accent" : "text-muted-foreground"}`}>
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

      <section className="mb-10 animate-fade-in-up">
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4" /> Course Progress
        </h2>
        {subjects.length === 0 ? (
          <div className="p-8 text-center border rounded-xl bg-card text-muted-foreground">
            You are not enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {subjects.map((subjectName: string, index: number) => {
              const meta = subjectMeta[subjectName] || { icon: <BookOpen />, textColor: "text-foreground", accentColor: "bg-accent" };
              return (
                <SmartCard key={subjectName} type="flat" className="group hover:-translate-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-xl bg-background/50 backdrop-blur-sm shadow-soft transition-transform group-hover:scale-110`}>
                      <span className={meta.textColor}>{meta.icon}</span>
                    </div>
                  </div>
                  <div className="font-bold text-sm text-foreground mb-4 truncate" title={subjectName}>{subjectName}</div>
                </SmartCard>
              );
            })}
          </div>
        )}
      </section>

      <section className="mb-10 animate-fade-in-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <BellRing className="h-4 w-4" /> Upcoming Evaluations
            </h2>
            {upcomingTests.length === 0 ? (
              <div className="p-6 text-center border rounded-xl bg-card text-muted-foreground">
                No tests assigned yet.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTests.map((test: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card transition-all hover:shadow-soft">
                    <div className={`p-3 rounded-xl bg-muted flex-shrink-0 shadow-soft`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm text-foreground truncate">{test.testTitle || test.topic}</span>
                      <div className="text-xs text-muted-foreground font-medium">{test.subject}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-foreground">{new Date(test.dueDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Recent Achievements
            </h2>
            {recentResults.length === 0 ? (
              <div className="p-6 text-center border rounded-xl bg-card text-muted-foreground">
                Your results will appear here after your first test.
              </div>
            ) : (
              <div className="space-y-3">
                {recentResults.map((result: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border border-border bg-card hover:shadow-soft transition-all">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-700 flex-shrink-0 shadow-soft">
                      <Award className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-foreground truncate mb-1">Attempt #{result.id}</div>
                      <div className="text-xs text-muted-foreground font-medium">Score: {result.score || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <BadgePop badge={earnedBadge} isOpen={showBadge} onClose={() => setShowBadge(false)} />
      {!showBadge && (
        <Button onClick={triggerBadge} className="fixed bottom-8 right-8 rounded-full h-14 w-14 shadow-modal bg-energy hover:bg-energy-dark border-2 border-white/20 animate-bounce">
          <Award className="h-7 w-7 text-white" />
        </Button>
      )}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse p-8">
      <div className="h-20 bg-muted rounded-xl w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 h-64 bg-muted rounded-xl" />
        <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
      </div>
    </div>
  );
}
