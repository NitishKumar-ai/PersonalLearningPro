import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, CheckCircle } from "lucide-react";
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
        <Card className="w-full max-w-3xl mx-auto shadow-none border-0 sm:border sm:shadow-sm bg-transparent sm:bg-card mt-4 sm:mt-10">
            <CardHeader>
                <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs uppercase tracking-wider">
                        {question.type} Question
                    </Badge>
                    <span className="text-sm font-medium text-muted-foreground">
                        {question.marks} marks
                    </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium leading-relaxed text-card-foreground">
                    {question.text}
                </h2>
            </CardHeader>

            <CardContent className="pt-6 pb-8">
                <AnswerInput
                    type={question.type}
                    options={question.options}
                    value={currentAnswer}
                    onChange={onAnswerChange}
                    disabled={isSubmitting}
                />
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t bg-muted/20 px-6 py-4 rounded-b-xl">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHintRequest}
                    disabled={hintsRemaining <= 0 || isSubmitting}
                    className="text-muted-foreground hover:text-foreground"
                    title={`Need a nudge? AI hint (${hintsRemaining} remaining)`}
                >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Hint
                </Button>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onSkip}
                        disabled={isSubmitting}
                    >
                        Skip
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!currentAnswer || isSubmitting}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">Checking...</span>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Check
                            </>
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
