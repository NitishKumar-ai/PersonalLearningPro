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
        <div className="group relative w-full overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#1c232b] to-[#12171c] p-8 md:p-12 transition-all duration-500 hover:border-white/10 hover:shadow-[0_8px_40px_-12px_rgba(79,140,255,0.15)]">
            {/* Dynamic Background Glow */}
            <div className="absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl z-0 rounded-2xl bg-gradient-to-r from-[#4f8cff]/10 via-transparent to-transparent pointer-events-none" />

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-screen z-0"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)
          `,
                    backgroundSize: '40px 40px',
                    backgroundPosition: '-1px -1px'
                }}
            />

            {/* Main Content */}
            <div className="relative z-10 flex flex-col-reverse md:flex-row items-center justify-between gap-12 h-full">
                <div className="flex flex-col gap-8 max-w-[480px]">
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-[40px] font-bold text-white tracking-[-0.02em] leading-[1.1]">
                            {title}
                        </h1>
                        <p className="text-lg md:text-[19px] text-[#8b9ba8] leading-[1.6] font-normal">
                            {description}
                        </p>
                    </div>

                    <div>
                        <Button
                            onClick={onCtaClick}
                            className="relative overflow-hidden bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full px-8 py-6 text-[15px] font-semibold shadow-xl transition-all duration-300 group/btn"
                        >
                            <span className="relative z-10 flex items-center">
                                {ctaText}
                                <ArrowRight className="ml-2.5 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
                            </span>
                            <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-[#4f8cff]/20 to-transparent transition-opacity duration-300 pointer-events-none" />
                        </Button>
                    </div>
                </div>

                {visual && (
                    <div className="relative flex-shrink-0 w-56 h-56 md:w-[320px] md:h-[320px] flex items-center justify-center transition-transform duration-700 group-hover:scale-105 group-hover:-rotate-2 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                        {/* Visual Backlight */}
                        <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full mix-blend-screen scale-50 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                        {visual}
                    </div>
                )}
            </div>
        </div>
    );
}
