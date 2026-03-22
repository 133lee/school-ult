"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AssignmentsDashboard } from "@/components/assignments";
import { useToast } from "@/hooks/use-toast";
import type {
  AssignmentTeacher,
  AssignmentSubject,
  AssignmentClass,
  Assignment,
  ActivityLogItem,
  Term,
  CurriculumItem,
  AssignableTeacher,
} from "@/components/assignments/types";

// Interface for academic year
interface AcademicYear {
  id: string;
  year: string;
  isActive: boolean;
}

export default function HodAssignmentsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data state
  const [teachers, setTeachers] = useState<AssignmentTeacher[]>([]);
  const [subjects, setSubjects] = useState<AssignmentSubject[]>([]);
  const [classes, setClasses] = useState<AssignmentClass[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [academicYears, setAcademicYears] = useState<Term[]>([]);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("Department");
  const [activities, setActivities] = useState<ActivityLogItem[]>([]);
  // Curriculum-based data
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [assignableTeachers, setAssignableTeachers] = useState<AssignableTeacher[]>([]);

  const getAuthToken = useCallback(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Authentication token not found. Please log in again.");
    }
    return token;
  }, []);

  const fetchAssignments = useCallback(
    async (academicYearId: string) => {
      try {
        const token = getAuthToken();

        const response = await fetch(
          `/api/hod/assignments?academicYearId=${academicYearId}&pageSize=500`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to fetch assignments");
        }

        const result = await response.json();
        if (result.success) {
          const data = result.data?.data || result.data || [];
          const mappedAssignments: Assignment[] = data.map((a: any) => ({
            id: a.id,
            teacherId: a.teacherId,
            subjectId: a.subjectId,
            classId: a.classId,
            termId: a.academicYearId || academicYearId,
            assignedDate: a.createdAt
              ? new Date(a.createdAt).toISOString().split("T")[0]
              : null,
          }));
          setAssignments(mappedAssignments);
        }
      } catch (err) {
        console.error("Error fetching assignments:", err);
      }
    },
    [getAuthToken]
  );

  // Fetch curriculum (ClassSubjects) for HOD's department
  const fetchCurriculum = useCallback(
    async (academicYearId: string) => {
      try {
        const token = getAuthToken();

        const response = await fetch(
          `/api/hod/curriculum?academicYearId=${academicYearId}&includeAssignments=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to fetch curriculum:", errorData.error);
          return;
        }

        const result = await response.json();
        if (result.success) {
          setCurriculum(result.data.curriculum || []);
          // Map teachers to AssignableTeacher format
          const mappedTeachers: AssignableTeacher[] = (result.data.teachers || []).map(
            (t: any) => ({
              id: t.id,
              name: `${t.firstName} ${t.lastName}`,
              staffNumber: t.staffNumber || "",
              email: t.user?.email || "",
              phone: t.phone || "",
              departmentId: t.departmentId,
              currentPeriodsPerWeek: t.periodsPerWeek || 0,
              maxPeriodsPerWeek: t.maxPeriodsPerWeek || 30,
              isOverloaded: (t.periodsPerWeek || 0) >= (t.maxPeriodsPerWeek || 30),
              availableCapacity: Math.max(0, (t.maxPeriodsPerWeek || 30) - (t.periodsPerWeek || 0)),
              qualifiedSubjectIds: t.qualifiedSubjectIds || [],
            })
          );
          setAssignableTeachers(mappedTeachers);
        }
      } catch (err) {
        console.error("Error fetching curriculum:", err);
      }
    },
    [getAuthToken]
  );

  useEffect(() => {
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentAcademicYearId) {
      fetchAssignments(currentAcademicYearId);
      fetchCurriculum(currentAcademicYearId);
    }
  }, [currentAcademicYearId, fetchAssignments, fetchCurriculum]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();

      // Fetch HOD profile, teachers, subjects, classes, and academic years in parallel
      const [profileRes, teachersRes, subjectsRes, classesRes, yearsRes] =
        await Promise.all([
          fetch("/api/hod/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/hod/teachers?mode=all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/hod/subjects?mode=all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/classes?mode=all", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/academic-years", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      // Parse profile
      if (profileRes.ok) {
        const profileResult = await profileRes.json();
        if (profileResult.success && profileResult.data?.department) {
          setDepartmentName(profileResult.data.department.name + " Department");
        }
      }

      // Parse teachers
      if (teachersRes.ok) {
        const teachersResult = await teachersRes.json();
        if (teachersResult.success) {
          const teachersData =
            teachersResult.data?.data || teachersResult.data || [];
          const mappedTeachers: AssignmentTeacher[] = teachersData.map(
            (t: any) => ({
              id: t.id,
              name: `${t.firstName} ${t.lastName}`,
              email: t.user?.email || t.email || "",
              phone: t.phone || "",
              departmentId: t.departmentId,
              totalClasses: t._count?.subjectTeacherAssignments || 0,
              periodsPerWeek: (t._count?.subjectTeacherAssignments || 0) * 5, // Estimate: 5 periods per assignment
              maxPeriods: 30, // Default max periods per week
            })
          );
          setTeachers(mappedTeachers);
        }
      } else {
        console.error("Failed to fetch teachers:", teachersRes.status);
      }

      // Parse subjects
      if (subjectsRes.ok) {
        const subjectsResult = await subjectsRes.json();
        if (subjectsResult.success) {
          const subjectsData =
            subjectsResult.data?.data || subjectsResult.data || [];
          const mappedSubjects: AssignmentSubject[] = subjectsData.map(
            (s: any) => ({
              id: s.id,
              name: s.name,
              code: s.code,
              departmentId: s.departmentId,
              color: "", // Will use default colors
            })
          );
          setSubjects(mappedSubjects);
        }
      } else {
        console.error("Failed to fetch subjects:", subjectsRes.status);
      }

      // Parse classes - filter to secondary grades only (8-12)
      if (classesRes.ok) {
        const classesResult = await classesRes.json();
        if (classesResult.success) {
          const classesData =
            classesResult.data?.data || classesResult.data || [];
          const secondaryGrades = [
            "GRADE_8",
            "GRADE_9",
            "GRADE_10",
            "GRADE_11",
            "GRADE_12",
            "8",
            "9",
            "10",
            "11",
            "12",
          ];
          const mappedClasses: AssignmentClass[] = classesData
            .filter((c: any) => {
              const gradeLevel = c.grade?.level || c.gradeLevel?.level || "";
              const gradeName = c.grade?.name || c.gradeLevel?.name || "";
              return secondaryGrades.some(
                (g) => gradeLevel.includes(g) || gradeName.includes(g)
              );
            })
            .map((c: any) => ({
              id: c.id,
              name: c.name,
              grade: c.grade?.name || c.gradeLevel?.name || "",
              section: c.section || "A",
            }));
          setClasses(mappedClasses);
        }
      } else {
        console.error("Failed to fetch classes:", classesRes.status);
      }

      // Parse academic years
      if (yearsRes.ok) {
        const yearsResult = await yearsRes.json();
        if (yearsResult.success) {
          const yearsData = yearsResult.data || [];
          const mappedYears: Term[] = yearsData.map((y: AcademicYear) => ({
            id: y.id,
            name: y.year,
            academicYearId: y.id,
            startDate: "",
            endDate: "",
          }));
          setAcademicYears(mappedYears);

          // Set active academic year as default
          const activeYear = yearsData.find((y: AcademicYear) => y.isActive);
          if (activeYear) {
            setCurrentAcademicYearId(activeYear.id);
          } else if (mappedYears.length > 0) {
            setCurrentAcademicYearId(mappedYears[0].id);
          }
        }
      } else {
        console.error("Failed to fetch academic years:", yearsRes.status);
      }
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (
    subjectId: string,
    classId: string,
    teacherId: string
  ) => {
    try {
      const token = getAuthToken();

      // Check if assignment already exists
      const existingAssignment = assignments.find(
        (a) => a.subjectId === subjectId && a.classId === classId
      );

      if (existingAssignment) {
        // Update existing assignment
        const response = await fetch(
          `/api/hod/assignments/${existingAssignment.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ teacherId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update assignment");
        }
      } else {
        // Create new assignment
        const response = await fetch("/api/hod/assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teacherId,
            subjectId,
            classId,
            academicYearId: currentAcademicYearId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create assignment");
        }
      }

      // Refresh assignments
      await fetchAssignments(currentAcademicYearId);

      // Add to activity log
      const teacher = teachers.find((t) => t.id === teacherId);
      const subject = subjects.find((s) => s.id === subjectId);
      const cls = classes.find((c) => c.id === classId);

      if (teacher && subject && cls) {
        setActivities((prev) => [
          {
            id: Date.now().toString(),
            action: existingAssignment ? "reassigned" : "assigned",
            teacherName: teacher.name,
            className: `${cls.grade} ${cls.name}`,
            subjectName: subject.name,
            timestamp: "Just now",
          },
          ...prev.slice(0, 19), // Keep last 20 activities
        ]);
      }
    } catch (err) {
      console.error("Error assigning teacher:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to assign teacher",
        variant: "destructive",
      });
      throw err;
    }
  };

  const handleAcademicYearChange = (yearId: string) => {
    setCurrentAcademicYearId(yearId);
  };

  // Curriculum-based assignment handler
  const handleCurriculumAssign = async (classSubjectId: string, teacherId: string) => {
    const token = getAuthToken();

    // Find the curriculum item to get subject/class info
    const curriculumItem = curriculum.find((c) => c.classSubjectId === classSubjectId);
    if (!curriculumItem) {
      throw new Error("Curriculum item not found");
    }

    // Check if assignment already exists for this classSubject
    const existingAssignment = curriculumItem.currentAssignment;

    try {
      if (existingAssignment) {
        // Update existing assignment
        const response = await fetch(
          `/api/hod/assignments/${existingAssignment.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ teacherId }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update assignment");
        }
      } else {
        // Create new assignment using classSubjectId
        const response = await fetch("/api/hod/assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            teacherId,
            subjectId: curriculumItem.subject.id,
            classId: curriculumItem.class.id,
            academicYearId: currentAcademicYearId,
            classSubjectId, // Pass the classSubjectId for direct linking
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to create assignment");
        }
      }

      // Refresh both assignments and curriculum
      await Promise.all([
        fetchAssignments(currentAcademicYearId),
        fetchCurriculum(currentAcademicYearId),
      ]);

      // Add to activity log
      const teacher = assignableTeachers.find((t) => t.id === teacherId);
      if (teacher && curriculumItem) {
        setActivities((prev) => [
          {
            id: Date.now().toString(),
            action: existingAssignment ? "reassigned" : "assigned",
            teacherName: teacher.name,
            className: `${curriculumItem.class.grade.name} ${curriculumItem.class.name}`,
            subjectName: curriculumItem.subject.name,
            timestamp: "Just now",
          },
          ...prev.slice(0, 19),
        ]);
      }
    } catch (err) {
      console.error("Error in curriculum assignment:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to assign teacher",
        variant: "destructive",
      });
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <AssignmentsDashboard
      teachers={teachers}
      subjects={subjects}
      classes={classes}
      assignments={assignments}
      activities={activities}
      terms={academicYears}
      currentTermId={currentAcademicYearId}
      departmentName={departmentName}
      onAssign={handleAssign}
      onTermChange={handleAcademicYearChange}
      isLoading={loading}
      // Curriculum-based assignment props
      curriculum={curriculum}
      assignableTeachers={assignableTeachers}
      onCurriculumAssign={handleCurriculumAssign}
    />
  );
}
