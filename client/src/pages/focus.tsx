import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    RotateCcw,
    Coffee,
    Brain,
    Flame,
    Trophy,
    CheckCircle2,
    Atom,
    FlaskConical,
    Calculator,
    Leaf,
    Code2,
    BookOpen,
    Headphones,
    Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "work" | "short" | "long";
type Subject = "Physics" | "Chemistry" | "Mathematics" | "Biology" | "Computer Science" | "English";

const MODES: { id: Mode; label: string; duration: number; icon: ReactNode; color: string; bg: string }[] = [
    { id: "work", label: "Focus", duration: 25 * 60, icon: <Brain className="h-4 w-4" />, color: "text-primary", bg: "bg-primary/10" },
    { id: "short", label: "Short Break", duration: 5 * 60, icon: <Coffee className="h-4 w-4" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "long", label: "Long Break", duration: 15 * 60, icon: <Coffee className="h-4 w-4" />, color: "text-blue-500", bg: "bg-blue-500/10" },
];

const SUBJECTS: { name: Subject; icon: ReactNode; gradient: string }[] = [

    { name: "Physics", icon: <Atom className="h-4 w-4" />, gradient: "from-blue-500 to-indigo-600" },
    { name: "Chemistry", icon: <FlaskConical className="h-4 w-4" />, gradient: "from-orange-500 to-amber-500" },
    { name: "Mathematics", icon: <Calculator className="h-4 w-4" />, gradient: "from-indigo-500 to-purple-600" },
    { name: "Biology", icon: <Leaf className="h-4 w-4" />, gradient: "from-emerald-500 to-teal-600" },
    { name: "Computer Science", icon: <Code2 className="h-4 w-4" />, gradient: "from-purple-500 to-violet-600" },
    { name: "English", icon: <BookOpen className="h-4 w-4" />, gradient: "from-cyan-500 to-blue-600" },
];

interface SessionLog {
    id: string;
    subject: Subject;
    mode: Mode;
    duration: number;
    completedAt: string;
}

function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// SVG Ring timer
function TimerRing({ progress, color }: { progress: number; color: string }) {
    const r = 90;
    const circ = 2 * Math.PI * r;
    const dash = circ * (1 - progress);

    return (
        <svg width="220" height="220" className="rotate-[-90deg]">
            <circle cx="110" cy="110" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/40" />
            <circle
                cx="110"
                cy="110"
                r={r}
                fill="none"
                stroke="url(#timerGrad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dash}
                style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <defs>
                <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function FocusPage() {
    const [mode, setMode] = useState<Mode>("work");
    const [subject, setSubject] = useState<Subject>("Physics");
    const [timeLeft, setTimeLeft] = useState(MODES[0].duration);
    const [isRunning, setIsRunning] = useState(false);
    const [sessionCount, setSessionCount] = useState(0);
    const [logs, setLogs] = useState<SessionLog[]>([]);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const currentMode = MODES.find((m) => m.id === mode)!;
    const progress = timeLeft / currentMode.duration;

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        setIsRunning(false);
                        clearInterval(intervalRef.current!);
                        // Log completed session
                        if (mode === "work") setSessionCount((c) => c + 1);
                        setLogs((prev) => [
                            {
                                id: Date.now().toString(),
                                subject,
                                mode,
                                duration: currentMode.duration,
                                completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            },
                            ...prev.slice(0, 9),
                        ]);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [isRunning, mode, subject, currentMode.duration]);

    const switchMode = (newMode: Mode) => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMode(newMode);
        setTimeLeft(MODES.find((m) => m.id === newMode)!.duration);
    };

    const reset = () => {
        setIsRunning(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTimeLeft(currentMode.duration);
    };

    const totalFocusMinutes = logs.filter((l) => l.mode === "work").reduce((acc, l) => acc + Math.floor(l.duration / 60), 0);

    return (
        <>
            <PageHeader
                title="Focus Sessions"
                subtitle="Deep work with Pomodoro technique. Stay focused, take breaks."
                className="animate-fade-in-up"
                breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Focus" }]}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Timer */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Mode selector */}
                    <div className="flex gap-2 p-1 rounded-2xl bg-card border border-border/60 w-fit animate-fade-in-up">
                        {MODES.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => switchMode(m.id)}
                                className={cn(
                                    "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                                    mode === m.id
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {m.icon}
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Timer Card */}
                    <Card className="animate-fade-in-up overflow-hidden" style={{ animationDelay: "50ms" }}>
                        <div className="h-1 w-full bg-gradient-to-r from-primary to-primary/60" />
                        <CardContent className="p-8 flex flex-col items-center gap-6">
                            {/* Ring + Time */}
                            <div className="relative flex items-center justify-center">
                                <TimerRing progress={progress} color="hsl(var(--primary))" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-5xl font-bold tracking-tighter tabular-nums">
                                        {formatTime(timeLeft)}
                                    </div>
                                    <div className="text-sm text-muted-foreground font-medium mt-1">{currentMode.label}</div>
                                    {isRunning && (
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="animate-pulse w-1.5 h-1.5 rounded-full bg-primary" />
                                            <span className="text-xs text-primary font-semibold">Focusing</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-3">
                                <Button variant="outline" size="icon" className="h-10 w-10" onClick={reset}>
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="lg"
                                    className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-primary-foreground"
                                    onClick={() => setIsRunning((r) => !r)}
                                >
                                    {isRunning ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current ml-0.5" />}
                                </Button>
                                <div className="h-10 w-10 flex items-center justify-center">
                                    <div className="flex flex-col items-center">
                                        <Headphones className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </div>

                            {/* Session dots */}
                            <div className="flex items-center gap-2">
                                {[0, 1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "w-3 h-3 rounded-full border-2 transition-all",
                                            i < (sessionCount % 4)
                                                ? "bg-primary border-primary"
                                                : "border-border bg-muted"
                                        )}
                                    />
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">
                                    {sessionCount % 4}/4 — {Math.floor(sessionCount / 4)} cycle{Math.floor(sessionCount / 4) !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Subject Selector */}
                    <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Focusing on
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {SUBJECTS.map((s) => (
                                    <button
                                        key={s.name}
                                        onClick={() => setSubject(s.name)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-xs font-medium",
                                            subject === s.name
                                                ? "border-primary/40 bg-primary/5 text-foreground"
                                                : "border-border/50 hover:border-border text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <div className={cn(
                                            "p-2 rounded-lg bg-gradient-to-br text-white",
                                            subject === s.name ? s.gradient : "from-muted-foreground/20 to-muted-foreground/10"
                                        )}>
                                            {s.icon}
                                        </div>
                                        <span className="leading-tight text-center">{s.name.split(" ")[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel */}
                <div className="space-y-5">
                    {/* Stats */}
                    <Card className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                Today's Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                            {[
                                { label: "Sessions Completed", value: sessionCount, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
                                { label: "Focus Time", value: `${totalFocusMinutes + sessionCount * 25}m`, icon: <Timer className="h-4 w-4 text-primary" /> },
                                { label: "Current Streak", value: "6 days", icon: <Flame className="h-4 w-4 text-orange-500" /> },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                                    <div className="flex items-center gap-2.5">
                                        {stat.icon}
                                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-bold">{stat.value}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Session Log */}
                    <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Timer className="h-4 w-4" />
                                Session Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {logs.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <Brain className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-sm text-muted-foreground">No sessions yet.</p>
                                    <p className="text-xs text-muted-foreground">Start your first focus session!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {logs.map((log) => {
                                        const sub = SUBJECTS.find((s) => s.name === log.subject);
                                        const modeConfig = MODES.find((m) => m.id === log.mode)!;
                                        return (
                                            <div key={log.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/40">
                                                <div className={cn("p-1.5 rounded-lg bg-gradient-to-br text-white text-xs", sub?.gradient || "from-primary to-primary/70")}>
                                                    {sub?.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-semibold truncate">{log.subject}</div>
                                                    <div className="text-[10px] text-muted-foreground">{modeConfig.label} · {Math.floor(log.duration / 60)}m</div>
                                                </div>
                                                <Badge className={cn("text-[9px] shrink-0", modeConfig.bg, modeConfig.color)}>
                                                    {log.completedAt}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
