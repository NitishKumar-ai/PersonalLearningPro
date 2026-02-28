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
import { FirebaseAuthProvider, useFirebaseAuth } from "./contexts/firebase-auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import "./blackboard-login.css";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { FirebaseAuthDialog } from "@/components/auth/firebase-auth-dialog";
import { getUserProfile, UserRole } from "@/lib/firebase";
import { useEffect, useState } from "react";
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
 *
 * @returns A React element containing the routing switch that enforces the above loading, auth, and route behaviors.
 */
/**
 * Shown when the user is authenticated but we couldn't load their Firestore
 * profile (Firestore offline / new device / first login race).
 *
 * Retries up to 3 times automatically, then offers a manual role selector so
 * users can enter the correct dashboard without being locked out.
 */
function ProfileGate({ uid }: { uid: string }) {
  const { currentUser } = useFirebaseAuth();
  const [attempts, setAttempts] = useState(0);
  const [role, setRole] = useState<UserRole | null>(currentUser.profile?.role ?? null);
  const [retrying, setRetrying] = useState(false);

  // Auto-retry up to 3 times, 3 s apart
  useEffect(() => {
    if (role || attempts >= 3) return;
    const timer = setTimeout(async () => {
      setRetrying(true);
      try {
        const profile = await getUserProfile(uid);
        if (profile?.role) setRole(profile.role);
      } catch { /* ignore */ } finally {
        setRetrying(false);
        setAttempts((a) => a + 1);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [uid, attempts, role]);

  // Profile loaded — redirect to the right dashboard
  useEffect(() => {
    if (role) window.location.replace("/");
  }, [role]);

  const roles: { value: UserRole; label: string; emoji: string }[] = [
    { value: "teacher", label: "Teacher", emoji: "👩‍🏫" },
    { value: "student", label: "Student", emoji: "🎒" },
    { value: "principal", label: "Principal", emoji: "🏫" },
    { value: "admin", label: "Admin", emoji: "⚙️" },
    { value: "parent", label: "Parent", emoji: "👪" },
  ];

  if (attempts < 3 || retrying) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-medium">Loading your profile…</p>
          <p className="text-sm text-muted-foreground">
            Attempt {Math.min(attempts + 1, 3)} of 3 — connecting to Firestore
          </p>
        </div>
      </div>
    );
  }

  // All retries exhausted — show role picker fallback
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center max-w-sm px-4">
        <div className="p-3 rounded-full bg-amber-500/10">
          <AlertCircle className="h-7 w-7 text-amber-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold mb-1">Couldn't load your profile</h2>
          <p className="text-sm text-muted-foreground">
            Firestore is unreachable. Select your role to continue anyway:
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 w-full">
          {roles.map((r) => (
            <Button
              key={r.value}
              variant="outline"
              className="w-full justify-start gap-3 h-11 text-base"
              onClick={() => {
                // Store the chosen role locally then navigate
                sessionStorage.setItem("fallback_role", r.value);
                window.location.replace(
                  r.value === "teacher" ? "/dashboard" :
                    r.value === "student" ? "/student-dashboard" :
                      r.value === "principal" ? "/principal-dashboard" :
                        r.value === "admin" ? "/admin-dashboard" :
                          "/parent-dashboard"
                );
              }}
            >
              <span className="text-xl">{r.emoji}</span>
              {r.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-muted-foreground"
          onClick={() => { setAttempts(0); setRetrying(false); }}
        >
          <RefreshCw className="h-4 w-4" />
          Retry connection
        </Button>
      </div>
    </div>
  );
}

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

  // If authenticated but profile not loaded, use ProfileGate to retry or offer fallback
  if (!currentUser.profile?.role) {
    return <ProfileGate uid={currentUser.user.uid} />;
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
      default: return WrappedDashboard;
    }
  };

  return (
    <Switch>
      {/* Root — role-aware dashboard */}
      <Route path="/" component={getDashboardComponent()} />

      {/* Role-specific dashboards */}
      <Route path="/dashboard" component={WrappedDashboard} />
      <Route path="/principal-dashboard" component={WrappedPrincipalDashboard} />
      <Route path="/admin-dashboard" component={WrappedAdminDashboard} />
      <Route path="/student-dashboard" component={WrappedStudentDashboard} />
      <Route path="/parent-dashboard" component={WrappedParentDashboard} />

      {/* Implemented feature routes */}
      <Route path="/create-test" component={WrappedCreateTest} />
      <Route path="/ocr-scan" component={WrappedOcrScan} />
      <Route path="/analytics" component={WrappedAnalytics} />
      <Route path="/ai-tutor" component={WrappedAiTutor} />
      <Route path="/student-directory" component={WrappedStudentDirectory} />
      <Route path="/messages" component={WrappedMessages} />
      <Route path="/messagepal" component={WrappedMessage} />

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
        <FirebaseAuthProvider>
          <Router />
          <Toaster />
        </FirebaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;