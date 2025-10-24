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

export default function TeacherDashboard() {
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
          <h1 className="text-xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back! Here's what's happening today.
          </p>
        </div>
        <Button asChild>
          <Link href="/teacher/my-classes">
            <BookOpen className="h-4 w-4 mr-2" />
            View My Classes
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Active this semester
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all classes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Grades
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingGrades}</div>
            <p className="text-xs text-muted-foreground">
              Assignments to grade
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assessments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.upcomingAssessments}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingClasses.map((classItem) => (
              <div
                key={classItem.id}
                className="flex items-start justify-between p-3 rounded-lg border bg-muted/50 hover:bg-muted transition-colors">
                <div className="space-y-1">
                  <p className="text-sm font-medium">{classItem.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {classItem.time}
                  </p>
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/teacher/schedule">View</Link>
                </Button>
              </div>
            ))}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/teacher/schedule">View Full Schedule</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {activity.action}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Events & Announcements */}
        <div>
          <Events embedded={true} userRole="teacher" currentUserId="t1" currentUserName="John Mwangi" />
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/teacher/attendance">
              <ClipboardList className="h-4 w-4 mr-2" />
              Mark Attendance
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/teacher/grades">
              <TrendingUp className="h-4 w-4 mr-2" />
              Enter Grades
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/teacher/assessments">
              <Calendar className="h-4 w-4 mr-2" />
              Create Assessment
            </Link>
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/teacher/my-students">
              <Users className="h-4 w-4 mr-2" />
              View Students
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card className="border-yellow-200 bg-yellow-50/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
            <p className="text-sm text-yellow-900">
              CAT 2 grades for Class 9A are due by Friday
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" />
            <p className="text-sm text-yellow-900">
              Parent-teacher meeting scheduled for next Monday
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
