import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusCircle, X, Trash2 } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false),
});

const questionSchema = z.object({
  testId: z.number(),
  type: z.enum(["mcq", "short", "long", "numerical"]),
  text: z.string().min(3, "Question text is required"),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().optional(),
  marks: z.number().min(1, "Marks must be at least 1"),
  order: z.number(),
  aiRubric: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  testId: number;
  order: number;
  onSuccess?: () => void;
}

export function QuestionForm({ testId, order, onSuccess }: QuestionFormProps) {
  const { toast } = useToast();
  const [questionType, setQuestionType] = useState<string>("mcq");
  const [options, setOptions] = useState<Array<{ id: string; text: string; isCorrect: boolean }>>([
    { id: "1", text: "", isCorrect: false },
    { id: "2", text: "", isCorrect: false },
    { id: "3", text: "", isCorrect: false },
    { id: "4", text: "", isCorrect: false },
  ]);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      testId,
      type: "mcq",
      text: "",
      marks: 1,
      order,
      aiRubric: "",
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: async (data: QuestionFormValues) => {
      // For MCQ questions, create the correctAnswer from options
      if (data.type === "mcq" && data.options) {
        const correctOption = data.options.findIndex((opt) => opt.isCorrect);
        if (correctOption !== -1) {
          data.correctAnswer = correctOption.toString();
        }
      }
      
      return apiRequest("POST", "/api/questions", data);
    },
    onSuccess: async () => {
      toast({
        title: "Question Added",
        description: "The question has been added to the test",
      });
      
      // Reset form for next question
      form.reset({
        testId,
        type: "mcq",
        text: "",
        marks: 1,
        order: order + 1,
        aiRubric: "",
      });
      
      // Reset options for MCQ
      setOptions([
        { id: "1", text: "", isCorrect: false },
        { id: "2", text: "", isCorrect: false },
        { id: "3", text: "", isCorrect: false },
        { id: "4", text: "", isCorrect: false },
      ]);
      
      // Invalidate the questions cache for this test
      queryClient.invalidateQueries({ queryKey: [`/api/tests/${testId}/questions`] });
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to add question",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  const handleTypeChange = (type: string) => {
    setQuestionType(type);
    form.setValue("type", type as any);
  };

  const handleOptionChange = (id: string, text: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    );
  };

  const handleCorrectOptionChange = (id: string) => {
    setOptions(
      options.map((opt) => ({ ...opt, isCorrect: opt.id === id }))
    );
  };

  const addOption = () => {
    const newId = (options.length + 1).toString();
    setOptions([...options, { id: newId, text: "", isCorrect: false }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      toast({
        title: "Cannot remove option",
        description: "MCQ questions must have at least 2 options",
        variant: "destructive",
      });
      return;
    }
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const onSubmit = (data: QuestionFormValues) => {
    if (data.type === "mcq") {
      // Validate MCQ specific fields
      const formattedOptions = options.map((opt) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));
      
      // Check if at least one option is marked as correct
      if (!options.some((opt) => opt.isCorrect)) {
        toast({
          title: "Invalid question",
          description: "Please mark at least one option as correct",
          variant: "destructive",
        });
        return;
      }
      
      // Check if all options have text
      if (options.some((opt) => !opt.text.trim())) {
        toast({
          title: "Invalid question",
          description: "All options must have text",
          variant: "destructive",
        });
        return;
      }
      
      data.options = formattedOptions;
    } else if (data.type === "numerical") {
      // Validate numerical answer is provided
      if (!data.correctAnswer) {
        toast({
          title: "Invalid question",
          description: "Please provide the correct numerical answer",
          variant: "destructive",
        });
        return;
      }
    }
    
    createQuestionMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleTypeChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="mcq">Multiple Choice</SelectItem>
                        <SelectItem value="short">Short Answer</SelectItem>
                        <SelectItem value="long">Long Answer</SelectItem>
                        <SelectItem value="numerical">Numerical</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marks</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your question here..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {questionType === "mcq" && (
              <div className="mt-4">
                <FormLabel className="block mb-2">Options</FormLabel>
                <div className="space-y-3">
                  {options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-start space-x-2"
                    >
                      <RadioGroup
                        value={
                          options.find((opt) => opt.isCorrect)?.id || ""
                        }
                        onValueChange={handleCorrectOptionChange}
                        className="flex items-center mt-2"
                      >
                        <RadioGroupItem
                          value={option.id}
                          id={`option-${option.id}`}
                          className="mt-1"
                        />
                      </RadioGroup>
                      <div className="flex-1">
                        <Input
                          value={option.text}
                          onChange={(e) =>
                            handleOptionChange(option.id, e.target.value)
                          }
                          placeholder={`Option ${option.id}`}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(option.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={addOption}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              </div>
            )}

            {questionType === "numerical" && (
              <FormField
                control={form.control}
                name="correctAnswer"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Correct Answer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter the correct numerical answer"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {(questionType === "short" || questionType === "long") && (
              <FormField
                control={form.control}
                name="aiRubric"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Evaluation Rubric (for AI Scoring)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter guidelines for how the AI should evaluate answers..."
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                disabled={createQuestionMutation.isPending}
              >
                {createQuestionMutation.isPending
                  ? "Adding..."
                  : "Add Question"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}
