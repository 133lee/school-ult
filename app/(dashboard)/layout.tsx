"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { SidebarComponent } from "@/components/dashboard/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { getRoleRoute } from "@/lib/auth/role-routes";
import { Role } from "@/types/prisma-enums";
import { canAccessRoute } from "@/lib/auth/role-hierarchy";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<any>(null);
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem("auth_token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Check if user has access to current route based on role hierarchy
      const userRole = parsedUser.role as Role;
      if (!canAccessRoute(userRole, pathname)) {
        // User doesn't have access, redirect to their default dashboard
        const roleRoute = getRoleRoute(userRole);
        router.push(roleRoute);
        return;
      }

      // Redirect user to their role-specific dashboard if they're on root /dashboard
      const roleRoute = getRoleRoute(userRole);

      // Only redirect if user is exactly on a base route without proper role prefix
      if (pathname === "/" || pathname === "/dashboard") {
        router.push(roleRoute);
        return;
      }

      setIsChecking(false);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    }
  }, [router, pathname]);

  // Show loading state while checking authentication
  if (!user || isChecking) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Check if current route is teacher or HOD - they have their own layouts
  const hasOwnLayout =
    pathname.startsWith("/teacher") || pathname.startsWith("/hod");

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange>
      {hasOwnLayout ? (
        // Teacher and HOD have their own sidebar layouts
        children
      ) : (
        // Admin and other routes use the admin sidebar
        <SidebarProvider>
          <SidebarComponent user={user} />
          <SidebarInset>
            <div className="flex flex-1 flex-col items-center justify-start p-4">
              <div className="w-full max-w-350">{children}</div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </ThemeProvider>
  );
}
