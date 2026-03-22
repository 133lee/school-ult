"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Users, GraduationCap, School, Calendar } from "lucide-react";
import { api } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/shared/stats-card";
import Link from "next/link";

interface DashboardStats {
  students: {
    total: number;
    active: number;
  };
  teachers: {
    total: number;
    active: number;
  };
  classes: {
    total: number;
    active: number;
  };
  academicYear: {
    year: number | null;
    termDisplay: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats(isBackground = false) {
      try {
        if (!isBackground) setLoading(true);
        setError(null);

        const response = await api.get("/admin/dashboard/stats");
        setStats(response.data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard statistics");
      } finally {
        if (!isBackground) setLoading(false);
      }
    }

    fetchStats();

    const interval = setInterval(() => {
      fetchStats(true); // 👈 silent refresh
    }, 60000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Welcome to the School Management System
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Welcome to the School Management System
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Students"
          value={stats?.students?.total ?? 0}
          subtitle={`${stats?.students?.active ?? 0} active`}
          icon={Users}
          variant="primary"
        />

        <StatsCard
          label="Total Teachers"
          value={stats?.teachers?.total ?? 0}
          subtitle={`${stats?.teachers?.active ?? 0} active`}
          icon={GraduationCap}
          variant="success"
        />

        <StatsCard
          label="Total Classes"
          value={stats?.classes?.total ?? 0}
          subtitle={`${stats?.classes?.active ?? 0} active`}
          icon={School}
          variant="info"
        />

        <StatsCard
          label="Academic Year"
          value={stats?.academicYear?.year ?? "—"}
          subtitle={stats?.academicYear?.termDisplay ?? "—"}
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Link href="/admin/students/new">
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">Add Student</div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    Enroll a new student
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/admin/classes/new">
              <Button className="w-full justify-start" variant="outline">
                <School className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">Create Class</div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    Set up a new class
                  </div>
                </div>
              </Button>
            </Link>
            <Link href="/admin/attendance/analytics">
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                <div className="text-left">
                  <div className="text-sm font-medium">View Attendance</div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    Check attendance analytics
                  </div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
