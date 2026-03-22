"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, User, LogOut, Monitor } from "lucide-react";
import { toast } from "sonner";
import { DashboardSwitcher } from "./dashboard-switcher";
import { Role } from "@/types/prisma-enums";

interface NavbarProps {
  user?: {
    email: string;
    role: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  const getThemeIcon = () => {
    if (theme === "dark") return <Sun className="h-4 w-4 text-muted-foreground" />;
    if (theme === "light") return <Monitor className="h-4 w-4 text-muted-foreground" />;
    return <Moon className="h-4 w-4 text-muted-foreground" />;
  };

  const getInitials = () => {
    if (!user || !user.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  const formatRole = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      {/* Dashboard Switcher */}
      {user && <DashboardSwitcher userRole={user.role as Role} />}

      {/* Theme Toggle */}
      {mounted && (
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-muted/50 rounded-md transition-colors ml-auto"
          aria-label="Toggle theme"
        >
          {getThemeIcon()}
        </button>
      )}

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded-md transition-colors">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-0.5">
              <p className="text-xs font-medium leading-none truncate">
                {user?.email || "User"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {user ? formatRole(user.role) : "Role"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => router.push("/admin/profile")}
            className="cursor-pointer text-xs"
          >
            <User className="mr-2 h-3.5 w-3.5" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-xs text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
