import * as React from "react";
import { SmartCard } from "@/components/ui/smart-card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface XPProgressBarProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  nextLevelXP,
  level,
  className
}) => {
  const progressPercentage = (currentXP / nextLevelXP) * 100;

  return (
    <SmartCard type="xp" className={className}>
      <div className="flex flex-col gap-3">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Current rank</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-foreground leading-none">Level {level}</span>
              <span className="text-muted-foreground font-semibold text-sm italic">Master</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-foreground font-bold text-lg leading-none">{currentXP} XP</div>
            <div className="text-muted-foreground text-xs font-medium">earned today</div>
          </div>
        </div>

        <div className="relative h-3 w-full bg-muted/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-energy rounded-full"
            style={{ 
              boxShadow: "0 0 12px rgba(240, 165, 0, 0.4)"
            }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Level {level}</span>
          <span className="text-accent">{Math.max(0, nextLevelXP - currentXP)} XP till Level {level + 1}</span>
          <span>Level {level + 1}</span>
        </div>
      </div>
    </SmartCard>
  );
};
