import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, Calendar, Clock, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudyTask {
  task: string;
  duration: string;
}

interface StudyDay {
  day: number;
  title: string;
  tasks: StudyTask[];
}

interface StudyPlan {
  days: StudyDay[];
}

interface WeakSubject {
  subject: string;
  avgScore: number;
}

export default function AiStudyPlans() {
  const { toast } = useToast();
  const [plan, setPlan] = useState<StudyPlan | null>(null);

  const { data: weakSubjects = [], isLoading: isLoadingWeak } = useQuery<WeakSubject[]>({
    queryKey: ["/api/student/weak-subjects"],
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai/study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weakSubjects }),
      });
      if (!response.ok) throw new Error("Failed to generate plan");
      return response.json();
    },
    onSuccess: (data) => {
      setPlan(data);
      toast({ title: "Study Plan Generated", description: "Your 7-day plan is ready." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate study plan. Please try again.", variant: "destructive" });
    }
  });

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Personalized Study Plan"
        subtitle="AI-generated revision paths focused on your improvement areas."
      >
        <Button 
          onClick={() => generateMutation.mutate()} 
          disabled={generateMutation.isPending || isLoadingWeak}
          className="bg-accent hover:bg-accent-hover text-white rounded-full font-bold text-[10px] uppercase tracking-widest px-8 h-11 shadow-card"
        >
          {generateMutation.isPending ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Plan...</>
          ) : (
            <><Sparkles className="h-4 w-4 mr-2" /> Generate 7-Day Plan</>
          )}
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Weak Subjects */}
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-soft">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Target Areas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {weakSubjects.length > 0 ? (
                <div className="space-y-3">
                  {weakSubjects.map((s: any) => (
                    <div key={s.subject} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <span className="text-sm font-semibold text-foreground">{s.subject}</span>
                      <Badge variant="outline" className="bg-background text-amber-600 border-amber-200">
                        Avg: {Math.round(s.avgScore)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 w-fit mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">You're doing great!</p>
                  <p className="text-xs text-muted-foreground mt-1 px-4">All your subjects are above 60% average.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content: The Plan */}
        <div className="lg:col-span-2">
          {!plan ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-border rounded-3xl bg-muted/30 p-12 text-center">
              <div className="p-5 rounded-full bg-background shadow-soft mb-6">
                <Calendar className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Ready to start?</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-8">
                Click generate to create a focused revision schedule based on your recent test performance.
              </p>
              <Button 
                variant="outline" 
                onClick={() => generateMutation.mutate()} 
                disabled={generateMutation.isPending}
                className="rounded-full font-bold text-[10px] uppercase tracking-widest px-8"
              >
                Create My Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {plan.days.map((day) => (
                <Card key={day.day} className="border-border bg-card shadow-soft overflow-hidden group hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-32 bg-muted/50 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Day</span>
                      <span className="text-4xl font-display text-accent leading-none">{day.day}</span>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        {day.title}
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30" />
                      </h3>
                      <div className="grid gap-3">
                        {day.tasks.map((task, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-background border border-border/60 group-hover:border-accent/20 transition-colors">
                            <div className="p-2 rounded-lg bg-accent-soft text-accent">
                              <Clock className="h-3.5 w-3.5" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{task.task}</p>
                            </div>
                            <Badge variant="default" className="text-[9px] font-bold uppercase tracking-widest bg-muted text-muted-foreground">
                              {task.duration}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
