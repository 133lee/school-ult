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
} from "lucide-react";
import { useHODAuth } from "@/hooks/useHODAuth";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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

type ViewType = "overview" | "attendance" | "performance" | "comparison" | "classLists";

export default function HODDepartmentManagement() {
  const { currentHOD, isLoading } = useHODAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeftColumnCollapsed, setIsLeftColumnCollapsed] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>("overview");

  // Department subjects mapping
  const departmentSubjects: Record<string, string[]> = {
    Sciences: ["Mathematics", "Physics", "Chemistry", "Biology"],
    Humanities: ["History", "Geography", "English", "Kiswahili"],
    Languages: ["English", "Kiswahili", "French"],
    Arts: ["Music", "Art", "Drama"],
  };

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

      {/* Search Box */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers by name, email, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
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
                <div className="space-y-3">
                  {filteredMembers.map((teacher) => (
                    <Card
                      key={teacher.id}
                      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        setSelectedTeacher(teacher);
                        setCurrentView("overview");
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{teacher.name}</h3>
                            <Badge
                              variant={
                                teacher.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {teacher.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {teacher.email}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {teacher.subjects.map((subject) => (
                              <Badge
                                key={subject}
                                variant="outline"
                                className="text-xs"
                              >
                                {subject}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Joined {teacher.joinYear}</span>
                            <span>{teacher.classes.length} Classes</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveTeacher(teacher.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
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
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
