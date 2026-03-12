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

/**
 * Render the teacher's dashboard with header, stats, quick actions, class schedule, recent tests, analytics, AI insights, top students, notifications, and resources.
 *
 * @returns The dashboard's JSX content for the teacher view.
 */
export default function Dashboard() {
  const { currentUser } = useFirebaseAuth();

  // Fetch notification data (mock for now)
  const { data: notifications, isLoading: notificationsLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    enabled: false,
  });

  const quickActions = [
    {
      title: "Create Test",
      description: "Design assessments",
      icon: <PlusCircle className="h-5 w-5" />,
      href: "/create-test",
      bgColor: "bg-accent-soft",
      iconColor: "text-accent",
    },
    {
      title: "Scan Papers",
      description: "AI-assisted grading",
      icon: <ScanBarcode className="h-5 w-5" />,
      href: "/ocr-scan",
      bgColor: "bg-muted",
      iconColor: "text-emerald-700",
    },
    {
      title: "Analytics",
      description: "Class insights",
      icon: <BarChart3 className="h-5 w-5" />,
      href: "/analytics",
      bgColor: "bg-muted",
      iconColor: "text-amber-700",
    },
    {
      title: "Study Plans",
      description: "AI Generation",
      icon: <Sparkles className="h-5 w-5" />,
      href: "/ai-study-plans",
      bgColor: "bg-muted",
      iconColor: "text-purple-700",
    },
    {
      title: "Live Class",
      description: "Host sessions",
      icon: <Video className="h-5 w-5" />,
      href: "/live-classes",
      bgColor: "bg-muted",
      iconColor: "text-rose-700",
    },
    {
      title: "Messages",
      description: "Chat & Support",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/messages",
      bgColor: "bg-muted",
      iconColor: "text-blue-700",
    },
  ];

  const stats = [
    { label: "Active Tests", value: "12", icon: <ClipboardCheck className="h-5 w-5" />, trend: "+3 this week", color: "text-accent" },
    { label: "Total Students", value: "86", icon: <Users className="h-5 w-5" />, trend: "+5 enrolled", color: "text-emerald-700" },
    { label: "Avg. Score", value: "78%", icon: <TrendingUp className="h-5 w-5" />, trend: "+4% vs lm", color: "text-amber-700" },
    { label: "Classes", value: "5", icon: <BookOpen className="h-5 w-5" />, trend: "2 today", color: "text-purple-700" },
  ];

  const mockAiInsights = [
    {
      title: "Class 10A - Physics",
      description: "Students are struggling with Momentum. Consider additional practice.",
      action: "Generate Test",
      href: "/ai-study-plans/generate?topic=momentum&class=10A",
      color: "border-l-accent",
    },
    {
      title: "Upcoming Test Analysis",
      description: "Students may need help with Algebraic Expressions.",
      action: "Schedule Review",
      href: "/schedule-review?topic=algebra",
      color: "border-l-amber-600",
    },
    {
      title: "Teaching Approach",
      description: "Visual learning methods are most effective for Chemistry.",
      action: "View Labs",
      href: "/resources?type=visual&subject=chemistry",
      color: "border-l-emerald-600",
    }
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${currentUser?.profile?.displayName || "Professor"} 👋`}
        subtitle="Your teaching hub is updated with today's student insights and class goals."
        className="animate-fade-in-up"
      >
        <div className="flex gap-3">
          <Button variant="outline" className="h-10 text-xs font-bold uppercase tracking-widest" asChild>
            <Link href="/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </Link>
          </Button>
          <Button className="h-10 text-xs font-bold uppercase tracking-widest shadow-soft" asChild>
            <Link href="/create-test">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Test
            </Link>
          </Button>
        </div>
      </PageHeader>

      {/* Stats Row */}
      <section className="mb-10 grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-fade-in-up hover:shadow-card transition-all duration-300 border-border bg-card" style={{ animationDelay: `${index * 75}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl bg-muted ${stat.color} shadow-soft`}>
                  {stat.icon}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-md">{stat.trend}</div>
              </div>
              <div className="text-3xl font-display text-foreground leading-none">{stat.value}</div>
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-2">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Quick Actions */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          Teaching Toolkit
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.href}
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

      {/* Class Schedule */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <ClassSchedule />
      </section>

      {/* Recent Tests */}
      <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '350ms' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <ClipboardCheck className="h-4 w-4 text-accent" />
            Recent Assessments
          </h2>
          <Link href="/tests" className="text-xs font-bold uppercase tracking-widest text-accent hover:underline">
            View Archive
          </Link>
        </div>
        <Card className="border-border bg-card shadow-soft overflow-hidden">
          <RecentTestsTable />
        </Card>
      </section>

      {/* Two-column analytics + insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <div className="lg:col-span-2 space-y-8">
          {/* Performance Chart */}
          <Card className="animate-fade-in-up border-border bg-card shadow-soft" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-0">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Class Performance Benchmark</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>

          {/* AI Insights */}
          <Card className="animate-fade-in-up border-border bg-card shadow-soft overflow-hidden" style={{ animationDelay: '450ms' }}>
            <CardHeader className="pb-4 bg-muted/50 border-b border-border">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-accent" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">AI Teaching Assistant</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-cream-400">
                {mockAiInsights.map((insight, index) => (
                  <div
                    key={index}
                    className={`p-5 border-l-4 ${insight.color} bg-background hover:bg-muted/50 transition-colors group`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-display text-base text-foreground mb-1 group-hover:text-accent transition-colors">{insight.title}</div>
                        <p className="text-sm text-muted-foreground font-body leading-relaxed">{insight.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-widest shrink-0" asChild>
                        <Link href={insight.href}>{insight.action}</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          {/* Top Students */}
          <Card className="animate-fade-in-up border-border bg-card shadow-soft" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Achievers & Leaders</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <TopStudents />
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="animate-fade-in-up border-border bg-card shadow-soft overflow-hidden" style={{ animationDelay: '450ms' }}>
            <CardHeader className="pb-4 bg-muted/50 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-accent" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Updates</CardTitle>
                </div>
                <Badge variant="live" className="text-[9px] uppercase tracking-widest border-0">3 New</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {[
                { title: "Test Submissions", desc: "8 students submitted Physics Quiz #4", time: "1h ago", unread: true },
                { title: "Student Question", desc: "Aryan has a question about Chemistry", time: "3h ago", unread: true },
                { title: "AI Alert", desc: "10 students struggling with similar concepts", time: "5h ago", unread: false },
              ].map((notif, i) => (
                <div key={i} className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-soft ${notif.unread ? 'bg-accent-soft border-accent/10' : 'bg-card border-border'}`}>
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="font-display text-sm text-foreground flex items-center gap-2 truncate">
                        {notif.title}
                        {notif.unread && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium mt-1 truncate">{notif.desc}</p>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground/50 whitespace-nowrap ml-2">{notif.time}</span>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-accent" asChild>
                <Link href="/notifications">View All Notification Hub</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Resource Suggestions */}
          <Card className="animate-fade-in-up border-border bg-card shadow-soft overflow-hidden" style={{ animationDelay: '500ms' }}>
            <CardHeader className="pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Curated Resources</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1">
                {[
                  { icon: <Video className="h-4 w-4" />, title: "Interactive Labs", subtitle: "Physics Motion", color: "text-blue-700 bg-blue-50" },
                  { icon: <FileQuestion className="h-4 w-4" />, title: "Math Q-Bank", subtitle: "New Algebra Set", color: "text-amber-700 bg-amber-50" },
                ].map((res, i) => (
                  <div key={i} className="flex items-center p-3 rounded-xl hover:bg-muted transition-all duration-200 cursor-pointer group border border-transparent hover:border-border">
                    <div className={`rounded-xl p-2.5 mr-3 shadow-soft transition-colors ${res.color}`}>
                      {res.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-sm text-foreground group-hover:text-accent transition-colors truncate">{res.title}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{res.subtitle}</div>
                    </div>
                  </div>
                ))}
                <Link href="/resources" className="text-[10px] font-bold text-accent hover:underline block text-center mt-3 uppercase tracking-widest">
                  Library →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}