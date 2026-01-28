import { ReactNode } from "react";
import { DivideIcon as LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any; // Lucide icon component
  trend?: string;
  color?: "primary" | "secondary" | "accent" | "success" | "warning" | "destructive";
}

export function StatCard({ title, value, icon: Icon, trend, color = "primary" }: StatCardProps) {
  const colorMap = {
    primary: "text-primary bg-primary/10 border-primary/20",
    secondary: "text-secondary-foreground bg-secondary/50 border-secondary",
    accent: "text-accent bg-accent/10 border-accent/20",
    success: "text-green-500 bg-green-500/10 border-green-500/20",
    warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    destructive: "text-destructive bg-destructive/10 border-destructive/20",
  };

  const activeColor = colorMap[color];

  return (
    <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground font-mono">{title}</h3>
        <div className={`p-2 rounded-lg ${activeColor} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-display font-bold text-foreground tracking-tight">{value}</div>
        {trend && (
          <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
