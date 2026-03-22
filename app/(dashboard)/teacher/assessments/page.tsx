"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  FileText,
  Trash2,
  Eye,
  ClipboardEdit,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Send,
  CheckCircle2,
} from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/**
 * Teacher Assessments Page
 * Two-card layout with tabs, matching classes page design
 */

interface Assessment {
  id: string;
  title: string;
  examType: string;
  totalMarks: number;
  passMark: number;
  weight: number;
  assessmentDate: string | null;
  status: "DRAFT" | "PUBLISHED" | "COMPLETED";
  subject: {
    id: string;
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
    termType: string;
    academicYear: {
      year: number;
    };
  };
  _count: {
    results: number;
  };
  createdBy?: {
    id: string;
    user: {
      email: string;
    };
  };
}

interface Term {
  id: string;
  termType: string;
  isActive: boolean;
  academicYear: {
    year: number;
  };
}

interface ClassData {
  id: string;
  name: string;
  grade: string;
  teachingSubjectId?: string; // Subject teacher's assigned subject for this class
}

// Track subject teacher assignments as classId:subjectId pairs
interface SubjectTeacherAssignment {
  classId: string;
  subjectId: string;
}

export default function TeacherAssessmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingPublishId, setPendingPublishId] = useState<string | null>(null);
  const [pendingCompleteId, setPendingCompleteId] = useState<string | null>(null);
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  const [classTeacherClassIds, setClassTeacherClassIds] = useState<string[]>(
    []
  );
  const [subjectTeacherClassIds, setSubjectTeacherClassIds] = useState<
    string[]
  >([]);
  // Track class teacher's class+subject pairs for proper filtering (secondary grades)
  const [classTeacherAssignments, setClassTeacherAssignments] = useState<
    SubjectTeacherAssignment[]
  >([]);
  // Track subject teacher's class+subject pairs for proper filtering
  const [subjectTeacherAssignments, setSubjectTeacherAssignments] = useState<
    SubjectTeacherAssignment[]
  >([]);

  // All selections derived from URL - URL is the single source of truth
  const selectedAssessmentId = searchParams.get("assessmentId");
  const selectedTermId = searchParams.get("termId") || "";
  const selectedClassId = searchParams.get("classId") || "all";
  const selectedExamType = searchParams.get("examType") || "all";
  const activeTab = (searchParams.get("tab") || "class-teacher") as "class-teacher" | "subject-teacher";

  // Helper to update URL params
  const updateURLParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Fetch terms and classes
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch terms
        const termsData = await api.get("/terms");
        const terms = termsData.data || [];
        setTerms(terms);

        // Default to active term if no term is selected
        if (!selectedTermId) {
          const activeTerm = terms.find((t: Term) => t.isActive);
          if (activeTerm) {
            updateURLParam("termId", activeTerm.id);
          }
        }

        // Fetch teacher's classes (both class teacher AND subject teacher)
        const classesResponse = await api.get("/teacher/classes");
        const classesData = classesResponse.data || {};
        const allTeacherClasses: ClassData[] = [];
        const ctClassIds: string[] = [];
        const stClassIds: string[] = [];

        // Add class teacher classes
        // For PRIMARY: class teacher teaches all subjects
        // For SECONDARY: class teacher teaches a specific subject (teachingSubjectId)
        const ctAssignments: SubjectTeacherAssignment[] = [];
        if (classesData.classTeacherClasses) {
          classesData.classTeacherClasses.forEach((c: any) => {
            allTeacherClasses.push({
              id: c.id,
              name: c.name,
              grade: c.gradeLevel,
              teachingSubjectId: c.teachingSubjectId,
            });
            ctClassIds.push(c.id);
            // Track class+subject pair for filtering (secondary grades have teachingSubjectId)
            if (c.teachingSubjectId) {
              ctAssignments.push({
                classId: c.id,
                subjectId: c.teachingSubjectId,
              });
            }
          });
        }

        // Add subject teacher classes (secondary bracket - teaches specific subjects)
        // Also track the class+subject pairs for proper assessment filtering
        const stAssignments: SubjectTeacherAssignment[] = [];
        if (classesData.subjectTeacherClasses) {
          classesData.subjectTeacherClasses.forEach((c: any) => {
            // Avoid duplicates if teacher is both class teacher AND subject teacher for same class
            if (!allTeacherClasses.find((cls) => cls.id === c.id)) {
              allTeacherClasses.push({
                id: c.id,
                name: c.name,
                grade: c.gradeLevel,
                teachingSubjectId: c.teachingSubjectId,
              });
            }
            stClassIds.push(c.id);
            // Track the class+subject pair for filtering assessments
            if (c.teachingSubjectId) {
              stAssignments.push({
                classId: c.id,
                subjectId: c.teachingSubjectId,
              });
            }
          });
        }

        setClasses(allTeacherClasses);
        setClassTeacherClassIds(ctClassIds);
        setSubjectTeacherClassIds(stClassIds);
        setClassTeacherAssignments(ctAssignments);
        setSubjectTeacherAssignments(stAssignments);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast({
          title: "Error",
          description: "Failed to load data",
          variant: "destructive",
        });
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch assessments when filters change (NOT when tab changes - tabs just filter existing data)
  useEffect(() => {
    if (selectedTermId) {
      fetchAssessments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTermId, selectedClassId, selectedExamType]);

  // Helper to update URL with selected assessment
  const updateURL = (assessmentId: string | null) => {
    updateURLParam("assessmentId", assessmentId);
  };

  // Helper functions for selectors
  const setSelectedTermId = (termId: string) => {
    updateURLParam("termId", termId);
  };

  const setSelectedClassId = (classId: string) => {
    updateURLParam("classId", classId);
  };

  const setSelectedExamType = (examType: string) => {
    updateURLParam("examType", examType);
  };

  const setActiveTab = (tab: "class-teacher" | "subject-teacher") => {
    updateURLParam("tab", tab);
  };

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ termId: selectedTermId });

      if (selectedClassId !== "all") {
        params.append("classId", selectedClassId);
      }

      if (selectedExamType !== "all") {
        params.append("examType", selectedExamType);
      }

      const result = await api.get(`/assessments?${params.toString()}`);
      const assessmentsData = result.data || [];
      setAssessments(assessmentsData);
    } catch (error: any) {
      console.error("Error fetching assessments:", error);
      toast({
        title: "Failed to Load Assessments",
        description:
          error.message || "Could not fetch assessments. Please try again.",
        variant: "destructive",
      });
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      await api.delete(`/assessments/${pendingDeleteId}`);

      toast({
        title: "Assessment Deleted",
        description: "The assessment has been successfully removed.",
      });

      if (selectedAssessmentId === pendingDeleteId) {
        updateURL(null);
      }

      fetchAssessments();
    } catch (error: any) {
      console.error("Error deleting assessment:", error);
      toast({
        title: "Failed to Delete",
        description:
          error.message || "Could not delete assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    }
  };

  const handlePublishClick = (id: string) => {
    setPendingPublishId(id);
    setPublishDialogOpen(true);
  };

  const confirmPublish = async () => {
    if (!pendingPublishId) return;

    try {
      await api.post(`/assessments/${pendingPublishId}/publish`, {});

      toast({
        title: "Assessment Published",
        description: "The assessment is now live and ready for result entry.",
      });

      fetchAssessments();
    } catch (error: any) {
      console.error("Error publishing assessment:", error);
      toast({
        title: "Failed to Publish",
        description:
          error.message || "Could not publish assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPublishDialogOpen(false);
      setPendingPublishId(null);
    }
  };

  const handleCompleteClick = (id: string) => {
    setPendingCompleteId(id);
    setCompleteDialogOpen(true);
  };

  const confirmComplete = async () => {
    if (!pendingCompleteId) return;

    try {
      await api.post(`/assessments/${pendingCompleteId}/complete`, {});

      toast({
        title: "Assessment Completed",
        description: "The assessment has been marked as completed and can now be used for report card generation.",
      });

      fetchAssessments();
    } catch (error: any) {
      console.error("Error completing assessment:", error);
      toast({
        title: "Failed to Complete",
        description:
          error.message || "Could not complete assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCompleteDialogOpen(false);
      setPendingCompleteId(null);
    }
  };

  const handleBulkDeleteClick = () => {
    const draftAssessments = displayedAssessments.filter(
      (a) => a.status === "DRAFT"
    );

    if (draftAssessments.length === 0) {
      toast({
        title: "No Drafts",
        description: "There are no draft assessments to delete.",
      });
      return;
    }

    setBulkDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    const draftAssessments = displayedAssessments.filter(
      (a) => a.status === "DRAFT"
    );

    try {
      let successCount = 0;
      let failCount = 0;

      for (const assessment of draftAssessments) {
        try {
          await api.delete(`/assessments/${assessment.id}`);
          successCount++;
        } catch (error) {
          console.error(`Failed to delete assessment ${assessment.id}:`, error);
          failCount++;
        }
      }

      toast({
        title: successCount > 0 ? "Drafts Deleted" : "Delete Failed",
        description: `Successfully deleted ${successCount} draft(s).${
          failCount > 0 ? ` ${failCount} failed.` : ""
        }`,
        variant: successCount > 0 ? "default" : "destructive",
      });

      updateURL(null);
      fetchAssessments();
    } catch (error: any) {
      console.error("Error deleting drafts:", error);
      toast({
        title: "Failed to Delete Drafts",
        description:
          error.message ||
          "Could not delete draft assessments. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DRAFT":
        return (
          <Badge variant="outline" className="border-muted-foreground/50">
            Draft
          </Badge>
        );
      case "PUBLISHED":
        return <Badge variant="default">Published</Badge>;
      case "COMPLETED":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getExamTypeBadge = (examType: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
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
      <Badge variant={variants[examType] || "outline"}>
        {labels[examType] || examType}
      </Badge>
    );
  };

  // Filter assessments by tab - based on class teacher vs subject teacher assignments
  // Class Teacher tab: Show assessments for subjects the teacher teaches in their class teacher classes
  // For secondary grades, this is filtered by classId + subjectId
  // For primary grades (no teachingSubjectId), show all assessments for the class
  const classTeacherAssessments = assessments.filter((a) => {
    // Must be a class teacher class
    if (!classTeacherClassIds.includes(a.class.id)) return false;

    // If we have class teacher assignments with subject IDs, filter by them
    if (classTeacherAssignments.length > 0) {
      return classTeacherAssignments.some(
        (cta) => cta.classId === a.class.id && cta.subjectId === a.subject.id
      );
    }
    // Primary grades: class teacher teaches all subjects (no specific assignment)
    return true;
  });

  // Subject Teacher tab: Show assessments for subjects the teacher teaches (not as class teacher)
  // Filter by BOTH classId AND subjectId
  const subjectTeacherAssessments = assessments.filter((a) =>
    subjectTeacherAssignments.some(
      (sta) => sta.classId === a.class.id && sta.subjectId === a.subject.id
    )
  );

  const displayedAssessments =
    activeTab === "class-teacher"
      ? classTeacherAssessments
      : subjectTeacherAssessments;

  // Auto-select first assessment only if current selection is invalid
  useEffect(() => {
    if (displayedAssessments.length === 0) return;

    const exists = displayedAssessments.some(
      (a) => a.id === selectedAssessmentId
    );

    if (!exists) {
      updateURL(displayedAssessments[0].id);
    }
  }, [displayedAssessments, selectedAssessmentId]);

  const selectedAssessment = displayedAssessments.find(
    (a) => a.id === selectedAssessmentId
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mt-2">
        <div>
          <h1 className="text-xl font-bold">Assessments</h1>
          <p className="text-muted-foreground text-sm">
            Manage CAT, Mid-Term, and End of Term assessments
          </p>
        </div>
      </div>

      {/* Two-Card Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT CARD: Assessment Details */}
        <Card className="lg:col-span-2 flex flex-col h-[calc(100vh-12rem)]">
          {selectedAssessment ? (
            <>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getExamTypeBadge(selectedAssessment.examType)}
                      {getStatusBadge(selectedAssessment.status)}
                    </div>
                    <CardTitle className="text-xl">
                      {selectedAssessment.subject.name} -{" "}
                      {selectedAssessment.examType}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedAssessment.class.grade.name}{" "}
                      {selectedAssessment.class.name}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="flex-1 overflow-y-auto space-y-6 pt-6">
                {/* Assessment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span className="text-sm">Subject</span>
                    </div>
                    <p className="font-medium">
                      {selectedAssessment.subject.name} (
                      {selectedAssessment.subject.code})
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      <span className="text-sm">Class</span>
                    </div>
                    <p className="font-medium">
                      {selectedAssessment.class.grade.name}{" "}
                      {selectedAssessment.class.name}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Total Marks</span>
                    </div>
                    <p className="font-medium">
                      {selectedAssessment.totalMarks}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Pass Mark</span>
                    </div>
                    <p className="font-medium">{selectedAssessment.passMark}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Weight</span>
                    </div>
                    <p className="font-medium">{selectedAssessment.weight}</p>
                  </div>

                  {selectedAssessment.assessmentDate && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-sm">Assessment Date</span>
                      </div>
                      <p className="font-medium">
                        {new Date(
                          selectedAssessment.assessmentDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Results Summary */}
                <div>
                  <h3 className="font-semibold mb-2">Results Summary</h3>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Results Entered
                      </span>
                      <span className="font-semibold">
                        {selectedAssessment._count.results}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <Separator />

              <div className="p-6 space-y-2">
                {selectedAssessment.status === "DRAFT" ? (
                  <>
                    <Button
                      className="w-full"
                      onClick={() => handlePublishClick(selectedAssessment.id)}>
                      <Send className="h-4 w-4 mr-2" />
                      Publish Assessment
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteClick(selectedAssessment.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Draft
                    </Button>
                  </>
                ) : selectedAssessment.status === "PUBLISHED" ? (
                  <>
                    <Button
                      className="w-full"
                      onClick={() =>
                        router.push(
                          `/teacher/assessments/${selectedAssessment.id}/enter-results`
                        )
                      }>
                      <ClipboardEdit className="h-4 w-4 mr-2" />
                      Enter Marks
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleCompleteClick(selectedAssessment.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Completed
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() =>
                      router.push(
                        `/teacher/assessments/${selectedAssessment.id}/enter-results`
                      )
                    }>
                    <ClipboardEdit className="h-4 w-4 mr-2" />
                    View Results
                  </Button>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    router.push(`/teacher/assessments/${selectedAssessment.id}`)
                  }>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </>
          ) : (
            <Empty className="h-full">
              <EmptyContent>
                <EmptyMedia>
                  <FileText className="h-6 w-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No assessment selected</EmptyTitle>
                  <EmptyDescription>
                    Select an assessment from the list to view details and enter
                    marks
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          )}
        </Card>

        {/* RIGHT CARD: Assessment List */}
        <Card className="lg:col-span-3 flex flex-col h-[calc(100vh-12rem)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-3">
              <CardTitle className="text-base">Assessments</CardTitle>
              <div className="flex gap-2">
                {displayedAssessments.filter((a) => a.status === "DRAFT")
                  .length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDeleteClick}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Drafts (
                    {
                      displayedAssessments.filter((a) => a.status === "DRAFT")
                        .length
                    }
                    )
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={() => router.push("/teacher/assessments/new")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assessment
                </Button>
              </div>
            </div>

            {/* Compact Filters - Single Row */}
            <div className="grid grid-cols-3 gap-2">
              <Select value={selectedTermId} onValueChange={setSelectedTermId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.academicYear.year} -{" "}
                      {term.termType.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedClassId}
                onValueChange={setSelectedClassId}
                disabled={activeTab === "class-teacher"}>
                <SelectTrigger
                  className={cn(
                    "h-9 text-sm",
                    activeTab === "class-teacher" &&
                      "opacity-50 cursor-not-allowed"
                  )}>
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All classes</SelectItem>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.grade} {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedExamType}
                onValueChange={setSelectedExamType}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All exam types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All exam types</SelectItem>
                  <SelectItem value="CAT">CAT</SelectItem>
                  <SelectItem value="MID">Mid-Term</SelectItem>
                  <SelectItem value="EOT">End of Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="flex-1 overflow-hidden p-0">
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as any)}
              className="h-full flex flex-col">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="class-teacher" className="flex-1">
                  Class Teacher
                </TabsTrigger>
                <TabsTrigger value="subject-teacher" className="flex-1">
                  Subject Teacher
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="class-teacher" className="m-0 p-4">
                  {loading ? (
                    <div className="space-y-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg border animate-pulse">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="h-5 bg-muted rounded w-20"></div>
                              <div className="h-3 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : classTeacherAssessments.length === 0 ? (
                    <Empty className="h-64">
                      <EmptyContent>
                        <EmptyMedia>
                          <FileText className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>No class teacher assessments</EmptyTitle>
                          <EmptyDescription>
                            No assessments found for classes where you teach all
                            subjects
                          </EmptyDescription>
                        </EmptyHeader>
                      </EmptyContent>
                    </Empty>
                  ) : (
                    <div className="space-y-1.5">
                      {classTeacherAssessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          onClick={() => updateURL(assessment.id)}
                          className={cn(
                            "p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                            selectedAssessmentId === assessment.id &&
                              "bg-muted border-primary"
                          )}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {assessment.subject.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {assessment.class.grade.name}{" "}
                                {assessment.class.name}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                {getExamTypeBadge(assessment.examType)}
                                {getStatusBadge(assessment.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {assessment._count.results} students
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="subject-teacher" className="m-0 p-4">
                  {loading ? (
                    <div className="space-y-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg border animate-pulse">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-muted rounded w-3/4"></div>
                              <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="h-5 bg-muted rounded w-20"></div>
                              <div className="h-3 bg-muted rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : subjectTeacherAssessments.length === 0 ? (
                    <Empty className="h-64">
                      <EmptyContent>
                        <EmptyMedia>
                          <FileText className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyHeader>
                          <EmptyTitle>
                            No subject teacher assessments
                          </EmptyTitle>
                          <EmptyDescription>
                            No assessments found for classes where you teach
                            specific subjects
                          </EmptyDescription>
                        </EmptyHeader>
                      </EmptyContent>
                    </Empty>
                  ) : (
                    <div className="space-y-1.5">
                      {subjectTeacherAssessments.map((assessment) => (
                        <div
                          key={assessment.id}
                          onClick={() => updateURL(assessment.id)}
                          className={cn(
                            "p-2.5 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50",
                            selectedAssessmentId === assessment.id &&
                              "bg-muted border-primary"
                          )}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {assessment.subject.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {assessment.class.grade.name}{" "}
                                {assessment.class.name}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-2">
                                {getExamTypeBadge(assessment.examType)}
                                {getStatusBadge(assessment.status)}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {assessment._count.results} students
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this draft assessment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this assessment? Once published,
              teachers can start entering results and the assessment cannot be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPublish}>
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation Dialog */}
      <AlertDialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this assessment as completed? This
              indicates that all results have been entered and the assessment
              data can be used for report card generation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmComplete}>
              Mark as Completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete All Draft Assessments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete all{" "}
              {displayedAssessments.filter((a) => a.status === "DRAFT").length}{" "}
              draft assessment(s)? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
