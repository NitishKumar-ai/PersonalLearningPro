import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import heroImg from "@/assets/hero-runway.png";

export const Hero = () => {
  const [, setLocation] = useLocation();
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background illustration */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImg}
          alt="Illustrated airport runway with educational elements"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
      </div>

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-6"
        >
          <span className="inline-block bg-card sketch-border sketch-shadow px-4 py-1.5 text-sm font-medium text-foreground">
            ✨ Ready for a smooth learning journey?
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.08] tracking-tight">
            Stop studying <br />
            <span className="text-primary italic">by accident.</span>
            <br />
            Start learning by design.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
            The first AI co-pilot that maps your curriculum, clears the noise, and navigates you to mastery—day by day.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button size="lg" className="rounded-full font-heading text-base px-8 bg-primary text-primary-foreground hover:bg-primary/90 sketch-border sketch-shadow-yellow hover-tilt" onClick={() => setLocation('/login')}>
              Start My Learning Plan
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full font-heading text-base px-8 bg-card sketch-border sketch-shadow hover-tilt"
            >
              See How It Works
            </Button>
          </div>
        </motion.div>

        {/* Floating element removed as per user request */}
      </div>
    </section>
  );
};
