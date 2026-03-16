import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface BentoHeroCardProps {
    title: string;
    description: string;
    ctaText?: string;
    onCtaClick?: () => void;
    visual?: React.ReactNode;
}

export function BentoHeroCard({
    title,
    description,
    ctaText = "Open Tutor",
    onCtaClick,
    visual,
}: BentoHeroCardProps) {
    return (
        <div className="group relative w-full overflow-hidden rounded-2xl border border-border bg-card p-8 md:p-12 transition-all duration-500 hover:shadow-card">
            {/* Subtle Texture Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03] z-0"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, #CC7B5C 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-12 h-full">
                <div className="flex flex-col gap-10 max-w-[520px]">
                    <div className="space-y-5">
                        <h1 className="text-3xl md:text-5xl font-display text-foreground tracking-tight leading-[1.1]">
                            {title}
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed font-body">
                            {description}
                        </p>
                    </div>

                    <div>
                        <Button
                            onClick={onCtaClick}
                            className="bg-accent hover:bg-accent/90 text-white rounded-full px-10 py-7 text-xs font-bold uppercase tracking-widest shadow-soft transition-all duration-300 group/btn active:scale-95"
                        >
                            <span className="flex items-center">
                                {ctaText}
                                <ArrowRight className="ml-3 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                            </span>
                        </Button>
                    </div>
                </div>

                {visual && (
                    <div className="relative flex-shrink-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-1">
                        {/* Visual Background Glow */}
                        <div className="absolute inset-0 bg-accent/5 blur-[100px] rounded-full scale-150 transform-gpu" />

                        <div className="relative z-10 drop-shadow-xl">
                            {visual}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
