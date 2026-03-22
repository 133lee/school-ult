"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";

/**
 * Enter Results Page
 * Clean, focused interface for entering student marks
 */

interface Assessment {
  id: string;
  title: string;
  totalMarks: number;
  passMark: number;
  examType: string;
  status: string;
  subject: {
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
    grade: {
      name: string;
    };
  };
  term: {
    id: string;
    academicYear: {
      id: string;
    };
  };
}

interface Student {
  id: string;
  studentNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}

interface Result {
  id?: string;
  studentId: string;
  marksObtained: number | string;
  grade?: string | null;
  remarks?: string;
}

export default function EnterResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  const { toast } = useToast();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [existingResults, setExistingResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null);
  const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
  const [showAutoSaveSuccess, setShowAutoSaveSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    fetchAssessment();
    fetchExistingResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const response = await api.get(`/assessments/${assessmentId}`);
      setAssessment(response.data);
      // Fetch students in the class for the academic year
      fetchStudents(response.data.class.id, response.data.term.academicYear.id);
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast({
        title: "Error",
        description: "Failed to load assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string, academicYearId: string) => {
    try {
      const response = await api.get(
        `/classes/${classId}/students?academicYearId=${academicYearId}`
      );
      // The API returns enrollments with student nested inside
      const enrollments = response.data || [];
      const studentsList = enrollments.map(
        (enrollment: any) => enrollment.student
      );
      setStudents(studentsList);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive",
      });
    }
  };

  const fetchExistingResults = async () => {
    try {
      const response = await api.get(`/assessments/${assessmentId}/results`);
      const data = response.data || [];
      setExistingResults(data);

      // Pre-populate results
      const resultsMap: Record<string, Result> = {};
      data.forEach((result: any) => {
        resultsMap[result.student.id] = {
          id: result.id,
          studentId: result.student.id,
          marksObtained: result.marksObtained,
          grade: result.grade,
          remarks: result.remarks || "",
        };
      });
      setResults(resultsMap);
    } catch (error) {
      console.error("Error fetching results:", error);
    }
  };

  const handleMarksChange = (studentId: string, marks: string) => {
    setResults({
      ...results,
      [studentId]: {
        ...results[studentId],
        studentId,
        marksObtained: marks,
      },
    });
  };

  // Auto-save individual student result with debounce
  const autoSaveResult = async (studentId: string, marks: string) => {
    if (!assessment || marks === "" || marks === undefined) return;

    // Check if assessment is published
    if (assessment.status === "DRAFT") {
      toast({
        title: "Cannot Save",
        description: "This assessment is still in DRAFT. Please publish it first to enter results.",
        variant: "destructive",
      });
      return;
    }

    const marksNum = typeof marks === "string" ? parseFloat(marks) : marks;

    // Validate marks
    if (isNaN(marksNum) || marksNum < 0 || marksNum > assessment.totalMarks) {
      toast({
        title: "Invalid Marks",
        description: `Marks must be between 0 and ${assessment.totalMarks}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSavingStudentId(studentId);

      // Single student save - use object format
      const result = await api.post(`/assessments/${assessmentId}/results`, {
        studentId,
        marksObtained: marksNum,
      });

      // Update with saved result ID
      setResults((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          id: result.data.id,
          marksObtained: marksNum,
        },
      }));

      setLastAutoSaveTime(new Date());
      setShowAutoSaveSuccess(true);

      // Hide success indicator after 2 seconds
      setTimeout(() => {
        setShowAutoSaveSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Auto-save error:", error);
      toast({
        title: "Auto-save Failed",
        description: error.message || "Failed to save result",
        variant: "destructive",
      });
    } finally {
      setSavingStudentId(null);
    }
  };

  // Debounced auto-save
  const debouncedAutoSave = useRef<Record<string, NodeJS.Timeout>>({});

  const handleMarksBlur = (studentId: string, marks: string) => {
    // Clear existing timeout for this student
    if (debouncedAutoSave.current[studentId]) {
      clearTimeout(debouncedAutoSave.current[studentId]);
    }

    // Set new timeout
    debouncedAutoSave.current[studentId] = setTimeout(() => {
      autoSaveResult(studentId, marks);
    }, 500);
  };

  const handleSaveAll = async () => {
    if (!assessment) return;

    // Check if assessment is published
    if (assessment.status === "DRAFT") {
      toast({
        title: "Cannot Save",
        description: "This assessment is still in DRAFT. Please publish it first to enter results.",
        variant: "destructive",
      });
      return;
    }

    // Validate all entries
    const entries = Object.values(results).filter(
      (r) => r.marksObtained !== "" && r.marksObtained !== undefined
    );

    if (entries.length === 0) {
      toast({
        title: "No Results",
        description: "Please enter at least one mark",
        variant: "destructive",
      });
      return;
    }

    // Validate marks are within range
    const invalid = entries.find(
      (r) =>
        typeof r.marksObtained === "number" &&
        (r.marksObtained < 0 || r.marksObtained > assessment.totalMarks)
    );

    if (invalid) {
      toast({
        title: "Invalid Marks",
        description: `Marks must be between 0 and ${assessment.totalMarks}`,
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      // Convert to array for bulk entry
      const resultsArray = entries.map((r) => ({
        studentId: r.studentId,
        marksObtained:
          typeof r.marksObtained === "string"
            ? parseFloat(r.marksObtained)
            : r.marksObtained,
      }));

      const result = await api.post(
        `/assessments/${assessmentId}/results`,
        resultsArray
      );

      // Extract data from response
      const responseData = result.data || result;

      toast({
        title: "Success",
        description: `Saved ${responseData.successful || resultsArray.length} result(s)${
          responseData.failed?.length > 0 ? `, ${responseData.failed.length} failed` : ""
        }`,
      });

      // Refresh results to get saved IDs
      fetchExistingResults();
    } catch (error: any) {
      console.error("Error saving results:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save results",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPercentage = (marks: number, totalMarks: number) => {
    return Math.round((marks / totalMarks) * 100);
  };

  const isPassing = (marks: number) => {
    return assessment && marks >= assessment.passMark;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Assessment not found</p>
      </div>
    );
  }

  const getExamTypeBadge = (examType: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      CAT: "default",
      MID: "secondary",
      EOT: "destructive",
    };
    const labels: Record<string, string> = {
      CAT: "CAT",
      MID: "Mid-Term",
      EOT: "End of Term",
    };
    return (
      <Badge variant={variants[examType] || "default"}>
        {labels[examType] || examType}
      </Badge>
    );
  };

  const enteredCount = Object.values(results).filter(
    (r) => r.marksObtained !== "" && r.marksObtained !== undefined
  ).length;

  // Pagination calculations
  const totalPages = Math.ceil(students.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = students.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/teacher/assessments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessments
          </Button>
        </div>
        <div className="flex flex-col items-end">
          <h1 className="text-xl font-bold">Enter Results</h1>
          <p className="text-sm text-muted-foreground">
            {assessment.subject.name} ({assessment.subject.code}) •{" "}
            {assessment.class.grade.name} {assessment.class.name}
          </p>
        </div>
      </div>

      {/* Draft Warning Banner */}
      {assessment.status === "DRAFT" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Assessment Not Published</AlertTitle>
          <AlertDescription>
            This assessment is still in DRAFT status. You cannot enter or save results until it is published.
            Please go back to the assessments page and publish this assessment first.
          </AlertDescription>
        </Alert>
      )}

      {/* Info Card */}
      <Card>
        <CardContent className="px-4 py-0">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-muted-foreground text-xs">
                  Total Marks:
                </span>
                <span className="ml-2 font-semibold">
                  {assessment.totalMarks}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">
                  Pass Mark:
                </span>
                <span className="ml-2 font-semibold">
                  {assessment.passMark}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {showAutoSaveSuccess && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 animate-in fade-in zoom-in duration-200" />
                )}
                <span className="text-muted-foreground text-xs">Progress:</span>
                <span className="font-semibold text-xs">
                  {enteredCount} of {students.length}
                </span>
                <Badge variant="outline" className="text-xs">
                  {students.length > 0
                    ? Math.round((enteredCount / students.length) * 100)
                    : 0}
                  %
                </Badge>
              </div>
              {getExamTypeBadge(assessment.examType)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Entry Card */}
      <Card className="overflow-hidden h-[calc(100vh-16rem)] flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/50 border-b text-xs font-medium text-muted-foreground uppercase flex-shrink-0">
          <div className="col-span-5">Student</div>
          <div className="col-span-3">Marks Obtained</div>
          <div className="col-span-2">Percentage</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Student List - Scrollable area that takes remaining space */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {students.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No students enrolled in this class</p>
            </div>
          ) : (
            paginatedStudents.map((student, index) => {
              const actualIndex = startIndex + index;
              const result = results[student.id];
              const marks =
                typeof result?.marksObtained === "string"
                  ? parseFloat(result.marksObtained)
                  : result?.marksObtained;
              const percentage =
                marks !== undefined && !isNaN(marks)
                  ? getPercentage(marks, assessment.totalMarks)
                  : null;
              const passing =
                marks !== undefined && !isNaN(marks) ? isPassing(marks) : null;

              return (
                <div
                  key={student.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                  {/* Student Info */}
                  <div className="col-span-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-6">
                        {actualIndex + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {student.firstName}{" "}
                          {student.middleName ? student.middleName + " " : ""}
                          {student.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {student.studentNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Marks Input */}
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        max={assessment.totalMarks}
                        step="0.5"
                        placeholder="0"
                        value={result?.marksObtained ?? ""}
                        onChange={(e) =>
                          handleMarksChange(student.id, e.target.value)
                        }
                        onBlur={(e) =>
                          handleMarksBlur(student.id, e.target.value)
                        }
                        disabled={assessment.status === "DRAFT"}
                        className="h-9 text-sm"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        / {assessment.totalMarks}
                      </span>
                    </div>
                  </div>

                  {/* Percentage */}
                  <div className="col-span-2">
                    {percentage !== null && (
                      <span className="text-sm font-semibold">
                        {percentage}%
                      </span>
                    )}
                  </div>

                  {/* Status & Saved Indicator */}
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    {passing !== null &&
                      (passing ? (
                        <Badge variant="default" className="text-xs">
                          Pass
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Fail
                        </Badge>
                      ))}
                    {savingStudentId === student.id ? (
                      <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                    ) : result?.id ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {/* Pagination and Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || students.length === 0}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || students.length === 0}>
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={saving || enteredCount === 0 || assessment.status === "DRAFT"}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Results"}
        </Button>
      </div>
    </div>
  );
}
