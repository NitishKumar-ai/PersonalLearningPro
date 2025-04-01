import { Link } from "wouter";
import { Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-neutral-800 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="hidden md:block">
          <h1 className="text-xl font-medium">
            {title || (user?.role === "teacher" ? "Teacher Dashboard" : "Student Dashboard")}
          </h1>
        </div>
        
        <div className="md:hidden">
          <h1 className="text-lg font-medium">{title}</h1>
        </div>
        
        <div className="flex items-center">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Help" className="ml-2">
            <HelpCircle className="h-5 w-5" />
          </Button>
          <Link href="/profile">
            <a className="ml-3">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user?.name ? getInitials(user.name) : "U"}
              </div>
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
}
