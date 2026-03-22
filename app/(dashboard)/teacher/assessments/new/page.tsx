"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api-client";
import { AssessmentWizard } from "@/components/assessments/assessment-wizard";

/**
 * Create Assessment Page
 * Uses the wizard component matching student creation flow
 */

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
}

interface Term {
  id: string;
  termType: string;
  isActive: boolean;
  academicYear: {
    year: number;
  };
}

export default function CreateAssessmentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch teacher's assigned subjects and classes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch teacher's assigned classes (which includes subjects)
        const teacherResponse = await api.get("/teacher/students?view=subject-teacher");
        const teacherData = teacherResponse.data;

        // Fetch active term
        const termsResponse = await api.get("/terms");
        const activeTermData = termsResponse.data?.find((t: Term) => t.isActive);

        if (activeTermData) {
          setActiveTerm(activeTermData);
        } else {
          toast({
            title: "Error",
            description: "No active term found",
            variant: "destructive",
          });
          router.push("/teacher/assessments");
          return;
        }

        if (teacherData?.view === "subject-teacher" && teacherData?.classes) {
          // Extract unique subjects from teacher's assignments
          const uniqueSubjects = new Map<string, Subject>();
          teacherData.classes.forEach((c: any) => {
            if (c.subjectId && !uniqueSubjects.has(c.subjectId)) {
              uniqueSubjects.set(c.subjectId, {
                id: c.subjectId,
                name: c.subject,
                code: c.subjectCode,
              });
            }
          });
          setSubjects(Array.from(uniqueSubjects.values()));

          // Extract unique classes from teacher's assignments
          const uniqueClasses = new Map<string, Class>();
          teacherData.classes.forEach((c: any) => {
            if (!uniqueClasses.has(c.id)) {
              uniqueClasses.set(c.id, {
                id: c.id,
                name: c.name,
                grade: c.grade,
              });
            }
          });
          setClasses(Array.from(uniqueClasses.values()));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Auto-generate title based on exam type
      const examTypeLabels: Record<string, string> = {
        CAT: "CAT",
        MID: "Mid-Term Exam",
        EOT: "End of Term Exam",
      };
      const title = examTypeLabels[data.examType] || data.examType;

      const response = await api.post("/assessments", {
        title,
        description: null,
        subjectId: data.subjectId,
        classId: data.classId,
        termId: data.termId,
        examType: data.examType,
        totalMarks: data.totalMarks,
        passMark: data.passMark,
        weight: data.weight,
        assessmentDate: data.assessmentDate ? data.assessmentDate.toISOString() : undefined,
      });

      toast({
        title: "Success",
        description: "Assessment created successfully",
      });

      router.push("/teacher/assessments");
    } catch (error: any) {
      console.error("Error creating assessment:", error);
      const errorMessage = error.message || "Failed to create assessment";
      toast({
        title: "Failed to Create Assessment",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/teacher/assessments");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!activeTerm) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Create Assessment</h1>
          <p className="text-muted-foreground text-sm">
            Create a new CAT, Mid-Term, or End of Term assessment
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AssessmentWizard
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            classes={classes}
            subjects={subjects}
            termId={activeTerm.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
