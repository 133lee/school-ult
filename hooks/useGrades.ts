import { useState, useEffect } from "react";
import { Grade, SchoolLevel } from "@/types/prisma-enums";

interface UseGradesOptions {
  schoolLevel?: SchoolLevel;
}

interface UseGradesReturn {
  grades: Grade[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGrades(options?: UseGradesOptions): UseGradesReturn {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrades = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.schoolLevel) {
        params.append("schoolLevel", options.schoolLevel);
      }

      const url = `/api/grade-levels${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch grades");
      }

      const result = await response.json();

      if (result.success) {
        setGrades(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch grades");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setGrades([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, [options?.schoolLevel]);

  return {
    grades,
    isLoading,
    error,
    refetch: fetchGrades,
  };
}
