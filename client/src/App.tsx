import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import CreateTest from "@/pages/create-test";
import OcrScan from "@/pages/ocr-scan";
import Analytics from "@/pages/analytics";
import { useAuth, AuthProvider } from "./contexts/auth-context";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  
  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-pulse text-primary font-bold text-lg">
          Loading...
        </div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user && !["/login", "/register"].includes(location)) {
    // Use window.location for a full page reload to avoid React state issues
    window.location.href = "/login";
    return null;
  }
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Teacher routes */}
      <Route path="/" component={user?.role === "teacher" ? Dashboard : StudentDashboard} />
      <Route path="/dashboard" component={user?.role === "teacher" ? Dashboard : StudentDashboard} />
      <Route path="/create-test" component={CreateTest} />
      <Route path="/ocr-scan" component={OcrScan} />
      <Route path="/analytics" component={Analytics} />
      
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
