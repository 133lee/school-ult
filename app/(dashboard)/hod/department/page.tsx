"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  FileText,
  BarChart3,
  ClipboardList,
  UserCheck,
  X,
  Calendar,
  BookOpen,
  Bell,
  Megaphone,
} from "lucide-react";
import { useHODAuth } from "@/hooks/useHODAuth";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  status: "Active" | "Inactive";
  joinYear: number;
  classes: string[];
}

type ViewType = "overview" | "attendance" | "performance" | "comparison" | "classLists" | "assignments";

export default function HODDepartmentManagement() {
  const { currentHOD, isLoading } = useHODAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeftColumnCollapsed, setIsLeftColumnCollapsed] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("overview");
  const [classSubjectPairs, setClassSubjectPairs] = useState<Record<string, string>>({});
  const [isNoticeDialogOpen, setIsNoticeDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // Department subjects mapping
  const departmentSubjects: Record<string, string[]> = {
    Sciences: ["Mathematics", "Physics", "Chemistry", "Biology"],
    Humanities: ["History", "Geography", "English", "Kiswahili"],
    Languages: ["English", "Kiswahili", "French"],
    Arts: ["Music", "Art", "Drama"],
  };

  // Available classes
  const availableClasses = [
    "Grade 9A",
    "Grade 9B",
    "Grade 10A",
    "Grade 10B",
    "Grade 11A",
    "Grade 11B",
    "Grade 12A",
    "Grade 12B",
  ];

  // Mock all teachers data
  const allTeachers: Teacher[] = [
    {
      id: "t1",
      name: "Dr. Jane Omondi",
      email: "jane.omondi@school.com",
      subjects: ["Mathematics"],
      status: "Active",
      joinYear: 2018,
      classes: ["Grade 9A", "Grade 9B", "Grade 10A"],
    },
    {
      id: "t2",
      name: "Mr. Peter Kipchoge",
      email: "peter.kipchoge@school.com",
      subjects: ["Physics"],
      status: "Active",
      joinYear: 2019,
      classes: ["Grade 9A", "Grade 10B"],
    },
    {
      id: "t3",
      name: "Ms. Alice Njoroge",
      email: "alice.njoroge@school.com",
      subjects: ["Chemistry", "Biology"],
      status: "Active",
      joinYear: 2020,
      classes: ["Grade 10A", "Grade 11B"],
    },
    {
      id: "t4",
      name: "Mr. Solomon Kiplagat",
      email: "solomon.kiplagat@school.com",
      subjects: ["Biology"],
      status: "Active",
      joinYear: 2021,
      classes: ["Grade 9B", "Grade 10B"],
    },
    {
      id: "t5",
      name: "Ms. Grace Mutua",
      email: "grace.mutua@school.com",
      subjects: ["History", "Geography"],
      status: "Active",
      joinYear: 2019,
      classes: ["Grade 9A", "Grade 10A"],
    },
    {
      id: "t6",
      name: "Mr. David Kiplagat",
      email: "david.kiplagat@school.com",
      subjects: ["English"],
      status: "Active",
      joinYear: 2020,
      classes: ["Grade 11A"],
    },
    {
      id: "t7",
      name: "Ms. Sarah Wanjiku",
      email: "sarah.wanjiku@school.com",
      subjects: ["Mathematics", "Physics"],
      status: "Active",
      joinYear: 2017,
      classes: ["Grade 11A", "Grade 11B"],
    },
  ];

  // Mock department members (teachers already in the department)
  const [departmentMemberIds, setDepartmentMemberIds] = useState<string[]>([
    "t1",
    "t2",
    "t3",
    "t4",
    "t7",
  ]);

  const currentDepartment = currentHOD?.department || "Sciences";
  const currentDepartmentSubjects = departmentSubjects[currentDepartment] || [];

  // Get department members
  const departmentMembers = allTeachers.filter((t) =>
    departmentMemberIds.includes(t.id)
  );

  // Get available teachers (not in department but teach department subjects)
  const availableTeachers = allTeachers.filter(
    (teacher) =>
      !departmentMemberIds.includes(teacher.id) &&
      teacher.subjects.some((subject) =>
        currentDepartmentSubjects.includes(subject)
      )
  );

  // Filter based on search
  const filteredMembers = departmentMembers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const filteredAvailable = availableTeachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleAddTeacher = (teacherId: string) => {
    setDepartmentMemberIds([...departmentMemberIds, teacherId]);
  };

  const handleRemoveTeacher = (teacherId: string) => {
    setDepartmentMemberIds(departmentMemberIds.filter((id) => id !== teacherId));
    if (selectedTeacher?.id === teacherId) {
      setSelectedTeacher(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!currentHOD) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Department Management ({currentDepartment})
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage your department members and monitor their performance
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {departmentMembers.length} Members
        </Badge>
      </div>

      {/* Search and Actions Bar */}
      <div className="flex items-center gap-3">
        {/* Compact Search */}
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Department Notice/Event Button */}
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={() => setIsNoticeDialogOpen(true)}
          >
            <Bell className="h-4 w-4" />
            Create Notice
          </Button>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => setIsEventDialogOpen(true)}
          >
            <Calendar className="h-4 w-4" />
            Schedule Event
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex gap-6">
        {/* Left Column - Available Teachers (Collapsible) */}
        <div
          className={cn(
            "transition-all duration-300",
            isLeftColumnCollapsed ? "w-12" : "w-80"
          )}
        >
          {isLeftColumnCollapsed ? (
            <Button
              variant="outline"
              size="icon"
              className="w-full h-12"
              onClick={() => setIsLeftColumnCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Available Teachers
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsLeftColumnCollapsed(true)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Teachers who teach {currentDepartment} subjects
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredAvailable.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">
                    No available teachers
                  </p>
                ) : (
                  filteredAvailable.map((teacher) => (
                    <Card
                      key={teacher.id}
                      className="p-3 hover:shadow-sm transition-shadow"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {teacher.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject) => (
                            <Badge
                              key={subject}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs"
                          onClick={() => handleAddTeacher(teacher.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add to Department
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Department Members */}
        <div className="flex-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                Department Members
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Click on a member to view details and analytics
              </p>
            </CardHeader>
            <CardContent>
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No department members found
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((teacher) => (
                    <Card
                      key={teacher.id}
                      className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setCurrentView("overview");
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-sm truncate">{teacher.name}</h3>
                              <Badge
                                variant={teacher.status === "Active" ? "default" : "secondary"}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {teacher.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <p className="text-xs text-muted-foreground truncate">
                                {teacher.subjects.join(", ")}
                              </p>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {teacher.classes.length} Classes
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTeacher(teacher.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Side Sheet for Teacher Details */}
      <Sheet
        open={selectedTeacher !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedTeacher(null);
            setCurrentView("overview");
          }
        }}
      >
        <SheetContent className="w-full sm:max-w-3xl overflow-y-auto p-0">
          {selectedTeacher && (
            <div className="flex flex-col h-full">
              {/* Header Section with Gradient */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTeacher.name}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTeacher.email}
                    </p>
                  </div>
                  <Badge
                    variant={selectedTeacher.status === "Active" ? "default" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {selectedTeacher.status}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border">
                    <p className="text-xs text-muted-foreground mb-1">Subjects</p>
                    <p className="text-xl font-bold">{selectedTeacher.subjects.length}</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border">
                    <p className="text-xs text-muted-foreground mb-1">Classes</p>
                    <p className="text-xl font-bold">{selectedTeacher.classes.length}</p>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-lg p-3 border">
                    <p className="text-xs text-muted-foreground mb-1">Years</p>
                    <p className="text-xl font-bold">
                      {new Date().getFullYear() - selectedTeacher.joinYear}
                    </p>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 p-6">
                {currentView === "overview" && (
                  <div className="space-y-6">
                    {/* Subjects and Classes Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Teaching Subjects
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeacher.subjects.map((subject) => (
                              <Badge key={subject} variant="outline" className="text-sm">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Assigned Classes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedTeacher.classes.map((className) => (
                              <Badge key={className} variant="secondary" className="text-sm">
                                {className}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Management Actions */}
                    <div>
                      <h3 className="text-sm font-semibold mb-4">Teacher Management</h3>
                      <Card
                        className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50 mb-4"
                        onClick={() => setCurrentView("assignments")}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10">
                              <BookOpen className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">Class Assignments</h4>
                              <p className="text-xs text-muted-foreground">
                                Assign or update classes for this teacher
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Analytics Actions Grid */}
                    <div>
                      <h3 className="text-sm font-semibold mb-4">Teacher Analytics & Reports</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        <Card
                          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                          onClick={() => setCurrentView("attendance")}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-blue-500/10">
                                <Calendar className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">Attendance Sheets</h4>
                                <p className="text-xs text-muted-foreground">
                                  View attendance records per session for all subjects
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                          onClick={() => setCurrentView("performance")}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-green-500/10">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">Performance Analysis</h4>
                                <p className="text-xs text-muted-foreground">
                                  Analysis sheet per test with detailed metrics
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                          onClick={() => setCurrentView("comparison")}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-purple-500/10">
                                <ClipboardList className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">Teacher Comparison</h4>
                                <p className="text-xs text-muted-foreground">
                                  Comparative analysis across all classes taught
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card
                          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                          onClick={() => setCurrentView("classLists")}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-orange-500/10">
                                <UserCheck className="h-5 w-5 text-orange-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">Class Lists</h4>
                                <p className="text-xs text-muted-foreground">
                                  Complete student lists for all assigned classes
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <Card className="bg-muted/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Member of {currentDepartment} Department since {selectedTeacher.joinYear}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Attendance View */}
                {currentView === "attendance" && (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView("overview")}
                      className="mb-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Overview
                    </Button>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Attendance Sheets
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Coming soon - View attendance records per session
                        </p>
                      </CardHeader>
                    </Card>
                  </div>
                )}

                {/* Performance View */}
                {currentView === "performance" && (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView("overview")}
                      className="mb-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Overview
                    </Button>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Performance Analysis
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Coming soon - View performance metrics per test
                        </p>
                      </CardHeader>
                    </Card>
                  </div>
                )}

                {/* Comparison View */}
                {currentView === "comparison" && (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView("overview")}
                      className="mb-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Overview
                    </Button>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <ClipboardList className="h-5 w-5" />
                          Teacher Comparison
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Coming soon - Compare performance across classes
                        </p>
                      </CardHeader>
                    </Card>
                  </div>
                )}

                {/* Class Lists View */}
                {currentView === "classLists" && (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView("overview")}
                      className="mb-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Overview
                    </Button>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Class Lists
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Coming soon - View student lists for all classes
                        </p>
                      </CardHeader>
                    </Card>
                  </div>
                )}

                {/* Class Assignments View */}
                {currentView === "assignments" && selectedTeacher && (
                  <div className="space-y-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentView("overview")}
                      className="mb-2"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Overview
                    </Button>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BookOpen className="h-5 w-5" />
                          Class Assignments
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Manage class assignments for {selectedTeacher.name}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Current Assignments */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Current Assignments</h4>
                          {selectedTeacher.classes.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No classes assigned yet
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {selectedTeacher.classes.map((className) => (
                                <Card key={className} className="p-3">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 rounded-lg bg-primary/10">
                                        <BookOpen className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{className}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {selectedTeacher.subjects.join(", ")}
                                        </p>
                                      </div>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Add New Assignment */}
                        <div className="pt-4 border-t">
                          <h4 className="text-sm font-semibold mb-3">Assign New Classes</h4>
                          <div className="space-y-4">
                            {/* Two Column Selection */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Classes Column */}
                              <div>
                                <label className="text-xs text-muted-foreground mb-2 block">
                                  Select Classes
                                </label>
                                <Card className="p-2 max-h-56 overflow-y-auto">
                                  <div className="space-y-1">
                                    {availableClasses.map((className) => (
                                      <div
                                        key={className}
                                        className={cn(
                                          "flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer",
                                          classSubjectPairs[className] && "bg-accent"
                                        )}
                                        onClick={() => {
                                          if (!classSubjectPairs[className]) {
                                            // Add class with empty subject
                                            setClassSubjectPairs({ ...classSubjectPairs, [className]: "" });
                                          } else {
                                            // Remove class
                                            const newPairs = { ...classSubjectPairs };
                                            delete newPairs[className];
                                            setClassSubjectPairs(newPairs);
                                          }
                                        }}
                                      >
                                        <Checkbox
                                          checked={!!classSubjectPairs[className]}
                                          className="pointer-events-none"
                                        />
                                        <span className="text-sm flex-1">{className}</span>
                                        {selectedTeacher.classes.includes(className) && (
                                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                            Assigned
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              </div>

                              {/* Subjects Column */}
                              <div>
                                <label className="text-xs text-muted-foreground mb-2 block">
                                  Select Subjects
                                </label>
                                <Card className="p-2 max-h-56 overflow-y-auto">
                                  <div className="space-y-1">
                                    {selectedTeacher.subjects.map((subject) => (
                                      <div
                                        key={subject}
                                        className={cn(
                                          "flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer",
                                          Object.values(classSubjectPairs).includes(subject) && "bg-accent"
                                        )}
                                        onClick={() => {
                                          // Assign this subject to all selected classes that don't have a subject yet
                                          const newPairs = { ...classSubjectPairs };
                                          Object.keys(newPairs).forEach(className => {
                                            if (newPairs[className] === "") {
                                              newPairs[className] = subject;
                                            }
                                          });
                                          setClassSubjectPairs(newPairs);
                                        }}
                                      >
                                        <Checkbox
                                          checked={Object.values(classSubjectPairs).includes(subject)}
                                          className="pointer-events-none"
                                        />
                                        <span className="text-sm flex-1">{subject}</span>
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              </div>
                            </div>

                            {/* Selected Pairs Preview */}
                            {Object.keys(classSubjectPairs).length > 0 && (
                              <div>
                                <label className="text-xs text-muted-foreground mb-2 block">
                                  Selected Assignments ({Object.keys(classSubjectPairs).filter(c => classSubjectPairs[c]).length})
                                </label>
                                <Card className="p-3">
                                  <div className="space-y-2">
                                    {Object.entries(classSubjectPairs).map(([className, subject]) => (
                                      <div
                                        key={className}
                                        className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50"
                                      >
                                        <div className="flex items-center gap-2">
                                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                          <span className="font-medium">{className}</span>
                                          <span className="text-muted-foreground">→</span>
                                          <span className={cn(
                                            "text-xs",
                                            subject ? "text-foreground" : "text-muted-foreground italic"
                                          )}>
                                            {subject || "No subject selected"}
                                          </span>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-6 w-6 p-0"
                                          onClick={() => {
                                            const newPairs = { ...classSubjectPairs };
                                            delete newPairs[className];
                                            setClassSubjectPairs(newPairs);
                                          }}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </Card>
                              </div>
                            )}

                            {/* Instructions */}
                            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
                              <p className="font-medium mb-1">How to assign:</p>
                              <ol className="list-decimal list-inside space-y-1">
                                <li>Click classes you want to assign</li>
                                <li>Click subject to assign to selected classes</li>
                                <li>Review assignments above and remove if needed</li>
                                <li>Click "Assign All" to confirm</li>
                              </ol>
                            </div>

                            <Button
                              className="w-full"
                              size="sm"
                              disabled={Object.keys(classSubjectPairs).length === 0 ||
                                       Object.values(classSubjectPairs).some(s => !s)}
                              onClick={() => {
                                // Handle assignment
                                setClassSubjectPairs({});
                              }}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Assign All ({Object.keys(classSubjectPairs).filter(c => classSubjectPairs[c]).length})
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Notice Dialog */}
      <Dialog open={isNoticeDialogOpen} onOpenChange={setIsNoticeDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              Create Department Notice
            </DialogTitle>
            <DialogDescription>
              Send an important notice to all members of the {currentDepartment} Department
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notice Title</label>
              <Input placeholder="Enter notice title..." className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Notice Message</label>
              <Textarea
                placeholder="Enter your notice message..."
                className="w-full min-h-32"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="normal">Normal</option>
                <option value="important">Important</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="send-email" />
              <label htmlFor="send-email" className="text-sm cursor-pointer">
                Also send via email
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsNoticeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 gap-2">
                <Megaphone className="h-4 w-4" />
                Send Notice
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Schedule Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              Schedule Department Event
            </DialogTitle>
            <DialogDescription>
              Create a new event for all members of the {currentDepartment} Department
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Event Title</label>
              <Input placeholder="Enter event title..." className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Event Description</label>
              <Textarea
                placeholder="Enter event description..."
                className="w-full min-h-24"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Event Date</label>
                <Input type="date" className="w-full" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Event Time</label>
                <Input type="time" className="w-full" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input placeholder="Enter event location..." className="w-full" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Event Type</label>
              <select className="w-full p-2 border rounded-md text-sm">
                <option value="meeting">Department Meeting</option>
                <option value="training">Training Session</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="send-reminder" />
              <label htmlFor="send-reminder" className="text-sm cursor-pointer">
                Send reminder 24 hours before event
              </label>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsEventDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button className="flex-1 gap-2">
                <Calendar className="h-4 w-4" />
                Create Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
