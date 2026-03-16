import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, CheckCircle, Sparkles, Loader2 } from "lucide-react";
import { AnswerInput } from "./answer-input";

interface QuestionCardProps {
    question: any;
    currentAnswer: string;
    onAnswerChange: (value: string) => void;
    onSubmit: () => void;
    onSkip: () => void;
    onHintRequest: () => void;
    hintsRemaining: number;
    isSubmitting: boolean;
}

export function QuestionCard({
    question,
    currentAnswer,
    onAnswerChange,
    onSubmit,
    onSkip,
    onHintRequest,
    hintsRemaining,
    isSubmitting
}: QuestionCardProps) {
    if (!question) return null;

    return (
        <Card className="w-full max-w-3xl mx-auto shadow-card border border-border bg-card rounded-2xl overflow-hidden mt-8 md:mt-12 animate-fade-in">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent/60" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {question.type} Assessment
                        </span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-muted border border-border text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                        {question.marks} Points
                    </div>
                </div>
                <h2 className="text-2xl md:text-3xl font-display text-foreground leading-tight tracking-tight">
                    {question.text}
                </h2>
            </CardHeader>

            <CardContent className="px-8 pt-6 pb-10">
                <AnswerInput
                    type={question.type}
                    options={question.options}
                    value={currentAnswer}
                    onChange={onAnswerChange}
                    disabled={isSubmitting}
                />
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border bg-muted/50 px-8 py-5">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHintRequest}
                    disabled={hintsRemaining <= 0 || isSubmitting}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4 transition-all"
                >
                    <Lightbulb className="w-4 h-4 mr-2 text-accent" />
                    <span className="text-xs font-bold uppercase tracking-widest">Ask for an AI Nudge</span>
                </Button>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={onSkip}
                        disabled={isSubmitting}
                        className="rounded-xl border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-all px-6"
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!currentAnswer || isSubmitting}
                        className="min-w-[140px] rounded-xl bg-accent text-white hover:bg-accent/90 shadow-soft transition-all"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Submit Answer
                            </span>
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
