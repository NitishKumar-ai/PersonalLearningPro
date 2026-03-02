import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

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
        <div className="flex items-center justify-between w-full p-4 bg-background border-b border-border shadow-sm sticky top-0 z-10">
            <div className="flex flex-col w-1/2 gap-1.5">
                <div className="flex justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Progress</span>
                    <span>{currentQuestionIndex} / {totalQuestions}</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className={`flex items-center gap-2 font-mono text-lg font-medium px-4 py-1.5 rounded-md ${timeLeft < 60 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'}`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
            </div>
        </div>
    );
}
