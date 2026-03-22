"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  variant: "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantStyles = {
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-blue-500/10 text-blue-500",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  variant,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-lg border border-border p-4 transition-all hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            variantStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
