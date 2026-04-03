import { useState } from "react";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { BentoHeroCard } from "@/components/chat/bento-hero-card";
import { BentoSubjectCard } from "@/components/chat/bento-subject-card";
import { RagChatSheet } from "@/components/chat/rag-chat-sheet";
import { Sparkles, Rocket, Trophy, Code, GraduationCap } from "lucide-react";

export default function AiTutor() {
  const { currentUser } = useFirebaseAuth();
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [initialPrompt, setInitialPrompt] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Use real subjects from profile or fallback
  const userSubjects = currentUser?.profile?.subjects || [];
  
  const subjects = userSubjects.length > 0 
    ? userSubjects.map(s => ({
        id: s.toLowerCase(),
        name: s,
        description: `Your enrolled ${s} module.`,
        tag: "ENROLLED",
        progress: 0,
        icon: <GraduationCap className="w-16 h-16 text-accent" strokeWidth={1.5} />,
        isLocked: false
      }))
    : [
        {
          id: "general",
          name: "General Study",
          description: "Ask anything about your curriculum.",
          tag: "GUEST",
          progress: 0,
          icon: <Sparkles className="w-16 h-16 text-accent" strokeWidth={1.5} />,
          isLocked: false
        }
      ];

  const handleAction = (subjectName: string, action: "revise" | "practice" | "chat") => {
    setActiveSubject(subjectName);
    if (action === "chat") {
      setInitialPrompt("");
    } else if (action === "revise") {
      setInitialPrompt(`I want to revise the key concepts for ${subjectName}. Where should I start?`);
    } else if (action === "practice") {
      setInitialPrompt(`Give me a quick 3-question practice quiz for ${subjectName}.`);
    }
    setIsChatOpen(true);
  };

  return (
    <div className="space-y-10 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-soft border border-accent/10 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase">AI Intelligent Tutor</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display text-foreground leading-tight mb-4">
            Welcome back, {currentUser?.profile?.displayName?.split(' ')[0] || "Scholar"}.
          </h1>
          <p className="text-lg text-muted-foreground font-body max-w-2xl leading-relaxed">
            Your personalized learning journey is evolving. Ask EduAI to clarify complex theories or generate practice paths tailored to your recent progress.
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <section className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <BentoHeroCard
          title="Focus Session: Physics"
          description="You've mastered 65% of Advanced Mechanics. EduAI suggests focusing on Rotational Motion today to bridge the gap in your recent quiz performance."
          ctaText="Start Learning Session"
          visual={
            <div className="relative group">
              <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-75 group-hover:scale-100 transition-transform duration-700" />
              <Rocket className="w-24 h-24 text-accent relative z-10 drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-2" strokeWidth={1.5} />
            </div>
          }
          onCtaClick={() => handleAction("Physics", "chat")}
        />
      </section>

      {/* Subjects Section */}
      <section className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-accent" />
            Academic Curriculum
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 bg-muted/50 px-2 py-1 rounded-md">
            {subjects.length} Active Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subjects.map((subject, index) => (
            <div key={subject.id} className="animate-fade-in-up" style={{ animationDelay: `${250 + index * 50}ms` }}>
              <BentoSubjectCard
                title={subject.name}
                description={subject.description}
                icon={subject.icon}
                tag={subject.tag}
                progressPercentage={subject.progress}
                isLocked={subject.isLocked}
                onAction={(action) => handleAction(subject.name, action)}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </section>

      {/* RAG Chat Sheet Overlay */}
      {activeSubject && (
        <RagChatSheet
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          subjectName={activeSubject}
          initialPrompt={initialPrompt}
        />
      )}
    </div>
  );
}