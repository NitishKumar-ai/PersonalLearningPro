import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { 
  BarChart3, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CalendarDays, 
  Award,
  Building2,
  BriefcaseBusiness
} from "lucide-react";

export default function PrincipalDashboard() {
  const { currentUser } = useFirebaseAuth();
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header title="Principal Dashboard" />
        <main className="flex-1 p-6 md:p-8">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle>Welcome, {currentUser.profile?.displayName}</CardTitle>
                  <CardDescription>
                    Principal Dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">
                    Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle>Institution Overview</CardTitle>
                  <CardDescription>
                    Key metrics and statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">1,245</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">87</p>
                      <p className="text-xs text-muted-foreground">Teachers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="font-medium">24</p>
                      <p className="text-xs text-muted-foreground">Classes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">96.5%</p>
                      <p className="text-xs text-muted-foreground">Pass Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="performance">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="finances">Finances</TabsTrigger>
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Academic Performance Overview</CardTitle>
                    <CardDescription>School-wide performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border rounded-md">
                      <div className="flex flex-col items-center">
                        <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Performance Charts Will Appear Here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Performing Classes</CardTitle>
                      <CardDescription>Based on recent assessments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {['XII-Science', 'X-A', 'XI-Commerce', 'IX-B', 'VII-A'].map((cls, i) => (
                          <li key={i} className="flex justify-between items-center py-2 border-b">
                            <span className="font-medium">{cls}</span>
                            <span className="text-green-600 font-medium">{98 - i * 1.5}%</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Areas Needing Improvement</CardTitle>
                      <CardDescription>Classes requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {['VIII-B', 'VI-C', 'IX-C', 'VII-D', 'X-D'].map((cls, i) => (
                          <li key={i} className="flex justify-between items-center py-2 border-b">
                            <span className="font-medium">{cls}</span>
                            <span className="text-red-500 font-medium">{78 - i * 2}%</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="staff" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Staff Management</CardTitle>
                    <CardDescription>Teacher performance and attendance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border rounded-md">
                      <div className="flex flex-col items-center">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Staff Management Dashboard Will Appear Here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="finances" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Overview</CardTitle>
                    <CardDescription>Budget allocation and expenses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border rounded-md">
                      <div className="flex flex-col items-center">
                        <BriefcaseBusiness className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Financial Reports Will Appear Here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="infrastructure" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Infrastructure Management</CardTitle>
                    <CardDescription>Facilities and maintenance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center border rounded-md">
                      <div className="flex flex-col items-center">
                        <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">Infrastructure Management Will Appear Here</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>School calendar</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      { title: 'Board Meeting', date: 'April 10, 2025', type: 'Meeting' },
                      { title: 'Annual Sports Day', date: 'April 15, 2025', type: 'Event' },
                      { title: 'Teacher Evaluation', date: 'April 22, 2025', type: 'Assessment' },
                      { title: 'Parent-Teacher Conference', date: 'April 30, 2025', type: 'Meeting' }
                    ].map((event, i) => (
                      <li key={i} className="flex items-center gap-3 py-2 border-b">
                        <CalendarDays className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{event.date}</span>
                            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{event.type}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Notifications</CardTitle>
                  <CardDescription>Important updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      { title: 'Budget Approval', desc: 'Annual budget has been approved', time: '2 hours ago' },
                      { title: 'Staff Absence Report', desc: 'Monthly staff absence report is ready', time: '5 hours ago' },
                      { title: 'New Curriculum Guidelines', desc: 'New guidelines for science curriculum', time: '1 day ago' },
                      { title: 'Infrastructure Maintenance', desc: 'Scheduled maintenance for Block B', time: '2 days ago' }
                    ].map((notification, i) => (
                      <li key={i} className="py-2 border-b">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.desc}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}