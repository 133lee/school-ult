"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { HodSidebar } from "@/components/dashboard/hod-sidebar";
import { useEffect, useState } from "react";

export default function HodLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  return (
    <SidebarProvider>
      <HodSidebar user={user} />
      <SidebarInset>
        <div className="flex flex-1 flex-col items-center justify-start p-4">
          <div className="w-full max-w-350">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
