import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useFirebaseAuth as useAuth } from "@/contexts/firebase-auth-context";
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  isSoon?: boolean;
}

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
  const { currentUser: { profile: user }, logout } = useAuth();
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
  const principalNavItems: NavItem[] = [
    { title: "Dashboard", href: "/principal-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Institution", href: "/institution", icon: <School className="h-5 w-5" />, isSoon: true },
    { title: "Staff", href: "/staff", icon: <Users className="h-5 w-5" />, isSoon: true },
    { title: "Students", href: "/students", icon: <GraduationCap className="h-5 w-5" />, isSoon: true },
    { title: "Student Directory", href: "/student-directory", icon: <Award className="h-5 w-5" /> },
    { title: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Calendar", href: "/calendar", icon: <CalendarDays className="h-5 w-5" />, isSoon: true },
    { title: "Infrastructure", href: "/infrastructure", icon: <Building2 className="h-5 w-5" />, isSoon: true },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" />, isSoon: true },
  ];

  // School Admin navigation items
  const schoolAdminNavItems: NavItem[] = [
    { title: "Dashboard", href: "/school-admin-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Staff", href: "/staff", icon: <Users className="h-5 w-5" />, isSoon: true },
    { title: "Students", href: "/students", icon: <GraduationCap className="h-5 w-5" />, isSoon: true },
    { title: "Student Directory", href: "/student-directory", icon: <Award className="h-5 w-5" /> },
    { title: "Reports", href: "/reports", icon: <FileQuestion className="h-5 w-5" />, isSoon: true },
    { title: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" />, isSoon: true },
  ];

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    { title: "Dashboard", href: "/admin-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "User Management", href: "/users", icon: <UserCog className="h-5 w-5" />, isSoon: true },
    { title: "Institution", href: "/institution", icon: <Building2 className="h-5 w-5" />, isSoon: true },
    { title: "Classes", href: "/classes", icon: <School className="h-5 w-5" />, isSoon: true },
    { title: "Student Directory", href: "/student-directory", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Reports", href: "/reports", icon: <FileQuestion className="h-5 w-5" />, isSoon: true },
    { title: "System Settings", href: "/system-settings", icon: <Settings className="h-5 w-5" />, isSoon: true },
  ];

  // Teacher navigation items
  const teacherNavItems: NavItem[] = [
    { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Tests", href: "/create-test", icon: <FileQuestion className="h-5 w-5" /> },
    { title: "Scan Tests", href: "/ocr-scan", icon: <ScanBarcode className="h-5 w-5" /> },
    { title: "Analytics", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
    { title: "Students", href: "/students", icon: <Users className="h-5 w-5" />, isSoon: true },
    { title: "Student Directory", href: "/student-directory", icon: <GraduationCap className="h-5 w-5" /> },
    { title: "AI Study Plans", href: "/ai-study-plans", icon: <Sparkles className="h-5 w-5" />, isSoon: true },
    { title: "Live Classes", href: "/live-classes", icon: <Video className="h-5 w-5" /> },
    { title: "AI Classroom", href: "/ai-classroom", icon: <Sparkles className="h-5 w-5" /> },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" />, isSoon: true },
  ];

  // Student navigation items
  const studentNavItems: NavItem[] = [
    { title: "Dashboard", href: "/student-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "Test MVP", href: "/test/1", icon: <FileQuestion className="h-5 w-5" /> },
    { title: "My Progress", href: "/progress", icon: <BarChart className="h-5 w-5" /> },
    { title: "Resources", href: "/resources", icon: <BookOpen className="h-5 w-5" />, isSoon: true },
    { title: "AI Tutor", href: "/ai-tutor", icon: <Brain className="h-5 w-5" /> },
    { title: "Live Classes", href: "/live-classes", icon: <Video className="h-5 w-5" /> },
    { title: "AI Classroom", href: "/ai-classroom", icon: <Sparkles className="h-5 w-5" /> },
    { title: "Study Arena", href: "/study-arena", icon: <Users className="h-5 w-5" /> },
    { title: "Achievements", href: "/achievements", icon: <Trophy className="h-5 w-5" />, isSoon: true },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" />, isSoon: true },
    { title: "Tasks", href: "/tasks", icon: <FileQuestion className="h-5 w-5" /> },
  ];

  // Parent navigation items
  const parentNavItems: NavItem[] = [
    { title: "Dashboard", href: "/parent-dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { title: "My Children", href: "/children", icon: <Users className="h-5 w-5" />, isSoon: true },
    { title: "Academic Progress", href: "/progress", icon: <BarChart className="h-5 w-5" /> },
    { title: "Tests & Results", href: "/test-results", icon: <FileQuestion className="h-5 w-5" />, isSoon: true },
    { title: "Teacher Meetings", href: "/meetings", icon: <Video className="h-5 w-5" />, isSoon: true },
    { title: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" />, isSoon: true },
  ];

  let items = teacherNavItems;
  if (user?.role === "student") items = studentNavItems;
  else if (user?.role === "teacher") items = teacherNavItems;
  else if (user?.role === "principal") items = principalNavItems;
  else if (user?.role === "school_admin") items = schoolAdminNavItems;
  else if (user?.role === "admin") items = adminNavItems;
  else if (user?.role === "parent") items = parentNavItems;

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
          "fixed top-0 bottom-0 left-0 flex h-screen flex-col bg-muted/30 border-r border-border transition-all duration-300 ease-in-out z-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-16 md:w-16" : "w-64 md:w-64",
          className
        )}
      >
        {/* Collapse toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 h-6 w-6 bg-background rounded-full border border-border flex items-center justify-center cursor-pointer shadow-soft text-muted-foreground hover:text-foreground hover:bg-muted transition-colors hidden md:flex"
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>

        {/* Logo and title */}
        <div className="py-6 px-6 flex items-center">
          {!isCollapsed && (
            <div className="flex flex-col">
              <h1 className="font-display text-2xl text-foreground leading-tight">EduAI</h1>
              <p className="font-body text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Learning Platform</p>
            </div>
          )}
          {isCollapsed && (
            <div className="h-9 w-9 bg-accent-soft text-accent rounded-xl flex items-center justify-center font-display text-xl">E</div>
          )}
        </div>

        {/* User info */}
        <div className={cn("mt-2 px-3 mb-6", isCollapsed && "flex justify-center")}>
          {isCollapsed ? (
            <div className="w-10 h-10 rounded-full bg-accent-soft text-accent flex items-center justify-center font-semibold text-sm">
              {user?.displayName ? getInitials(user.displayName) : "U"}
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted cursor-pointer transition-colors group">
              <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-semibold flex-shrink-0 text-sm">
                {user?.displayName ? getInitials(user.displayName) : "U"}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm text-foreground truncate">{user?.displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role ?
                    user.role.charAt(0).toUpperCase() + user.role.slice(1) :
                    "User"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className={cn("flex-1 overflow-y-auto", isCollapsed ? "px-2" : "px-3")}>
          {!isCollapsed && (
            <div className="mb-2 px-3 text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">
              Main Menu
            </div>
          )}
          <nav className="space-y-0.5">
            {items.map((item) => {
              const isActive = location === item.href;
              return (
                <div key={item.href} className="block">
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center py-2.5 rounded-xl transition-all duration-150 group relative text-sm font-medium",
                      isActive
                        ? "bg-accent-soft text-accent font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isCollapsed ? "justify-center px-2" : "px-3"
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full" />
                    )}
                    <span
                      className={cn(
                        "flex items-center justify-center w-5 h-5 transition-colors flex-shrink-0",
                        isActive ? "text-accent" : "text-muted-foreground group-hover:text-foreground",
                        !isCollapsed && "mr-3"
                      )}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <>
                        <span className="truncate flex-1">{item.title}</span>
                        {item.isSoon && (
                          <span className="ml-2 flex-shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent-soft text-accent border border-accent/10">
                            Soon
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className={cn(
          "border-t border-border mt-auto",
          isCollapsed ? "p-3 space-y-3 flex flex-col items-center" : "p-4 flex items-center justify-between"
        )}>
          {isCollapsed ? (
            <>
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex gap-1">
                <ThemeToggle />
                <Link href="/settings">
                  <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => logout()}
                className="rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50"
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