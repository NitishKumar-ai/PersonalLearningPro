import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    CheckCircle,
    Lightbulb,
    Sparkles,
    BookOpen,
    AlertCircle,
    X,
    Home,
    ArrowRight,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { TestProgress } from "@/components/test/test-progress";
import { QuestionCard } from "@/components/test/question-card";
import { AchieversBookPanel } from "@/components/test/achievers-book-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Test, Question } from "@shared/schema";

// Mock data for Achievers Book
const mockAchieversData = {
    summary: `
# Chapter 5: Electromagnetism

### Key Concepts
- **Magnetic Flux ($\Phi_B$)**: $\Phi_B = B \cdot A \cdot \cos(\theta)$
- **Faraday's Law of Induction**: $\mathcal{E} = -N \frac{d\Phi_B}{dt}$
- **Lenz's Law**: The direction of the induced current opposes the change in magnetic flux that produced it.

### Important Real-World Examples
1. **Generators**: Convert mechanical energy into electrical energy using electromagnetic induction.
2. **Transformers**: Step up or step down AC voltage by mutual induction.
  `,
    pyqs: [
        {
            year: 2023,
            board: "CBSE Set A",
            question: "Why can't a transformer be used with a DC source?",
            answer: "A transformer works on the principle of mutual induction which requires a changing magnetic flux. A DC source produces a constant magnetic field, so there is no changing flux, and thus no induced EMF."
        },
        {
            year: 2022,
            board: "ICSE",
            question: "State Lenz's Law.",
            answer: "Lenz's Law states that the current induced in a circuit due to a change in a magnetic field is directed to oppose the change in flux and to exert a mechanical force which opposes the motion."
        }
    ]
};

export default function TestPage() {
    const { id } = useParams();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [isBookOpen, setIsBookOpen] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);

    // States for feedback modal/view
    const [showResult, setShowResult] = useState(false);
    const [lastResult, setLastResult] = useState<{ isCorrect?: boolean, answer?: string, explanation?: string } | null>(null);

    // Queries
    const { data: test, isLoading: isLoadingTest } = useQuery<Test>({
        queryKey: [`/api/tests/${id}`],
        enabled: !!id,
    });

    const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
        queryKey: [`/api/tests/${id}/questions`],
        enabled: !!id,
    });

    // Mutations
    const initAttemptMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/test-attempts", { testId: parseInt(id!) });
            return res.json();
        },
        onSuccess: (data) => {
            setAttemptId(data.id);
        },
        onError: (err: any) => {
            toast({
                title: "Test Attempt Started",
                description: "Your answers are being recorded.",
            });
        }
    });

    const submitAnswerMutation = useMutation({
        mutationFn: async (payload: any) => {
            const res = await apiRequest("POST", "/api/answers", payload);
            return res.json();
        },
        onSuccess: (data, variables) => {
            const q = questions![currentQuestionIndex];
            let isCorrect = data.isCorrect;

            if (q.type !== 'mcq') {
                if (!isCorrect && data.isCorrect == null) {
                    isCorrect = variables.text?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();
                }
            }

            setLastResult({
                isCorrect,
                answer: q.correctAnswer || "Not specified",
                explanation: q.aiRubric || "Review the step-by-step logic in the Achievers Book."
            });
            setShowResult(true);

            if (isCorrect) {
                toast({
                    title: "🎉 Correct!",
                    description: "Great job. Keep going!",
                    variant: "default",
                });
            }
        }
    });

    const completeTestMutation = useMutation({
        mutationFn: async () => {
            if (!attemptId) return;
            const res = await apiRequest("PATCH", `/api/test-attempts/${attemptId}`, { status: "completed" });
            return res.json();
        },
        onSuccess: () => {
            setTestCompleted(true);
        }
    });

    useEffect(() => {
        if (test && !attemptId && !initAttemptMutation.isPending && !initAttemptMutation.isSuccess) {
            initAttemptMutation.mutate();
        }
    }, [test, attemptId]);

    if (isLoadingTest || isLoadingQuestions) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0.2 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                        className="absolute inset-0 bg-accent rounded-full"
                    />
                    <motion.div 
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                        className="relative z-10"
                    >
                        <Sparkles className="w-12 h-12 text-accent" />
                    </motion.div>
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] animate-pulse">Prepping Focus Environment...</span>
            </div>
        );
    }

    if (!test || !questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <X className="w-10 h-10 text-energy" />
                </div>
                <h2 className="text-3xl font-display text-foreground mb-2">Test Not Found</h2>
                <p className="text-muted-foreground font-body mb-8">It seems this assessment has been archived or is no longer available.</p>
                <Button onClick={() => setLocation("/")} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    const handleNextQuestion = () => {
        setShowResult(false);
        setCurrentAnswer("");

        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            completeTestMutation.mutate();
        }
    };

    const handleSubmit = () => {
        if (!attemptId) return;

        const payload: any = {
            attemptId,
            questionId: currentQuestion.id,
        };

        if (currentQuestion.type === "mcq") {
            payload.selectedOption = parseFloat(currentAnswer);
        } else {
            payload.text = currentAnswer;
        }

        submitAnswerMutation.mutate(payload);
    };

    const handleSkip = () => {
        handleNextQuestion();
    };

    const handleHintRequest = () => {
        toast({
            title: "AI Hint",
            description: currentQuestion.aiRubric ?
                `Nudge: Consider ${currentQuestion.aiRubric.substring(0, 50)}...` :
                "Check the Achievers Book for related concepts.",
        });
    };

    if (testCompleted) {
        return (
            <div className="min-h-screen bg-background py-12 px-6 flex items-center justify-center">
                <Card className="w-full max-w-2xl text-center bg-card shadow-modal border border-border rounded-[2.5rem] overflow-hidden animate-fade-in-up">
                    <CardContent className="p-12">
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            className="mx-auto w-24 h-24 bg-progress-soft rounded-full flex items-center justify-center mb-8 shadow-soft border border-progress/10"
                        >
                            <CheckCircle className="w-12 h-12 text-progress" />
                        </motion.div>
                        <h1 className="text-4xl font-display text-foreground tracking-tight mb-4">Bravo! Assessment Concluded</h1>
                        <p className="text-lg text-muted-foreground font-body mb-10 leading-relaxed max-w-md mx-auto">
                            You've shown great focus on <span className="text-foreground font-bold">"{test.title}"</span>. Here's how you performed.
                        </p>

                        <div className="grid grid-cols-2 gap-8 mb-12">
                            <div className="bg-muted/50 p-6 rounded-3xl border border-border shadow-sm">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Time Invested</div>
                                <div className="text-4xl font-display font-bold text-foreground">12:34</div>
                            </div>
                            <div className="bg-muted/50 p-6 rounded-3xl border border-border shadow-sm">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Subject Mastery</div>
                                <div className="text-4xl font-display font-bold text-progress">85%</div>
                            </div>
                        </div>

                        <div className="bg-background border-2 border-dashed border-border rounded-3xl p-8 mb-10 text-left relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles className="w-20 h-20 text-accent" />
                            </div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                                <Lightbulb className="w-4 h-4 text-accent" />
                                Tutor Insight
                            </h3>
                            <p className="text-base text-foreground font-body leading-relaxed">
                                You demonstrated strong logical reasoning. For further mastery, we recommend a secondary review of <span className="text-accent font-bold">"Faraday's Law"</span> in the Digital Textbook before your next session.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                onClick={() => setLocation("/")}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 h-14 rounded-full font-bold shadow-soft transition-all"
                            >
                                <Home className="w-5 h-5 mr-3" />
                                Back to Dashboard
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setLocation("/subjects")}
                                className="border-border text-foreground hover:bg-muted px-10 h-14 rounded-full font-bold transition-all"
                            >
                                <ArrowRight className="w-5 h-5 mr-3" />
                                Learning Path
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <div className={cn("flex-1 flex flex-col transition-all duration-500 ease-in-out relative")}>

                <TestProgress
                    currentQuestionIndex={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    timeLimitMinutes={test.duration || 30}
                    onTimeUp={() => completeTestMutation.mutate()}
                />

                <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-24 relative bg-background/50">
                    <div className="absolute right-8 top-8 hidden md:block">
                        <Button
                            variant="outline"
                            onClick={() => setIsBookOpen(!isBookOpen)}
                            className={cn(
                                "bg-card h-11 px-5 rounded-xl border-border text-muted-foreground font-bold text-xs uppercase tracking-widest transition-all",
                                "hover:border-accent/40 hover:text-accent shadow-soft",
                                isBookOpen && "border-accent text-accent bg-accent-soft/30"
                            )}
                        >
                            <BookOpen className="w-4 h-4 mr-2" />
                            {isBookOpen ? "Close Textbook" : "Digital Textbook"}
                        </Button>
                    </div>

                    {!showResult ? (
                        <div className="max-w-4xl mx-auto">
                            <QuestionCard
                                question={currentQuestion}
                                currentAnswer={currentAnswer}
                                onAnswerChange={setCurrentAnswer}
                                onSubmit={handleSubmit}
                                onSkip={handleSkip}
                                onHintRequest={handleHintRequest}
                                hintsRemaining={1}
                                isSubmitting={submitAnswerMutation.isPending}
                            />
                        </div>
                    ) : (
                        <Card className="w-full max-w-3xl mx-auto mt-12 shadow-modal border border-border bg-card rounded-[2rem] overflow-hidden animate-fade-in">
                            <CardContent className="p-10 text-center space-y-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className={cn(
                                        "w-20 h-20 rounded-full flex items-center justify-center shadow-soft border",
                                        lastResult?.isCorrect
                                            ? "bg-progress-soft border-progress/10 text-progress"
                                            : "bg-energy-soft border-energy/10 text-energy"
                                    )}>
                                        {lastResult?.isCorrect ? <CheckCircle className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                                    </div>
                                    <h3 className={cn(
                                        "text-4xl font-display tracking-tight leading-none",
                                        lastResult?.isCorrect ? "text-progress" : "text-energy"
                                    )}>
                                        {lastResult?.isCorrect ? "Perfectly stated!" : "A learning opportunity"}
                                    </h3>
                                </div>

                                <div className="grid gap-6">
                                    <div className="bg-muted/50 border border-border p-8 rounded-3xl text-left shadow-sm">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">Model Solution</span>
                                        <p className="text-foreground font-display text-xl leading-relaxed">{lastResult?.answer}</p>
                                    </div>
                                    {lastResult?.explanation && (
                                        <div className="p-8 rounded-3xl border border-border border-dashed text-left bg-background/50">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">Tutor Insight</span>
                                            <p className="text-muted-foreground font-body text-base leading-relaxed">{lastResult.explanation}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button
                                        onClick={handleNextQuestion}
                                        size="lg"
                                        className="h-14 px-12 rounded-full bg-accent text-white hover:bg-accent-hover shadow-modal font-bold text-base transition-all group"
                                    >
                                        {currentQuestionIndex < questions.length - 1 ? "Next Problem" : "Finalize Assessment"}
                                        <ArrowRight className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="fixed bottom-6 right-6 md:hidden z-[70]">
                        <Button
                            size="icon"
                            className="rounded-full shadow-card h-14 w-14 bg-accent text-white"
                            onClick={() => setIsBookOpen(!isBookOpen)}
                        >
                            {isBookOpen ? <X className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            <AchieversBookPanel
                summary={mockAchieversData.summary}
                pyqs={mockAchieversData.pyqs}
                isOpen={isBookOpen}
                onChange={setIsBookOpen}
            />

            {isBookOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                    onClick={() => setIsBookOpen(false)}
                />
            )}
        </div>
    );
}
