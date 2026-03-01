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
import ComingSoon from "@/pages/coming-soon";
import { AuthProvider, useAuth } from "./contexts/auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import "./blackboard-login.css";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthDialog } from "@/components/auth/auth-dialog";

import { Button } from "@/components/ui/button";


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
// ComingSoon gets fullWidth so it fills the page without extra padding constraints
const WrappedComingSoon = withLayout(ComingSoon, { fullWidth: true });

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
 */

/**
 * Higher-order component representing a protected route.
 * Redirects to the dashboard if the user's role is not authorized for the route.
 */
function ProtectedRoute({
  component: Component,
  allowedRoles,
  ...props
}: {
  component: React.ComponentType<any>,
  allowedRoles?: string[],
  [key: string]: any
}) {
  const { state: { user } } = useAuth();

  if (!user) return <AuthDialog />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Show a forbidden message or redirect
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-8 mt-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </AppLayout>
    );
  }

  return <Component {...props} />;
}

// Helper to easily create protected routes with Wouter
const withProtection = (Component: React.ComponentType<any>, allowedRoles?: string[]) => {
  const ProtectedRouteWrapper = (props: any) => (
    <ProtectedRoute component={Component} allowedRoles={allowedRoles} {...props} />
  );
  ProtectedRouteWrapper.displayName = `Protected(${Component.displayName || Component.name || 'Component'})`;
  return ProtectedRouteWrapper;
}

function Router() {
  const { state: { user, isLoading } } = useAuth();

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
  if (!user) {
    return <AuthDialog />;
  }

  const effectiveRole = user.role;

  // Get appropriate dashboard component based on user role
  const getDashboardComponent = () => {
    const role = effectiveRole;
    switch (role) {
      case "principal": return WrappedPrincipalDashboard;
      case "admin": return WrappedAdminDashboard;
      case "teacher": return WrappedDashboard;
      case "student": return WrappedStudentDashboard;
      case "parent": return WrappedParentDashboard;
      default: return WrappedDashboard;
    }
  };

  return (
    <Switch>
      {/* Root — role-aware dashboard */}
      <Route path="/" component={getDashboardComponent()} />

      {/* Role-specific dashboards */}
      <Route path="/dashboard" component={withProtection(WrappedDashboard, ["teacher"])} />
      <Route path="/principal-dashboard" component={withProtection(WrappedPrincipalDashboard, ["principal"])} />
      <Route path="/admin-dashboard" component={withProtection(WrappedAdminDashboard, ["admin"])} />
      <Route path="/student-dashboard" component={withProtection(WrappedStudentDashboard, ["student"])} />
      <Route path="/parent-dashboard" component={withProtection(WrappedParentDashboard, ["parent"])} />

      {/* Implemented feature routes */}
      <Route path="/create-test" component={withProtection(WrappedCreateTest, ["teacher"])} />
      <Route path="/ocr-scan" component={withProtection(WrappedOcrScan, ["teacher", "student", "parent"])} />
      <Route path="/analytics" component={withProtection(WrappedAnalytics)} />
      <Route path="/ai-tutor" component={withProtection(WrappedAiTutor, ["student"])} />
      <Route path="/student-directory" component={withProtection(WrappedStudentDirectory, ["teacher", "principal", "admin"])} />
      <Route path="/messages" component={withProtection(WrappedMessages)} />
      <Route path="/messagepal" component={withProtection(WrappedMessage)} />

      {/* Coming Soon — unimplemented sidebar links */}
      <Route path="/institution" component={WrappedComingSoon} />
      <Route path="/staff" component={WrappedComingSoon} />
      <Route path="/students" component={WrappedComingSoon} />
      <Route path="/calendar" component={WrappedComingSoon} />
      <Route path="/infrastructure" component={WrappedComingSoon} />
      <Route path="/live-classes" component={WrappedComingSoon} />
      <Route path="/tests" component={WrappedComingSoon} />
      <Route path="/progress" component={WrappedComingSoon} />
      <Route path="/resources" component={WrappedComingSoon} />
      <Route path="/study-groups" component={WrappedComingSoon} />
      <Route path="/achievements" component={WrappedComingSoon} />
      <Route path="/settings" component={WrappedComingSoon} />
      <Route path="/system-settings" component={WrappedComingSoon} />
      <Route path="/users" component={WrappedComingSoon} />
      <Route path="/classes" component={WrappedComingSoon} />
      <Route path="/focus" component={WrappedComingSoon} />
      <Route path="/partners" component={WrappedComingSoon} />
      <Route path="/children" component={WrappedComingSoon} />
      <Route path="/meetings" component={WrappedComingSoon} />
      <Route path="/notifications" component={WrappedComingSoon} />
      <Route path="/reports" component={WrappedComingSoon} />
      <Route path="/ai-study-plans" component={WrappedComingSoon} />
      <Route path="/test-results" component={WrappedComingSoon} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;