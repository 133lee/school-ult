import { useState, useEffect } from "react";

interface AssessmentScore {
  type: "CAT" | "MID" | "EOT";
  score: number;
  rank: number;
  total: number;
  trend: "up" | "down" | "same";
}

interface StudentPerformance {
  studentId: string;
  studentName: string;
  assessments: AssessmentScore[];
}

interface SubjectPerformanceData {
  subjectId: string;
  termId: string;
  classId: string | null;
  students: StudentPerformance[];
}

interface UseSubjectPerformanceReturn {
  data: SubjectPerformanceData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch subject-specific performance data for all students
 */
export function useSubjectPerformance(
  subjectId: string | null,
  classId?: string | null,
  termId?: string
): UseSubjectPerformanceReturn {
  const [data, setData] = useState<SubjectPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    if (!subjectId) {
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
          if (!termResult.success) {
            throw new Error(termResult.error || "Failed to fetch active term");
          }
          const termData = termResult.data;
          activeTermId = termData.id;
        } else {
          throw new Error("Failed to fetch active term");
        }
      }

      // Build query parameters
      const params = new URLSearchParams({
        subjectId,
        termId: activeTermId,
      });

      if (classId) {
        params.append("classId", classId);
      }

      // Fetch subject performance data
      const response = await fetch(
        `/api/teacher/subject-performance?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Subject Performance API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          url: `/api/teacher/subject-performance?${params.toString()}`,
        });
        throw new Error(
          errorData.error ||
            `Failed to fetch subject performance data (${response.status})`
        );
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch subject performance data");
      }
      const performanceData = result.data;
      setData(performanceData);
    } catch (err) {
      console.error("Error fetching subject performance:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, classId, termId]);

  return {
    data,
    loading,
    error,
    refetch: fetchPerformance,
  };
}
