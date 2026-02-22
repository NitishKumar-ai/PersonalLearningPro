import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useFirebaseAuth } from "@/contexts/firebase-auth-context";
import {
  LayoutDashboard,
  FileQuestion,
  BarChart,
  Users,
  Video,
  Settings,
  LogOut,
  Menu,
  ScanBarcode,
  Sparkles,
  MessageSquare,
  BookOpen,
  Brain,
  Trophy,
  School,
  GraduationCap,
  UserCog,
  Building2,
  CalendarDays,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

/**
 * Responsive, role-aware collapsible sidebar with mobile overlay, user panel, navigation, and bottom actions.
 *
 * Renders a left-side navigation UI that:
 * - selects menu items based on the current user's role
 * - supports expanded and collapsed widths (syncs width to CSS variable `--sidebar-width`)
 * - provides a mobile full-screen overlay and toggle
 * - displays user initials/name, an optional student progress card, theme toggle, settings, and logout actions
 *
 * @param className - Optional additional class names applied to the root sidebar container
 * @returns The sidebar React element ready to be rendered in the application layout
 */
export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { currentUser, logout } = useFirebaseAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check if we're on mobile to set default state
  useEffect(() => {
    const checkIfMobile = () => window.innerWidth < 768;
    setIsCollapsed(checkIfMobile());

    const handleResize = () => setIsCollapsed(checkIfMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync sidebar width via CSS variable (replaces CustomEvent approach)
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '4rem' : '16rem'
    );
  }, [isCollapsed]);

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsMobileOpen(false);
  const toggleSidebar = () => setIsCollapsed((prev) => !prev);

  // Principal navigation items
  const principalNavItems = [
    { title: "Dashboard", href: "/principal-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Institution", href: "/institution", icon: <School className="h-5 w-5" /> },
    { title: "Staff", href: "/staff", icon: <Users className="h-5 w-5" /> },
    { title: "Students", href: "/students", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Student Directory", href: "/student-directory", icon: <Award className="h-5 w-5" /> },
    { title: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { title: "Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" /> },
    { title: "Infrastructure", href: "/infrastructure", icon: <Building2 className="h-5 w-5" /> },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Admin navigation items
  const adminNavItems = [
    { title: "Dashboard", href: "/admin-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "User Management", href: "/users", icon: <UserCog className="h-5 w-5" /> },
    { title: "Institution", href: "/institution", icon: <Building2 className="h-5 w-5" /> },
    { title: "Classes", href: "/classes", icon: <School className="h-5 w-5" /> },
    { title: "Student Directory", href: "/student-directory", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { title: "Reports", href: "/reports", icon: <FileQuestion className="h-5 w-5" /> },
    { title: "System Settings", href: "/system-settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Teacher navigation items
  const teacherNavItems = [
    { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Tests", href: "/create-test", icon: <FileQuestion className="h-5 w-5" /> },
    { title: "Scan Tests", href: "/ocr-scan", icon: <ScanBarcode className="h-5 w-5" /> },
    { title: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { title: "Students", href: "/students", icon: <Users className="h-5 w-5" /> },
    { title: "Student Directory", href: "/student-directory", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "AI Study Plans", href: "/ai-study-plans", icon: <Sparkles className="h-5 w-5" /> },
    { title: "Live Classes", href: "/live-classes", icon: <Video className="h-5 w-5" /> },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Student navigation items
  const studentNavItems = [
    { title: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Tests", href: "/tests", icon: <FileQuestion className="h-5 w-5" /> },
    { title: "My Progress", href: "/progress", icon: <BarChart className="h-5 w-5" /> },
    { title: "Resources", href: "/resources", icon: <BookOpen className="h-5 w-5" /> },
    { title: "AI Tutor", href: "/ai-tutor", icon: <Brain className="h-5 w-5" /> },
    { title: "Live Classes", href: "/live-classes", icon: <Video className="h-5 w-5" /> },
    { title: "Study Groups", href: "/study-groups", icon: <Users className="h-5 w-5" /> },
    { title: "Achievements", href: "/achievements", icon: <Trophy className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Parent navigation items
  const parentNavItems = [
    { title: "Dashboard", href: "/parent-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "My Children", href: "/children", icon: <Users className="h-5 w-5" /> },
    { title: "Academic Progress", href: "/progress", icon: <BarChart className="h-5 w-5" /> },
    { title: "Tests & Results", href: "/test-results", icon: <FileQuestion className="h-5 w-5" /> },
    { title: "Teacher Meetings", href: "/meetings", icon: <Video className="h-5 w-5" /> },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Select navigation items based on user role
  let items = teacherNavItems;
  if (currentUser.profile?.role === "student") items = studentNavItems;
  else if (currentUser.profile?.role === "teacher") items = teacherNavItems;
  else if (currentUser.profile?.role === "principal") items = principalNavItems;
  else if (currentUser.profile?.role === "admin") items = adminNavItems;
  else if (currentUser.profile?.role === "parent") items = parentNavItems;

  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      className="md:hidden p-0 h-9 w-9 rounded-full"
      onClick={toggleMobileMenu}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle menu</span>
    </Button>
  );


  return (
    <>
      {/* Mobile menu overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <MobileMenuButton />
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 bottom-0 left-0 flex h-screen flex-col bg-card border-r border-border shadow-sm transition-all duration-300 ease-in-out z-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16 md:w-16" : "w-64 md:w-64",
          className
        )}
      >
        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 h-6 w-6 bg-card rounded-full border border-border flex items-center justify-center cursor-pointer shadow-sm text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors hidden md:flex"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Logo and title */}
        <div className="py-5 px-4 flex items-center border-b border-border">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold shadow-sm flex-shrink-0">
            MP
          </div>
          {!isCollapsed && (
            <h1 className="ml-3 font-bold text-lg whitespace-nowrap overflow-hidden transition-opacity duration-300">
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Master Plan
              </span>
            </h1>
          )}
        </div>

        {/* User info */}
        <div className={cn("mt-4 px-4 mb-6", isCollapsed && "flex justify-center px-2")}>
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 text-primary-foreground flex items-center justify-center font-medium shadow-sm text-sm">
              {currentUser.profile?.displayName ? getInitials(currentUser.profile.displayName) : "U"}
            </div>
          ) : (
            <div className="flex items-center p-2.5 rounded-lg bg-primary/5 dark:bg-primary/10 w-full">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/80 to-primary/60 text-primary-foreground flex items-center justify-center font-medium shadow-sm flex-shrink-0 text-sm">
                {currentUser.profile?.displayName ? getInitials(currentUser.profile.displayName) : "U"}
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="font-medium text-sm truncate">{currentUser.profile?.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {currentUser.profile?.role ?
                    currentUser.profile.role.charAt(0).toUpperCase() + currentUser.profile.role.slice(1) :
                    "User"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={cn("flex-1 overflow-y-auto", isCollapsed ? "px-2" : "px-3")}>
          {!isCollapsed && (
            <div className="mb-2 px-3 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
              Navigation
            </div>
          )}
          <nav className="space-y-1">
            {items.map((item) => {
              const isActive = location === item.href;
              return (
                <div key={item.href} className="block">
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center py-2.5 text-sm rounded-lg transition-all duration-200 group relative",
                      isActive
                        ? "text-primary bg-primary/10 dark:bg-primary/15 font-medium shadow-sm"
                        : "text-foreground/70 hover:text-foreground hover:bg-muted",
                      isCollapsed ? "justify-center px-2" : "px-3"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <span
                      className={cn(
                        "flex items-center justify-center w-5 h-5 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground/80",
                        !isCollapsed && "mr-3"
                      )}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                </div>
              );
            })}
          </nav>

          {currentUser.profile?.role === "student" && !isCollapsed && (
            <>
              <div className="mt-6 mb-2 px-3 text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                Learning Tools
              </div>
              <div className="mb-2 bg-primary/5 dark:bg-primary/10 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium">Today's Progress</span>
                  <span className="text-xs text-primary font-semibold">70%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-gradient-to-r from-primary/80 to-primary h-1.5 rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom actions */}
        <div className={cn(
          "border-t border-border flex items-center",
          isCollapsed ? "justify-center p-3 space-y-3 flex-col" : "p-4 justify-between"
        )}>
          {isCollapsed ? (
            <>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex space-x-2">
                <ThemeToggle />
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="rounded-lg text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
}