import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestProgressProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    timeLimitMinutes: number;
    onTimeUp: () => void;
}

export function TestProgress({ currentQuestionIndex, totalQuestions, timeLimitMinutes, onTimeUp }: TestProgressProps) {
    const [timeLeft, setTimeLeft] = useState(timeLimitMinutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onTimeUp]);

    const progressPercentage = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center justify-between w-full px-6 py-4 bg-muted/50 backdrop-blur-md border-b border-border sticky top-0 z-10">
            <div className="flex flex-col w-1/3 gap-2">
                <div className="flex justify-between text-[11px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                    <span>Progress</span>
                    <span>{currentQuestionIndex} / {totalQuestions}</span>
                </div>
                <div className="relative w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                        className="absolute top-0 left-0 h-full bg-accent transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-500",
                    timeLeft < 60
                        ? "bg-red-50 text-red-600 shadow-sm shadow-red-100 border border-red-100 animate-pulse"
                        : "bg-card text-foreground shadow-soft border border-border"
                )}>
                    <Clock className={cn("w-4 h-4", timeLeft < 60 ? "text-red-500" : "text-accent")} strokeWidth={2.5} />
                    <span className="font-mono text-lg font-bold tracking-tight">
                        {formatTime(timeLeft)}
                    </span>
                </div>
            </div>
        </div>
    );
}
