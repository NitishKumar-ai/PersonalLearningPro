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
import StudentDirectory from "@/pages/student-directory";
import { FirebaseAuthProvider, useFirebaseAuth } from "./contexts/firebase-auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import "./blackboard-login.css";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { FirebaseAuthDialog } from "@/components/auth/firebase-auth-dialog";


// Layout component with collapsible sidebar — reads sidebar width from CSS variable
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

// Memoize withLayout calls at module level to avoid re-creating wrapper components each render
const withLayout = (Component: React.ComponentType) => {
  const WrappedComponent = (props: any) => (
    <AppLayout>
      <Component {...props} />
    </AppLayout>
  );
  WrappedComponent.displayName = `WithLayout(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};

// Pre-wrap all routed components at module level (avoids re-creating on each render)
const WrappedDashboard = withLayout(Dashboard);
const WrappedStudentDashboard = withLayout(StudentDashboard);
const WrappedPrincipalDashboard = withLayout(PrincipalDashboard);
const WrappedAdminDashboard = withLayout(AdminDashboard);
const WrappedCreateTest = withLayout(CreateTest);
const WrappedOcrScan = withLayout(OcrScan);
const WrappedAnalytics = withLayout(Analytics);
const WrappedAiTutor = withLayout(AiTutor);
const WrappedStudentDirectory = withLayout(StudentDirectory);

function Router() {
  const { currentUser, isLoading } = useFirebaseAuth();

  // Loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
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
      case "principal": return WrappedPrincipalDashboard;
      case "admin": return WrappedAdminDashboard;
      case "teacher": return WrappedDashboard;
      case "student": return WrappedStudentDashboard;
      case "parent": return WrappedDashboard;
      default: return WrappedDashboard;
    }
  };

  return (
    <Switch>
      {/* Dashboard route - redirects to appropriate dashboard based on role */}
      <Route path="/" component={getDashboardComponent()} />

      {/* Role-specific dashboards */}
      <Route path="/dashboard" component={WrappedDashboard} />
      <Route path="/principal-dashboard" component={WrappedPrincipalDashboard} />
      <Route path="/admin-dashboard" component={WrappedAdminDashboard} />
      <Route path="/student-dashboard" component={WrappedStudentDashboard} />

      {/* Common routes */}
      <Route path="/create-test" component={WrappedCreateTest} />
      <Route path="/ocr-scan" component={WrappedOcrScan} />
      <Route path="/analytics" component={WrappedAnalytics} />
      <Route path="/ai-tutor" component={WrappedAiTutor} />
      <Route path="/student-directory" component={WrappedStudentDirectory} />

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
