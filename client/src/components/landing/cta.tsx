import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Send } from "lucide-react";
import { toast } from "sonner";
import schoolMeeting from "@/assets/school-meeting.png";

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

export const DemoWidget = () => {
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

export const Pricing = () => {
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

export const ContactForm = () => {
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
