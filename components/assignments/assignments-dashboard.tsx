"use client";

import { useState } from "react";
import {
  Grid3X3,
  Users,
  BookOpen,
  GraduationCap,
  Search,
  PanelRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

import { AssignmentMatrix } from "./assignment-matrix";
import { WorkloadPanel } from "./workload-panel";
import { ViewByClass } from "./view-by-class";
import { ViewByTeacher } from "./view-by-teacher";
import { ViewBySubject } from "./view-by-subject";
import { ActivityLog } from "./activity-log";
import { FloatingActions } from "./floating-actions";
import { AssignmentModal } from "./assignment-modal";
import { CurriculumAssignmentModal } from "./curriculum-assignment-modal";
import {
  AssignmentTeacher,
  AssignmentSubject,
  AssignmentClass,
  Assignment,
  ActivityLogItem,
  Term,
  CurriculumItem,
  AssignableTeacher,
} from "./types";

interface AssignmentsDashboardProps {
  teachers: AssignmentTeacher[];
  subjects: AssignmentSubject[];
  classes: AssignmentClass[];
  assignments: Assignment[];
  activities: ActivityLogItem[];
  terms: Term[];
  currentTermId: string;
  departmentName?: string;
  onAssign: (subjectId: string, classId: string, teacherId: string) => void;
  onTermChange?: (termId: string) => void;
  isLoading?: boolean;
  // Curriculum-based assignment props
  curriculum?: CurriculumItem[];
  assignableTeachers?: AssignableTeacher[];
  onCurriculumAssign?: (classSubjectId: string, teacherId: string) => Promise<void>;
}

export function AssignmentsDashboard({
  teachers,
  subjects,
  classes,
  assignments,
  activities,
  terms,
  currentTermId,
  departmentName = "Department",
  onAssign,
  onTermChange,
  isLoading = false,
  curriculum = [],
  assignableTeachers = [],
  onCurriculumAssign,
}: AssignmentsDashboardProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState(currentTermId);
  const [showWorkloadSheet, setShowWorkloadSheet] = useState(false);
  const [activeTab, setActiveTab] = useState("matrix");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCurriculumModal, setShowCurriculumModal] = useState(false);
  const [isCurriculumAssigning, setIsCurriculumAssigning] = useState(false);

  // Determine if we should use curriculum-based assignment
  const useCurriculumMode = curriculum.length > 0 && onCurriculumAssign;

  const handleTermChange = (termId: string) => {
    setSelectedTerm(termId);
    onTermChange?.(termId);
  };

  const handleAssign = (
    subjectId: string,
    classId: string,
    teacherId: string
  ) => {
    onAssign(subjectId, classId, teacherId);

    const teacher = teachers.find((t) => t.id === teacherId);
    const subject = subjects.find((s) => s.id === subjectId);
    const cls = classes.find((c) => c.id === classId);

    toast({
      title: "Assignment Updated",
      description: `${teacher?.name} assigned to ${subject?.name} for ${cls?.grade} ${cls?.name}`,
    });
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being generated...",
    });
  };

  // Handler for curriculum-based assignment
  const handleCurriculumAssign = async (classSubjectId: string, teacherId: string) => {
    if (!onCurriculumAssign) return;

    setIsCurriculumAssigning(true);
    try {
      await onCurriculumAssign(classSubjectId, teacherId);

      const curriculumItem = curriculum.find((c) => c.classSubjectId === classSubjectId);
      const teacher = assignableTeachers.find((t) => t.id === teacherId);

      if (curriculumItem && teacher) {
        toast({
          title: "Assignment Updated",
          description: `${teacher.name} assigned to ${curriculumItem.subject.name} for ${curriculumItem.class.grade.name} ${curriculumItem.class.name}`,
        });
      }
    } catch (error) {
      console.error("Curriculum assignment failed:", error);
      toast({
        title: "Assignment Failed",
        description: error instanceof Error ? error.message : "Failed to assign teacher",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCurriculumAssigning(false);
    }
  };

  // Handler for opening the appropriate assign modal
  const handleOpenAssignModal = () => {
    if (useCurriculumMode) {
      setShowCurriculumModal(true);
    } else {
      setShowAssignModal(true);
    }
  };

  // Filter data based on search
  const filteredClasses = classes.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubjects = subjects.filter((subject) =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats for header cards
  const stats = {
    totalAssignments: assignments.length,
    assignedCount: assignments.filter((a) => a.teacherId).length,
    unassignedCount: assignments.filter((a) => !a.teacherId).length,
    teacherCount: teachers.length,
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-card border-b border-border">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Teaching Assignments
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {departmentName} • Manage teacher-subject-class assignments
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[280px] max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search teacher, class, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedTerm} onValueChange={handleTermChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {terms.map((term) => (
                    <SelectItem key={term.id} value={term.id}>
                      {term.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Assignments"
              value={stats.totalAssignments}
              icon={Grid3X3}
              color="primary"
            />
            <StatCard
              label="Assigned"
              value={stats.assignedCount}
              icon={GraduationCap}
              color="success"
            />
            <StatCard
              label="Unassigned"
              value={stats.unassignedCount}
              icon={BookOpen}
              color="destructive"
            />
            <StatCard
              label="Teachers"
              value={stats.teacherCount}
              icon={Users}
              color="accent"
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <TabsList className="bg-secondary/50">
                  <TabsTrigger
                    value="matrix"
                    className="data-[state=active]:bg-card"
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Matrix View
                  </TabsTrigger>
                  <TabsTrigger
                    value="class"
                    className="data-[state=active]:bg-card"
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    By Class
                  </TabsTrigger>
                  <TabsTrigger
                    value="teacher"
                    className="data-[state=active]:bg-card"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    By Teacher
                  </TabsTrigger>
                  <TabsTrigger
                    value="subject"
                    className="data-[state=active]:bg-card"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    By Subject
                  </TabsTrigger>
                </TabsList>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWorkloadSheet(true)}
                >
                  <PanelRight className="h-4 w-4 mr-2" />
                  Workload & Activity
                </Button>
              </div>

              <Card className="border-border">
                <TabsContent value="matrix" className="m-0">
                  <AssignmentMatrix
                    subjects={searchQuery ? filteredSubjects : subjects}
                    classes={searchQuery ? filteredClasses : classes}
                    teachers={teachers}
                    assignments={assignments}
                    onAssign={handleAssign}
                    isLoading={isLoading}
                  />
                </TabsContent>

                <TabsContent value="class" className="m-0 p-4">
                  <ViewByClass
                    classes={searchQuery ? filteredClasses : classes}
                    subjects={subjects}
                    teachers={teachers}
                    assignments={assignments}
                  />
                </TabsContent>

                <TabsContent value="teacher" className="m-0 p-4">
                  <ViewByTeacher
                    teachers={searchQuery ? filteredTeachers : teachers}
                    subjects={subjects}
                    classes={classes}
                    assignments={assignments}
                  />
                </TabsContent>

                <TabsContent value="subject" className="m-0 p-4">
                  <ViewBySubject
                    subjects={searchQuery ? filteredSubjects : subjects}
                    classes={classes}
                    teachers={teachers}
                    assignments={assignments}
                  />
                </TabsContent>
              </Card>
            </Tabs>
          </div>
        </main>

        {/* Workload & Activity Sheet */}
        <Sheet open={showWorkloadSheet} onOpenChange={setShowWorkloadSheet}>
          <SheetContent className="w-[400px] sm:w-[450px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Workload & Activity</SheetTitle>
            </SheetHeader>
            <Tabs defaultValue="workload" className="h-[calc(100vh-80px)] flex flex-col">
              <TabsList className="mx-4 mt-4 bg-secondary/50">
                <TabsTrigger value="workload" className="flex-1 text-xs">
                  Workload Summary
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex-1 text-xs">
                  Activity Log
                </TabsTrigger>
              </TabsList>
              <TabsContent value="workload" className="flex-1 mt-0 overflow-auto">
                <WorkloadPanel teachers={teachers} />
              </TabsContent>
              <TabsContent value="activity" className="flex-1 mt-0 overflow-auto">
                <ActivityLog activities={activities} />
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>

        {/* Floating Action Buttons */}
        <FloatingActions
          onAssignClick={handleOpenAssignModal}
          onExportClick={handleExport}
        />

        {/* Modals */}
        <AssignmentModal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          subjects={subjects}
          classes={classes}
          teachers={teachers}
          onAssign={handleAssign}
        />

        {/* Curriculum-based Assignment Modal */}
        {useCurriculumMode && (
          <CurriculumAssignmentModal
            open={showCurriculumModal}
            onClose={() => setShowCurriculumModal(false)}
            curriculum={curriculum}
            teachers={assignableTeachers}
            onAssign={handleCurriculumAssign}
            isLoading={isCurriculumAssigning}
          />
        )}
      </div>
    </TooltipProvider>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: "primary" | "success" | "destructive" | "accent";
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-500",
    destructive: "bg-destructive/10 text-destructive",
    accent: "bg-blue-500/10 text-blue-500",
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 transition-all hover:shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
        </div>
        <div
          className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            colorClasses[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
