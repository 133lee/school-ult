import { useState, useEffect } from "react";

interface SubjectScore {
  subject: string;
  score: number;
}

interface ClassRanking {
  subject: string;
  score: number;
  rank: number;
  total: number;
  trend: "up" | "down" | "same";
  isTeacherSubject: boolean;
}

interface StudentPerformanceData {
  studentId: string;
  assessmentType: string;
  termId: string;
  radarChartData: SubjectScore[];
  classRankings: ClassRanking[];
  classPosition: number;
  classTotal: number;
  bestSix: number | null;
  bestSixCount?: number | null;
  bestSixType?: "points" | "percentage";
  trend: "up" | "down" | "same";
}

interface UseStudentPerformanceReturn {
  data: StudentPerformanceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch and manage student performance data
 */
export function useStudentPerformance(
  studentId: string | null,
  assessmentType: "CAT1" | "MID" | "EOT",
  termId?: string
): UseStudentPerformanceReturn {
  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map CAT1 to CAT for backend
  const examType = assessmentType === "CAT1" ? "CAT" : assessmentType;

  const fetchPerformance = async () => {
    if (!studentId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Get active term if not provided
      let activeTermId = termId;
      if (!activeTermId) {
        const termResponse = await fetch("/api/terms/active", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (termResponse.ok) {
          const termResult = await termResponse.json();

          // API returns { success: true, data: {...} } - must check success flag
          if (!termResult.success) {
            throw new Error(termResult.error || "Failed to fetch active term");
          }

          const termData = termResult.data;

          // Valid empty state: no active term configured
          if (!termData) {
            setData(null);
            setLoading(false);
            setError(null); // Not an error - valid empty state
            return;
          }

          activeTermId = termData.id;
        } else {
          throw new Error("Failed to fetch active term");
        }
      }

      // Fetch performance data
      const response = await fetch(
        `/api/teacher/students/${studentId}/performance?assessmentType=${examType}&termId=${activeTermId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        console.error("Performance API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: `/api/teacher/students/${studentId}/performance?assessmentType=${examType}&termId=${activeTermId}`
        });
        throw new Error(errorData.error || `Failed to fetch performance data (${response.status})`);
      }

      const result = await response.json();

      // API returns { success: true, data: {...} } - must check success flag
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch performance data");
      }

      const performanceData = result.data;

      // Valid empty state: student has no assessment results yet
      // This is normal when assessments haven't been created or student hasn't taken them
      // Empty radarChartData (length === 0) is a valid state and will be handled by UI components
      setData(performanceData);
    } catch (err) {
      console.error("Error fetching student performance:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [studentId, assessmentType, termId]);

  return {
    data,
    loading,
    error,
    refetch: fetchPerformance,
  };
}
