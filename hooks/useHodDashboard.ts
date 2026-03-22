import { useState, useEffect } from "react";

interface SubjectInfo {
  id: string;
  name: string;
  code: string;
}

interface TeacherInfo {
  id: string;
  firstName: string;
  lastName: string;
  staffNumber: string;
  email: string;
  isActive: boolean;
}

interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  description: string | null;
  totalSubjects: number;
  totalTeachers: number;
  totalStudents: number;
  activeClasses: number;
}

interface PerformanceMetrics {
  averagePerformance: number;
  passRate: number;
  bestPerformingSubject: { name: string; average: number } | null;
  subjectNeedingAttention: { name: string; average: number } | null;
}

interface StatsInfo {
  totalAssessments: number;
  pendingAssessments: number;
  activeClasses: number;
  totalStudents: number;
}

interface HodDashboardData {
  department: DepartmentInfo;
  performance: PerformanceMetrics;
  stats: StatsInfo;
  subjects: SubjectInfo[];
  teachers: TeacherInfo[];
  academicYear: {
    id: string;
    name: string;
  };
  term: {
    id: string;
    name: string;
  } | null;
}

interface UseHodDashboardReturn {
  data: HodDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHodDashboard(): UseHodDashboardReturn {
  const [data, setData] = useState<HodDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/hod/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Failed to fetch dashboard data");
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch dashboard data");
      }
      const dashboardData = result.data;
      setData(dashboardData);
    } catch (err) {
      console.error("Error fetching HOD dashboard:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchDashboard,
  };
}
