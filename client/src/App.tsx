import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import PrincipalDashboard from "@/pages/principal-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import CreateTest from "@/pages/create-test";
import OcrScan from "@/pages/ocr-scan";
import Analytics from "@/pages/analytics";
import AiTutor from "@/pages/ai-tutor";
import StudentDirectory from "@/pages/student-directory";
import MessagesPage from "@/pages/messages";
import MessagePage from "@/pages/messagepal-demo";
import { FirebaseAuthProvider, useFirebaseAuth } from "./contexts/firebase-auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import "./blackboard-login.css";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { FirebaseAuthDialog } from "@/components/auth/firebase-auth-dialog";


/**
 * Layout wrapper that renders a sidebar and a main content area whose left margin is controlled by the CSS variable `--sidebar-width`.
 *
 * The main content is centered, constrained to a max width, and padded; children are rendered inside this container.
 * When `fullWidth` is true, it removes the max-width and padding to allow edge-to-edge rendering.
 *
 * @param children - The content to display within the main layout container
 * @param fullWidth - If true, bypasses the standard container constraints for full-bleed layouts
 */
function AppLayout({ children, fullWidth = false }: { children: React.ReactNode, fullWidth?: boolean }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main
        className="flex-1 transition-all duration-300 ease-in-out"
        style={{ marginLeft: 'var(--sidebar-width, 16rem)' }}
      >
        {fullWidth ? (
          <div className="w-full h-screen overflow-hidden">
            {children}
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        )}
      </main>
    </div>
  );
}

// Memoize withLayout calls at module level to avoid re-creating wrapper components each render
const withLayout = (Component: React.ComponentType, options?: { fullWidth?: boolean }) => {
  const WrappedComponent = (props: any) => (
    <AppLayout fullWidth={options?.fullWidth}>
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
const WrappedParentDashboard = withLayout(ParentDashboard);
const WrappedCreateTest = withLayout(CreateTest);
const WrappedOcrScan = withLayout(OcrScan);
const WrappedAnalytics = withLayout(Analytics);
const WrappedAiTutor = withLayout(AiTutor);
const WrappedStudentDirectory = withLayout(StudentDirectory);
const WrappedMessages = withLayout(MessagesPage, { fullWidth: true });
const WrappedMessage = withLayout(MessagePage, { fullWidth: true });

/**
 * Render application routes and handle authentication and loading states.
 *
 * When authentication is in progress, renders a centered loading indicator.
 * When no authenticated user is present, renders the authentication dialog.
 * When a user is authenticated, registers the application's routes:
 * - A role-aware root dashboard
 * - Role-specific dashboard routes
 * - Common feature routes (create-test, ocr-scan, analytics, ai-tutor, student-directory)
 * - A fallback 404 route
 *
 * @returns A React element containing the routing switch that enforces the above loading, auth, and route behaviors.
 */
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
      case "parent": return WrappedParentDashboard;
      default:
        // Profile not loaded yet or unknown role — show loading instead of
        // falling through to the teacher dashboard
        return () => (
          <div className="h-screen w-full flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your dashboard…</p>
            </div>
          </div>
        );
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
      <Route path="/parent-dashboard" component={WrappedParentDashboard} />

      {/* Common routes */}
      <Route path="/create-test" component={WrappedCreateTest} />
      <Route path="/ocr-scan" component={WrappedOcrScan} />
      <Route path="/analytics" component={WrappedAnalytics} />
      <Route path="/ai-tutor" component={WrappedAiTutor} />
      <Route path="/student-directory" component={WrappedStudentDirectory} />
      <Route path="/messages" component={WrappedMessages} />
      <Route path="/messagepal" component={WrappedMessage} />

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