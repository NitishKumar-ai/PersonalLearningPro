import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Trophy, 
  BarChart3, 
  ArrowRight, 
  BookMarked,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Flame,
  Award,
  LucideIcon
} from "lucide-react";

interface Test {
  id: number;
  title: string;
  subject: string;
  class: string;
  status: string;
  totalMarks: number;
  duration: number;
  testDate: string;
}

interface Analytics {
  strongTopics: string[];
  weakTopics: string[];
  recommendedResources: Array<{
    title: string;
    type: string;
    url?: string;
  }>;
}

export default function StudentDashboard() {
  const { currentUser } = useFirebaseAuth();
  const [completedCourses, setCompletedCourses] = useState(12);
  const [totalCourses, setTotalCourses] = useState(20);
  
  // Sample data
  const upcomingTests: Test[] = [
    {
      id: 1,
      title: "Mid-Term Mathematics",
      subject: "Mathematics",
      class: "10-A",
      status: "upcoming",
      totalMarks: 100,
      duration: 90,
      testDate: "2025-04-10"
    },
    {
      id: 2,
      title: "Physics Chapter Test",
      subject: "Physics",
      class: "10-A",
      status: "upcoming",
      totalMarks: 50,
      duration: 60,
      testDate: "2025-04-15"
    },
    {
      id: 3,
      title: "Chemistry Quiz",
      subject: "Chemistry",
      class: "10-A",
      status: "upcoming",
      totalMarks: 30,
      duration: 45,
      testDate: "2025-04-20"
    }
  ];
  
  const recentTests: Test[] = [
    {
      id: 4,
      title: "Biology Unit Test",
      subject: "Biology",
      class: "10-A",
      status: "completed",
      totalMarks: 50,
      duration: 60,
      testDate: "2025-03-25"
    },
    {
      id: 5,
      title: "English Literature Quiz",
      subject: "English",
      class: "10-A",
      status: "completed",
      totalMarks: 30,
      duration: 45,
      testDate: "2025-03-20"
    }
  ];

  const analytics: Analytics = {
    strongTopics: [
      "Algebraic Expressions",
      "Gravitation",
      "Cell Biology",
      "European History"
    ],
    weakTopics: [
      "Trigonometry",
      "Thermodynamics",
      "Organic Chemistry"
    ],
    recommendedResources: [
      {
        title: "Mastering Trigonometry",
        type: "Practice Set",
        url: "#"
      },
      {
        title: "Basics of Thermodynamics",
        type: "Video Tutorial",
        url: "#"
      },
      {
        title: "Organic Chemistry Made Easy",
        type: "Reading Material",
        url: "#"
      }
    ]
  };
  
  const subjects = [
    { name: "Mathematics", progress: 78, teacher: "Mr. Sharma" },
    { name: "Physics", progress: 65, teacher: "Mrs. Gupta" },
    { name: "Chemistry", progress: 82, teacher: "Dr. Patel" },
    { name: "Biology", progress: 90, teacher: "Ms. Desai" },
    { name: "English", progress: 85, teacher: "Mrs. Jones" },
    { name: "History", progress: 70, teacher: "Mr. Singh" }
  ];
  
  const achievements = [
    { id: 1, title: "Math Wizard", description: "Scored 95% in Mathematics", icon: Trophy },
    { id: 2, title: "Science Explorer", description: "Completed all science modules", icon: BookMarked },
    { id: 3, title: "Perfect Attendance", description: "No absences for 3 months", icon: CheckCircle2 },
    { id: 4, title: "Quick Learner", description: "Completed 5 topics ahead of schedule", icon: Flame }
  ];
  
  const timetable = [
    { day: "Monday", periods: ["Mathematics", "Physics", "Chemistry", "English", "Physical Ed.", "History"] },
    { day: "Tuesday", periods: ["Biology", "Mathematics", "English", "Chemistry", "Computer Sc.", "Art"] },
    { day: "Wednesday", periods: ["Physics", "Mathematics", "Biology", "History", "English", "Chemistry"] },
    { day: "Thursday", periods: ["Mathematics", "Computer Sc.", "Physics", "Physical Ed.", "Biology", "English"] },
    { day: "Friday", periods: ["Chemistry", "Biology", "Mathematics", "English", "History", "Physics"] }
  ];
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header title="Student Dashboard" />
        <main className="flex-1 p-6 md:p-8">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle>Welcome, {currentUser.profile?.displayName}</CardTitle>
                  <CardDescription>
                    Student Dashboard - Class {currentUser.profile?.classId || "10-A"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Course Progress</span>
                        <span className="text-sm font-medium">{completedCourses}/{totalCourses}</span>
                      </div>
                      <Progress value={(completedCourses / totalCourses) * 100} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle>Learning Streak</CardTitle>
                  <CardDescription>
                    Keep up the momentum!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-100 p-2 rounded-full">
                      <Flame className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Current Streak</span>
                        <span className="text-sm font-medium">7 days</span>
                      </div>
                      <div className="flex space-x-1">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-2 flex-1 rounded-full ${i < 5 ? "bg-orange-500" : "bg-orange-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="tests">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="tests">Upcoming Tests</TabsTrigger>
                <TabsTrigger value="subjects">My Subjects</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="timetable">Timetable</TabsTrigger>
              </TabsList>
              
              <TabsContent value="tests" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Tests</CardTitle>
                    <CardDescription>Tests scheduled in the next 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingTests.map((test) => (
                        <Card key={test.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="font-bold">{test.title}</h3>
                                <p className="text-sm text-muted-foreground">{test.subject} | Class {test.class}</p>
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2 mt-2 md:mt-0">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(test.testDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{test.duration} mins</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Trophy className="h-4 w-4" />
                                  <span>{test.totalMarks} marks</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="bg-muted/50 p-2 flex justify-end">
                            <Button variant="default" size="sm">Prepare</Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tests</CardTitle>
                    <CardDescription>Your recently completed tests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentTests.map((test) => (
                        <Card key={test.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="space-y-1">
                                <h3 className="font-bold">{test.title}</h3>
                                <p className="text-sm text-muted-foreground">{test.subject} | Class {test.class}</p>
                              </div>
                              <div className="flex items-center gap-2 mt-2 md:mt-0">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  85%
                                </span>
                                <Button variant="outline" size="sm">View Results</Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="subjects" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {subjects.map((subject, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle>{subject.name}</CardTitle>
                        <CardDescription>Teacher: {subject.teacher}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Progress</span>
                            <span className="text-sm font-medium">{subject.progress}%</span>
                          </div>
                          <Progress value={subject.progress} className="h-2" />
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <span>View Subject</span>
                          <ArrowRight className="ml-auto h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Subject Performance</CardTitle>
                      <CardDescription>Your performance across subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] flex items-center justify-center border rounded-md">
                        <div className="flex flex-col items-center">
                          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                          <p className="text-sm text-muted-foreground">Performance Chart Will Appear Here</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Learning Analysis</CardTitle>
                      <CardDescription>Strengths and areas for improvement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Strong Topics
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analytics.strongTopics.map((topic, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                          Areas for Improvement
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {analytics.weakTopics.map((topic, i) => (
                            <span key={i} className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium mb-2">Recommended Resources</h3>
                        <ul className="space-y-2">
                          {analytics.recommendedResources.map((resource, i) => (
                            <li key={i} className="text-sm flex justify-between items-center p-2 bg-muted rounded-md">
                              <span>{resource.title}</span>
                              <div className="flex items-center">
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full mr-2">
                                  {resource.type}
                                </span>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Achievements</CardTitle>
                    <CardDescription>Your learning achievements</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {achievements.map((achievement) => {
                        const Icon = achievement.icon;
                        return (
                          <Card key={achievement.id} className="text-center p-4">
                            <div className="flex justify-center mb-2">
                              <div className="bg-primary/10 p-2 rounded-full">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                            </div>
                            <h3 className="font-bold">{achievement.title}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="timetable" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Timetable</CardTitle>
                    <CardDescription>Class 10-A Schedule</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <div className="bg-muted/50 p-2 grid grid-cols-7">
                        <div className="font-medium">Time/Day</div>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day, i) => (
                          <div key={i} className="font-medium text-center">{day}</div>
                        ))}
                      </div>
                      
                      {Array.from({ length: 6 }).map((_, periodIndex) => (
                        <div key={periodIndex} className="grid grid-cols-7 border-t">
                          <div className="p-2 border-r">
                            <div className="font-medium">{periodIndex + 1}</div>
                            <div className="text-xs text-muted-foreground">
                              {9 + periodIndex}:00 - {10 + periodIndex}:00
                            </div>
                          </div>
                          
                          {timetable.map((day, dayIndex) => (
                            <div 
                              key={dayIndex} 
                              className={`p-2 text-center ${dayIndex < 4 ? 'border-r' : ''}`}
                            >
                              {day.periods[periodIndex]}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}