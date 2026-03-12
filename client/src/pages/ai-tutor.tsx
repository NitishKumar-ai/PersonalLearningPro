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

  // Mock data for the MVP Bento Grid
  const subjects = [
    {
      id: "physics",
      name: "Physics",
      description: "Advanced mechanics and thermodynamics.",
      tag: "CORE",
      progress: 65,
      weakness: "Rotational Motion",
      icon: <Rocket className="w-16 h-16 text-[#4f8cff]" strokeWidth={1.5} />,
      isLocked: false
    },
    {
      id: "chemistry",
      name: "Chemistry",
      description: "Organic reactions and periodicity.",
      tag: "CORE",
      progress: 88,
      icon: <Trophy className="w-16 h-16 text-[#3ad29f]" strokeWidth={1.5} />,
      isLocked: false
    },
    {
      id: "math",
      name: "Mathematics",
      description: "Calculus and linear algebra.",
      tag: "ADVANCED",
      progress: 42,
      weakness: "Integration by Parts",
      icon: <GraduationCap className="w-16 h-16 text-[#ffb86b]" strokeWidth={1.5} />,
      isLocked: false
    },
    {
      id: "cs",
      name: "Computer Science",
      description: "Data structures and algorithms.",
      tag: "ELECTIVE",
      progress: 0,
      icon: <Code className="w-16 h-16 text-white/30" strokeWidth={1.5} />,
      isLocked: true
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
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0f14] text-[#e6eef6] p-4 md:p-8 lg:p-12 font-sans -mx-4 md:-mx-6 -my-4 md:-my-6 relative overflow-hidden">

      {/* Subtle page background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#4f8cff]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#3ad29f]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-[1280px] mx-auto space-y-6 md:space-y-8 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pt-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-4 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#4f8cff]" />
              <span className="text-[12px] font-semibold tracking-wide text-white/80 uppercase">AI-Powered Learning</span>
            </div>
            <h1 className="text-3xl md:text-[44px] font-bold tracking-[-0.03em] text-white leading-tight mb-2">
              Welcome back, {currentUser?.profile?.displayName?.split(' ')[0] || "Student"}.
            </h1>
            <p className="text-[17px] text-[#8b9ba8] font-medium max-w-2xl leading-relaxed">
              Your personalized learning grid is ready. Ask EduAI to break down complex topics or generate tailored practice questions based on your history.
            </p>
          </div>
        </div>

        {/* Hero Card */}
        <BentoHeroCard
          title="Master Class: Physics"
          description="You are 65% through the advanced mechanics module. Your RAG tutor recommends reviewing Rotational Motion next based on recent quiz results."
          ctaText="Open Physics Tutor"
          visual={
            <div className="relative">
              <Rocket className="w-full h-full text-white/90 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-700 ease-in-out" strokeWidth={1} />
            </div>
          }
          onCtaClick={() => handleAction("Physics", "chat")}
        />

        {/* Section Title */}
        <div className="pt-8 pb-2 flex items-center justify-between border-b border-white/5">
          <h2 className="text-xl font-bold text-white tracking-tight">Your Subjects</h2>
          <span className="text-sm font-medium text-[#8b9ba8]">{subjects.length} Active Courses</span>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {subjects.map((subject) => (
            <BentoSubjectCard
              key={subject.id}
              title={subject.name}
              description={subject.description}
              icon={subject.icon}
              tag={subject.tag}
              progressPercentage={subject.progress}
              weakness={subject.weakness}
              isLocked={subject.isLocked}
              onAction={(action) => handleAction(subject.name, action)}
              className="w-full"
            />
          ))}
        </div>
      </div>

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