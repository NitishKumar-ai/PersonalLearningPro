import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestDetailsForm } from "@/components/test/test-details-form";
import { QuestionForm } from "@/components/test/question-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileQuestion,
  CircleCheck,
  Settings2,
  Brain,
  Rocket,
} from "lucide-react";

/**
 * Multi-step test creation wizard. Manages tabs for:
 * 1. Test Details
 * 2. Add Questions
 * 3. Settings & Review (Coming Soon)
 */
export default function CreateTest() {
  const [activeTab, setActiveTab] = useState("test-details");
  const [testId, setTestId] = useState<number | null>(null);
  const [questionOrder, setQuestionOrder] = useState(1);

  const handleTestCreated = (id: number) => {
    setTestId(id);
    setActiveTab("add-questions");
  };

  const handleQuestionAdded = () => {
    setQuestionOrder((prev) => prev + 1);
  };

  const steps = [
    { key: "test-details", label: "Test Details", icon: <FileQuestion className="h-4 w-4" />, unlocked: true },
    { key: "add-questions", label: "Add Questions", icon: <Brain className="h-4 w-4" />, unlocked: !!testId },
    { key: "review", label: "Review & Publish", icon: <Settings2 className="h-4 w-4" />, unlocked: !!testId },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
            <FileQuestion className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create a New Test</h1>
            <p className="text-sm text-muted-foreground">
              Design a custom assessment with AI-powered evaluation
            </p>
          </div>
        </div>
      </div>

      {/* Visual step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-2 flex-1 last:flex-none">
            <button
              onClick={() => step.unlocked && setActiveTab(step.key)}
              disabled={!step.unlocked}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${activeTab === step.key
                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                  : step.unlocked
                    ? "border-border bg-card hover:bg-muted text-foreground/80 cursor-pointer"
                    : "border-border/40 bg-muted/40 text-muted-foreground cursor-not-allowed opacity-60"
                }`}
            >
              {step.icon}
              <span className="hidden sm:block">{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px ${testId && i === 0 ? "bg-primary/50" : "bg-border/40"
                  }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Hidden tab triggers (steps above serve as visual triggers) */}
          <TabsList className="hidden">
            <TabsTrigger value="test-details">Test Details</TabsTrigger>
            <TabsTrigger value="add-questions">Add Questions</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
          </TabsList>

          <CardContent className="p-6">
            <TabsContent value="test-details" className="mt-0">
              <TestDetailsForm />
            </TabsContent>

            <TabsContent value="add-questions" className="mt-0">
              {testId ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Add Questions to Your Test</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                      Create various types of questions to assess different skills
                    </p>
                  </div>
                  <QuestionForm
                    testId={testId}
                    order={questionOrder}
                    onSuccess={handleQuestionAdded}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Please complete test details first</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="review" className="mt-0">
              {/* Premium Coming Soon for review tab */}
              <div className="flex flex-col items-center justify-center py-16 text-center gap-5">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 blur-2xl scale-110" />
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
                    <Rocket className="h-10 w-10 text-blue-500" />
                  </div>
                </div>
                <div>
                  <Badge className="mb-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-semibold">
                    🚀 Coming Soon
                  </Badge>
                  <h3 className="text-xl font-bold mb-2">Review & Publish Test</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    A full test review interface with preview mode, rubric editor, and one-click publishing is on the way.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-sm">
                  {["Preview Mode", "Rubric Editor", "One-Click Publish"].map((f) => (
                    <div key={f} className="px-3 py-3 rounded-xl border border-border/60 bg-card/60 text-center">
                      <CircleCheck className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground font-medium">{f}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </>
  );
}
