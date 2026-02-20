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
  Brain,
  TrendingUp,
  Users,
  ClipboardCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { QuickActionCard } from "@/components/dashboard/quick-action-card";
import { RecentTestsTable } from "@/components/dashboard/recent-tests-table";
import { TopStudents } from "@/components/dashboard/top-students";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { ClassSchedule } from "@/components/dashboard/class-schedule";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

  // Fetch notification data (mock for now)
  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: false,
  });

  const quickActions = [
    {
      title: "Create New Test",
      description: "Design customized assessments",
      icon: <PlusCircle className="h-5 w-5" />,
      href: "/create-test",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Scan Paper Test",
      description: "Upload handwritten answers",
      icon: <ScanBarcode className="h-5 w-5" />,
      href: "/ocr-scan",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      title: "View Analytics",
      description: "Class performance insights",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/analytics",
      gradient: "from-amber-500 to-orange-600",
    },
    {
      title: "AI Study Plans",
      description: "Generate personalized plans",
      icon: <Sparkles className="h-5 w-5" />,
      href: "/ai-study-plans",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      title: "Live Class",
      description: "Host live sessions",
      icon: <Video className="h-5 w-5" />,
      href: "/live-classes",
      gradient: "from-rose-500 to-pink-600",
    },
    {
      title: "Messages",
      description: "Chat with students",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/messages",
      gradient: "from-cyan-500 to-blue-600",
    },
  ];

  const stats = [
    { label: "Active Tests", value: "12", icon: <ClipboardCheck className="h-5 w-5" />, trend: "+3 this week", color: "text-blue-600 dark:text-blue-400" },
    { label: "Total Students", value: "86", icon: <Users className="h-5 w-5" />, trend: "+5 enrolled", color: "text-emerald-600 dark:text-emerald-400" },
    { label: "Avg. Score", value: "78%", icon: <TrendingUp className="h-5 w-5" />, trend: "+4% vs last month", color: "text-amber-600 dark:text-amber-400" },
    { label: "Classes", value: "5", icon: <BookOpen className="h-5 w-5" />, trend: "2 today", color: "text-purple-600 dark:text-purple-400" },
  ];

  const mockAiInsights = [
    {
      title: "Class 10A - Physics",
      description: "Many students are struggling with Momentum & Collisions. Consider additional practice.",
      action: "Generate Practice Set",
      href: "/ai-study-plans/generate?topic=momentum-collisions&class=10A",
      color: "border-l-blue-500",
    },
    {
      title: "Upcoming Test Analysis",
      description: "Based on past performance, students may need extra help with Algebraic Expressions.",
      action: "Schedule Review",
      href: "/schedule-review?topic=algebraic-expressions",
      color: "border-l-amber-500",
    },
    {
      title: "Teaching Approach",
      description: "Visual learning methods are most effective for your Chemistry classes based on test results.",
      action: "View Resources",
      href: "/resources?type=visual&subject=chemistry",
      color: "border-l-emerald-500",
    }
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${currentUser?.profile?.displayName || "Teacher"} 👋`}
        subtitle="Here's your teaching dashboard with insights and activities."
        className="animate-fade-in-up"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Teacher Dashboard" }
        ]}
      >
        <Button asChild>
          <Link href="/create-test">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Test
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Link>
        </Button>
      </PageHeader>

      {/* Stats Row */}
      <section className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-fade-in-up hover:shadow-md transition-shadow" style={{ animationDelay: `${index * 75}ms` }}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  {stat.icon}
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-primary/70 mt-1 font-medium">{stat.trend}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 h-full border-transparent hover:border-primary/20">
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-white mb-3 shadow-sm group-hover:shadow-md transition-shadow`}>
                    {action.icon}
                  </div>
                  <div className="text-sm font-medium leading-tight">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{action.description}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Class Schedule */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <ClassSchedule />
      </section>

      {/* Recent Tests */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Tests & Performance</h2>
          <Link href="/tests" className="text-sm text-primary font-medium hover:underline">
            View All
          </Link>
        </div>
        <RecentTestsTable />
      </section>

      {/* Two-column analytics + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Class Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">AI Teaching Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockAiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${insight.color} bg-muted/30 hover:bg-muted/50 transition-colors`}
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

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Students */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold">Top Students</CardTitle>
            </CardHeader>
            <CardContent>
              <TopStudents />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <BellRing className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs">3 New</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { title: "Test Submissions", desc: "8 students submitted Physics Quiz #4", time: "1h ago", unread: true },
                  { title: "Student Question", desc: "Aryan has a question about Chemistry homework", time: "3h ago", unread: true },
                  { title: "AI Alert", desc: "10 students struggling with similar concepts", time: "5h ago", unread: false },
                ].map((notif, i) => (
                  <div key={i} className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${notif.unread ? 'bg-primary/5 dark:bg-primary/10 border-primary/20' : 'bg-transparent'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm flex items-center gap-2">
                          {notif.title}
                          {notif.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.desc}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{notif.time}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/notifications">View All Notifications</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resource Suggestions */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <BookOpen className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { icon: <Video className="h-4 w-4" />, title: "Interactive Physics Labs", subtitle: "For motion & energy topics", color: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
                  { icon: <FileQuestion className="h-4 w-4" />, title: "Math Question Bank", subtitle: "Updated with new problems", color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
                ].map((res, i) => (
                  <div key={i} className="flex items-center p-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                    <div className={`rounded-lg p-2 mr-3 ${res.color}`}>
                      {res.icon}
                    </div>
                    <div className="text-sm">
                      <div className="font-medium group-hover:text-primary transition-colors">{res.title}</div>
                      <div className="text-xs text-muted-foreground">{res.subtitle}</div>
                    </div>
                  </div>
                ))}
                <Link href="/resources" className="text-xs text-primary hover:underline block text-center mt-3 font-medium">
                  Browse all resources →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
