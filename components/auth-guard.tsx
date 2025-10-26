"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ("ADMIN" | "TEACHER" | "STUDENT" | "HOD")[];
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not logged in
      if (!user) {
        router.push("/");
        return;
      }

      // Logged in but not authorized for this role
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to their dashboard
        switch (user.role) {
          case "ADMIN":
            router.push("/admin");
            break;
          case "TEACHER":
            router.push("/teacher");
            break;
          case "STUDENT":
            router.push("/student");
            break;
          case "HOD":
            router.push("/hod");
            break;
        }
      }
    }
  }, [user, loading, allowedRoles, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Not authorized
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
