"use client";

import React, { useState } from "react";
import { useHODAuth } from "@/hooks/useHODAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  CalendarIcon,
  Eye,
  FileText,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Assessment {
  id: string;
  title: string;
  type: string;
  class: string;
  subject: string;
  maxScore: number;
  passingScore: number;
  scheduledDate: Date | null;
  dueDate: Date | null;
  status: "draft" | "scheduled" | "ongoing" | "completed";
  studentsCompleted: number;
  totalStudents: number;
  description?: string;
}

const assessments: Assessment[] = [
  {
    id: "1",
    title: "Continuous Assessment Test 1",
    type: "CAT",
    class: "Class 9A",
    subject: "Mathematics",
    maxScore: 100,
    passingScore: 50,
    scheduledDate: new Date(2025, 9, 20),
    dueDate: new Date(2025, 9, 21),
    status: "completed",
    studentsCompleted: 32,
    totalStudents: 32,
    description: "Covers topics: Algebra, Quadratic Equations, Polynomials",
  },
  {
    id: "2",
    title: "Continuous Assessment Test 2",
    type: "CAT",
    class: "Class 9A",
    subject: "Mathematics",
    maxScore: 100,
    passingScore: 50,
    scheduledDate: new Date(2025, 10, 15),
    dueDate: new Date(2025, 10, 16),
    status: "ongoing",
    studentsCompleted: 18,
    totalStudents: 32,
    description: "Covers topics: Geometry, Trigonometry",
  },
  {
    id: "3",
    title: "Mid-Term Examination",
    type: "EXAM",
    class: "Class 10A",
    subject: "Mathematics",
    maxScore: 100,
    passingScore: 50,
    scheduledDate: new Date(2025, 10, 25),
    dueDate: new Date(2025, 10, 25),
    status: "scheduled",
    studentsCompleted: 0,
    totalStudents: 28,
    description: "Comprehensive mid-term assessment",
  },
];

const getStatusConfig = (status: Assessment["status"]) => {
  switch (status) {
    case "draft":
      return { color: "bg-gray-100 text-gray-700", icon: FileText, label: "Draft" };
    case "scheduled":
      return { color: "bg-blue-100 text-blue-700", icon: Clock, label: "Scheduled" };
    case "ongoing":
      return { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Ongoing" };
    case "completed":
      return { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Completed" };
  }
};

export default function HODAssessmentsPage() {
  const router = useRouter();
  const { currentHOD, isLoading } = useHODAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAssessments = assessments.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.class.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || assessment.class === classFilter;
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const stats = {
    total: assessments.length,
    scheduled: assessments.filter((a) => a.status === "scheduled").length,
    ongoing: assessments.filter((a) => a.status === "ongoing").length,
    completed: assessments.filter((a) => a.status === "completed").length,
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
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">My Assessments ({currentHOD.department})</h1>
          <p className="text-muted-foreground text-sm">
            View and track assessments assigned to your classes by administration
          </p>
        </div>
        <Badge variant="outline" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
          <FileText className="h-4 w-4 mr-2" />
          Admin-Created Assessments
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search assessments..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={classFilter} onValueChange={setClassFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by Class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            <SelectItem value="Class 9A">Class 9A</SelectItem>
            <SelectItem value="Class 10A">Class 10A</SelectItem>
            <SelectItem value="Class 11A">Class 11A</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content: Table on Left, Stats on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assessments List - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessment List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-24rem)]">
                <div className="space-y-4">
              {filteredAssessments.map((assessment) => {
                const config = getStatusConfig(assessment.status);
                const StatusIcon = config.icon;

                return (
                  <div
                    key={assessment.id}
                    className="p-5 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Title and Status */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-base mb-1">
                              {assessment.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {assessment.class} • {assessment.subject}
                            </p>
                          </div>
                          <Badge className={config.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>

                        {/* Key Info */}
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-muted-foreground">
                            <span className="font-medium text-foreground">{assessment.type}</span>
                          </span>
                          {assessment.scheduledDate && (
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <CalendarIcon className="h-3.5 w-3.5" />
                              {format(assessment.scheduledDate, "MMM d, yyyy")}
                            </span>
                          )}
                          <span className="text-muted-foreground">
                            Max: <span className="font-medium text-foreground">{assessment.maxScore}</span>
                          </span>
                        </div>

                        {/* Progress Bar (only if not draft) */}
                        {assessment.status !== "draft" && (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Grading Progress</span>
                              <span className="font-medium">
                                {assessment.studentsCompleted}/{assessment.totalStudents}
                              </span>
                            </div>
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{
                                  width: `${
                                    (assessment.studentsCompleted /
                                      assessment.totalStudents) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          title="View assessment details"
                          onClick={() => {
                            // In production, this would navigate to assessment details page
                            router.push(`/teacher/assessments/${assessment.id}`);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          disabled={assessment.status === "draft"}
                          title={assessment.status === "completed" ? "View grades" : "Enter grades"}
                          onClick={() => {
                            // Navigate to grades page for this assessment
                            router.push(`/teacher/grades?assessment=${assessment.id}&class=${assessment.class}`);
                          }}
                        >
                          {assessment.status === "completed" ? "View Grades" : "Enter Grades"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Takes 1/3 width, 2x2 grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All assessments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-600">
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.scheduled}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Upcoming</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-600">
                Ongoing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.ongoing}
              </div>
              <p className="text-xs text-muted-foreground mt-1">In progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-600">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.completed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Finished</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
