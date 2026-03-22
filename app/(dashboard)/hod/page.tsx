"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHodDashboard } from "@/hooks/useHodDashboard";
import {
  BookOpen,
  Users,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileText,
  ClipboardCheck,
  School,
  AlertCircle,
  BarChart3,
  FileBarChart,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function HodDashboard() {
  const { toast } = useToast();
  const { data, isLoading, error, refetch } = useHodDashboard();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshing",
      description: "Updating dashboard data...",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground mt-3">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <div>
                <h3 className="font-semibold">Error Loading Dashboard</h3>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Department Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {data.department.name} • {data.academicYear.name}
            {data.term && ` • ${data.term.name}`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Department Summary Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {data.department.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {data.department.code}
                {data.department.description &&
                  ` • ${data.department.description}`}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <School className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {data.department.totalSubjects}
              </span>
              <span className="text-xs text-muted-foreground">
                Subjects
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {data.department.totalTeachers}
              </span>
              <span className="text-xs text-muted-foreground">
                Teachers
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {data.department.totalStudents}
              </span>
              <span className="text-xs text-muted-foreground">
                Students
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {data.department.activeClasses}
              </span>
              <span className="text-xs text-muted-foreground">
                Active Classes
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Performance */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Average Performance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.performance.averagePerformance}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        {/* Pass Rate */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.performance.passRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Students passing (≥50%)
            </p>
          </CardContent>
        </Card>

        {/* Best Performing Subject */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Best Performing
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            {data.performance.bestPerformingSubject ? (
              <>
                <div className="text-2xl font-bold">
                  {data.performance.bestPerformingSubject.average}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.performance.bestPerformingSubject.name}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>

        {/* Subject Needing Attention */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Needs Attention
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            {data.performance.subjectNeedingAttention ? (
              <>
                <div className="text-2xl font-bold">
                  {data.performance.subjectNeedingAttention.average}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {data.performance.subjectNeedingAttention.name}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assessments */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Assessments
                </p>
                <p className="text-xl font-bold">
                  {data.stats.totalAssessments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Assessments */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Assessments
                </p>
                <p className="text-xl font-bold">
                  {data.stats.pendingAssessments}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Classes */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Classes</p>
                <p className="text-xl font-bold">{data.stats.activeClasses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Students */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-xl font-bold">{data.stats.totalStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Sections */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="teachers">
            <Users className="h-4 w-4 mr-2" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <BookOpen className="h-4 w-4 mr-2" />
            Subjects
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileBarChart className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Department Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed performance breakdown across all department subjects
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Performance analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Teachers Tab */}
        <TabsContent value="teachers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Teachers</CardTitle>
              <p className="text-sm text-muted-foreground">
                View and manage teachers in your department
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.email} • {teacher.staffNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {teacher.isActive ? (
                        <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Subjects</CardTitle>
              <p className="text-sm text-muted-foreground">
                Subject-wise performance breakdown
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Code: {subject.code}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate Reports</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and download departmental reports
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Performance Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Comprehensive performance analysis across all subjects and
                    classes
                  </p>
                  <Button size="sm">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Teacher Workload Report</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Detailed breakdown of teacher assignments and class load
                  </p>
                  <Button size="sm">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Department Summary</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Overview of department statistics and key metrics
                  </p>
                  <Button size="sm">
                    <FileBarChart className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
