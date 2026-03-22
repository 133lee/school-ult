import { useState, useEffect, useCallback } from "react";
import { ClassStatus } from "@/types/prisma-enums";

// Types
export interface HodClass {
  id: string;
  name: string;
  capacity: number;
  currentEnrolled: number;
  status: ClassStatus;
  gradeId: string;
  grade: {
    id: string;
    name: string;
    level: string;
    schoolLevel: string;
    sequence: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HodClassFilters {
  status?: ClassStatus;
  gradeId?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface HodClassMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UseHodClassesReturn {
  classes: HodClass[];
  meta: HodClassMeta;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch classes for HOD
 *
 * Automatically filtered to:
 * - Secondary grades only (8-12) via schoolLevel: "SECONDARY"
 *
 * Note: Classes are NOT department-scoped. HOD sees all secondary classes
 * because they assign their department's subjects to teachers for these classes.
 */
export function useHodClasses(
  filters?: HodClassFilters,
  pagination?: PaginationParams
): UseHodClassesReturn {
  const [classes, setClasses] = useState<HodClass[]>([]);
  const [meta, setMeta] = useState<HodClassMeta>({
    total: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract primitive values to avoid object reference issues in dependencies
  const status = filters?.status;
  const gradeId = filters?.gradeId;
  const search = filters?.search;
  const page = pagination?.page || 1;
  const pageSize = pagination?.pageSize || 10;

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      if (gradeId) {
        params.append("gradeId", gradeId);
      }

      if (search) {
        params.append("search", search);
      }

      // Fetch classes from HOD-specific endpoint (secondary grades only)
      const response = await fetch(`/api/hod/classes?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `Failed to fetch classes (${response.status})`,
        }));
        throw new Error(errorData.error || "Failed to fetch classes");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch classes");
      }

      setClasses(result.data || []);
      setMeta(result.meta || { total: 0, page: 1, pageSize: 10, totalPages: 0 });
    } catch (err) {
      console.error("Error fetching HOD classes:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [status, gradeId, search, page, pageSize]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    classes,
    meta,
    isLoading,
    error,
    refetch: fetchClasses,
  };
}
