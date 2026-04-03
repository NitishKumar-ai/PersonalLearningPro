import { ReactNode } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
  bgColor: string;
  iconColor: string;
}

export function QuickActionCard({
  title,
  description,
  icon,
  href,
  bgColor,
  iconColor
}: QuickActionCardProps) {
  return (
    <Link href={href} className="block h-full group">
      <Card className="h-full border-border bg-card shadow-soft hover:shadow-card hover:border-accent/30 transition-all duration-200 hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className={`rounded-xl p-2.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${bgColor} ${iconColor}`}>
              <div className="h-5 w-5">{icon}</div>
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground group-hover:text-accent transition-colors truncate">{title}</h3>
              <p className="text-xs text-muted-foreground leading-snug mt-0.5 truncate">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}