import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import CreateTest from "@/pages/create-test";
import OcrScan from "@/pages/ocr-scan";
import Analytics from "@/pages/analytics";
import AiTutor from "@/pages/ai-tutor";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { Loader2 } from "lucide-react";

// Login dialog component
import { LoginDialog } from "@/components/auth/login-dialog";

function Router() {
  const { user, isLoading } = useAuth();
  
  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Show login dialog if not authenticated
  if (!user) {
    return <LoginDialog />;
  }
  
  return (
    <Switch>
      {/* Teacher/Student routes */}
      <Route path="/" component={user?.role === "teacher" ? Dashboard : StudentDashboard} />
      <Route path="/dashboard" component={user?.role === "teacher" ? Dashboard : StudentDashboard} />
      <Route path="/create-test" component={CreateTest} />
      <Route path="/ocr-scan" component={OcrScan} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/ai-tutor" component={AiTutor} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
