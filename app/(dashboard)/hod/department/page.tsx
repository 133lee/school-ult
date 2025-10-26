"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  BookOpen,
  Search,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { useHODAuth } from "@/hooks/useHODAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface DepartmentTeacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  status: "Active" | "Inactive";
  joinYear: number;
}

interface ClassAssignment {
  classId: string;
  className: string;
  gradeLevel: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  term: string;
}

interface Class {
  id: string;
  name: string;
  gradeLevel: string;
  capacity: number;
  status: "Active" | "Inactive";
}

export default function HODDepartmentManagement() {
  const { currentHOD, isLoading } = useHODAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("Term 1");
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  // Mock department teachers data
  const allDepartmentTeachers: Record<string, DepartmentTeacher[]> = {
    Sciences: [
      {
        id: "t1",
        name: "Dr. Jane Omondi",
        email: "jane.omondi@school.com",
        subjects: ["Mathematics"],
        status: "Active",
        joinYear: 2018,
      },
      {
        id: "t2",
        name: "Mr. Peter Kipchoge",
        email: "peter.kipchoge@school.com",
        subjects: ["Physics"],
        status: "Active",
        joinYear: 2019,
      },
      {
        id: "t3",
        name: "Ms. Alice Njoroge",
        email: "alice.njoroge@school.com",
        subjects: ["Chemistry", "Biology"],
        status: "Active",
        joinYear: 2020,
      },
      {
        id: "t4",
        name: "Mr. Solomon Kiplagat",
        email: "solomon.kiplagat@school.com",
        subjects: ["Biology"],
        status: "Active",
        joinYear: 2021,
      },
    ],
    Humanities: [
      {
        id: "t5",
        name: "Ms. Grace Mutua",
        email: "grace.mutua@school.com",
        subjects: ["History", "Geography"],
        status: "Active",
        joinYear: 2019,
      },
      {
        id: "t6",
        name: "Mr. David Kiplagat",
        email: "david.kiplagat@school.com",
        subjects: ["English"],
        status: "Active",
        joinYear: 2020,
      },
    ],
  };

  // Class assignments data
  const classAssignments: ClassAssignment[] = [
    {
      classId: "c1",
      className: "Grade 9A",
      gradeLevel: "Grade 9",
      teacherId: "t1",
      teacherName: "Dr. Jane Omondi",
      subject: "Mathematics",
      term: "Term 1",
    },
    {
      classId: "c2",
      className: "Grade 9B",
      gradeLevel: "Grade 9",
      teacherId: "t1",
      teacherName: "Dr. Jane Omondi",
      subject: "Mathematics",
      term: "Term 1",
    },
    {
      classId: "c3",
      className: "Grade 10A",
      gradeLevel: "Grade 10",
      teacherId: "t1",
      teacherName: "Dr. Jane Omondi",
      subject: "Mathematics",
      term: "Term 1",
    },
    {
      classId: "c4",
      className: "Grade 9A",
      gradeLevel: "Grade 9",
      teacherId: "t2",
      teacherName: "Mr. Peter Kipchoge",
      subject: "Physics",
      term: "Term 1",
    },
    {
      classId: "c5",
      className: "Grade 10B",
      gradeLevel: "Grade 10",
      teacherId: "t2",
      teacherName: "Mr. Peter Kipchoge",
      subject: "Physics",
      term: "Term 1",
    },
  ];

  // Get teachers for current HOD's department
  const departmentTeachers = allDepartmentTeachers[currentHOD?.department || "Sciences"] || [];

  // Filter teachers based on search
  const filteredTeachers = departmentTeachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get assignments for selected term
  const termAssignments = classAssignments.filter((a) => a.term === selectedTerm);

  // Group assignments by class
  const assignmentsByClass = termAssignments.reduce(
    (acc, assignment) => {
      const key = assignment.classId;
      if (!acc[key]) {
        acc[key] = {
          classId: assignment.classId,
          className: assignment.className,
          gradeLevel: assignment.gradeLevel,
          assignments: [],
        };
      }
      acc[key].assignments.push(assignment);
      return acc;
    },
    {} as Record<string, { classId: string; className: string; gradeLevel: string; assignments: ClassAssignment[] }>
  );

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
      <div>
        <h1 className="text-2xl font-bold">Department Management ({currentHOD.department})</h1>
        <p className="text-muted-foreground text-sm">
          Manage department members and class assignments
        </p>
      </div>

      {/* Two Tab Layout */}
      <Tabs defaultValue="members">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Department Members
          </TabsTrigger>
          <TabsTrigger value="assignments">
            <BookOpen className="h-4 w-4 mr-2" />
            Class Assignments
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Department Members */}
        <TabsContent value="members" className="space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Teachers List */}
          <div className="space-y-3">
            {filteredTeachers.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  No teachers found matching your search
                </CardContent>
              </Card>
            ) : (
              filteredTeachers.map((teacher) => (
                <Card key={teacher.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{teacher.name}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">{teacher.email}</p>
                      </div>
                      <Badge variant={teacher.status === "Active" ? "default" : "secondary"}>
                        {teacher.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Subjects</p>
                      <div className="flex flex-wrap gap-2">
                        {teacher.subjects.map((subject) => (
                          <Badge key={subject} variant="outline" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        Joined in {teacher.joinYear}
                      </p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-2" />
                        View Analysis
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Class Assignments */}
        <TabsContent value="assignments" className="space-y-4">
          {/* Term Selector */}
          <Select value={selectedTerm} onValueChange={setSelectedTerm}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Term 1">Term 1</SelectItem>
              <SelectItem value="Term 2">Term 2</SelectItem>
              <SelectItem value="Term 3">Term 3</SelectItem>
            </SelectContent>
          </Select>

          {/* Classes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {Object.values(assignmentsByClass).map((classGroup) => (
              <Card key={classGroup.classId} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm">{classGroup.className}</CardTitle>
                      <p className="text-xs text-muted-foreground">{classGroup.gradeLevel}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {classGroup.assignments.length}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Expandable Content */}
                {expandedClass === classGroup.classId && (
                  <CardContent className="pb-2 space-y-2">
                    {classGroup.assignments.map((assignment, idx) => (
                      <div key={idx} className="text-xs border-t pt-2">
                        <p className="font-medium">{assignment.subject}</p>
                        <p className="text-muted-foreground text-xs">{assignment.teacherName}</p>
                      </div>
                    ))}
                  </CardContent>
                )}

                {/* Toggle Button */}
                <div className="mt-auto">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full"
                    onClick={() =>
                      setExpandedClass(
                        expandedClass === classGroup.classId ? null : classGroup.classId
                      )
                    }
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedClass === classGroup.classId ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
