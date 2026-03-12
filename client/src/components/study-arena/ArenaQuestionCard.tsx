import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    text: string;
    options: Option[];
}

interface ArenaQuestionCardProps {
    question: Question;
    timeRemaining?: number;
    maxTime?: number;
    onAnswerSubmit: (optionId: string) => void;
    isAnswering?: boolean;
    selectedOptionId?: string | null;
    correctOptionId?: string | null;
}

export function ArenaQuestionCard({
    question,
    timeRemaining = 30,
    maxTime = 30,
    onAnswerSubmit,
    isAnswering = false,
    selectedOptionId = null,
    correctOptionId = null
}: ArenaQuestionCardProps) {

    const progressPercentage = Math.max(0, (timeRemaining / maxTime) * 100);
    const isTimeLow = timeRemaining <= 10;

    return (
        <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -50, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-full max-w-2xl mx-auto z-20"
        >
            <Card className="bg-[#111111] border-white/5 shadow-2xl overflow-hidden rounded-2xl">
                {/* Timer Bar */}
                <div className="h-1 w-full bg-black/40">
                    <motion.div
                        className={`h-full ${isTimeLow ? 'bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.8)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]'}`}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ ease: "linear", duration: 1 }}
                    />
                </div>

                <CardContent className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <Badge variant="outline" className="bg-white/5 text-zinc-400 border-white/10 px-3 py-1 text-xs">
                            Active Question
                        </Badge>
                        <div className={`flex items-center gap-1.5 text-sm font-mono font-medium ${isTimeLow ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`}>
                            <Clock className="w-4 h-4" />
                            <span>{timeRemaining}s</span>
                        </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-medium mb-8 text-zinc-100 leading-relaxed tracking-tight">
                        {question.text}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {question.options.map((option, index) => {
                                const isSelected = selectedOptionId === option.id;
                                const isCorrect = correctOptionId === option.id;
                                const showAsCorrect = correctOptionId && isCorrect;
                                const showAsWrong = correctOptionId && isSelected && !isCorrect;
                                const isDisabled = isAnswering || correctOptionId !== null;

                                let buttonClass = "w-full justify-start p-4 text-left whitespace-normal h-auto transition-all duration-200 border rounded-xl";

                                if (showAsCorrect) {
                                    buttonClass += " border-emerald-500/50 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
                                } else if (showAsWrong) {
                                    buttonClass += " border-rose-500/50 bg-rose-500/10 text-rose-100";
                                } else if (isSelected) {
                                    buttonClass += " border-indigo-500/50 bg-indigo-500/10 text-white";
                                } else {
                                    buttonClass += " border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-zinc-300";
                                }

                                return (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Button
                                            variant="outline"
                                            className={buttonClass}
                                            onClick={() => !isDisabled && onAnswerSubmit(option.id)}
                                            disabled={isDisabled && !isSelected && !isCorrect}
                                        >
                                            <div className="flex items-start gap-4 w-full">
                                                <span className={`w-6 h-6 rounded flex items-center justify-center shrink-0 border text-xs font-medium ${showAsCorrect ? 'bg-emerald-500 border-emerald-400 text-white' :
                                                    showAsWrong ? 'bg-rose-500 border-rose-400 text-white' :
                                                        isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-black/40 border-white/10 text-zinc-400'
                                                    }`}>
                                                    {String.fromCharCode(65 + index)}
                                                </span>
                                                <span className="flex-1 leading-snug">{option.text}</span>
                                            </div>
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
