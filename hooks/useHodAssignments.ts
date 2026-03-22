import { useState, useEffect, useCallback } from "react";

// Types
export interface Assignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    staffNumber: string;
    user: {
      email: string;
    };
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
    grade: {
      id: string;
      name: string;
      level: string;
      sequence: number;
    };
  };
  academicYear: {
    id: string;
    year: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentFilters {
  teacherId?: string;
  subjectId?: string;
  classId?: string;
  academicYearId?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface AssignmentMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UseHodAssignmentsReturn {
  assignments: Assignment[];
  meta: AssignmentMeta;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch HOD assignments with department scoping
 *
 * Automatically filtered to:
 * - Subjects in HOD's department
 * - Secondary grades only (8-12)
 */
export function useHodAssignments(
  filters?: AssignmentFilters,
  pagination?: PaginationParams
): UseHodAssignmentsReturn {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [meta, setMeta] = useState<AssignmentMeta>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: (pagination?.page || 1).toString(),
        pageSize: (pagination?.pageSize || 20).toString(),
      });

      if (filters?.academicYearId) {
        params.append("academicYearId", filters.academicYearId);
      }

      if (filters?.teacherId) {
        params.append("teacherId", filters.teacherId);
      }

      if (filters?.subjectId) {
        params.append("subjectId", filters.subjectId);
      }

      if (filters?.classId) {
        params.append("classId", filters.classId);
      }

      // Fetch assignments
      const response = await fetch(`/api/hod/assignments?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Failed to fetch assignments (${response.status})`,
        }));
        throw new Error(errorData.error || "Failed to fetch assignments");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch assignments");
      }

      const data = result.data;
      setAssignments(data.data || []);
      setMeta(data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 });
    } catch (err) {
      console.error("Error fetching HOD assignments:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  return {
    assignments,
    meta,
    isLoading,
    error,
    refetch: fetchAssignments,
  };
}
