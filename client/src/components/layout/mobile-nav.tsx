import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileQuestion,
  BarChart,
  Menu,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const teacherNavItems = [
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
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "More",
      href: "#",
      icon: <Menu className="h-5 w-5" />,
    },
  ];

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
      title: "Progress",
      href: "/progress",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "More",
      href: "#",
      icon: <Menu className="h-5 w-5" />,
    },
  ];

  const navItems = user?.role === "student" ? studentNavItems : teacherNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-neutral-800 shadow-md z-10 flex justify-around py-2 border-t border-neutral-200 dark:border-neutral-700">
      {navItems.map((item) => {
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "p-3 flex flex-col items-center",
                isActive
                  ? "text-primary"
                  : "text-neutral-400 dark:text-neutral-300"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.title}</span>
            </a>
          </Link>
        );
      })}
    </div>
  );
}
