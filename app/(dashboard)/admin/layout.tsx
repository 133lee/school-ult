"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAdminRole } from "@/lib/auth/role-routes";
import { Role } from "@/types/prisma-enums";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout
 * Protects all admin routes - only accessible by ADMIN, HEAD_TEACHER, and CLERK roles
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (!userData) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (!isAdminRole(user.role as Role)) {
        // User is not authorized for admin routes
        router.push("/login");
        return;
      }

      // User is authorized
      setIsAuthorized(true);
    } catch (error) {
      console.error("Error validating admin access:", error);
      router.push("/login");
    }
  }, [router]);

  // Don't render children until authorization is confirmed
  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
