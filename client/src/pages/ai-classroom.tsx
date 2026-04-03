import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, BookOpen, Brain, Presentation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClassroomResponse {
  classroomId: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  url?: string;
  scenes?: any[];
}

export default function AIClassroom() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [sceneType, setSceneType] = useState<'slides' | 'quiz' | 'simulation' | 'pbl'>('slides');
  const [currentClassroom, setCurrentClassroom] = useState<ClassroomResponse | null>(null);

  // Check if OpenMAIC is available
  const { data: healthStatus } = useQuery({
    queryKey: ['ai-classroom-health'],
    queryFn: async () => {
      const res = await fetch('/api/ai-classroom/health');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const createClassroomMutation = useMutation({
    mutationFn: async (data: { topic: string; sceneTypes: string[] }) => {
      const res = await fetch('/api/ai-classroom/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create classroom');
      return res.json();
    },
    onSuccess: (data) => {
      setCurrentClassroom(data);
      toast({
        title: 'Classroom Created',
        description: 'Your AI classroom is being generated...',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create classroom',
        variant: 'destructive',
      });
    },
  });

  const generateQuizMutation = useMutation({
    mutationFn: async (data: { topic: string; questionCount: number }) => {
      const res = await fetch('/api/ai-classroom/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to generate quiz');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Quiz Generated',
        description: 'Your interactive quiz is ready!',
      });
    },
  });

  const handleCreateClassroom = () => {
    if (!topic.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic',
        variant: 'destructive',
      });
      return;
    }

    createClassroomMutation.mutate({
      topic: topic.trim(),
      sceneTypes: [sceneType],
    });
  };

  const handleGenerateQuiz = () => {
    if (!topic.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic',
        variant: 'destructive',
      });
      return;
    }

    generateQuizMutation.mutate({
      topic: topic.trim(),
      questionCount: 5,
    });
  };

  if (!healthStatus?.available) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              AI Classroom
            </CardTitle>
            <CardDescription>
              Multi-agent interactive learning experiences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">AI Classroom Not Available</h3>
              <p className="text-muted-foreground mb-4">
                The OpenMAIC service is not configured or not running.
              </p>
              <p className="text-sm text-muted-foreground">
                To enable this feature, set up the arena-learning infrastructure and configure
                OPENMAIC_INTERNAL_URL in your environment variables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8" />
            AI Classroom
          </h1>
          <p className="text-muted-foreground mt-1">
            Create interactive learning experiences with AI teachers and agents
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Presentation className="h-5 w-5" />
              Create Classroom
            </CardTitle>
            <CardDescription>
              Generate a full AI classroom with slides, quizzes, and interactive content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., Quantum Physics, Machine Learning, Ancient Rome"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sceneType">Scene Type</Label>
              <Select value={sceneType} onValueChange={(v: any) => setSceneType(v)}>
                <SelectTrigger id="sceneType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slides">Slides</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="simulation">Interactive Simulation</SelectItem>
                  <SelectItem value="pbl">Project-Based Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCreateClassroom}
              disabled={createClassroomMutation.isPending}
              className="w-full"
            >
              {createClassroomMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Create Classroom
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Quick Quiz Generator
            </CardTitle>
            <CardDescription>
              Generate an interactive quiz on any topic
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quiz-topic">Topic</Label>
              <Input
                id="quiz-topic"
                placeholder="e.g., World War II, Photosynthesis"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>

            <Button
              onClick={handleGenerateQuiz}
              disabled={generateQuizMutation.isPending}
              className="w-full"
              variant="secondary"
            >
              {generateQuizMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Generate Quiz
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {currentClassroom && (
        <Card>
          <CardHeader>
            <CardTitle>Classroom Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">ID:</span> {currentClassroom.classroomId}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className="capitalize">{currentClassroom.status}</span>
              </p>
              {currentClassroom.url && (
                <div>
                  <Button asChild>
                    <a href={currentClassroom.url} target="_blank" rel="noopener noreferrer">
                      Open Classroom
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
