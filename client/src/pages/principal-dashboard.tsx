import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { PageHeader } from "@/components/layout/page-header";
import {
  Users,
  GraduationCap,
  School,
  TrendingUp,
  Calendar,
  Award,
  Bell,
  BarChart3,
  BookOpen,
  Building2,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Renders the Principal's dashboard with statistics, charts, staff and finance summaries, events, and notifications.
 *
 * The component pulls the current user from authentication context to personalize the header and composes
 * multiple UI sections (stats grid, tabbed main content for Academic/Staff/Finance/Infrastructure, and
 * Events & Notifications) driven by internal data arrays.
 *
 * @returns A React element that displays the principal's dashboard UI
 */
export default function PrincipalDashboard() {
  const { currentUser } = useFirebaseAuth();

  const stats = [
    { label: "Total Students", value: "1,245", icon: <GraduationCap className="h-5 w-5" />, trend: "+42 this term", gradient: "from-blue-500 to-indigo-600" },
    { label: "Teachers", value: "87", icon: <Users className="h-5 w-5" />, trend: "3 new hires", gradient: "from-emerald-500 to-teal-600" },
    { label: "Active Classes", value: "36", icon: <School className="h-5 w-5" />, trend: "All running", gradient: "from-amber-500 to-orange-600" },
    { label: "Pass Rate", value: "94.2%", icon: <TrendingUp className="h-5 w-5" />, trend: "+2.1% vs last year", gradient: "from-purple-500 to-violet-600" },
  ];

  const performanceData = [
    { subject: "Physics", avgScore: 78, passRate: 92 },
    { subject: "Chem", avgScore: 72, passRate: 88 },
    { subject: "Math", avgScore: 82, passRate: 95 },
    { subject: "Bio", avgScore: 76, passRate: 91 },
    { subject: "CS", avgScore: 85, passRate: 97 },
    { subject: "English", avgScore: 80, passRate: 94 },
  ];

  const staffDistribution = [
    { name: "Science", value: 25, color: "hsl(var(--chart-1))" },
    { name: "Mathematics", value: 18, color: "hsl(var(--chart-2))" },
    { name: "Languages", value: 20, color: "hsl(var(--chart-3))" },
    { name: "Social Studies", value: 12, color: "hsl(var(--chart-4))" },
    { name: "Other", value: 12, color: "hsl(var(--chart-5))" },
  ];

  const financeSummary = [
    { label: "Annual Budget", value: "₹2.4 Cr", status: "Approved" },
    { label: "Spent YTD", value: "₹1.8 Cr", status: "75% utilized" },
    { label: "Pending Fees", value: "₹12.5 L", status: "8% outstanding" },
  ];

  const upcomingEvents = [
    { title: "Annual Sports Day", date: "Mar 15", type: "Event", color: "bg-blue-500" },
    { title: "Term 2 Exams Begin", date: "Mar 20", type: "Academic", color: "bg-amber-500" },
    { title: "Parent-Teacher Meeting", date: "Mar 25", type: "Meeting", color: "bg-emerald-500" },
    { title: "Science Exhibition", date: "Apr 2", type: "Event", color: "bg-purple-500" },
  ];

  const notifications = [
    { title: "Staff Leave Request", desc: "3 pending approvals for next week", time: "1h ago", urgent: true },
    { title: "Exam Results", desc: "Term 1 results compilation complete", time: "3h ago", urgent: false },
    { title: "Infrastructure", desc: "Lab equipment delivery scheduled for Monday", time: "5h ago", urgent: false },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${currentUser?.profile?.displayName || "Principal"} 🏫`}
        subtitle="Your institution's performance dashboard"
        className="animate-fade-in-up"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Principal Dashboard" }
        ]}
      >
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule
        </Button>
        <Button>
          <BarChart3 className="h-4 w-4 mr-2" />
          Reports
        </Button>
      </PageHeader>

      {/* Stats */}
      <section className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={stat.label} className="animate-fade-in-up hover:shadow-md transition-shadow overflow-hidden" style={{ animationDelay: `${index * 75}ms` }}>
            <CardContent className="p-5 relative">
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-bl-full`} />
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} text-white w-fit mb-3 shadow-sm`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
              <div className="text-xs text-primary/70 mt-1 font-medium">{stat.trend}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Main Content Tabs */}
      <Tabs defaultValue="academic" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="finance">Finance</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        {/* Academic Tab */}
        <TabsContent value="academic" className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Academic Performance by Subject</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '13px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="avgScore" name="Avg Score" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="passRate" name="Pass Rate %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { grade: "A+ (90-100%)", count: 312, pct: 25, color: "from-emerald-500 to-teal-500" },
                    { grade: "A (80-89%)", count: 436, pct: 35, color: "from-blue-500 to-indigo-500" },
                    { grade: "B (70-79%)", count: 312, pct: 25, color: "from-amber-500 to-orange-500" },
                    { grade: "C (60-69%)", count: 124, pct: 10, color: "from-rose-400 to-red-500" },
                    { grade: "Below C", count: 61, pct: 5, color: "from-gray-400 to-gray-500" },
                  ].map((g) => (
                    <div key={g.grade} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-28 text-muted-foreground">{g.grade}</span>
                      <div className="flex-1 relative h-3 rounded-full bg-muted overflow-hidden">
                        <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${g.color}`} style={{ width: `${g.pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-12 text-right">{g.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6 animate-fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Staff Distribution by Department</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={staffDistribution}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={45}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {staffDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} staff`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Staff Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Total Teaching Staff", value: "87", icon: <BookOpen className="h-4 w-4" />, color: "text-blue-600 dark:text-blue-400 bg-blue-500/10" },
                    { label: "Non-Teaching Staff", value: "28", icon: <Building2 className="h-4 w-4" />, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
                    { label: "Staff on Leave Today", value: "4", icon: <Calendar className="h-4 w-4" />, color: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
                    { label: "Avg. Experience", value: "8.5 yrs", icon: <Award className="h-4 w-4" />, color: "text-purple-600 dark:text-purple-400 bg-purple-500/10" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${item.color}`}>{item.icon}</div>
                        <span className="text-sm">{item.label}</span>
                      </div>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Finance Tab */}
        <TabsContent value="finance" className="animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {financeSummary.map((item) => (
              <Card key={item.label}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <Badge variant="secondary" className="mt-2 text-xs">{item.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="animate-fade-in-up">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Classrooms", value: "42", status: "All operational", icon: <School className="h-5 w-5" /> },
              { label: "Labs", value: "8", status: "1 under maintenance", icon: <BookOpen className="h-5 w-5" /> },
              { label: "Library", value: "15K+", status: "Books available", icon: <BookOpen className="h-5 w-5" /> },
              { label: "Sports Facilities", value: "6", status: "All available", icon: <Award className="h-5 w-5" /> },
            ].map((item) => (
              <Card key={item.label} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 text-center">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary w-fit mx-auto mb-3">
                    {item.icon}
                  </div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                  <div className="text-xs text-primary/70 mt-1">{item.status}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Events + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Events */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-8 rounded-full ${event.color}`} />
                    <div>
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.date}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">{event.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Bell className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">Notifications</CardTitle>
              </div>
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0 text-xs">
                {notifications.filter(n => n.urgent).length} Urgent
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif, i) => (
                <div key={i} className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${notif.urgent ? 'bg-destructive/5 border-destructive/20' : 'bg-transparent'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {notif.title}
                        {notif.urgent && <span className="w-1.5 h-1.5 rounded-full bg-destructive" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}