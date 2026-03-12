
import { forwardRef, useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Menu, X, AlertCircle, Clock, BookX, ZapOff, ShieldCheck, Map, BookOpen, Target, Plane, Calendar, BrainCircuit, BarChart2, Brain, Code, Cloud, TrendingUp, Sparkles, Star, Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import heroImg from "@/assets/hero-runway.png";
import { toast } from "sonner";
import schoolMeeting from "@/assets/school-meeting.png";


// --- Navbar.tsx ---
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();

  const links = [
    { label: "How it Works", href: "#journey" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <a href="#" className="font-heading text-xl font-bold tracking-tight">
          Edu<span className="text-primary">AI</span> ✨
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Button className="rounded-full font-heading text-sm bg-primary text-primary-foreground hover:bg-primary/90 sketch-border sketch-shadow-yellow hover-tilt" size="sm" onClick={() => setLocation('/login')}>
            Get My Plan
          </Button>
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 space-y-3">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="block text-sm font-medium text-muted-foreground"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Button className="w-full rounded-full font-heading text-sm bg-primary text-primary-foreground hover:bg-primary/90 sketch-border sketch-shadow-yellow" size="sm" onClick={() => { setOpen(false); setLocation('/login'); }}>
            Get Started
          </Button>
        </div>
      )}
    </nav>
  );
};

// --- Hero.tsx ---
const Hero = () => {
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

// --- Turbulence.tsx ---
const painPoints = [
  {
    icon: Clock,
    title: "Information Overload",
    desc: "Drowning in notes, textbooks, and videos? 80% of study time is spent just deciding *what* to study.",
    color: "text-red-400"
  },
  {
    icon: AlertCircle,
    title: "The 'Wall' of Anxiety",
    desc: "That sinking feeling when you open a book and realize you don't know where to start. ✈️ Procrastination is just fear in disguise.",
    color: "text-orange-400"
  },
  {
    icon: BookX,
    title: "Forgotten by Friday",
    desc: "Reading isn't learning. Without active recall, 70% of what you study today is gone by next week.",
    color: "text-rose-400"
  },
  {
    icon: ZapOff,
    title: "Static Learning",
    desc: "One-size-fits-all textbooks don't care about *your* speed. You're either bored or left behind.",
    color: "text-amber-400"
  }
];

const Turbulence = () => {
  return (
    <section className="py-24 bg-[#0B0B0B] text-white relative overflow-hidden">
      {/* Abstract Grid/Vibration Effect */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <span className="inline-block bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            ⚠️ Standard Learning Warning
          </span>
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Studying in the <span className="text-red-500">Clouds?</span>
          </h2>
          <p className="text-neutral-400 text-lg md:text-xl leading-relaxed">
            Most students are studying blind. No plan, no feedback, just pure chaos.
            It's not that you're not working hard—it's that your navigation system is broken.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {painPoints.map((point, i) => (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl bg-neutral-900/50 border border-neutral-800 hover:border-red-500/30 transition-all duration-500"
            >
              <div className={`w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${point.color}`}>
                <point.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-neutral-100">{point.title}</h3>
              <p className="text-neutral-500 leading-relaxed text-sm group-hover:text-neutral-400 transition-colors">
                {point.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-col items-center">
            <p className="text-neutral-500 text-sm mb-4 italic">Ready for clear skies?</p>
            <div className="w-1 h-12 bg-gradient-to-b from-red-500 to-primary rounded-full animate-bounce"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// --- Journey.tsx ---
const steps = [
  { icon: ShieldCheck, label: "Assess", desc: "Quick diagnostic to find your strengths & gaps", color: "bg-secondary" },
  { icon: Map, label: "Personal Plan", desc: "AI builds your custom study roadmap", color: "bg-primary" },
  { icon: BookOpen, label: "Learn", desc: "AI tutor, flashcards & bite-sized lessons", color: "bg-secondary" },
  { icon: Target, label: "Practice", desc: "Smart quizzes that adapt to your level", color: "bg-primary" },
  { icon: Plane, label: "Launch", desc: "Ace your exam and reach your goals", color: "bg-secondary" },
];

const Journey = () => (
  <section id="journey" className="py-24 bg-card/50">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
          Your Strategic Navigator 🧭
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          We strip away the chaos. Here's your automated path from confusion to complete mastery.
        </p>
      </motion.div>

      <div className="relative max-w-3xl mx-auto">
        {/* Vertical dashed line */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px border-l-2 border-dashed border-border -translate-x-1/2" />

        <div className="space-y-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative flex items-start gap-4 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
            >
              {/* Bubble */}
              <div
                className={`md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}
              >
                <div className="bg-background sketch-border sketch-shadow p-5 rounded-2xl inline-block max-w-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_hsl(var(--secondary)/0.5)]">
                  <div className="flex items-center gap-2 mb-1">
                    <step.icon size={18} className="text-foreground" />
                    <span className="font-heading font-bold text-sm">
                      {step.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>

              {/* Center dot */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-foreground bg-background z-10 top-5" />

              {/* Spacer for other side */}
              <div className="hidden md:block md:w-1/2" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// --- NotebookFeature.tsx ---
const features = [
  {
    title: "AI Study Planner",
    desc: "Create a personalized study plan based on your goals and weaknesses.",
    points: ["Personalized study roadmap", "Daily and weekly learning schedule", "Smart goal tracking"],
    cta: "Try Sample Plan",
    icon: Calendar,
  },
  {
    title: "AI Tutor",
    desc: "Provides step-by-step explanations using AI.",
    points: ["Step-by-step explanations", "Ask questions anytime", "Adaptive teaching style"],
    cta: "Ask the AI",
    icon: BrainCircuit,
  },
  {
    title: "Smart Practice",
    desc: "Generates quizzes and tests automatically.",
    points: ["AI-generated quizzes", "Exam simulations", "Weakness detection"],
    cta: "Start Practice",
    icon: Target,
  },
  {
    title: "Performance Insights",
    desc: "Shows student learning progress.",
    points: ["Progress analytics", "Leaderboards & streaks", "Improvement tracking"],
    cta: "View Dashboard",
    icon: BarChart2,
  },
];

const NotebookFeature = () => {
  return (
    <section className="py-24 notebook-bg overflow-hidden dark:bg-background transition-colors duration-300">
      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#111111] dark:text-neutral-50">
            From Concept to Launch
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            EduAI guides students through every stage of learning — <br className="hidden md:block" />
            from understanding concepts to mastering exams.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotateX: 10, y: 40 }}
          whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ perspective: "1000px" }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="grid md:grid-cols-2 gap-8 relative">
            {features.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 * index }}
      className="notebook-card group hover:-translate-y-2 hover:shadow-[8px_10px_0px_#000] dark:hover:shadow-[8px_10px_0px_hsl(var(--primary))] transition-all duration-300 relative overflow-hidden"
      style={{ paddingLeft: '3.5rem' }}
    >
      {/* Notebook Punch Holes */}
      <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-evenly py-4 z-20">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-4 h-4 rounded-full bg-[#F8F9FA] dark:bg-[#161618] border border-black/10 dark:border-white/10 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.15)] dark:shadow-[inset_1px_1px_3px_rgba(255,255,255,0.05)]"></div>
        ))}
      </div>

      {/* Red margin line characteristic of notebook paper */}
      <div className="absolute left-[3.2rem] top-0 bottom-0 w-[2px] bg-red-300/40 dark:bg-red-900/40 z-10"></div>

      <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-white/40 dark:from-white/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 relative group-hover:-rotate-6 transition-transform">
          {/* Handwritten style highlight behind icon */}
          <div className="absolute inset-0 bg-[#FFD455]/90 -rotate-3 rounded-sm -z-10 group-hover:rotate-6 transition-transform"></div>
          <feature.icon size={26} strokeWidth={2.5} className="text-[#111111]" />
        </div>
        <h3 className="text-2xl font-bold text-[#111111] dark:text-neutral-50 relative inline-block font-sans">
          {feature.title}
          {/* Custom handwritten underline effect */}
          <svg className="absolute -bottom-2 left-0 w-full h-3 text-[#FFD455] opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
            <path d="M0 5 Q 50 10 100 2" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          </svg>
        </h3>
      </div>

      <ul className="space-y-3 mb-8 ml-2 mt-4 relative z-10">
        {feature.points.map((point: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-[#111111] dark:text-neutral-200 text-base font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4C6FFF] shrink-0"></span>
            {point}
          </li>
        ))}
      </ul>

      <Button
        variant="outline"
        className="w-full sm:w-auto relative z-10 rounded-full bg-white dark:bg-[#161618] border-2 border-[#111111] dark:border-neutral-50 text-[#111111] dark:text-neutral-50 font-bold hover:bg-[#FFD455] dark:hover:bg-[#FFD455] hover:text-[#111111] dark:hover:text-[#111111] transition-colors shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_hsl(var(--primary))] hover:shadow-[4px_4px_0px_#000] dark:hover:shadow-[4px_4px_0px_hsl(var(--primary))] text-sm h-11 px-6 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none"
      >
        {feature.cta} <span className="ml-1 text-lg leading-none">›</span>
      </Button>
    </motion.div>
  );
};

// --- OnboardingFeatures.tsx ---
const cards = [
  {
    icon: Brain,
    title: "AI Systems",
    bullets: ["Personalised study plans", "Smart flashcard generation", "Adaptive difficulty engine"],
  },
  {
    icon: Code,
    title: "Software & Tools",
    bullets: ["Interactive code labs", "Real-time collaboration", "Progress dashboards"],
  },
  {
    icon: Cloud,
    title: "Cloud Platform",
    bullets: ["Access anywhere, any device", "Auto-sync across sessions", "Offline mode support"],
  },
  {
    icon: TrendingUp,
    title: "Growth & Coaching",
    bullets: ["1-on-1 mentor matching", "Exam strategy workshops", "Performance analytics"],
  },
];

const OnboardingFeatures = () => (
  <section id="features" className="py-24">
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
          Onboarding Features ✨
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Everything you need for a smooth learning journey.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-card sketch-border hover-tilt sketch-shadow p-6 rounded-2xl flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4">
              <card.icon size={22} className="text-foreground" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-3">{card.title}</h3>
            <ul className="space-y-2 flex-1">
              {card.bullets.map((b) => (
                <li key={b} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {b}
                </li>
              ))}
            </ul>
            <button className="mt-5 text-sm font-bold text-foreground hover:text-primary transition-colors text-left flex items-center gap-1 group">
              Contact Us <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// --- DemoWidget.tsx ---
const samplePlans: Record<string, string[]> = {
  Mathematics: [
    "Day 1: Algebra fundamentals & practice set",
    "Day 2: Geometry concepts + visual exercises",
    "Day 3: Trigonometry with real-world problems",
    "Day 4: Statistics & data interpretation",
    "Day 5: Mixed revision quiz (AI-adaptive)",
    "Day 6: Weak-area deep dive (auto-detected)",
    "Day 7: Mock test & performance report",
  ],
  Science: [
    "Day 1: Physics — Forces & motion lab",
    "Day 2: Chemistry — Periodic trends flashcards",
    "Day 3: Biology — Cell structure visual guide",
    "Day 4: Physics — Energy & work problems",
    "Day 5: Chemistry — Balancing equations drill",
    "Day 6: Cross-topic revision quiz",
    "Day 7: Full-length practice test",
  ],
  English: [
    "Day 1: Reading comprehension strategies",
    "Day 2: Grammar & sentence correction",
    "Day 3: Essay writing framework",
    "Day 4: Vocabulary building (AI flashcards)",
    "Day 5: Critical analysis practice",
    "Day 6: Timed writing exercise",
    "Day 7: Mock test & AI feedback",
  ],
};

const DemoWidget = () => {
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [plan, setPlan] = useState<string[] | null>(null);

  const generate = () => {
    if (!subject) return;
    setPlan(samplePlans[subject] || samplePlans["Mathematics"]);
  };

  return (
    <section className="py-24 bg-card/50">
      <div className="container max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Try It Now ✨
          </h2>
          <p className="text-muted-foreground text-lg">
            Enter a subject and get an instant 7-day micro study plan.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-background sketch-border sketch-shadow-yellow p-8 rounded-2xl"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <select
              value={subject}
              onChange={(e) => { setSubject(e.target.value); setPlan(null); }}
              className="flex-1 h-11 rounded-lg border border-border bg-background px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select subject</option>
              <option>Mathematics</option>
              <option>Science</option>
              <option>English</option>
            </select>
            <input
              type="text"
              placeholder="Grade (e.g. 10th)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="flex-1 h-11 rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={generate}
              className="rounded-full font-heading bg-primary text-primary-foreground hover:bg-primary/90 sketch-border sketch-shadow-yellow hover-tilt"
              disabled={!subject}
            >
              <Sparkles size={16} className="mr-2" />
              Generate Plan
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {plan && (
              <motion.div
                key="plan"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {plan.map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border"
                  >
                    <span className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-sm">{day}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};


const plans = [
  {
    name: "All Access Pass",
    price: "Coming Soon",
    desc: "We're preparing our premium learning features for launch.",
    features: ["Unlimited AI study plans", "Smart tutor bot", "Performance analytics", "Priority support"],
    cta: "Join Waitlist",
    highlighted: true,
  }
];

const Pricing = () => {
  const [, setLocation] = useLocation();
  return (
    <section id="pricing" className="py-24 bg-card/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold mb-3">
            Choose Your Ticket 🎫
          </h2>
          <p className="text-muted-foreground text-lg">
            Simple pricing for every kind of learner. Tickets launching soon.
          </p>
        </motion.div>

        <div className="flex justify-center max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 w-full max-w-sm rounded-2xl sketch-border transition-all flex flex-col hover-tilt ${plan.highlighted
                ? "bg-card sketch-shadow-yellow ring-2 ring-primary"
                : "bg-card sketch-shadow"
                }`}
            >
              {plan.highlighted && (
                <span className="text-xs font-bold bg-primary px-3 py-1 rounded-full self-start mb-4 text-primary-foreground">
                  Launching Soon
                </span>
              )}
              <h3 className="font-heading font-bold text-xl">{plan.name}</h3>
              <p className="text-3xl font-extrabold font-heading mt-2">{plan.price}</p>
              <p className="text-sm text-muted-foreground mt-2 mb-6">{plan.desc}</p>
              <ul className="space-y-4 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm font-medium">
                    <Check size={18} className="text-primary shrink-0" strokeWidth={3} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`mt-8 h-12 rounded-full font-heading text-base sketch-border hover-tilt ${plan.highlighted ? "bg-primary text-primary-foreground hover:bg-primary/90 sketch-shadow-yellow" : "bg-card sketch-shadow"
                  }`}
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => setLocation('/login')}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- ContactForm.tsx ---
const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please fill in your name and email.");
      return;
    }
    toast.success("Thank you! We'll be in touch shortly. ✨");
    setForm({ name: "", email: "", phone: "", role: "", message: "" });
  };

  const inputClasses =
    "w-full h-11 rounded-lg border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] transition-all";

  return (
    <section id="contact" className="py-24 relative overflow-hidden flex items-center min-h-[80vh]">
      {/* Background illustration */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={schoolMeeting}
          alt="Contact Section Background"
          className="w-full h-full object-cover opacity-35 dark:opacity-15 mix-blend-multiply dark:mix-blend-screen grayscale select-none"
        />
        {/* Fade out right side (where form is), keep left visible */}
        <div className="absolute inset-0 bg-gradient-to-l from-background via-background/80 to-background/20" />
        {/* Fade top and bottom edges */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/60" />
      </div>

      <div className="container relative z-10 flex justify-end">
        <div className="w-full max-w-lg">
          <div className="text-left mb-10">
            <span className="inline-block bg-card sketch-border sketch-shadow px-4 py-1.5 text-sm font-medium text-foreground mb-4">
              ✨ Get in touch
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Book Your Digital Journey
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mt-4">
              Whether you're a student, teacher, or school — we'd love to help you succeed. Fill out the form and our team will reach out within 24 hours.
            </p>
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card/70 dark:bg-card/50 backdrop-blur-xl sketch-border sketch-shadow p-8 rounded-2xl space-y-4"
          >
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClasses}
              maxLength={100}
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputClasses}
              maxLength={255}
            />
            <input
              type="tel"
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputClasses}
              maxLength={20}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={inputClasses}
            >
              <option value="">I am a…</option>
              <option>Student</option>
              <option>Teacher</option>
              <option>School / Institution</option>
              <option>Parent</option>
            </select>
            <textarea
              placeholder="Tell us about your learning goals…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] min-h-[100px] resize-none transition-all"
              maxLength={1000}
            />
            <Button type="submit" className="w-full rounded-full font-heading bg-primary text-primary-foreground hover:bg-primary/90 sketch-border sketch-shadow-yellow hover-tilt" size="lg">
              <Send size={16} className="mr-2" />
              Send Message
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We won't share your data. Privacy first. 🔒
            </p>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

// --- Footer.tsx ---
const Footer = () => (
  <footer className="border-t border-border py-12 bg-card/30">
    <div className="container">
      {/* Footer Divider */}
      <div className="flex justify-center mb-8">
        <div className="flex gap-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-6 h-1 bg-foreground/15 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-8 text-sm">
        <div>
          <p className="font-heading font-bold text-lg mb-2">
            Edu<span className="text-primary">AI</span> ✨
          </p>
          <p className="text-muted-foreground">
            AI-powered personalised learning for every student.
          </p>
        </div>
        <div>
          <p className="font-heading font-bold mb-2">Quick Links</p>
          <div className="space-y-1 text-muted-foreground">
            <a href="#journey" className="block hover:text-foreground transition-colors">How it Works</a>
            <a href="#features" className="block hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="block hover:text-foreground transition-colors">Pricing</a>
            <a href="#contact" className="block hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
        <div>
          <p className="font-heading font-bold mb-2">Connect</p>
          <div className="space-y-1 text-muted-foreground">
            <a href="#" className="block hover:text-foreground transition-colors">Twitter / X</a>
            <a href="#" className="block hover:text-foreground transition-colors">LinkedIn</a>
            <a href="#" className="block hover:text-foreground transition-colors">Instagram</a>
            <a href="mailto:hello@eduai.com" className="block hover:text-foreground transition-colors">hello@eduai.com</a>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        © 2026 EduAI. All rights reserved. Built with 💛 for learners everywhere.
      </div>
    </div>
  </footer>
);


const LandingPage = () => (
  <div className="bg-background min-h-screen text-foreground selection:bg-primary/20">
    <Navbar />
    <main>
      <Hero />
      <Turbulence />
      <Journey />
      <NotebookFeature />
      <OnboardingFeatures />
      <DemoWidget />
      <Pricing />
      <ContactForm />
    </main>
    <Footer />
  </div>
);

export default LandingPage;