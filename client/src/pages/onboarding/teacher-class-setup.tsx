import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const GRADES = ["Nursery","LKG","UKG",...Array.from({length:12},(_,i)=>`Grade ${i+1}`)];

export default function TeacherClassSetup() {
  const [form, setForm] = useState({ name:"", grade:"" });
  const { toast } = useToast();
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: classes = [] } = useQuery<any[]>({ queryKey:["/api/classes/mine"] });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/classes", form),
    onSuccess: () => {
      toast({ title:"Class created!" });
      setForm({ name:"", grade:"" });
      qc.invalidateQueries({ queryKey:["/api/classes/mine"] });
    },
    onError: (e: any) => toast({ title:"Error", description:e.message, variant:"destructive" }),
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Set up your classes</h1>
          <p className="text-muted-foreground mt-1">Create at least one class to access your dashboard.</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div className="space-y-1">
            <Label>Class name *</Label>
            <Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Grade 5 – Section A" />
          </div>
          <div className="space-y-2">
            <Label>Grade *</Label>
            <div className="flex flex-wrap gap-2">
              {GRADES.map(g => (
                <button key={g} type="button" onClick={() => setForm(f=>({...f,grade:g}))}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${form.grade===g ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={!form.name || !form.grade || createMutation.isPending} className="w-full">
            {createMutation.isPending ? "Creating…" : "Create Class"}
          </Button>
        </div>

        {classes.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">Your Classes</h2>
            {classes.map((cls: any) => (
              <div key={cls._id} className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium">{cls.name}</p>
                  <p className="text-sm text-muted-foreground">{cls.grade}</p>
                </div>
              </div>
            ))}
            <Button className="w-full" onClick={() => setLocation("/")}>
              Go to Dashboard →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
