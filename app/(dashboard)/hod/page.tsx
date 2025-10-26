"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  ClipboardList,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import Events from "@/components/events";
import { useHODAuth } from "@/hooks/useHODAuth";

interface DepartmentTeacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  classes: string[];
  status: "Active" | "Inactive";
  joinYear: number;
}

export default function HODDashboard() {
  const { currentHOD, isLoading } = useHODAuth();

  // Mock department teachers data (filtered by department)
  const allDepartmentTeachers: Record<string, DepartmentTeacher[]> = {
    Sciences: [
      {
        id: "t1",
        name: "Dr. Jane Omondi",
        email: "jane.omondi@school.com",
        subjects: ["Mathematics"],
        classes: ["Grade 9A", "Grade 10A"],
        status: "Active",
        joinYear: 2018,
      },
      {
        id: "t2",
        name: "Mr. Peter Kipchoge",
        email: "peter.kipchoge@school.com",
        subjects: ["Physics"],
        classes: ["Grade 11A", "Grade 12A"],
        status: "Active",
        joinYear: 2019,
      },
      {
        id: "t3",
        name: "Ms. Alice Njoroge",
        email: "alice.njoroge@school.com",
        subjects: ["Chemistry", "Biology"],
        classes: ["Grade 10B", "Grade 11B"],
        status: "Active",
        joinYear: 2020,
      },
      {
        id: "t4",
        name: "Mr. Solomon Kiplagat",
        email: "solomon.kiplagat@school.com",
        subjects: ["Biology"],
        classes: ["Grade 9B"],
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
        classes: ["Grade 9C", "Grade 10C"],
        status: "Active",
        joinYear: 2018,
      },
      {
        id: "t6",
        name: "Mr. James Mwangi",
        email: "james.mwangi@school.com",
        subjects: ["English Literature"],
        classes: ["Grade 11C", "Grade 12C"],
        status: "Active",
        joinYear: 2019,
      },
    ],
    "Languages & Social Studies": [
      {
        id: "t7",
        name: "Ms. Ruth Kipchoge",
        email: "ruth.kipchoge@school.com",
        subjects: ["English Language", "Kiswahili"],
        classes: ["Grade 9D", "Grade 10D"],
        status: "Active",
        joinYear: 2017,
      },
      {
        id: "t8",
        name: "Mr. David Kiprotich",
        email: "david.kiprotich@school.com",
        subjects: ["Social Studies"],
        classes: ["Grade 11D", "Grade 12D"],
        status: "Active",
        joinYear: 2020,
      },
    ],
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

  // Get teachers for this HOD's department
  const departmentTeachers = allDepartmentTeachers[currentHOD.department] || [];

  // Mock data - would come from API
  const stats = {
    totalClasses: 3,
    totalStudents: 85,
    pendingGrades: 12,
    upcomingAssessments: 4,
  };

  const upcomingClasses = [
    {
      id: "1",
      name: "Class 9A - Mathematics",
      time: "8:00 AM - 9:00 AM",
      day: "Today",
    },
    {
      id: "2",
      name: "Class 10A - Mathematics",
      time: "10:00 AM - 11:00 AM",
      day: "Today",
    },
    {
      id: "3",
      name: "Class 11A - Advanced Math",
      time: "2:00 PM - 3:00 PM",
      day: "Today",
    },
  ];

  const recentActivity = [
    {
      id: "1",
      action: "Graded",
      description: "CAT 1 - Class 9A Mathematics",
      time: "2 hours ago",
    },
    {
      id: "2",
      action: "Marked",
      description: "Attendance for Class 10A",
      time: "3 hours ago",
    },
    {
      id: "3",
      action: "Created",
      description: "New assessment for Class 11A",
      time: "Yesterday",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Department Head Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            {currentHOD.name} • {currentHOD.department} Department
          </p>
        </div>
      </div>

      {/* Department Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentTeachers.length}</div>
            <p className="text-xs text-muted-foreground">
              In {currentHOD.department} department
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentTeachers.filter(t => t.status === "Active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {departmentTeachers.reduce((sum, t) => sum + t.classes.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all teachers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Department Teachers Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Department Teachers
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {currentHOD.department} Department
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {departmentTeachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No teachers in this department yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {departmentTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      teacher.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {teacher.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-xs">
                    <div>
                      <p className="text-muted-foreground mb-1">Subjects</p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.subjects.map((subject) => (
                          <span
                            key={subject}
                            className="inline-block bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Classes ({teacher.classes.length})</p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.classes.slice(0, 3).map((cls) => (
                          <span
                            key={cls}
                            className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
                            {cls}
                          </span>
                        ))}
                        {teacher.classes.length > 3 && (
                          <span className="text-muted-foreground text-xs">
                            +{teacher.classes.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/hod/teachers/${teacher.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost">
                      Assign Classes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Department Events & Announcements */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span>Term 1 Exam Period</span>
                <span className="text-muted-foreground">Oct 28 - Nov 8</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span>Report Card Release</span>
                <span className="text-muted-foreground">Nov 15</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-muted/50">
                <span>Parent-Teacher Meeting</span>
                <span className="text-muted-foreground">Nov 22</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Department Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2 p-2 rounded bg-yellow-50 border border-yellow-200">
              <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-yellow-900">
                Ensure all teachers submit their grade plans by Friday
              </p>
            </div>
            <div className="flex items-start gap-2 p-2 rounded bg-blue-50 border border-blue-200">
              <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                Mid-term reviews are due next week
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
