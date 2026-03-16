import React, { useState } from "react";

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import StudentDashboard from "@/pages/student-dashboard";
import PrincipalDashboard from "@/pages/principal-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import SchoolAdminDashboard from "@/pages/school-admin-dashboard";
import ParentDashboard from "@/pages/parent-dashboard";
import CreateTest from "@/pages/create-test";
import OcrScan from "@/pages/ocr-scan";
import Analytics from "@/pages/analytics";
import AiTutor from "@/pages/ai-tutor";
import StudentDirectory from "@/pages/student-directory";
import MessagesPage from "@/pages/messages";
import MessagePage from "@/pages/messagepal-demo";
import ComingSoon from "@/pages/coming-soon";
import TestPage from "@/pages/test-page";
import ResourcesPage from "@/pages/resources-page";
import MyProgress from "@/pages/my-progress";
import StudyArenaPage from "@/pages/study-arena";
import TasksPage from "@/pages/tasks";
import NotificationsPage from "@/pages/notifications";
import TestsListPage from "@/pages/tests-list";
import AcademicCalendarPage from "@/pages/academic-calendar";
import FocusPage from "@/pages/focus";
import AchievementsPage from "@/pages/achievements";
import LandingPage from "@/pages/landing";
import SettingsPage from "@/pages/settings";
import LiveClassesPage from "@/pages/live-classes";
import LiveClassroomPage from "@/pages/live-classroom";
import { ThemeProvider } from "./contexts/theme-context";
import { useLiveClassNotifications } from "@/hooks/live/useLiveClassNotifications";

import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { FirebaseAuthDialog as AuthDialog } from "@/components/auth/firebase-auth-dialog";
import { FirebaseAuthProvider as AuthProvider, useFirebaseAuth as useAuth } from "./contexts/firebase-auth-context";

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
  // Listen for live class events via WebSocket and show toast notifications
  useLiveClassNotifications();

  return (
    <div className="flex min-h-screen bg-background font-body antialiased">
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
          <div className="max-w-5xl mx-auto px-6 py-8">
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
const WrappedSchoolAdminDashboard = withLayout(SchoolAdminDashboard);
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
const WrappedTestPage = withLayout(TestPage, { fullWidth: true });
const WrappedResourcesPage = withLayout(ResourcesPage, { fullWidth: true });
const WrappedMyProgress = withLayout(MyProgress);
const WrappedStudyArena = withLayout(StudyArenaPage, { fullWidth: true });
const WrappedTasks = withLayout(TasksPage, { fullWidth: true });
const WrappedNotifications = withLayout(NotificationsPage);
const WrappedTestsList = withLayout(TestsListPage);
const WrappedCalendar = withLayout(AcademicCalendarPage);
const WrappedFocus = withLayout(FocusPage);
const WrappedAchievements = withLayout(AchievementsPage);
const WrappedSettings = withLayout(SettingsPage);
const WrappedLiveClasses = withLayout(LiveClassesPage);

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
  const { currentUser: { user, profile } } = useAuth();

  // Allow if either Firebase user OR backend JWT profile is set (backend users have no Firebase user)
  const isAuthenticated = (user || profile) && profile;
  if (!isAuthenticated) return <AuthDialog />;

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
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

function UnauthenticatedRouter() {
  return (
    <Switch>
      <Route path="/login" component={AuthDialog} />
      <Route component={LandingPage} />
    </Switch>
  );
}

function Router() {
  const { currentUser: { user, profile }, isLoading, logout } = useAuth();

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

  // Show landing page or login page if not authenticated (backend users have no Firebase user, but have a profile)
  if (!profile) {
    return <UnauthenticatedRouter />;
  }

  if (profile.status === 'pending') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md shadow-sm">
          <h2 className="text-2xl font-bold mb-3 text-foreground">Account Pending Approval</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been created successfully but is currently awaiting approval from an administrator.
            You will be able to access the platform once your account is activated.
          </p>
          <Button onClick={() => logout && logout()} variant="default" className="w-full">Sign Out</Button>
        </div>
      </div>
    );
  }

  if (profile.status === 'suspended') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="bg-card border border-red-200 dark:border-red-900 rounded-xl p-8 max-w-md shadow-sm">
          <h2 className="text-2xl font-bold mb-3 text-destructive">Account Suspended</h2>
          <p className="text-muted-foreground mb-6">
            Your account has been suspended. Please contact your school administrator or support for assistance.
          </p>
          <Button onClick={() => logout && logout()} variant="outline" className="w-full text-destructive hover:bg-destructive/10">Sign Out</Button>
        </div>
      </div>
    );
  }

  if (profile.status === 'rejected') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="bg-card border border-red-200 dark:border-red-900 rounded-xl p-8 max-w-md shadow-sm">
          <h2 className="text-2xl font-bold mb-3 text-destructive">Registration Declined</h2>
          <p className="text-muted-foreground mb-6">
            Your registration request has been declined. Please contact administration for more details.
          </p>
          <Button onClick={() => logout && logout()} variant="outline" className="w-full">Sign Out</Button>
        </div>
      </div>
    );
  }

  const effectiveRole = profile.role;

  // Get appropriate dashboard component based on user role
  const getDashboardComponent = () => {
    const role = effectiveRole;
    switch (role) {
      case "principal": return WrappedPrincipalDashboard;
      case "school_admin": return WrappedSchoolAdminDashboard;
      case "admin": return WrappedAdminDashboard;
      case "teacher": return WrappedDashboard;
      case "student": return WrappedStudentDashboard;
      case "parent": return WrappedParentDashboard;
      default: return WrappedDashboard;
    }
  };

  // Role-based route protection
  const canAccessRoute = (requiredRole: string | string[]) => {
    const userRole = profile.role;
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
  };

  // Protected route wrapper
  const ProtectedRoute = ({ component: Component, requiredRole, ...props }: {
    component: React.ComponentType,
    requiredRole: string | string[]
  }) => {
    if (!canAccessRoute(requiredRole)) {
      return <NotFound />;
    }
    return <Component {...props} />;
  };

  // Wrap components with protection
  const ProtectedTeacherDashboard = () => <ProtectedRoute component={WrappedDashboard} requiredRole="teacher" />;
  const ProtectedPrincipalDashboard = () => <ProtectedRoute component={WrappedPrincipalDashboard} requiredRole="principal" />;
  const ProtectedAdminDashboard = () => <ProtectedRoute component={WrappedAdminDashboard} requiredRole="admin" />;
  const ProtectedStudentDashboard = () => <ProtectedRoute component={WrappedStudentDashboard} requiredRole="student" />;
  const ProtectedCreateTest = () => <ProtectedRoute component={WrappedCreateTest} requiredRole="teacher" />;
  const ProtectedOcrScan = () => <ProtectedRoute component={WrappedOcrScan} requiredRole="teacher" />;
  const ProtectedAnalytics = () => <ProtectedRoute component={WrappedAnalytics} requiredRole={["teacher", "principal", "admin"]} />;
  const ProtectedStudentDirectory = () => <ProtectedRoute component={WrappedStudentDirectory} requiredRole={["teacher", "principal", "admin"]} />;
  const ProtectedAiTutor = () => <ProtectedRoute component={WrappedAiTutor} requiredRole={["teacher", "student"]} />;

  // No layout wrapper for full-screen classroom
  const ProtectedLiveClassroom = () => <ProtectedRoute component={LiveClassroomPage} requiredRole={["teacher", "student", "admin", "principal"]} />;

  return (
    <Switch>
      <Route path="/login">
        {() => {
          // If authenticated but visiting /login, redirect to /
          window.location.replace("/");
          return null;
        }}
      </Route>

      {/* Root — role-aware dashboard */}
      <Route path="/" component={getDashboardComponent()} />

      {/* Role-specific dashboards */}
      <Route path="/dashboard" component={withProtection(WrappedDashboard, ["teacher"])} />
      <Route path="/principal-dashboard" component={withProtection(WrappedPrincipalDashboard, ["principal"])} />
      <Route path="/school-admin-dashboard" component={withProtection(WrappedSchoolAdminDashboard, ["school_admin"])} />
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
      <Route path="/test/:id" component={withProtection(WrappedTestPage, ["student", "teacher", "admin"])} />
      <Route path="/resources" component={withProtection(WrappedResourcesPage, ["student"])} />
      <Route path="/study-arena" component={withProtection(WrappedStudyArena, ["student"])} />
      <Route path="/tasks" component={withProtection(WrappedTasks)} />

      {/* Coming Soon — unimplemented sidebar links */}
      <Route path="/institution" component={WrappedComingSoon} />
      <Route path="/staff" component={WrappedComingSoon} />
      <Route path="/students" component={WrappedComingSoon} />
      {/* Phase 2 — newly implemented features */}
      <Route path="/notifications" component={withProtection(WrappedNotifications)} />
      <Route path="/tests" component={withProtection(WrappedTestsList, ["student"])} />
      <Route path="/calendar" component={withProtection(WrappedCalendar)} />
      <Route path="/focus" component={withProtection(WrappedFocus, ["student"])} />
      <Route path="/achievements" component={withProtection(WrappedAchievements, ["student"])} />

      {/* Coming Soon — still unimplemented */}
      <Route path="/infrastructure" component={WrappedComingSoon} />
      <Route path="/live-classes" component={withProtection(WrappedLiveClasses, ["teacher", "student", "admin", "principal"])} />
      <Route path="/live/:id" component={ProtectedLiveClassroom} />
      <Route path="/progress" component={withProtection(WrappedMyProgress, ["student", "parent"])} />
      <Route path="/study-groups" component={WrappedComingSoon} />
      <Route path="/settings" component={withProtection(WrappedSettings)} />
      <Route path="/system-settings" component={WrappedComingSoon} />
      <Route path="/users" component={WrappedComingSoon} />
      <Route path="/classes" component={WrappedComingSoon} />
      <Route path="/partners" component={WrappedComingSoon} />
      <Route path="/children" component={WrappedComingSoon} />
      <Route path="/meetings" component={WrappedComingSoon} />
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