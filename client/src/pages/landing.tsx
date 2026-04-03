import { useState } from "react";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Hero, NotebookFeature, OnboardingFeatures, Turbulence, Journey, DemoWidget, Pricing, ContactForm } from "@/components/landing";

// --- Navbar ---
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

// --- Footer ---
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
