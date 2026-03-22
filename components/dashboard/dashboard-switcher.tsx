"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Check, ChevronsUpDown, LayoutDashboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Role } from "@/types/prisma-enums";
import { getAccessibleDashboards } from "@/lib/auth/role-hierarchy";

interface DashboardSwitcherProps {
  userRole: Role;
  className?: string;
}

export function DashboardSwitcher({
  userRole,
  className,
}: DashboardSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Get all dashboards accessible to this user based on role hierarchy
  const dashboards = getAccessibleDashboards(userRole);

  // Determine current dashboard from pathname
  const currentDashboard = dashboards.find((d) =>
    pathname.startsWith(d.route)
  ) || dashboards[0]; // Default to highest role dashboard

  // Only show switcher if user has access to multiple dashboards
  if (dashboards.length <= 1) {
    return null;
  }

  const handleDashboardSwitch = (route: string) => {
    router.push(route);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 px-3 py-2 hover:bg-muted/50 rounded-md transition-colors",
            className
          )}
          aria-label="Switch dashboard"
        >
          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {currentDashboard.label} View
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs">
          Switch Dashboard
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {dashboards.map((dashboard) => {
          const isActive = pathname.startsWith(dashboard.route);
          return (
            <DropdownMenuItem
              key={dashboard.role}
              onClick={() => handleDashboardSwitch(dashboard.route)}
              className="cursor-pointer text-xs"
            >
              <Check
                className={cn(
                  "mr-2 h-3.5 w-3.5",
                  isActive ? "opacity-100" : "opacity-0"
                )}
              />
              <span>{dashboard.label}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
