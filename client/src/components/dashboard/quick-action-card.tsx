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
    <Link href={href} className="block h-full">
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`rounded-full p-3 ${bgColor}`}>
              <div className={iconColor}>{icon}</div>
            </div>
            <div>
              <h3 className="font-medium mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}