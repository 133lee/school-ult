"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Search,
  X,
  Phone,
  MapPin,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  UserPlus,
  Edit,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Printer,
  Upload,
  Plus,
  Download,
  FileText,
  Calendar,
  Users,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ClassRankingsWithAnalysis from "@/components/ClassRankingsWithAnalysis";
import Link from "next/link";
import { useRef } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

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

const students: Student[] = [
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
    className: "Class 9B",
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
  {
    id: "5",
    name: "Trisha Berge",
    studentId: "STU005",
    email: "trisha.berge@student.edu",
    phone: "(603) 965-4668",
    year: 2018,
    photoUrl: "https://i.pravatar.cc/150?img=20",
    className: "Class 9B",
    grade: "Grade 9",
    gender: "Female",
    dateOfBirth: "29-04-2004",
    religion: "Christian",
    bloodGroup: "B+",
    address: "1942 Harrison Street, San Francisco, CA 94103",
    father: "Richard Berge",
    fatherPhone: "+1 603-965-4668",
    mother: "Maren Berge",
    motherPhone: "+1 660-687-7027",
    status: "Inactive",
  },
  {
    id: "6",
    name: "Morris Mayert",
    studentId: "STU006",
    email: "morris.mayert@student.edu",
    phone: "(555) 567-8901",
    year: 2016,
    photoUrl: "https://i.pravatar.cc/150?img=13",
    className: "Class 10A",
    grade: "Grade 10",
    gender: "Male",
    dateOfBirth: "18-12-2003",
    religion: "Christian",
    bloodGroup: "A-",
    address: "7890 Cedar Lane, San Francisco, CA 94111",
    father: "Thomas Mayert",
    fatherPhone: "+1 555-567-8901",
    mother: "Patricia Mayert",
    motherPhone: "+1 555-543-2109",
    status: "Active",
  },
  {
    id: "7",
    name: "Ronny Kemmer",
    studentId: "STU007",
    email: "ronny.kemmer@student.edu",
    phone: "(555) 678-9012",
    year: 2021,
    photoUrl: "https://i.pravatar.cc/150?img=15",
    className: "Class 11A",
    grade: "Grade 11",
    gender: "Male",
    dateOfBirth: "14-09-2007",
    religion: "Christian",
    bloodGroup: "O-",
    address: "2345 Maple Drive, San Francisco, CA 94113",
    father: "Steven Kemmer",
    fatherPhone: "+1 555-678-9012",
    mother: "Nancy Kemmer",
    motherPhone: "+1 555-432-1098",
    status: "Active",
  },
  {
    id: "8",
    name: "Bianka Tromp",
    studentId: "STU008",
    email: "bianka.tromp@student.edu",
    phone: "(555) 789-0123",
    year: 2021,
    photoUrl: "https://i.pravatar.cc/150?img=25",
    className: "Class 11A",
    grade: "Grade 11",
    gender: "Female",
    dateOfBirth: "03-02-2007",
    religion: "Christian",
    bloodGroup: "B-",
    address: "6789 Birch Avenue, San Francisco, CA 94115",
    father: "Daniel Tromp",
    fatherPhone: "+1 555-789-0123",
    mother: "Karen Tromp",
    motherPhone: "+1 555-321-0987",
    status: "Active",
  },
  {
    id: "9",
    name: "Gregg Quigley",
    studentId: "STU009",
    email: "gregg.quigley@student.edu",
    phone: "(555) 890-1234",
    year: 2019,
    photoUrl: "https://i.pravatar.cc/150?img=33",
    className: "Class 9A",
    grade: "Grade 9",
    gender: "Male",
    dateOfBirth: "27-06-2005",
    religion: "Christian",
    bloodGroup: "A+",
    address: "4567 Willow Court, San Francisco, CA 94117",
    father: "James Quigley",
    fatherPhone: "+1 555-890-1234",
    mother: "Barbara Quigley",
    motherPhone: "+1 555-210-9876",
    status: "Suspended",
  },
  {
    id: "10",
    name: "Carissa Gottlieb",
    studentId: "STU010",
    email: "carissa.gottlieb@student.edu",
    phone: "(555) 901-2345",
    year: 2017,
    photoUrl: "https://i.pravatar.cc/150?img=45",
    className: "Class 12A",
    grade: "Grade 12",
    gender: "Female",
    dateOfBirth: "11-01-2002",
    religion: "Christian",
    bloodGroup: "O+",
    address: "8901 Spruce Street, San Francisco, CA 94119",
    father: "William Gottlieb",
    fatherPhone: "+1 555-901-2345",
    mother: "Jennifer Gottlieb",
    motherPhone: "+1 555-109-8765",
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

const subjectRankings = [
  { subject: "Maths", score: 82, rank: 5, total: 45, trend: "up" as const },
  {
    subject: "Science",
    score: 75,
    rank: 12,
    total: 45,
    trend: "down" as const,
  },
  { subject: "English", score: 88, rank: 3, total: 45, trend: "up" as const },
  { subject: "History", score: 79, rank: 8, total: 45, trend: "same" as const },
  { subject: "Geography", score: 85, rank: 4, total: 45, trend: "up" as const },
  {
    subject: "Physics",
    score: 71,
    rank: 15,
    total: 45,
    trend: "down" as const,
  },
];

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const ITEMS_PER_PAGE = 10;

const calculateDaysEnrolled = (year: number) => {
  const currentYear = new Date().getFullYear();
  const yearsEnrolled = currentYear - year;
  return yearsEnrolled * 365;
};

export default function StudentManagementDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [performanceSheetOpen, setPerformanceSheetOpen] = useState(false);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [assessmentFilter, setAssessmentFilter] = useState("CAT1");
  const [classmateSearch, setClassmateSearch] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>("about");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Student data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh student data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredStudents = students.filter((student) => {
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

  const getClassmates = () => {
    if (!selectedStudent) return [];
    return students
      .filter(
        (s) =>
          s.className === selectedStudent.className &&
          s.id !== selectedStudent.id &&
          s.name.toLowerCase().includes(classmateSearch.toLowerCase())
      )
      .slice(0, 5);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length === 0) {
        toast.error("CSV file is empty");
        return;
      }

      // Parse headers
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().toLowerCase());

      // Expected headers for students
      const requiredHeaders = ["name", "email", "grade", "class"];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        toast.error(
          `Missing required columns: ${missingHeaders.join(", ")}`
        );
        return;
      }

      // Parse data rows
      const importedStudents: typeof students = [];
      let errorCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < requiredHeaders.length) {
          errorCount++;
          continue;
        }

        const rowData: Record<string, string> = {};
        headers.forEach((header, idx) => {
          rowData[header] = values[idx] || "";
        });

        const newStudent = {
          id: `STU${Date.now()}-${i}`,
          admissionNumber: rowData["admission number"] || `ADM-${Date.now()}-${i}`,
          name: rowData["name"],
          email: rowData["email"],
          grade: rowData["grade"],
          class: rowData["class"],
          status: (rowData["status"] || "Active") as "Active" | "Inactive",
          phone: rowData["phone"] || "N/A",
          parentName: rowData["parent name"] || "N/A",
          enrollmentDate: new Date().toLocaleDateString(),
          performance: {
            cat1: 0,
            cat2: 0,
            exam: 0,
          },
          attendance: 0,
          grades: [],
        };

        // Validate required fields
        if (newStudent.name && newStudent.email) {
          importedStudents.push(newStudent);
        } else {
          errorCount++;
        }
      }

      if (importedStudents.length === 0) {
        toast.error("No valid student records found in the CSV");
        return;
      }

      // Add imported students to the list
      setStudents([...students, ...importedStudents]);

      setImportDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(
        `Successfully imported ${importedStudents.length} student${
          importedStudents.length > 1 ? "s" : ""
        }${errorCount > 0 ? ` (${errorCount} invalid rows skipped)` : ""}`
      );
    } catch (error) {
      console.error("Error importing file:", error);
      toast.error("Failed to import CSV file. Please check the format.");
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Name,Email,Grade,Class,Status,Phone,Parent Name,Admission Number
John Doe,john.doe@school.edu,Grade 9,9A,Active,+1234567890,Jane Doe,ADM001
Alice Smith,alice.smith@school.edu,Grade 9,9B,Active,+1234567891,Bob Smith,ADM002
Charlie Brown,charlie.brown@school.edu,Grade 10,10A,Active,+1234567892,Diana Brown,ADM003
Eva Johnson,eva.johnson@school.edu,Grade 10,10B,Inactive,+1234567893,Frank Johnson,ADM004
Grace Lee,grace.lee@school.edu,Grade 11,11A,Active,+1234567894,Henry Lee,ADM005`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Students Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage student information and enrollment
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setImportDialogOpen(true)}>
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Students</DialogTitle>
                <DialogDescription>
                  Upload a CSV to bulk import students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileImport}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" asChild>
                      <span>Choose File</span>
                    </Button>
                  </label>
                  <p className="text-sm text-gray-500 mt-2">Supports CSV</p>
                </div>
                <Button
                  onClick={downloadTemplate}
                  variant="outline"
                  className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="flex-1 sm:flex-none" asChild>
            <Link href="/admin/students/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="flex flex-col h-[calc(100vh-16rem)]">
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
                <SelectItem value="Class 9B">Class 9B</SelectItem>
                <SelectItem value="Class 10A">Class 10A</SelectItem>
                <SelectItem value="Class 11A">Class 11A</SelectItem>
                <SelectItem value="Class 12A">Class 12A</SelectItem>
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
                <SelectItem value="Grade 12">Grade 12</SelectItem>
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
          {filteredStudents.length > 0 ? (
            <>
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
              <ScrollArea className="flex-1">
                <StudentsTable
                  students={paginatedStudents}
                  onRowClick={handleRowClick}
                  onEdit={(student) => {
                    setSelectedStudent(student);
                    setEditDialogOpen(true);
                  }}
                  onDelete={(student) => {
                    setSelectedStudent(student);
                    setDeleteDialogOpen(true);
                  }}
                  showActions={true}
                />
              </ScrollArea>

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
            </>
          ) : (
            <Empty className="h-96">
              <EmptyContent>
                <EmptyMedia variant="icon">
                  <Users className="h-6 w-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No students found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || classFilter !== "all" || gradeFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "Start by adding new students to the system"}
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* Basic Details Sheet */}
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
                    <Button variant="outline" size="sm">
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
                          Class Poistion:
                          <span className="font-medium text-gray-800">3rd</span>
                        </span>
                        <span className="text-xs text-gray-500">
                          Best Six:
                          <span className="font-medium text-gray-800">
                            12 points
                          </span>
                        </span>
                      </CardFooter>
                    </Card>

                    {/* Rankings Table goes here */}
                    <ClassRankingsWithAnalysis />
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStudent?.name}? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // Handle delete logic here
                setDeleteDialogOpen(false);
                setSelectedStudent(null);
              }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={selectedStudent?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Student ID</label>
                <Input defaultValue={selectedStudent?.studentId} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={selectedStudent?.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue={selectedStudent?.phone} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Grade</label>
                <Select defaultValue={selectedStudent?.grade}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Class</label>
                <Select defaultValue={selectedStudent?.className}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class 9A">Class 9A</SelectItem>
                    <SelectItem value="Class 9B">Class 9B</SelectItem>
                    <SelectItem value="Class 10A">Class 10A</SelectItem>
                    <SelectItem value="Class 11A">Class 11A</SelectItem>
                    <SelectItem value="Class 12A">Class 12A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedStudent?.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle save logic here
                setEditDialogOpen(false);
              }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
