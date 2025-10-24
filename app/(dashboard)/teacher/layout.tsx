"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/app-sidebar";
import AppNavbar from "@/components/layout/app-navbar";
import { AuthGuard } from "@/components/auth-guard";

export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard allowedRoles={["TEACHER"]}>
      <SidebarProvider>
        <AppSidebar variant="inset" collapsible="icon" userRole="TEACHER" />
        <SidebarInset>
          <AppNavbar />
          <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
