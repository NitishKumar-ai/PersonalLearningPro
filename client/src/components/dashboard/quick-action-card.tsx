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
      <Card className="h-full border-border bg-card shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`rounded-xl p-3 shrink-0 shadow-soft transition-colors ${bgColor} ${iconColor}`}>
              <div className="h-6 w-6">{icon}</div>
            </div>
            <div>
              <h3 className="font-display text-lg text-foreground mb-1 group-hover:text-accent transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground font-body leading-snug">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}