import * as React from "react";
import { SmartCard } from "@/components/ui/smart-card";
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface StreakWidgetProps {
  streak: number;
  activity: boolean[]; // 7 days activity status
  className?: string;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({ 
  streak, 
  activity = [true, true, true, true, false, false, false],
  className 
}) => {
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  return (
    <SmartCard type="streak" className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full bg-energy-soft/30",
            streak > 0 && "animate-pulse"
          )}>
            <Flame className={cn(
              "w-8 h-8",
              streak > 0 ? "text-energy fill-energy" : "text-muted-foreground/50"
            )} />
          </div>
          <div>
            <div className="streak-number leading-none">{streak}</div>
            <div className="text-muted-foreground font-medium text-sm">Day streak</div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mt-2">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
              activity[i] 
                ? "bg-energy text-white shadow-sm" 
                : "bg-muted text-muted-foreground"
            )}>
              {activity[i] && <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute" />}
              <span className="relative">{day}</span>
            </div>
          </div>
        ))}
      </div>
      
      {streak === 0 ? (
        <p className="text-xs text-muted-foreground font-medium italic mt-2">
          Start your streak today! 🚀
        </p>
      ) : (
        <p className="text-xs text-muted-foreground font-medium mt-2">
          {streak >= 7 ? "You're on fire! 🔥 Keep it up." : "Day 7 is just a few tests away!"}
        </p>
      )}
    </SmartCard>
  );
};
