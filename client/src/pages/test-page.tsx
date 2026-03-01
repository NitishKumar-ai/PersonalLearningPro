import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2, PanelRightClose, PanelRightOpen, ArrowRight, Home } from "lucide-react";
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
- **Magnetic Flux ($\\Phi_B$)**: $\\Phi_B = B \\cdot A \\cdot \\cos(\\theta)$
- **Faraday's Law of Induction**: $\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$
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
            // If there's an existing attempt, we could handle it here.
            // For MVP, we'll just log or show toast
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
            // Evaluate locally for MVP instant feedback if MCQ, or just show the correct answer
            const q = questions![currentQuestionIndex];
            let isCorrect = data.isCorrect;

            if (q.type !== 'mcq') {
                // Simple string match for short/numerical if not evaluated by backend yet
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

    // Effect to init attempt
    useEffect(() => {
        if (test && !attemptId && !initAttemptMutation.isPending && !initAttemptMutation.isSuccess) {
            initAttemptMutation.mutate();
        }
    }, [test, attemptId]);

    if (isLoadingTest || isLoadingQuestions) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading test environment...</span>
            </div>
        );
    }

    if (!test || !questions || questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <h2 className="text-xl font-bold">Test not found</h2>
                <Button onClick={() => setLocation("/")} className="mt-4">Back to Dashboard</Button>
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
            <div className="max-w-2xl mx-auto py-16 px-4">
                <Card className="text-center py-10 shadow-lg border-primary/20">
                    <CardContent>
                        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Test Completed!</h1>
                        <p className="text-muted-foreground mb-8">
                            Great job completing "{test.title}".
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Time Elapsed</div>
                                <div className="text-xl font-mono font-semibold">12:34</div>
                            </div>
                            <div className="bg-muted p-4 rounded-lg">
                                <div className="text-sm text-muted-foreground mb-1">Questions Attempted</div>
                                <div className="text-xl font-mono font-semibold">{questions.length} / {questions.length}</div>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-8 text-left">
                            <h3 className="font-semibold flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                AI Recommendation
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Based on your performance, you should review the <strong>Faraday's Law</strong> section in the Achievers Book before your next attempt.
                            </p>
                        </div>

                        <Button onClick={() => setLocation("/")} className="w-full sm:w-auto px-8">
                            <Home className="w-4 h-4 mr-2" />
                            Return to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#fcfcfc] overflow-hidden">
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isBookOpen ? 'md:mr-80' : ''}`}>

                <TestProgress
                    currentQuestionIndex={currentQuestionIndex + 1}
                    totalQuestions={questions.length}
                    timeLimitMinutes={test.duration || 30}
                    onTimeUp={() => completeTestMutation.mutate()}
                />

                <div className="flex-1 overflow-y-auto px-4 pb-24 relative">
                    {/* Top right toggle button for Achievers Book visible on desktop */}
                    <div className="absolute right-4 top-4 hidden md:block">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsBookOpen(!isBookOpen)}
                            className="bg-card text-muted-foreground shadow-sm"
                            title="Toggle Achievers Book"
                        >
                            {isBookOpen ? <PanelRightClose className="w-4 h-4 mr-2" /> : <PanelRightOpen className="w-4 h-4 mr-2" />}
                            {isBookOpen ? "Close Book" : "Achievers Book"}
                        </Button>
                    </div>

                    {!showResult ? (
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
                    ) : (
                        <Card className="w-full max-w-3xl mx-auto mt-10 shadow-sm border-primary/20">
                            <CardContent className="pt-8 pb-8 text-center space-y-6">
                                <div>
                                    <h3 className={`text-2xl font-bold ${lastResult?.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
                                        {lastResult?.isCorrect ? "Correct!" : "Not quite right"}
                                    </h3>
                                </div>

                                <div className="bg-muted p-6 rounded-xl text-left space-y-4">
                                    <div>
                                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Model Answer</span>
                                        <p className="text-foreground font-medium text-lg">{lastResult?.answer}</p>
                                    </div>
                                    {lastResult?.explanation && (
                                        <div className="pt-4 border-t">
                                            <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Explanation</span>
                                            <p className="text-muted-foreground">{lastResult.explanation}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-center pt-4">
                                    <Button onClick={handleNextQuestion} size="lg" className="px-8">
                                        {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Test"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Mobile floating button for Achievers Book */}
                    <div className="fixed bottom-6 right-6 md:hidden z-10">
                        <Button
                            size="icon"
                            className="rounded-full shadow-lg h-14 w-14"
                            onClick={() => setIsBookOpen(!isBookOpen)}
                        >
                            {isBookOpen ? <PanelRightClose /> : <PanelRightOpen />}
                        </Button>
                    </div>
                </div>
            </div>

            <AchieversBookPanel
                summary={mockAchieversData.summary}
                pyqs={mockAchieversData.pyqs}
                isOpen={isBookOpen}
            />

            {/* Overlay for mobile when book is open */}
            {isBookOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-10"
                    onClick={() => setIsBookOpen(false)}
                />
            )}
        </div>
    );
}

// Ensure lucide-react imports are present above
import { CheckCircle, Lightbulb } from "lucide-react";
