import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { 
  UsersRound, 
  School, 
  BookOpen, 
  BarChart3, 
  CalendarClock, 
  Settings, 
  FileSpreadsheet,
  UserPlus,
  Mail
} from "lucide-react";

export default function AdminDashboard() {
  const { currentUser } = useFirebaseAuth();
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1">
        <Header title="Administration Dashboard" />
        <main className="flex-1 p-6 md:p-8">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="flex-1">
                <CardHeader className="pb-2">
                  <CardTitle>Welcome, {currentUser.profile?.displayName}</CardTitle>
                  <CardDescription>
                    Institution Administration Panel
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
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4">
                    <UserPlus className="h-5 w-5 mb-1" />
                    <span className="text-xs">Add User</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4">
                    <Mail className="h-5 w-5 mb-1" />
                    <span className="text-xs">Send Notice</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4">
                    <Settings className="h-5 w-5 mb-1" />
                    <span className="text-xs">Settings</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="users">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="users">User Management</TabsTrigger>
                <TabsTrigger value="classes">Classes</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings">System Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Manage all users in the system</CardDescription>
                    </div>
                    <Button size="sm">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <Card className="p-4 flex flex-col items-center">
                        <School className="h-8 w-8 mb-2 text-blue-500" />
                        <p className="font-medium">1</p>
                        <p className="text-xs text-center text-muted-foreground">Principal</p>
                      </Card>
                      <Card className="p-4 flex flex-col items-center">
                        <BookOpen className="h-8 w-8 mb-2 text-green-500" />
                        <p className="font-medium">87</p>
                        <p className="text-xs text-center text-muted-foreground">Teachers</p>
                      </Card>
                      <Card className="p-4 flex flex-col items-center">
                        <UsersRound className="h-8 w-8 mb-2 text-amber-500" />
                        <p className="font-medium">1,245</p>
                        <p className="text-xs text-center text-muted-foreground">Students</p>
                      </Card>
                      <Card className="p-4 flex flex-col items-center">
                        <UsersRound className="h-8 w-8 mb-2 text-purple-500" />
                        <p className="font-medium">985</p>
                        <p className="text-xs text-center text-muted-foreground">Parents</p>
                      </Card>
                    </div>
                    
                    <div className="border rounded-md">
                      <div className="flex items-center p-3 bg-muted/50 border-b">
                        <div className="w-1/4 font-medium">Name</div>
                        <div className="w-1/4 font-medium">Role</div>
                        <div className="w-1/4 font-medium">Email</div>
                        <div className="w-1/4 font-medium">Actions</div>
                      </div>
                      <div className="divide-y">
                        {[
                          { name: 'Rajesh Kumar', role: 'Principal', email: 'principal@example.com' },
                          { name: 'Anita Singh', role: 'Teacher', email: 'anita.s@example.com' },
                          { name: 'Vikram Patel', role: 'Teacher', email: 'vikram.p@example.com' },
                          { name: 'Priya Sharma', role: 'Student', email: 'priya.s@example.com' },
                          { name: 'Arjun Mehra', role: 'Student', email: 'arjun.m@example.com' }
                        ].map((user, i) => (
                          <div key={i} className="flex items-center p-3">
                            <div className="w-1/4">{user.name}</div>
                            <div className="w-1/4">{user.role}</div>
                            <div className="w-1/4">{user.email}</div>
                            <div className="w-1/4 flex space-x-2">
                              <Button variant="outline" size="sm">Edit</Button>
                              <Button variant="outline" size="sm" className="text-red-500">Delete</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="classes" className="space-y-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Class Management</CardTitle>
                      <CardDescription>Manage classes and sections</CardDescription>
                    </div>
                    <Button size="sm">
                      Add Class
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'].map((grade, i) => (
                        <Card key={i} className="p-4">
                          <h3 className="font-bold text-lg">{grade}</h3>
                          <p className="text-sm text-muted-foreground mb-3">4 Sections | 125 Students</p>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">View Details</Button>
                            <Button variant="outline" size="sm">Manage</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Reports & Analytics</CardTitle>
                    <CardDescription>View and generate reports</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <Card className="p-4">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                          <BarChart3 className="h-5 w-5 text-blue-500" />
                          Academic Performance
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          View academic performance reports across classes
                        </p>
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </Card>
                      <Card className="p-4">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                          <UsersRound className="h-5 w-5 text-green-500" />
                          Attendance Report
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Student and teacher attendance statistics
                        </p>
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </Card>
                      <Card className="p-4">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                          <FileSpreadsheet className="h-5 w-5 text-amber-500" />
                          Exam Results
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Comprehensive exam results and analysis
                        </p>
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </Card>
                      <Card className="p-4">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                          <CalendarClock className="h-5 w-5 text-purple-500" />
                          Term Calendar
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Academic calendar and important dates
                        </p>
                        <Button variant="outline" size="sm">View Calendar</Button>
                      </Card>
                    </div>
                    
                    <h3 className="font-medium mb-2">Recent Reports</h3>
                    <div className="border rounded-md">
                      <div className="divide-y">
                        {[
                          { name: 'Annual Performance Report 2024-25', date: 'April 2, 2025', type: 'Academic' },
                          { name: 'Term 1 Attendance Summary', date: 'March 25, 2025', type: 'Attendance' },
                          { name: 'Mid-term Examination Results', date: 'March 15, 2025', type: 'Exam' },
                          { name: 'Teacher Evaluation Report', date: 'March 10, 2025', type: 'Staff' }
                        ].map((report, i) => (
                          <div key={i} className="flex items-center p-3">
                            <div className="flex-1 font-medium">{report.name}</div>
                            <div className="w-1/4 text-sm text-muted-foreground">{report.date}</div>
                            <div className="w-1/6">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                {report.type}
                              </span>
                            </div>
                            <div className="w-1/6">
                              <Button variant="ghost" size="sm">Download</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>Configure system-wide settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <Card className="p-4 flex flex-col">
                        <Settings className="h-8 w-8 mb-3 text-blue-500" />
                        <h3 className="font-bold mb-1">General Settings</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Configure basic system settings
                        </p>
                        <Button variant="outline" size="sm" className="mt-auto">Configure</Button>
                      </Card>
                      <Card className="p-4 flex flex-col">
                        <School className="h-8 w-8 mb-3 text-green-500" />
                        <h3 className="font-bold mb-1">Institution Profile</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Update institution information
                        </p>
                        <Button variant="outline" size="sm" className="mt-auto">Update</Button>
                      </Card>
                      <Card className="p-4 flex flex-col">
                        <CalendarClock className="h-8 w-8 mb-3 text-amber-500" />
                        <h3 className="font-bold mb-1">Academic Calendar</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Manage academic year and terms
                        </p>
                        <Button variant="outline" size="sm" className="mt-auto">Configure</Button>
                      </Card>
                      <Card className="p-4 flex flex-col">
                        <BookOpen className="h-8 w-8 mb-3 text-purple-500" />
                        <h3 className="font-bold mb-1">Curriculum Setup</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Configure subjects and curriculum
                        </p>
                        <Button variant="outline" size="sm" className="mt-auto">Configure</Button>
                      </Card>
                      <Card className="p-4 flex flex-col">
                        <Mail className="h-8 w-8 mb-3 text-red-500" />
                        <h3 className="font-bold mb-1">Notification Settings</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Configure email and notification settings
                        </p>
                        <Button variant="outline" size="sm" className="mt-auto">Configure</Button>
                      </Card>
                      <Card className="p-4 flex flex-col">
                        <UsersRound className="h-8 w-8 mb-3 text-indigo-500" />
                        <h3 className="font-bold mb-1">User Permissions</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          Manage user roles and permissions
                        </p>
                        <Button variant="outline" size="sm" className="mt-auto">Configure</Button>
                      </Card>
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