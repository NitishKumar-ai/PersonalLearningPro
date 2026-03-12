import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

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
                {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => !disabled && onChange(option.id)}>
                        <RadioGroupItem value={option.id} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                            {option.text}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        );
    }

    if (type === "numerical") {
        return (
            <div className="space-y-2">
                <Label htmlFor="numerical-answer">Your Answer</Label>
                <Input
                    id="numerical-answer"
                    type="number"
                    placeholder="Enter a number..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="text-lg py-6"
                />
            </div>
        );
    }

    // Fallback for short/long
    return (
        <div className="space-y-2">
            <Label htmlFor="text-answer">Your Answer</Label>
            <Textarea
                id="text-answer"
                placeholder="Type your answer here..."
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={disabled}
                className="min-h-[150px] text-base resize-y"
            />
        </div>
    );
}
