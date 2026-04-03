import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/theme-context";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Loader2 } from "lucide-react";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import PrincipalDashboard from "@/pages/principal-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import SchoolAdminDashboard from "@/pages/school-admin-dashboard";
import CreateTest from "@/pages/create-test";
import OcrScan from "@/pages/ocr-scan";
import Analytics from "@/pages/analytics";
import AiTutor from "@/pages/ai-tutor";
import StudentDirectory from "@/pages/student-directory";
import Messages from "@/pages/messages";
import LiveClasses from "@/pages/live-classes";
import LiveClassRoom from "@/pages/live-classroom";
import AiClassroom from "@/pages/ai-classroom";
import MyProgress from "@/pages/my-progress";
import Tasks from "@/pages/tasks";
import Notifications from "@/pages/notifications";
import AcademicCalendar from "@/pages/academic-calendar";
import Achievements from "@/pages/achievements";
import Settings from "@/pages/settings";
import AiStudyPlans from "./pages/ai-study-plans";
import Focus from "@/pages/focus";
import TestPage from "@/pages/test-page";
import TestsList from "@/pages/tests-list";

function WrappedComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center p-8 mt-20 text-center space-y-4">
      <h2 className="text-2xl font-bold">Coming Soon</h2>
      <p className="text-muted-foreground">This feature is currently under development.</p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  );
}

function Layout({ children, fullWidth = false }: { children: React.ReactNode; fullWidth?: boolean }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ease-in-out" style={{ marginLeft: "var(--sidebar-width, 16rem)" }}>
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

const withLayout = (Component: React.ComponentType<any>, options?: { fullWidth?: boolean }) => {
  const WrappedComponent = (props: any) => (
    <Layout fullWidth={options?.fullWidth}>
      <Component {...props} />
    </Layout>
  );
  WrappedComponent.displayName = `WithLayout(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};

const ProtectedRoute = ({ component: Component, allowedRoles, ...rest }: { component: React.ComponentType<any>, allowedRoles?: string[], [key: string]: any }) => {
  const { currentUser: { user, profile } } = useFirebaseAuth();

  if (!(user || profile)) {
    return <WrappedComingSoon />; // Handled by App level redirect usually
  }

  if (profile && allowedRoles && !allowedRoles.includes(profile.role)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center p-8 mt-20 text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">You do not have permission to view this page.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Layout>
    );
  }

  return <Component {...rest} />;
};

const er = (Component: React.ComponentType<any>, allowedRoles?: string[]) => {
  const Protected = (props: any) => <ProtectedRoute component={Component} allowedRoles={allowedRoles} {...props} />;
  return Protected;
};

function App() {
  const { currentUser: { user, profile }, isLoading, logout } = useFirebaseAuth();

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

  if (!profile) {
    return <Switch><Route component={WrappedComingSoon} /></Switch>;
  }

  if (profile.status === "pending") {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md shadow-sm">
          <h2 className="text-2xl font-bold mb-3 text-foreground">Account Pending Approval</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created successfully but is currently awaiting approval from an administrator.
            You will be able to access the platform once your account is activated.
          </p>
          <Button onClick={() => logout && logout()} variant="default" className="w-full">
            Sign Out
          </Button>
        </div>
      </div>
    );
  }

  const role = profile.role;
  const getDashboard = () => {
    switch (role) {
      case "principal": return withLayout(PrincipalDashboard);
      case "school_admin": return withLayout(SchoolAdminDashboard);
      case "admin": return withLayout(AdminDashboard);
      case "teacher": return withLayout(Dashboard);
      case "student": return withLayout(StudentDashboard);
      case "parent": return withLayout(ParentDashboard);
      default: return withLayout(Dashboard);
    }
  };

  return (
    <Switch>
      <Route path="/" component={getDashboard()} />
      <Route path="/dashboard" component={withLayout(er(Dashboard, ["teacher"]))} />
      <Route path="/principal-dashboard" component={withLayout(er(PrincipalDashboard, ["principal"]))} />
      <Route path="/school-admin-dashboard" component={withLayout(er(SchoolAdminDashboard, ["school_admin"]))} />
      <Route path="/admin-dashboard" component={withLayout(er(AdminDashboard, ["admin"]))} />
      <Route path="/student-dashboard" component={withLayout(er(StudentDashboard, ["student"]))} />
      <Route path="/parent-dashboard" component={withLayout(er(ParentDashboard, ["parent"]))} />

      <Route path="/create-test" component={withLayout(er(CreateTest, ["teacher"]))} />
      <Route path="/ocr-scan" component={withLayout(er(OcrScan, ["teacher", "student", "parent"]))} />
      <Route path="/analytics" component={withLayout(er(Analytics))} />
      <Route path="/ai-tutor" component={withLayout(er(AiTutor, ["student"]))} />
      <Route path="/student-directory" component={withLayout(er(StudentDirectory, ["teacher", "principal", "admin"]))} />
      <Route path="/messages" component={withLayout(er(Messages), { fullWidth: true })} />
      <Route path="/test/:id" component={withLayout(er(TestPage, ["student", "teacher", "admin"]), { fullWidth: true })} />
      <Route path="/resources" component={withLayout(er(WrappedComingSoon, ["student"]), { fullWidth: true })} />
      <Route path="/study-arena" component={withLayout(er(WrappedComingSoon, ["student"]), { fullWidth: true })} />
      <Route path="/tasks" component={withLayout(er(Tasks))} />

      <Route path="/institution" component={withLayout(WrappedComingSoon)} />
      <Route path="/staff" component={withLayout(WrappedComingSoon)} />
      <Route path="/students" component={withLayout(WrappedComingSoon)} />

      <Route path="/notifications" component={withLayout(er(Notifications))} />
      <Route path="/tests" component={withLayout(er(TestsList, ["student"]))} />
      <Route path="/calendar" component={withLayout(er(AcademicCalendar))} />
      <Route path="/focus" component={withLayout(er(Focus, ["student"]))} />
      <Route path="/achievements" component={withLayout(er(Achievements, ["student"]))} />

      <Route path="/infrastructure" component={withLayout(WrappedComingSoon)} />
      <Route path="/live-classes" component={withLayout(er(LiveClasses, ["teacher", "student", "admin", "principal"]))} />
      <Route path="/live/:id" component={withLayout(er(LiveClassRoom), { fullWidth: true })} />
      <Route path="/progress" component={withLayout(er(MyProgress, ["student", "parent"]), { fullWidth: true })} />
      <Route path="/study-groups" component={withLayout(WrappedComingSoon)} />
      <Route path="/settings" component={withLayout(er(Settings))} />
      <Route path="/system-settings" component={withLayout(WrappedComingSoon)} />
      <Route path="/users" component={withLayout(WrappedComingSoon)} />
      <Route path="/classes" component={withLayout(WrappedComingSoon)} />
      <Route path="/partners" component={withLayout(WrappedComingSoon)} />
      <Route path="/children" component={withLayout(WrappedComingSoon)} />
      <Route path="/meetings" component={withLayout(WrappedComingSoon)} />
      <Route path="/reports" component={withLayout(WrappedComingSoon)} />
      <Route path="/ai-study-plans" component={withLayout(er(AiStudyPlans, ["student"]))} />
      <Route path="/test-results" component={withLayout(WrappedComingSoon)} />

      <Route component={NotFound} />
    </Switch>
  );
}

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <App />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
