import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AnswerInputProps {
    type: "mcq" | "short" | "numerical" | "long";
    options?: any[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function AnswerInput({ type, options, value, onChange, disabled }: AnswerInputProps) {
    if (type === "mcq" && options) {
        return (
            <RadioGroup
                value={value}
                onValueChange={onChange}
                disabled={disabled}
                className="space-y-3"
            >
                {options.map((option, index) => {
                    const isSelected = value === option.id;
                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center space-x-4 p-5 border rounded-2xl transition-all duration-300 cursor-pointer",
                                isSelected
                                    ? "bg-accent/[0.03] border-accent ring-1 ring-accent/10 shadow-soft"
                                    : "bg-card border-border hover:border-accent/40 hover:bg-muted/50"
                            )}
                            onClick={() => !disabled && onChange(option.id)}
                        >
                            <RadioGroupItem value={option.id} id={`option-${index}`} className="border-border text-accent" />
                            <Label
                                htmlFor={`option-${index}`}
                                className={cn(
                                    "flex-1 cursor-pointer text-base font-body leading-tight",
                                    isSelected ? "text-foreground font-bold" : "text-muted-foreground"
                                )}
                            >
                                {option.text}
                            </Label>
                        </div>
                    );
                })}
            </RadioGroup>
        );
    }

    if (type === "numerical") {
        return (
            <div className="space-y-3">
                <Label htmlFor="numerical-answer" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Numerical Answer</Label>
                <Input
                    id="numerical-answer"
                    type="number"
                    placeholder="0.00"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="h-16 text-2xl font-mono font-bold px-6 bg-muted/50 border-border focus-visible:ring-accent/10 focus-visible:border-accent rounded-2xl transition-all"
                />
            </div>
        );
    }

    // Fallback for short/long
    return (
        <div className="space-y-3">
            <Label htmlFor="text-answer" className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Your Detailed Explanation</Label>
            <Textarea
                id="text-answer"
                placeholder="Start typing your response here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="min-h-[220px] text-lg font-body bg-muted/50 border-border focus-visible:ring-accent/10 focus-visible:border-accent rounded-2xl p-6 leading-relaxed resize-none"
            />
        </div>
    );
}
