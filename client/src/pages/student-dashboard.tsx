import { Link } from "wouter";
import {
  BookOpen,
  Brain,
  Trophy,
  Clock,
  Calendar,
  TrendingUp,
  Target,
  Flame,
  Star,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { PageHeader } from "@/components/layout/page-header";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function StudentDashboard() {
  const { currentUser } = useFirebaseAuth();

  const subjects = [
    { name: "Physics", progress: 72, grade: "A-", color: "from-blue-500 to-indigo-600", textColor: "text-blue-600 dark:text-blue-400", bgColor: "bg-blue-500/10" },
    { name: "Chemistry", progress: 65, grade: "B+", color: "from-emerald-500 to-teal-600", textColor: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-500/10" },
    { name: "Mathematics", progress: 88, grade: "A", color: "from-amber-500 to-orange-600", textColor: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-500/10" },
    { name: "Biology", progress: 78, grade: "A-", color: "from-rose-500 to-pink-600", textColor: "text-rose-600 dark:text-rose-400", bgColor: "bg-rose-500/10" },
    { name: "Computer Science", progress: 91, grade: "A+", color: "from-purple-500 to-violet-600", textColor: "text-purple-600 dark:text-purple-400", bgColor: "bg-purple-500/10" },
  ];

  const upcomingTests = [
    { subject: "Physics", topic: "Electromagnetic Waves", date: "Tomorrow", type: "Quiz", color: "bg-blue-500" },
    { subject: "Mathematics", topic: "Calculus - Integration", date: "In 3 days", type: "Unit Test", color: "bg-amber-500" },
    { subject: "Chemistry", topic: "Organic Chemistry", date: "Next week", type: "Mid-term", color: "bg-emerald-500" },
  ];

  const recentResults = [
    { subject: "Mathematics", topic: "Trigonometry", score: 92, total: 100, date: "2 days ago" },
    { subject: "Physics", topic: "Kinematics", score: 78, total: 100, date: "5 days ago" },
    { subject: "Computer Science", topic: "Data Structures", score: 95, total: 100, date: "1 week ago" },
  ];

  const achievements = [
    { title: "Perfect Score", desc: "100% on Computer Science quiz", icon: <Star className="h-5 w-5" />, color: "from-amber-400 to-yellow-500" },
    { title: "5 Day Streak", desc: "Studied 5 days in a row", icon: <Flame className="h-5 w-5" />, color: "from-orange-400 to-red-500" },
    { title: "Quick Learner", desc: "Completed 3 topics this week", icon: <TrendingUp className="h-5 w-5" />, color: "from-blue-400 to-indigo-500" },
  ];

  const timetable = [
    { time: "8:00", mon: "Physics", tue: "Mathematics", wed: "Chemistry", thu: "Physics", fri: "Biology" },
    { time: "9:00", mon: "Mathematics", tue: "English", wed: "Physics", thu: "Chemistry", fri: "CS" },
    { time: "10:00", mon: "Chemistry", tue: "Physics", wed: "Mathematics", thu: "Biology", fri: "Mathematics" },
    { time: "11:00", mon: "English", tue: "Biology", wed: "CS", thu: "English", fri: "Physics" },
    { time: "12:00", mon: "Lunch", tue: "Lunch", wed: "Lunch", thu: "Lunch", fri: "Lunch" },
    { time: "1:00", mon: "CS", tue: "Chemistry", wed: "English", thu: "Mathematics", fri: "Chemistry" },
    { time: "2:00", mon: "Biology", tue: "CS", wed: "Biology", thu: "CS", fri: "English" },
  ];

  const getSubjectColor = (name: string) => {
    const colors: Record<string, string> = {
      Physics: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
      Chemistry: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      Mathematics: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      Biology: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
      CS: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
      English: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
      Lunch: "bg-muted text-muted-foreground",
    };
    return colors[name] || "bg-muted text-muted-foreground";
  };

  return (
    <>
      <PageHeader
        title={`Welcome back, ${currentUser?.profile?.displayName || "Student"} 🎓`}
        subtitle="Keep up the great work! Here's your learning overview."
        className="animate-fade-in-up"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Student Dashboard" }
        ]}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 dark:from-orange-500/20 dark:to-red-500/20">
          <Flame className="h-5 w-5 text-orange-500" />
          <div>
            <div className="text-lg font-bold">12</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </div>
        </div>
        <Button asChild>
          <Link href="/ai-tutor">
            <Brain className="h-4 w-4 mr-2" />
            AI Tutor
          </Link>
        </Button>
      </PageHeader>

      {/* Subject Progress Cards */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Subject Progress</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {subjects.map((subject, index) => (
            <Card key={subject.name} className="animate-fade-in-up hover:shadow-md transition-all hover:-translate-y-0.5" style={{ animationDelay: `${index * 75}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-sm font-semibold ${subject.textColor}`}>{subject.name}</span>
                  <Badge variant="secondary" className="text-xs">{subject.grade}</Badge>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${subject.color} transition-all duration-1000`}
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-2">{subject.progress}% complete</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tests Section */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Tests</h2>
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="recent">Recent Results</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingTests.map((test, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="outline">{test.type}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {test.date}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{test.topic}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${test.color}`} />
                      <span className="text-xs text-muted-foreground">{test.subject}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                      <Link href="/tests">Prepare</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <div className="space-y-3">
              {recentResults.map((result, i) => (
                <Card key={i}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${result.score >= 90 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : result.score >= 70 ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{result.topic}</div>
                        <div className="text-xs text-muted-foreground">{result.subject} • {result.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{result.score}/{result.total}</div>
                      <div className={`text-xs font-medium ${result.score >= 90 ? 'text-emerald-600 dark:text-emerald-400' : result.score >= 70 ? 'text-blue-600 dark:text-blue-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {result.score >= 90 ? 'Excellent' : result.score >= 70 ? 'Good' : 'Needs work'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Achievements + Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Achievements */}
        <Card className="animate-fade-in-up hover:shadow-md transition-all duration-300 hover:-translate-y-1" style={{ animationDelay: '300ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Trophy className="h-4 w-4 text-amber-500" />
              </div>
              <CardTitle className="text-lg font-semibold">Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {achievements.map((achievement, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${achievement.color} text-white shadow-sm`}>
                    {achievement.icon}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">{achievement.desc}</div>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/achievements">
                  View All
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Learning Analytics */}
        <Card className="lg:col-span-2 animate-fade-in-up hover:shadow-md transition-all duration-300" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Target className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Learning Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {[
                    { label: "Avg. Score", value: "82%", change: "+5%", positive: true },
                    { label: "Tests taken", value: "24", change: "3 new", positive: true },
                    { label: "Study hours", value: "18h", change: "-2h", positive: false },
                  ].map((stat) => (
                    <div key={stat.label} className="p-2.5 rounded-xl bg-muted/50 border border-border/50">
                      <div className="text-lg font-bold">{stat.value}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{stat.label}</div>
                      <div className={`text-[10px] mt-0.5 font-bold ${stat.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {stat.change}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Subject Performance
                  </h4>
                  <div className="space-y-3">
                    {subjects.slice(0, 4).map((subject) => (
                      <div key={subject.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium">{subject.name}</span>
                          <span className="text-muted-foreground">{subject.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${subject.color} transition-all duration-1000`}
                            style={{ width: `${subject.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[250px] w-full mt-4 md:mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjects.map(s => ({ subject: s.name, fullMark: 100, score: s.progress }))}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        fontSize: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Timetable */}
      <section className="mb-8 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-semibold">Weekly Timetable</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-md border border-border">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-md">
                    <tr className="border-b border-border/50">
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider sticky left-0 z-20 bg-muted/80 backdrop-blur-md border-r border-border/50">Time</th>
                      {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                        <th key={day} className="text-center py-3 px-4 text-muted-foreground font-semibold text-xs uppercase tracking-wider">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((row, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4 font-bold text-xs text-primary sticky left-0 z-20 bg-muted/80 backdrop-blur-sm border-r border-border/50">{row.time}</td>
                        {[row.mon, row.tue, row.wed, row.thu, row.fri].map((subject, j) => (
                          <td key={j} className="text-center py-2 px-2">
                            <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-transform hover:scale-105 cursor-default ${getSubjectColor(subject)}`}>
                              {subject}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}