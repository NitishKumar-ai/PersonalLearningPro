import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestDetailsForm } from "@/components/test/test-details-form";
import { QuestionForm } from "@/components/test/question-form";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateTest() {
  const [activeTab, setActiveTab] = useState("test-details");
  const [testId, setTestId] = useState<number | null>(null);
  const [questionOrder, setQuestionOrder] = useState(1);

  const handleTestCreated = (id: number) => {
    setTestId(id);
    setActiveTab("add-questions");
  };

  const handleQuestionAdded = () => {
    setQuestionOrder(prev => prev + 1);
  };

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create a New Test</h1>
        <p className="text-muted-foreground">
          Design a custom assessment with AI-powered evaluation
        </p>
      </div>

      <Card>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="border-b px-4">
            <TabsList className="justify-start -mb-px">
              <TabsTrigger
                value="test-details"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Test Details
              </TabsTrigger>
              <TabsTrigger
                value="add-questions"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
                disabled={!testId}
              >
                Add Questions
              </TabsTrigger>
              <TabsTrigger
                value="review"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
                disabled={!testId}
              >
                Settings & Review
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-6">
            <TabsContent value="test-details" className="mt-0">
              <TestDetailsForm />
            </TabsContent>

            <TabsContent value="add-questions" className="mt-0">
              {testId ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Add Questions to Your Test
                    </h2>
                    <p className="text-muted-foreground mb-6">
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
                  <p>Please complete test details first</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="review" className="mt-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">
                    Review and Publish Test
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Review your test details and questions before publishing
                  </p>
                </div>

                {/* Review content - to be implemented */}
                <div className="bg-muted rounded-md p-6 text-center">
                  <p>Test review interface will be available in future updates</p>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </>
  );
}

