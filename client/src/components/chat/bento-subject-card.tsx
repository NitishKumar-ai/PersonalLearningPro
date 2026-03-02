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
                "group relative flex flex-col h-[300px] w-full overflow-hidden rounded-[20px] bg-gradient-to-b from-[#1c232b] to-[#141a20] p-7 transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
                "border border-white/[0.08] shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
                !isLocked && "hover:-translate-y-2 hover:border-white/[0.15] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
                className
            )}
        >
            {/* Dynamic Background Glow */}
            {!isLocked && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-[50px] z-0 rounded-2xl bg-gradient-to-t from-[#4f8cff]/10 to-transparent pointer-events-none" />
            )}

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-screen z-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '-1px -1px'
                }}
            />

            {/* Top Section */}
            <div className="relative z-10 flex-1 flex flex-col items-center justify-center mb-6">
                {tag && (
                    <div className="absolute top-0 right-0 rotate-90 origin-bottom-right translate-x-5 -translate-y-1 z-20">
                        <span className="text-[10px] font-bold text-white/30 tracking-[0.25em] uppercase whitespace-nowrap">
                            {tag}
                        </span>
                    </div>
                )}

                {weakness && !isLocked && (
                    <div className="absolute top-0 left-0 z-20">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ffb86b]/10 border border-[#ffb86b]/20 shadow-[0_0_15px_rgba(255,184,107,0.1)] backdrop-blur-sm">
                            <AlertTriangle className="w-[14px] h-[14px] text-[#ffb86b]" strokeWidth={2.5} />
                            <span className="text-[11px] font-bold text-[#ffb86b] tracking-wider uppercase">
                                Weak: {weakness}
                            </span>
                        </div>
                    </div>
                )}

                <div className="relative w-36 h-36 flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-[1.08] group-hover:-translate-y-2 drop-shadow-2xl">
                    {/* Subtle backlight behind icon */}
                    <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="relative z-10 flex flex-col gap-1.5 mt-auto transition-transform duration-500 ease-out group-hover:-translate-y-1">
                <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1.5 flex-1 pr-4">
                        <h3 className="text-[22px] font-bold text-white tracking-tight leading-none">
                            {title}
                        </h3>
                        <p className="text-[14px] text-[#8b9ba8] line-clamp-1 leading-snug font-medium">
                            {description}
                        </p>
                    </div>

                    {/* Progress Ring or Lock */}
                    <div className="relative flex items-center justify-center w-11 h-11 flex-shrink-0 bg-black/20 rounded-full border border-white/5 shadow-inner">
                        {isLocked ? (
                            <Lock className="w-[18px] h-[18px] text-white/40" />
                        ) : (
                            <div className="relative flex items-center justify-center w-full h-full">
                                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 44 44">
                                    {/* Track */}
                                    <circle
                                        className="text-white/[0.04] stroke-current"
                                        strokeWidth={strokeWidth}
                                        fill="transparent"
                                        r={radius}
                                        cx="22"
                                        cy="22"
                                    />
                                    {/* Progress Indicator */}
                                    <circle
                                        className={cn(
                                            "stroke-current transition-all duration-1000 ease-[cubic-bezier(0.25,0.8,0.25,1)]",
                                            progressPercentage >= 90 ? "text-[#3ad29f]" : "text-[#4f8cff]"
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
                                {/* Center text indicating readiness */}
                                <div className="absolute flex items-center justify-center w-full h-full text-[10px] font-bold text-white/80">
                                    {progressPercentage > 0 ? (
                                        <ArrowRight className="w-4 h-4 text-white/70" />
                                    ) : (
                                        <span className="opacity-50">0%</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hover Actions Bar */}
            {!isLocked && (
                <div className="absolute bottom-0 left-0 right-0 p-5 pt-16 bg-gradient-to-t from-[#141a20] via-[#141a20]/95 to-transparent translate-y-[110%] opacity-0 transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)] group-hover:translate-y-0 group-hover:opacity-100 z-20 flex justify-end gap-2.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('revise'); }}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-[13px] font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        Revise
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('practice'); }}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-[13px] font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        Practice
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAction?.('chat'); }}
                        className="flex-none py-2 px-4 rounded-xl bg-[#4f8cff]/10 border border-[#4f8cff]/20 text-[13px] font-bold text-[#4f8cff] hover:bg-[#4f8cff]/20 transition-colors flex items-center gap-1.5 group/btn"
                    >
                        Ask Tutor
                        <ArrowRight className="w-[14px] h-[14px] transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </button>
                </div>
            )}

            {/* Locked Overlay */}
            {isLocked && (
                <div className="absolute inset-0 bg-[#0f1720]/50 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center transition-opacity duration-500 opacity-0 group-hover:opacity-100">
                    <button className="px-5 py-2.5 rounded-full bg-white/10 border border-white/20 text-[14px] font-semibold text-white hover:bg-white/20 transition-all hover:scale-105 flex items-center gap-2 shadow-xl backdrop-blur-md">
                        <Lock className="w-[14px] h-[14px]" />
                        Upgrade to Unlock
                    </button>
                </div>
            )}
        </div>
    );
}
