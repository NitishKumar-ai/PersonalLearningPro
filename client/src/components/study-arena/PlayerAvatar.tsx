import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Zap, Flame, Star, Skull } from "lucide-react";

interface StatusEffect {
  type: "combo" | "fire" | "stunned" | "boosted";
  duration?: number;
  value?: number; // e.g., combo multiplier
}

interface PlayerAvatarProps {
  id: string;
  name: string;
  avatarUrl?: string;
  health: number;
  maxHealth: number;
  score: number;
  isCurrentPlayer?: boolean;
  statusEffects?: StatusEffect[];
  isTakingDamage?: boolean;
}

export function PlayerAvatar({
  name,
  avatarUrl,
  health,
  maxHealth,
  score,
  isCurrentPlayer,
  statusEffects = [],
  isTakingDamage
}: PlayerAvatarProps) {

  const healthPercentage = Math.max(0, (health / maxHealth) * 100);
  const isDead = health <= 0;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const hasCombo = statusEffects.some(s => s.type === 'combo');
  const comboValue = statusEffects.find(s => s.type === 'combo')?.value;

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 relative ${isDead ? 'opacity-50 grayscale' : ''}`}
      animate={isTakingDamage ? {
        x: [-5, 5, -5, 5, 0],
        y: [2, -2, 2, -2, 0]
      } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Status Effects Container */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1 z-20">
        <AnimatePresence>
          {statusEffects.map((effect, idx) => (
            <motion.div
              key={effect.type + idx}
              initial={{ scale: 0, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
              style={{
                backgroundColor: effect.type === 'combo' ? '#f59e0b' :
                  effect.type === 'fire' ? '#ef4444' :
                    effect.type === 'boosted' ? '#10b981' : '#6b7280',
                color: 'white'
              }}
            >
              {effect.type === 'combo' && <Zap className="w-3 h-3" />}
              {effect.type === 'fire' && <Flame className="w-3 h-3" />}
              {effect.type === 'boosted' && <Star className="w-3 h-3" />}
              {effect.type === 'stunned' && <Skull className="w-3 h-3" />}

              {effect.value && `x${effect.value}`}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Avatar */}
      <div className={`relative ${isCurrentPlayer ? 'ring-1 ring-white/50 ring-offset-4 ring-offset-[#0a0a0a] rounded-full' : ''}`}>
        <Avatar className={`w-16 h-16 border border-white/10 bg-[#151515] ${hasCombo ? 'shadow-[0_0_20px_rgba(245,158,11,0.2)] border-amber-500/50' : ''}`}>
          <AvatarImage src={avatarUrl} alt={name} />
          <AvatarFallback className="bg-[#1a1a1a] text-zinc-300 font-medium text-lg">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Health Bar Overlay/Indicator */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[120%] h-2 bg-black/80 rounded-full border border-white/10 overflow-hidden backdrop-blur-sm">
          <motion.div
            className={`h-full ${healthPercentage > 30 ? 'bg-indigo-500' : 'bg-rose-500'}`}
            initial={{ width: "100%" }}
            animate={{ width: `${healthPercentage}%` }}
            transition={{ type: "spring", stiffness: 50 }}
          />
        </div>
      </div>

      {/* Name and Score */}
      <div className="text-center mt-2">
        <p className={`text-sm tracking-wide truncate w-20 ${isCurrentPlayer ? 'text-white font-medium' : 'text-zinc-500'}`}>
          {name}
        </p>
        <p className="text-[11px] text-zinc-600 font-mono font-medium">
          {score} pts
        </p>
      </div>
    </motion.div>
  );
}
