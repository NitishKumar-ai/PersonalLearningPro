import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/auth-context";
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
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Tests",
      href: "/create-test",
      icon: <FileQuestion className="h-5 w-5" />,
    },
    {
      title: "Scan Tests",
      href: "/ocr-scan",
      icon: <ScanBarcode className="h-5 w-5" />,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Students",
      href: "/students",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "AI Study Plans",
      href: "/ai-study-plans",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      title: "Live Classes",
      href: "/live-classes",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  // If student, show a reduced menu
  const studentNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Tests",
      href: "/tests",
      icon: <FileQuestion className="h-5 w-5" />,
    },
    {
      title: "My Progress",
      href: "/progress",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Resources",
      href: "/resources",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "AI Tutor",
      href: "/ai-tutor",
      icon: <Brain className="h-5 w-5" />,
    },
    {
      title: "Live Classes",
      href: "/live-classes",
      icon: <Video className="h-5 w-5" />,
    },
    {
      title: "Study Groups",
      href: "/study-groups",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Achievements",
      href: "/achievements",
      icon: <Trophy className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  const items = user?.role === "student" ? studentNavItems : navItems;

  // Mobile hamburger menu
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

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

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
          "fixed top-0 bottom-0 left-0 flex h-screen flex-col bg-white dark:bg-neutral-800 shadow-md transition-transform z-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          "w-64 md:w-64",
          className
        )}
      >
        {/* Logo and title */}
        <div className="p-4 flex items-center">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-white font-bold">
            MP
          </div>
          <h1 className="ml-3 font-bold text-primary text-lg">Master Plan</h1>
        </div>

        {/* User info */}
        <div className="px-4 mb-6 flex items-center">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
            {user?.name ? getInitials(user.name) : "U"}
          </div>
          <div className="ml-3">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-muted-foreground">
              {user?.role === "teacher" ? "Teacher" : "Student"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-2">
          <nav className="px-2 space-y-1">
            {items.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                >
                  <a
                    className={cn(
                      "flex items-center px-4 py-3 text-sm rounded-md transition-colors group",
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom actions */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => logout()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
