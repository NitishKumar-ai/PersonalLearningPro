import { useState } from "react";
import { Link } from "wouter";
import { 
  FileQuestion, 
  BookOpen, 
  BarChart3, 
  Video, 
  MessageSquare, 
  Trophy, 
  Sparkles,
  Brain,
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Test interface for typing
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

// Analytics interface for typing
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
  const { user } = useAuth();
  
  // Fetch upcoming tests
  const { data: upcomingTests, isLoading: testsLoading } = useQuery<Test[]>({
    queryKey: ["/api/tests", { status: "published" }],
  });
  
  // Fetch student analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery<Analytics>({
    queryKey: ["/api/analytics/student", user?.id],
  });

  const quickActions = [
    {
      title: "Take Tests",
      description: "Attempt available assessments",
      icon: <FileQuestion className="h-6 w-6" />,
      href: "/tests",
      bgColor: "bg-primary/10 dark:bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Study Materials",
      description: "Access AI-recommended resources",
      icon: <BookOpen className="h-6 w-6" />,
      href: "/resources",
      bgColor: "bg-secondary/10 dark:bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      title: "My Progress",
      description: "View your performance stats",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/progress",
      bgColor: "bg-accent/10 dark:bg-accent/20",
      iconColor: "text-accent",
    },
    {
      title: "AI Tutor",
      description: "Get help with difficult concepts",
      icon: <Brain className="h-6 w-6" />,
      href: "/ai-tutor",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Live Classes",
      description: "Join scheduled live sessions",
      icon: <Video className="h-6 w-6" />,
      href: "/live-classes",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-500",
    },
    {
      title: "Study Groups",
      description: "Collaborate with classmates",
      icon: <Users className="h-6 w-6" />,
      href: "/study-groups",
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
      iconColor: "text-green-500",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-100 dark:bg-neutral-900">
      <Sidebar />

      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <Header title="Student Dashboard" />

        <div className="px-4 py-6 md:px-6 lg:px-8 pb-20 md:pb-6">
          {/* Welcome Section */}
          <section className="mb-8">
            <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold mb-2">
                Welcome back, {user?.name || "Student"}!
              </h1>
              <p className="text-muted-foreground mb-4">
                {`Let's continue your learning journey. Here's what's new today.`}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {quickActions.map((action, index) => (
                  <QuickActionCard
                    key={index}
                    title={action.title}
                    description={action.description}
                    icon={action.icon}
                    href={action.href}
                    bgColor={action.bgColor}
                    iconColor={action.iconColor}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Upcoming Tests Section */}
          <section className="mb-8">
            <h2 className="text-lg font-medium mb-4">Upcoming Tests</h2>
            
            {testsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : !upcomingTests || upcomingTests.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    You don't have any upcoming tests at the moment.
                  </p>
                  <Button asChild>
                    <Link href="/tests">Browse All Tests</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingTests.slice(0, 3).map((test) => (
                  <Card key={test.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0">
                          <h3 className="font-medium">{test.title}</h3>
                          <div className="text-sm text-muted-foreground">
                            <span className="inline-block mr-4">
                              Subject: {test.subject}
                            </span>
                            <span className="inline-block">
                              Date: {new Date(test.testDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="inline-block mr-4">
                              Duration: {test.duration} mins
                            </span>
                            <span className="inline-block">
                              Marks: {test.totalMarks}
                            </span>
                          </div>
                        </div>
                        <Button asChild>
                          <Link href={`/tests/${test.id}`}>Take Test</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {upcomingTests.length > 3 && (
                  <div className="text-center mt-4">
                    <Button variant="outline" asChild>
                      <Link href="/tests">View All Tests</Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Performance & Learning Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Performance Metrics */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <BarChart3 className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-lg font-medium">My Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Physics</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Chemistry</span>
                        <span className="text-sm font-medium">72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Mathematics</span>
                        <span className="text-sm font-medium">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/progress">View Detailed Performance</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Recommendations */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-lg font-medium">AI Recommendations</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Areas to Improve</h3>
                      <div className="bg-muted p-3 rounded-md">
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          {analytics?.weakTopics?.slice(0, 3).map((topic, i) => (
                            <li key={i}>{topic}</li>
                          )) || (
                            <>
                              <li>Chemical Bonding</li>
                              <li>Newton's Laws of Motion</li>
                              <li>Integration in Calculus</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Recommended Resources</h3>
                      <div className="space-y-2">
                        {analytics?.recommendedResources?.slice(0, 3).map((resource, i) => (
                          <div key={i} className="bg-muted p-3 rounded-md text-sm">
                            <div className="font-medium">{resource.title}</div>
                            <div className="text-xs text-muted-foreground">
                              Type: {resource.type}
                            </div>
                            {resource.url && (
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline"
                              >
                                View Resource
                              </a>
                            )}
                          </div>
                        )) || (
                          <>
                            <div className="bg-muted p-3 rounded-md text-sm">
                              <div className="font-medium">Chemical Bonding Video Tutorial</div>
                              <div className="text-xs text-muted-foreground">Type: Video</div>
                            </div>
                            <div className="bg-muted p-3 rounded-md text-sm">
                              <div className="font-medium">Physics Practice Problems</div>
                              <div className="text-xs text-muted-foreground">Type: Exercise</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href="/resources">View All Resources</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Gamification Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Achievements & Badges */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
                    <CardTitle className="text-lg font-medium">Achievements</CardTitle>
                  </div>
                  <Badge className="bg-yellow-500">2 New</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-3 rounded-md bg-yellow-500/10 border border-yellow-200 dark:border-yellow-900/50">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-700 dark:text-yellow-500 mr-3">
                      <Trophy className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Math Genius</div>
                      <div className="text-xs text-muted-foreground">Scored 95% in Calculus Test</div>
                    </div>
                  </div>
                  <div className="flex items-center p-3 rounded-md bg-blue-500/10 border border-blue-200 dark:border-blue-900/50">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-500 mr-3">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Science Explorer</div>
                      <div className="text-xs text-muted-foreground">Completed 10 Chemistry Experiments</div>
                    </div>
                  </div>
                  <Link href="/achievements" className="text-xs text-primary hover:underline block text-center mt-2">
                    View all achievements
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily Streak */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-lg font-medium">Learning Streak</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="text-4xl font-bold text-primary mb-2">7</div>
                  <div className="text-sm text-center mb-4">days in a row</div>
                  <div className="w-full bg-muted rounded-full h-2.5 mb-4">
                    <div className="bg-gradient-to-r from-primary/80 to-primary h-2.5 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">3 more days to unlock "Dedicated Learner" badge</div>
                </div>
              </CardContent>
            </Card>
            
            {/* Challenge Friends */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-lg font-medium">Challenge Friends</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-medium mr-2">
                          AK
                        </div>
                        <span className="text-sm font-medium">Aryan Kumar</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Physics</Badge>
                    </div>
                    <Button size="sm" className="w-full" variant="outline">Accept Challenge</Button>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-medium mr-2">
                          PS
                        </div>
                        <span className="text-sm font-medium">Priya Sharma</span>
                      </div>
                      <Badge variant="outline" className="text-xs">Math Quiz</Badge>
                    </div>
                    <Button size="sm" className="w-full" variant="outline">Accept Challenge</Button>
                  </div>
                  <Link href="/challenges" className="text-xs text-primary hover:underline block text-center mt-2">
                    Create new challenge
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <MobileNav />
      </div>
    </div>
  );
}
