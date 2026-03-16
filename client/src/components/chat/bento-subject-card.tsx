import { ArrowRight, Lock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BentoSubjectCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    tag?: string;
    progressPercentage?: number;
    weakness?: string;
    isLocked?: boolean;
    onAction?: (action: "revise" | "practice" | "chat") => void;
    className?: string;
}

export function BentoSubjectCard({
    title,
    description,
    icon,
    tag,
    progressPercentage = 0,
    weakness,
    isLocked = false,
    onAction,
    className,
}: BentoSubjectCardProps) {
    // SVG properties for the progress ring
    const strokeWidth = 3;
    const radius = 22 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

    return (
        <div
            className={cn(
                "group relative flex flex-col h-[320px] w-full overflow-hidden rounded-2xl bg-card p-6 transition-all duration-400 ease-out",
                "border border-border shadow-soft",
                !isLocked && "hover:shadow-card hover:-translate-y-1",
                className
            )}
        >
            {/* Subtle Gradient Hint */}
            {!isLocked && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            )}

            {/* Top Section */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-4">
                {tag && (
                    <div className="absolute top-0 right-0">
                        <span className="text-[9px] font-bold text-muted-foreground/50 tracking-widest uppercase bg-muted px-2 py-1 rounded-md">
                            {tag}
                        </span>
                    </div>
                )}

                {weakness && !isLocked && (
                    <div className="absolute top-0 left-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 shadow-sm">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span className="text-[10px] font-bold text-amber-700 tracking-widest uppercase">
                                {weakness}
                            </span>
                        </div>
                    </div>
                )}

                <div className="relative w-32 h-32 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-110">
                    <div className="relative z-10 w-full h-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                        {icon}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 flex flex-col gap-2 transition-transform duration-500 ease-out group-hover:-translate-y-1">
                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1 flex-1 pr-4">
                        <h3 className="text-xl font-display text-foreground tracking-tight leading-none group-hover:text-accent transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 leading-snug font-body">
                            {description}
                        </p>
                    </div>

                    {/* Progress Ring or Lock */}
                    <div className="relative flex items-center justify-center w-10 h-10 flex-shrink-0 bg-muted rounded-full border border-border shadow-inner">
                        {isLocked ? (
                            <Lock className="w-4 h-4 text-muted-foreground/50" />
                        ) : (
                            <div className="relative flex items-center justify-center w-full h-full">
                                <svg className="absolute inset-0 w-full h-full -rotate-90 p-1" viewBox="0 0 44 44">
                                    <circle
                                        className="text-cream-400 stroke-current"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        r={radius}
                                        cx="22"
                                        cy="22"
                                    />
                                    <circle
                                        className={cn(
                                            "stroke-current transition-all duration-1000 ease-out",
                                            "text-accent"
                                        )}
                                        strokeWidth={strokeWidth}
                                        strokeLinecap="round"
                                        fill="transparent"
                                        r={radius}
                                        cx="22"
                                        cy="22"
                                        style={{ strokeDasharray: circumference, strokeDashoffset }}
                                    />
                                </svg>
                                <div className="absolute flex items-center justify-center w-full h-full text-[9px] font-bold text-accent">
                                    {progressPercentage > 0 ? (
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    ) : (
                                        <span className="opacity-40">0%</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Actions Bar */}
            {!isLocked && (
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-card via-card/95 to-transparent translate-y-[110%] opacity-0 transition-all duration-400 ease-out group-hover:translate-y-0 group-hover:opacity-100 z-20 flex justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('revise'); }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-muted border border-border text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        Revise
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('practice'); }}
                        className="flex-1 py-1.5 px-3 rounded-xl bg-muted border border-border text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                    >
                        Quiz
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('chat'); }}
                        className="flex-none py-1.5 px-4 rounded-xl bg-accent-soft border border-accent/10 text-[11px] font-bold uppercase tracking-widest text-accent hover:bg-accent/10 transition-all flex items-center gap-1.5 group/btn"
                    >
                        Ask AI
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                </div>
            )}

            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-muted/60 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                    <button className="px-5 py-2.5 rounded-full bg-card border border-border text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted transition-all hover:scale-105 flex items-center gap-2 shadow-card">
                        <Lock className="w-3.5 h-3.5 text-accent" />
                        Unlock Module
                    </button>
                </div>
            )}
        </div>
    );
}
