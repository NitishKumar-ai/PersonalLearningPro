import { useState } from "react";
import { Link } from "wouter";
import { 
  FileQuestion, 
  ScanBarcode, 
  BarChart3, 
  PlusCircle, 
  Sparkles, 
  MessageSquare, 
  Video, 
  BellRing,
  BookOpen, 
  Brain
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { RecentTestsTable } from "@/components/dashboard/recent-tests-table";
import { TopStudents } from "@/components/dashboard/top-students";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ClassSchedule } from "@/components/dashboard/class-schedule";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Notification interface for typing
interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

export default function Dashboard() {
  const { currentUser } = useFirebaseAuth();
  const [title] = useState("Teacher Dashboard");
  
  // Fetch notification data (mock for now)
  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: false, // Disabled for now until API endpoint is implemented
  });

  const quickActions = [
    {
      title: "Create New Test",
      description: "Design customized assessments",
      icon: <PlusCircle className="h-6 w-6" />,
      href: "/create-test",
      bgColor: "bg-primary/10 dark:bg-primary/20",
      iconColor: "text-primary",
    },
    {
      title: "Scan Paper Test",
      description: "Upload handwritten answers",
      icon: <ScanBarcode className="h-6 w-6" />,
      href: "/ocr-scan",
      bgColor: "bg-secondary/10 dark:bg-secondary/20",
      iconColor: "text-secondary",
    },
    {
      title: "View Analytics",
      description: "Class performance insights",
      icon: <BarChart3 className="h-6 w-6" />,
      href: "/analytics",
      bgColor: "bg-accent/10 dark:bg-accent/20",
      iconColor: "text-accent",
    },
    {
      title: "AI Study Plans",
      description: "Generate personalized study plans",
      icon: <Sparkles className="h-6 w-6" />,
      href: "/ai-study-plans",
      bgColor: "bg-blue-500/10 dark:bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      title: "Live Class",
      description: "Schedule and host live sessions",
      icon: <Video className="h-6 w-6" />,
      href: "/live-classes",
      bgColor: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-500",
    },
    {
      title: "Chat with Students",
      description: "Message your class groups",
      icon: <MessageSquare className="h-6 w-6" />,
      href: "/messages",
      bgColor: "bg-green-500/10 dark:bg-green-500/20",
      iconColor: "text-green-500",
    },
  ];

  const mockAiInsights = [
    {
      title: "Class 10A - Physics",
      description: "Many students are struggling with Momentum & Collisions. Consider additional practice.",
      action: "Generate Practice Set",
      href: "/ai-study-plans/generate?topic=momentum-collisions&class=10A"
    },
    {
      title: "Upcoming Test Analysis",
      description: "Based on past performance, students may need extra help with Algebraic Expressions.",
      action: "Schedule Review",
      href: "/schedule-review?topic=algebraic-expressions"
    },
    {
      title: "Teaching Approach",
      description: "Visual learning methods are most effective for your Chemistry classes based on test results.",
      action: "View Resources",
      href: "/resources?type=visual&subject=chemistry"
    }
  ];

  return (
    <>
      <Header title={title} />
      <div className="px-4 py-6 md:px-6 lg:px-8 pb-20 md:pb-6">
        {/* Welcome Section with Summary */}
        <section className="mb-8">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    Welcome back, {currentUser?.profile?.displayName || "Teacher"}!
                  </h1>
                  <p className="text-muted-foreground">
                    {`Here's your teaching dashboard with insights and activities.`}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                  <div className="text-center px-4 py-2 rounded-lg bg-white/50 dark:bg-neutral-800/50 shadow-sm">
                    <div className="text-2xl font-bold text-primary">12</div>
                    <div className="text-xs text-muted-foreground">Active Tests</div>
                  </div>
                  <div className="text-center px-4 py-2 rounded-lg bg-white/50 dark:bg-neutral-800/50 shadow-sm">
                    <div className="text-2xl font-bold text-primary">86</div>
                    <div className="text-xs text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center px-4 py-2 rounded-lg bg-white/50 dark:bg-neutral-800/50 shadow-sm">
                    <div className="text-2xl font-bold text-primary">5</div>
                    <div className="text-xs text-muted-foreground">Classes</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions Section */}
        <section className="mb-8">
          <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        </section>

        {/* Class Schedule Section */}
        <section className="mb-8">
          <ClassSchedule />
        </section>
        
        {/* Recent Tests & Performance Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent Tests & Performance</h2>
            <Link href="/tests" className="text-sm text-primary font-medium hover:underline">
              View All
            </Link>
          </div>

          <RecentTestsTable />
        </section>

        {/* Two-column layout for analytics and insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Metrics */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Class Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceChart />
              </CardContent>
            </Card>
            
            {/* AI Teaching Insights */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-lg font-medium">AI Teaching Insights</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAiInsights.map((insight, index) => (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg border border-muted bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="font-medium text-sm mb-1">{insight.title}</div>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={insight.href}>{insight.action}</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column with Student Insights and Notifications */}
          <div className="space-y-6">
            {/* Top Performing Students */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Top Students</CardTitle>
              </CardHeader>
              <CardContent>
                <TopStudents />
              </CardContent>
            </Card>
            
            {/* Recent Notifications */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BellRing className="h-5 w-5 text-primary mr-2" />
                    <CardTitle className="text-lg font-medium">Notifications</CardTitle>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    New
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border border-muted">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">Test Submissions</div>
                        <p className="text-sm text-muted-foreground">8 students submitted Physics Quiz #4</p>
                      </div>
                      <span className="text-xs text-muted-foreground">1h ago</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-muted">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">Student Question</div>
                        <p className="text-sm text-muted-foreground">Aryan has a question about Chemistry homework</p>
                      </div>
                      <span className="text-xs text-muted-foreground">3h ago</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border border-muted bg-muted/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">AI Alert</div>
                        <p className="text-sm text-muted-foreground">10 students struggling with similar concepts</p>
                      </div>
                      <span className="text-xs text-muted-foreground">5h ago</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href="/notifications">View All Notifications</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Resource Suggestions */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-primary mr-2" />
                  <CardTitle className="text-lg font-medium">Resource Suggestions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                    <div className="rounded-md bg-primary/10 p-2 mr-3">
                      <Video className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Interactive Physics Labs</div>
                      <div className="text-xs text-muted-foreground">For motion & energy topics</div>
                    </div>
                  </div>
                  <div className="flex items-center p-2 rounded-md hover:bg-muted transition-colors">
                    <div className="rounded-md bg-primary/10 p-2 mr-3">
                      <FileQuestion className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Math Question Bank</div>
                      <div className="text-xs text-muted-foreground">Updated with new problems</div>
                    </div>
                  </div>
                  <Link href="/resources" className="text-xs text-primary hover:underline block text-center mt-4">
                    Browse all resources
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <MobileNav />
      </div>
    </>
  );
}
