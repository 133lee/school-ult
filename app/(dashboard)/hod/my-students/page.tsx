"use client";

import React, { useState } from "react";
import { useHODAuth } from "@/hooks/useHODAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardDescription, CardTitle, CardAction, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { StudentsTable } from "@/components/shared/data-tables/students-table";
import { StudentDetailsSheet } from "@/components/shared/sheets/student-details-sheet";
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
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  TrendingUp,
  TrendingDown,
  Minus,
  Printer,
  Info,
} from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import TeacherClassRankingsWithAnalysis from "@/components/TeacherClassRankingsWithAnalysis";

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  year: number;
  photoUrl: string;
  className: string;
  grade: string;
  gender: string;
  dateOfBirth: string;
  religion: string;
  bloodGroup: string;
  address: string;
  father: string;
  fatherPhone: string;
  mother: string;
  motherPhone: string;
  status: "Active" | "Inactive" | "Suspended";
}

// Mock data - filtered to show only students in teacher's classes
const myStudents: Student[] = [
  {
    id: "1",
    name: "John Doe",
    studentId: "STU001",
    email: "john.doe@student.edu",
    phone: "(555) 123-4567",
    year: 2019,
    photoUrl: "https://i.pravatar.cc/150?img=12",
    className: "Class 9A",
    grade: "Grade 9",
    gender: "Male",
    dateOfBirth: "15-08-2005",
    religion: "Christian",
    bloodGroup: "A+",
    address: "1234 Main Street, San Francisco, CA 94103",
    father: "James Doe",
    fatherPhone: "+1 555-123-4567",
    mother: "Jane Doe",
    motherPhone: "+1 555-987-6543",
    status: "Active",
  },
  {
    id: "2",
    name: "Julie Von",
    studentId: "STU002",
    email: "julie.von@student.edu",
    phone: "(555) 234-5678",
    year: 2020,
    photoUrl: "https://i.pravatar.cc/150?img=5",
    className: "Class 9A",
    grade: "Grade 9",
    gender: "Female",
    dateOfBirth: "22-03-2006",
    religion: "Christian",
    bloodGroup: "B+",
    address: "5678 Oak Avenue, San Francisco, CA 94105",
    father: "Michael Von",
    fatherPhone: "+1 555-234-5678",
    mother: "Emma Von",
    motherPhone: "+1 555-876-5432",
    status: "Active",
  },
  {
    id: "3",
    name: "Jocelyn Walker",
    studentId: "STU003",
    email: "jocelyn.walker@student.edu",
    phone: "(555) 345-6789",
    year: 2016,
    photoUrl: "https://i.pravatar.cc/150?img=9",
    className: "Class 10A",
    grade: "Grade 10",
    gender: "Female",
    dateOfBirth: "10-11-2003",
    religion: "Christian",
    bloodGroup: "O+",
    address: "9012 Pine Street, San Francisco, CA 94107",
    father: "David Walker",
    fatherPhone: "+1 555-345-6789",
    mother: "Lisa Walker",
    motherPhone: "+1 555-765-4321",
    status: "Active",
  },
  {
    id: "4",
    name: "Jaiden Zulauf",
    studentId: "STU004",
    email: "jaiden.zulauf@student.edu",
    phone: "(555) 456-7890",
    year: 2019,
    photoUrl: "https://i.pravatar.cc/150?img=12",
    className: "Class 9A",
    grade: "Grade 9",
    gender: "Male",
    dateOfBirth: "05-07-2005",
    religion: "Christian",
    bloodGroup: "AB+",
    address: "3456 Elm Street, San Francisco, CA 94109",
    father: "Robert Zulauf",
    fatherPhone: "+1 555-456-7890",
    mother: "Michelle Zulauf",
    motherPhone: "+1 555-654-3210",
    status: "Active",
  },
];

const chartData = [
  { subject: "Maths", score: 82 },
  { subject: "Science", score: 75 },
  { subject: "English", score: 88 },
  { subject: "History", score: 79 },
  { subject: "Geography", score: 85 },
  { subject: "Physics", score: 71 },
];

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const ITEMS_PER_PAGE = 10;

export default function HODMyStudentsDashboard() {
  const { currentHOD, isLoading } = useHODAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [performanceSheetOpen, setPerformanceSheetOpen] = useState(false);
  const [assessmentFilter, setAssessmentFilter] = useState("CAT1");

  const filteredStudents = myStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      classFilter === "all" || student.className === classFilter;
    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter;
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesClass && matchesGrade && matchesStatus;
  });

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  const handleRowClick = (student: Student) => {
    setSelectedStudent(student);
    setDetailsSheetOpen(true);
  };

  const handleViewPerformance = () => {
    setDetailsSheetOpen(false);
    setPerformanceSheetOpen(true);
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
          <h1 className="text-xl font-bold">My Students ({currentHOD.department})</h1>
          <p className="text-muted-foreground text-sm">
            View students in your assigned classes
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success("Student list refreshed");
              // In production, this would refetch data from the API
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success("Exporting student list...");
              // In production, this would generate CSV/Excel export
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export List
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="flex flex-col h-[calc(100vh-12rem)]">
        <CardHeader>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search students..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={classFilter}
              onValueChange={(val) => {
                setClassFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                <SelectItem value="Class 9A">Class 9A</SelectItem>
                <SelectItem value="Class 10A">Class 10A</SelectItem>
                <SelectItem value="Class 11A">Class 11A</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={gradeFilter}
              onValueChange={(val) => {
                setGradeFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Grades</SelectItem>
                <SelectItem value="Grade 9">Grade 9</SelectItem>
                <SelectItem value="Grade 10">Grade 10</SelectItem>
                <SelectItem value="Grade 11">Grade 11</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
            <span className="font-medium">
              Student List ({filteredStudents.length})
            </span>
            <span>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredStudents.length)} of{" "}
              {filteredStudents.length}
            </span>
          </div>
          <div className="overflow-auto flex-1">
            <StudentsTable
              students={paginatedStudents}
              onRowClick={handleRowClick}
              onEdit={() => {}} // No-op for teachers
              onDelete={() => {}} // No-op for teachers
              showActions={false} // Hide Edit/Delete actions for teachers
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-9">
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Details Sheet */}
      <StudentDetailsSheet
        student={selectedStudent}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        onViewPerformance={handleViewPerformance}
        showPerformanceButton={true}
      />

      {/* Performance Sheet */}
      <Sheet
        open={performanceSheetOpen}
        onOpenChange={(open) => {
          setPerformanceSheetOpen(open);
          if (!open) {
            setDetailsSheetOpen(true);
          }
        }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[60vw] p-0 overflow-hidden">
          {selectedStudent && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b bg-white p-6 shrink-0">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20 border-2 border-gray-200">
                    <AvatarImage
                      src={selectedStudent.photoUrl}
                      alt={selectedStudent.name}
                    />
                    <AvatarFallback className="text-xl bg-slate-100 text-slate-700">
                      {selectedStudent.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                      {selectedStudent.name}
                    </h1>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
                        {selectedStudent.className}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ID: {selectedStudent.studentId}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          selectedStudent.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : selectedStudent.status === "Suspended"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-items gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.print();
                      }}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print Report Card
                    </Button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-hidden p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">
                        Performance Overview
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Current semester academic standing
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={
                          assessmentFilter === "CAT1" ? "default" : "outline"
                        }
                        onClick={() => setAssessmentFilter("CAT1")}>
                        CAT 1
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          assessmentFilter === "MID" ? "default" : "outline"
                        }
                        onClick={() => setAssessmentFilter("MID")}>
                        MID
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          assessmentFilter === "EOT" ? "default" : "outline"
                        }
                        onClick={() => setAssessmentFilter("EOT")}>
                        EOT
                      </Button>
                    </div>
                  </div>

                  <Alert className="mb-4">
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      As a teacher, you can only view detailed subject analysis for subjects you teach (Mathematics & Physics).
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
                    {/* Radar Chart */}
                    <Card className="h-[450px] w-full flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          Performance Radar
                        </CardTitle>
                        <CardDescription className="text-xs">
                          Subject score distribution
                        </CardDescription>
                        <CardAction>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Improving
                          </Badge>
                        </CardAction>
                      </CardHeader>
                      <CardContent className="flex-1 flex items-center justify-center ">
                        <ChartContainer
                          config={chartConfig}
                          className="aspect-square max-h-[280px] w-full">
                          <RadarChart data={chartData}>
                            <ChartTooltip
                              cursor={false}
                              content={<ChartTooltipContent />}
                            />
                            <PolarAngleAxis
                              dataKey="subject"
                              className="text-xs"
                            />
                            <PolarGrid />
                            <Radar
                              dataKey="score"
                              fill="var(--color-score)"
                              fillOpacity={0.6}
                              dot={{
                                r: 4,
                                fillOpacity: 1,
                              }}
                            />
                          </RadarChart>
                        </ChartContainer>
                      </CardContent>
                      <CardFooter className="pt-0 pb-4 px-6 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Class Position:
                          <span className="font-medium text-gray-800 ml-1">3rd</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Best Six:
                          <span className="font-medium text-gray-800 ml-1">
                            12 points
                          </span>
                        </span>
                      </CardFooter>
                    </Card>

                    {/* Rankings Table - Teacher specific version */}
                    <TeacherClassRankingsWithAnalysis />
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
