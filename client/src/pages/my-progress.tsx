import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
    BookOpen,
    Trophy,
    Clock,
    TrendingUp,
    Target,
    Flame,
    Star,
    CheckCircle2,
    Atom,
    FlaskConical,
    Calculator,
    Leaf,
    Code2,
    Medal,
    CalendarDays,
    Activity,
    Zap,
    AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line
} from "recharts";

// ─── Helpers ────────────────────────────────────────────────────────────────

const subjectMeta: Record<
    string,
    {
        gradient: string;
        icon: React.ReactNode;
        textColor: string;
        bgColor: string;
        color: string;
    }
> = {
    Physics: {
        gradient: "from-blue-500 to-indigo-600",
        icon: <Atom className="h-6 w-6" />,
        textColor: "text-blue-500",
        bgColor: "bg-blue-500/10",
        color: "#3b82f6",
    },
    Chemistry: {
        gradient: "from-orange-500 to-amber-500",
        icon: <FlaskConical className="h-6 w-6" />,
        textColor: "text-orange-500",
        bgColor: "bg-orange-500/10",
        color: "#f97316",
    },
    Mathematics: {
        gradient: "from-indigo-500 to-purple-600",
        icon: <Calculator className="h-6 w-6" />,
        textColor: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        color: "#6366f1",
    },
    Biology: {
        gradient: "from-emerald-500 to-teal-600",
        icon: <Leaf className="h-6 w-6" />,
        textColor: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        color: "#10b981",
    },
    "Computer Science": {
        gradient: "from-purple-500 to-violet-600",
        icon: <Code2 className="h-6 w-6" />,
        textColor: "text-purple-500",
        bgColor: "bg-purple-500/10",
        color: "#a855f7",
    },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function MyProgress() {
    const { currentUser } = useFirebaseAuth();
    const studentId = currentUser?.profile?.uid;

    // Fetch real progress data
    const { data: progressData, isLoading: isLoadingProgress, isError: isErrorProgress } = useQuery<Array<{ month: string; avgScore: number }>>({
        queryKey: ["/api/progress/student", studentId],
        queryFn: () => apiRequest("GET", `/api/progress/student/${studentId}`).then(r => r.json()),
        enabled: !!studentId,
    });

    // ── Data ──────────────────────────────────────────────────────────────────

    const subjectSkills = [
        { subject: "Physics", score: 72, fullMark: 100 },
        { subject: "Chemistry", score: 65, fullMark: 100 },
        { subject: "Maths", score: 88, fullMark: 100 },
        { subject: "Biology", score: 78, fullMark: 100 },
        { subject: "CS", score: 91, fullMark: 100 },
    ];

    const weeklyActivity = [
        { day: "Mon", hours: 2.5 },
        { day: "Tue", hours: 3.0 },
        { day: "Wed", hours: 1.5 },
        { day: "Thu", hours: 4.0 },
        { day: "Fri", hours: 2.0 },
        { day: "Sat", hours: 5.5 },
        { day: "Sun", hours: 3.5 },
    ];

    // Format progress data for chart
    const monthlyProgressData = progressData?.map(item => {
        const [year, month] = item.month.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return {
            month: monthNames[parseInt(month) - 1],
            score: item.avgScore
        };
    }) || [];

    const recentPerformance = [
        {
            subject: "Mathematics",
            topic: "Integration Techniques",
            score: 92,
            total: 100,
            date: "2 days ago",
            type: "Unit Test",
            improvement: "+5%",
        },
        {
            subject: "Physics",
            topic: "Rotational Motion",
            score: 85,
            total: 100,
            date: "4 days ago",
            type: "Quiz",
            improvement: "+12%",
        },
        {
            subject: "Computer Science",
            topic: "Data Structures",
            score: 95,
            total: 100,
            date: "1 week ago",
            type: "Mock Exam",
            improvement: "Steady",
        },
        {
            subject: "Chemistry",
            topic: "Thermodynamics",
            score: 74,
            total: 100,
            date: "1 week ago",
            type: "Unit Test",
            improvement: "-2%",
        },
    ];

    const achievements = [
        {
            title: "Maths Whiz",
            desc: "Top 5% in Calculus",
            icon: <Star className="h-6 w-6" />,
            color: "from-amber-400 to-yellow-500",
            date: "Oct 12, 2026",
        },
        {
            title: "14 Day Streak",
            desc: "Studied 14 days in a row!",
            icon: <Flame className="h-6 w-6" />,
            color: "from-orange-400 to-red-500",
            date: "Currently active",
        },
        {
            title: "Speed Reader",
            desc: "Completed 5 chapters in a week",
            icon: <Zap className="h-6 w-6" />,
            color: "from-blue-400 to-indigo-500",
            date: "Sep 28, 2026",
        },
        {
            title: "Perfect Score",
            desc: "100% on Data Structures Quiz",
            icon: <Medal className="h-6 w-6" />,
            color: "from-purple-400 to-pink-500",
            date: "Oct 05, 2026",
        },
    ];

    const highlightStats = [
        {
            title: "Total Study Time",
            value: "142 hrs",
            subtext: "+12 hrs this week",
            icon: <Clock className="h-5 w-5 text-blue-500" />,
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            title: "Current Streak",
            value: "14 Days",
            subtext: "Personal best: 21 days",
            icon: <Flame className="h-5 w-5 text-orange-500" />,
            bg: "bg-orange-500/10",
            border: "border-orange-500/20",
        },
        {
            title: "Tests Taken",
            value: "28",
            subtext: "Avg score: 82%",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
        },
        {
            title: "Focus Score",
            value: "94/100",
            subtext: "Top 10% of class",
            icon: <Target className="h-5 w-5 text-purple-500" />,
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
    ];

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <>
            <PageHeader
                title="My Progress 📈"
                subtitle="Track your academic growth, achievements, and study habits."
                className="animate-fade-in-up"
                breadcrumbs={[
                    { label: "Dashboard", href: "/" },
                    { label: "My Progress" },
                ]}
            />

            {/* ────────────────────────────────────────────────────────────────────
          1. HIGHLIGHT STATS
      ──────────────────────────────────────────────────────────────────── */}
            <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {highlightStats.map((stat, i) => (
                        <Card key={i} className={`border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}>
                            <CardContent className="p-5 flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
                                </div>
                                <div className={`p-2.5 rounded-xl ${stat.bg} flex-shrink-0`}>
                                    {stat.icon}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            {/* ────────────────────────────────────────────────────────────────────
          2. MONTHLY PROGRESS CHART (REAL DATA)
      ──────────────────────────────────────────────────────────────────── */}
            <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "75ms" }}>
                <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Monthly Progress Trend
                        </CardTitle>
                        <CardDescription>Your average test scores over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        {isLoadingProgress ? (
                            <div className="flex items-center justify-center h-full">
                                <Skeleton className="h-64 w-full" />
                            </div>
                        ) : isErrorProgress ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">Failed to load progress data</p>
                            </div>
                        ) : monthlyProgressData.length < 2 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                <CalendarDays className="h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm text-muted-foreground">Not enough data yet</p>
                                <p className="text-xs text-muted-foreground">Complete tests across multiple months to see your progress</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                                        dy={10} 
                                    />
                                    <YAxis 
                                        domain={[0, 100]} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                                    />
                                    <RechartsTooltip
                                        contentStyle={{ 
                                            backgroundColor: "hsl(var(--card))", 
                                            borderColor: "hsl(var(--border))", 
                                            borderRadius: "8px" 
                                        }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={3}
                                        dot={{ fill: "hsl(var(--primary))", r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>
            </section>

            {/* ────────────────────────────────────────────────────────────────────
          3. CHARTS OVERVIEW
      ──────────────────────────────────────────────────────────────────── */}
            <section className="mb-7 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {/* Skill Radar */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Target className="h-5 w-5 text-primary" />
                                Subject Mastery Overview
                            </CardTitle>
                            <CardDescription>Your current proficiency across main subjects.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={subjectSkills}>
                                    <PolarGrid stroke="hsl(var(--border))" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <RechartsTooltip
                                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
                                        itemStyle={{ color: "hsl(var(--foreground))" }}
                                    />
                                    <Radar
                                        name="Proficiency"
                                        dataKey="score"
                                        stroke="hsl(var(--primary))"
                                        fill="hsl(var(--primary))"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Activity Bar Chart */}
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                Weekly Study Hours
                            </CardTitle>
                            <CardDescription>Your study consistency over the last 7 days.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                                    <RechartsTooltip
                                        cursor={{ fill: "hsl(var(--muted))" }}
                                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                                    />
                                    <Bar
                                        dataKey="hours"
                                        radius={[4, 4, 0, 0]}
                                        fill="hsl(var(--primary))"
                                        activeBar={{ fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--primary))" }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* ────────────────────────────────────────────────────────────────────
          3. RECENT PERFORMANCE & ACHIEVEMENTS
      ──────────────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-7">

                {/* Recent Test History (2/3 width) */}
                <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Recent Test History
                    </h2>
                    <div className="space-y-3">
                        {recentPerformance.map((test, i) => {
                            const pct = (test.score / test.total) * 100;
                            const meta = subjectMeta[test.subject] || subjectMeta["Physics"]; // Fallback

                            const isImproved = test.improvement.startsWith("+");
                            const isSteady = test.improvement === "Steady";
                            const isDeclined = test.improvement.startsWith("-");

                            return (
                                <Card key={i} className="hover:shadow-md transition-shadow overflow-hidden group">
                                    {/* Subtle left border accent */}
                                    <div className="flex relative">
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${meta.gradient}`} />
                                        <CardContent className="p-4 pl-5 flex items-center justify-between w-full">

                                            {/* Left: Icon & Details */}
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`hidden sm:flex p-2.5 rounded-xl shadow-sm ${meta.bgColor} ${meta.textColor} flex-shrink-0 group-hover:scale-105 transition-transform`}>
                                                    {meta.icon}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-semibold text-[15px] text-foreground truncate">{test.topic}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className={`text-[10px] uppercase border-0 font-semibold px-2 py-0.5 ${meta.bgColor} ${meta.textColor}`}>
                                                            {test.subject}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">{test.type} · {test.date}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Score & Trend */}
                                            <div className="flex items-center gap-6 flex-shrink-0">
                                                {/* Trend indicator */}
                                                <div className="hidden md:flex flex-col items-end">
                                                    {isImproved ? (
                                                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 text-[10px] py-0">
                                                            <TrendingUp className="h-3 w-3" /> {test.improvement}
                                                        </Badge>
                                                    ) : isDeclined ? (
                                                        <Badge variant="outline" className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 gap-1 text-[10px] py-0">
                                                            <TrendingUp className="h-3 w-3 rotate-180" /> {test.improvement}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 text-[10px] py-0">
                                                            Steady
                                                        </Badge>
                                                    )}
                                                    <span className="text-[10px] text-muted-foreground mt-0.5">vs last test</span>
                                                </div>

                                                {/* Huge Score */}
                                                <div className="text-right">
                                                    <div className="flex items-baseline gap-0.5 justify-end">
                                                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
                                                            {test.score}
                                                        </span>
                                                        <span className="text-sm font-medium text-muted-foreground">/{test.total}</span>
                                                    </div>
                                                </div>
                                            </div>

                                        </CardContent>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                    <Button variant="outline" className="w-full mt-4 text-sm text-muted-foreground">
                        View All Test Results
                    </Button>
                </div>

                {/* Achievements (1/3 width) */}
                <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        Achievements Badges
                    </h2>
                    <div className="grid gap-3">
                        {achievements.map((badge, i) => (
                            <Card key={i} className="group hover:-translate-y-1 hover:shadow-md transition-all duration-300 overflow-hidden relative border border-border/60">
                                <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity`}>
                                    {/* Background faint icon */}
                                    <div className="scale-[3] transform rotate-12">{badge.icon}</div>
                                </div>
                                <CardContent className="p-4 relative z-10 flex items-start gap-4">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-sm flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                                        {badge.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[15px]">{badge.title}</h4>
                                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{badge.desc}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground/60 mt-2 uppercase tracking-wide">
                                            Earned: {badge.date}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

            </div>

        </>
    );
}
