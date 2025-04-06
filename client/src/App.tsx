import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import PrincipalDashboard from "@/pages/principal-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import CreateTest from "@/pages/create-test";
import OcrScan from "@/pages/ocr-scan";
import Analytics from "@/pages/analytics";
import AiTutor from "@/pages/ai-tutor";
import { FirebaseAuthProvider, useFirebaseAuth } from "./contexts/firebase-auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { UserRole } from "./lib/firebase";
import { Sidebar } from "@/components/layout/sidebar";

// Authentication components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User } from "firebase/auth";

// Firebase Auth Dialog
function FirebaseAuthDialog() {
  const { login, register, googleLogin, completeGoogleRegistration } = useFirebaseAuth();
  const [isNewGoogleUser, setIsNewGoogleUser] = useState(false);
  const [tempGoogleUser, setTempGoogleUser] = useState<User | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  
  // Form schemas
  const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  });
  
  const registerSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    role: z.enum(["student", "teacher", "principal", "admin", "parent"], {
      required_error: "Please select a role",
    }),
  });
  
  const roleSchema = z.object({
    role: z.enum(["student", "teacher", "principal", "admin", "parent"], {
      required_error: "Please select a role",
    }),
  });
  
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
    },
  });
  
  const roleForm = useForm<z.infer<typeof roleSchema>>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      role: "student",
    },
  });
  
  async function onLoginSubmit(data: z.infer<typeof loginSchema>) {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error("Login failed:", error);
    }
  }
  
  async function onRegisterSubmit(data: z.infer<typeof registerSchema>) {
    try {
      const additionalData = getRoleSpecificData(data.role);
      await register(data.email, data.password, data.name, data.role as UserRole, additionalData);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  }
  
  async function onRoleSubmit(data: z.infer<typeof roleSchema>) {
    if (!tempGoogleUser) return;
    
    try {
      const additionalData = getRoleSpecificData(data.role);
      await completeGoogleRegistration(tempGoogleUser, data.role as UserRole, additionalData);
      setIsNewGoogleUser(false);
      setTempGoogleUser(null);
    } catch (error) {
      console.error("Google registration completion failed:", error);
    }
  }
  
  function getRoleSpecificData(role: string) {
    switch (role) {
      case "student":
        return { classId: "10-A" };
      case "teacher":
        return { subjects: ["Mathematics", "Physics"] };
      case "principal":
        return { institutionId: "central-high" };
      case "admin":
        return { institutionId: "central-high" };
      case "parent":
        return { studentId: "student-123" };
      default:
        return {};
    }
  }
  
  async function handleGoogleLogin() {
    try {
      const result = await googleLogin();
      
      if (result.isNewUser) {
        setIsNewGoogleUser(true);
        setTempGoogleUser(result.user);
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  }
  
  // New Google user role selection
  if (isNewGoogleUser) {
    return (
      <Dialog open={isNewGoogleUser} onOpenChange={(open) => !open && setIsNewGoogleUser(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete your registration</DialogTitle>
            <DialogDescription>
              Please select your role to complete your registration.
            </DialogDescription>
          </DialogHeader>
          <Form {...roleForm}>
            <form onSubmit={roleForm.handleSubmit(onRoleSubmit)} className="space-y-4 pt-4">
              <FormField
                control={roleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="teacher">Teacher</SelectItem>
                        <SelectItem value="principal">Principal</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="parent">Parent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Complete Registration</Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/50">
      <div className="w-full max-w-4xl grid md:grid-cols-2 overflow-hidden shadow-xl rounded-xl">
        <div className="p-8 bg-gradient-to-br from-primary/80 to-primary text-white flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Master Plan</h1>
            <p className="text-white/90">
              AI-powered personalized learning platform
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
                  <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                  <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">AI-powered learning</h3>
                <p className="text-sm text-white/80">
                  Personalized assistance and adaptive tests
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
                  <path d="M8 7h6" />
                  <path d="M8 11h8" />
                  <path d="M8 15h5" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Comprehensive Analytics</h3>
                <p className="text-sm text-white/80">
                  Track progress and identify areas for improvement
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5.8 11.3 2 22l10.7-3.79" />
                  <path d="M4 3h.01" />
                  <path d="M22 8h.01" />
                  <path d="M15 2h.01" />
                  <path d="M22 20h.01" />
                  <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" />
                  <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17" />
                  <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7" />
                  <path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Engaging Learning</h3>
                <p className="text-sm text-white/80">
                  Interactive lessons and gamification elements
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <Card className="border-0 shadow-none rounded-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              defaultValue={authTab} 
              onValueChange={(v) => setAuthTab(v as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Sign In
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="your.email@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="principal">Principal</SelectItem>
                              <SelectItem value="admin">Administrator</SelectItem>
                              <SelectItem value="parent">Parent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" className="w-full">
                      Create Account
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleLogin}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  />
                </svg>
                Google
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Layout component with collapsible sidebar
function AppLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Listen for sidebar collapsed state changes
    const handleSidebarCollapse = (e: CustomEvent) => {
      setIsCollapsed(e.detail.isCollapsed);
    };

    window.addEventListener('sidebarCollapsed' as any, handleSidebarCollapse);
    return () => {
      window.removeEventListener('sidebarCollapsed' as any, handleSidebarCollapse);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className={`flex-1 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="container mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Wrap component with layout
const withLayout = (Component: React.ComponentType) => {
  return function WrappedComponent(props: any) {
    return (
      <AppLayout>
        <Component {...props} />
      </AppLayout>
    );
  };
};

function Router() {
  const { currentUser, isLoading } = useFirebaseAuth();
  
  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Show auth dialog if not authenticated
  if (!currentUser.user) {
    return <FirebaseAuthDialog />;
  }
  
  // Get appropriate dashboard component based on user role
  const getDashboardComponent = () => {
    const role = currentUser.profile?.role;
    
    switch (role) {
      case "principal":
        return withLayout(PrincipalDashboard);
      case "admin":
        return withLayout(AdminDashboard);
      case "teacher":
        return withLayout(Dashboard);
      case "student":
        return withLayout(StudentDashboard);
      case "parent":
        return withLayout(Dashboard); // We'll create ParentDashboard later
      default:
        return withLayout(Dashboard);
    }
  };
  
  return (
    <Switch>
      {/* Dashboard route - redirects to appropriate dashboard based on role */}
      <Route path="/" component={getDashboardComponent()} />
      
      {/* Role-specific dashboards */}
      <Route path="/dashboard" component={getDashboardComponent()} />
      <Route path="/principal-dashboard" component={withLayout(PrincipalDashboard)} />
      <Route path="/admin-dashboard" component={withLayout(AdminDashboard)} />
      <Route path="/student-dashboard" component={withLayout(StudentDashboard)} />
      
      {/* Common routes */}
      <Route path="/create-test" component={withLayout(CreateTest)} />
      <Route path="/ocr-scan" component={withLayout(OcrScan)} />
      <Route path="/analytics" component={withLayout(Analytics)} />
      <Route path="/ai-tutor" component={withLayout(AiTutor)} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <FirebaseAuthProvider>
          <Router />
          <Toaster />
        </FirebaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
