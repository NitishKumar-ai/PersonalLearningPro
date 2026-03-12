import { useState } from "react";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { TopStudents } from "@/components/dashboard/top-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import {
  TrendingUp,
  Users,
  Brain,
  BookOpen,
  BarChart3,
  Sparkles,
  Lightbulb,
  Target,
} from "lucide-react";

export default function Analytics() {
  const [periodTab, setPeriodTab] = useState("monthly");

  const testCompletionData = [
    { name: "Completed", value: 85, color: "hsl(var(--chart-1))" },
    { name: "In Progress", value: 10, color: "hsl(var(--chart-2))" },
    { name: "Not Started", value: 5, color: "hsl(var(--chart-3))" },
  ];

  const subjectData = [
    { name: "Physics", value: 30, color: "hsl(var(--chart-1))" },
    { name: "Chemistry", value: 25, color: "hsl(var(--chart-2))" },
    { name: "Mathematics", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Biology", value: 15, color: "hsl(var(--chart-4))" },
    { name: "Computer Science", value: 10, color: "hsl(var(--chart-5))" },
  ];

  const kpis = [
    {
      label: "Class Average",
      value: "78%",
      trend: "+4% vs last month",
      trendUp: true,
      icon: <TrendingUp className="h-5 w-5" />,
      gradient: "from-emerald-500 to-teal-600",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Total Students",
      value: "86",
      trend: "+5 enrolled",
      trendUp: true,
      icon: <Users className="h-5 w-5" />,
      gradient: "from-blue-500 to-indigo-600",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Tests Conducted",
      value: "24",
      trend: "12 this month",
      trendUp: true,
      icon: <Target className="h-5 w-5" />,
      gradient: "from-purple-500 to-violet-600",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      label: "Completion Rate",
      value: "85%",
      trend: "+2% vs target",
      trendUp: true,
      icon: <BarChart3 className="h-5 w-5" />,
      gradient: "from-amber-500 to-orange-600",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Performance Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Detailed insights into student performance and learning patterns
            </p>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <section className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card
            key={kpi.label}
            className="animate-fade-in-up hover:shadow-md transition-shadow"
            style={{ animationDelay: `${i * 75}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  {kpi.icon}
                </span>
              </div>
              <div className="text-2xl font-bold tracking-tight">{kpi.value}</div>
              <div className="text-sm text-muted-foreground">{kpi.label}</div>
              <div className="text-xs text-primary/70 mt-1 font-medium">{kpi.trend}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Performance chart + Top students */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="md:col-span-2 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
              </div>
              <CardTitle className="text-base font-semibold">Class Performance by Subject</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-72">
            <PerformanceChart />
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-base font-semibold">Top Performing Students</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TopStudents />
          </CardContent>
        </Card>
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="animate-fade-in-up" style={{ animationDelay: "250ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10">
                <Target className="h-4 w-4 text-teal-500" />
              </div>
              <CardTitle className="text-base font-semibold">Test Completion Rate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={testCompletionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {testCompletionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <BookOpen className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-base font-semibold">Subject Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Learning Insights */}
      <Card className="animate-fade-in-up" style={{ animationDelay: "350ms" }}>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-base font-semibold">AI-Generated Learning Insights</CardTitle>
            <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">Powered by AI</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="class" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="class">Class Insights</TabsTrigger>
              <TabsTrigger value="individuals">Individual Students</TabsTrigger>
            </TabsList>

            <TabsContent value="class" className="mt-4 space-y-4">
              <div className="p-4 rounded-xl border-l-4 border-l-red-500 bg-red-500/5">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500 mt-0.5">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Improvement Areas</h3>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                      <li>Physics: Newton's Laws of Motion understanding needs reinforcement</li>
                      <li>Mathematics: Calculus application in real-world problems</li>
                      <li>Chemistry: Chemical bonding concepts need more practice</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border-l-4 border-l-emerald-500 bg-emerald-500/5">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Teaching Recommendations</h3>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                      <li>Increase practical demonstrations for Physics concepts</li>
                      <li>Provide more visual learning materials for Chemistry</li>
                      <li>Create specialized practice sessions for weak topics</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="individuals" className="mt-4">
              <div className="flex flex-col items-center justify-center py-14 text-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-violet-600 opacity-10 blur-xl" />
                  <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20">
                    <Brain className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div>
                  <Badge className="mb-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                    🚀 Coming Soon
                  </Badge>
                  <h3 className="font-semibold text-base">Individual Student Analytics</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Personalised AI insights per student — including learning pace, weak areas, and improvement suggestions.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
}