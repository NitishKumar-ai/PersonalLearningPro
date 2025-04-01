import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  bgColor?: string;
  iconColor?: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  bgColor = "bg-primary/10 dark:bg-primary/20",
  iconColor = "text-primary",
}: QuickActionCardProps) {
  return (
    <Link href={href}>
      <a className="block">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 h-full flex items-center justify-between cursor-pointer">
          <div>
            <h3 className="font-medium mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", bgColor, iconColor)}>
            {icon}
          </div>
        </div>
      </a>
    </Link>
  );
}
