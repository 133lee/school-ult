"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  MoreVertical,
  RefreshCw,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Download,
  FileText,
  BookOpen,
  Users,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface Subject {
  id: string;
  subjectId: string;
  name: string;
  code: string;
  department: string;
  description: string;
  creditHours: number;
  gradeLevel: string[];
  totalTeachers: number;
  totalStudents: number;
  status: "Active" | "Inactive";
}

const subjects: Subject[] = [
  {
    id: "1",
    subjectId: "SUB001",
    name: "Mathematics",
    code: "MATH-101",
    department: "Sciences",
    description: "Advanced Mathematics covering Algebra, Calculus, and Geometry",
    creditHours: 4,
    gradeLevel: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    totalTeachers: 3,
    totalStudents: 85,
    status: "Active",
  },
  {
    id: "2",
    subjectId: "SUB002",
    name: "English Literature",
    code: "ENG-101",
    department: "Languages",
    description: "Study of classic and modern literature",
    creditHours: 3,
    gradeLevel: ["Grade 9", "Grade 10"],
    totalTeachers: 2,
    totalStudents: 72,
    status: "Active",
  },
  {
    id: "3",
    subjectId: "SUB003",
    name: "Physics",
    code: "PHY-101",
    department: "Sciences",
    description: "Introduction to Physics: Mechanics and Thermodynamics",
    creditHours: 4,
    gradeLevel: ["Grade 10", "Grade 11", "Grade 12"],
    totalTeachers: 2,
    totalStudents: 65,
    status: "Active",
  },
  {
    id: "4",
    subjectId: "SUB004",
    name: "Chemistry",
    code: "CHEM-101",
    department: "Sciences",
    description: "Basic Chemistry: Organic and Inorganic compounds",
    creditHours: 4,
    gradeLevel: ["Grade 9", "Grade 10"],
    totalTeachers: 1,
    totalStudents: 58,
    status: "Active",
  },
  {
    id: "5",
    subjectId: "SUB005",
    name: "History",
    code: "HIST-101",
    department: "Humanities",
    description: "World History: Ancient to Modern",
    creditHours: 3,
    gradeLevel: ["Grade 11", "Grade 12"],
    totalTeachers: 1,
    totalStudents: 45,
    status: "Active",
  },
  {
    id: "6",
    subjectId: "SUB006",
    name: "Computer Science",
    code: "CS-101",
    department: "Technology",
    description: "Introduction to Programming and Computer Fundamentals",
    creditHours: 3,
    gradeLevel: ["Grade 9", "Grade 10", "Grade 11"],
    totalTeachers: 2,
    totalStudents: 92,
    status: "Active",
  },
  {
    id: "7",
    subjectId: "SUB007",
    name: "Biology",
    code: "BIO-101",
    department: "Sciences",
    description: "Life Sciences: Cell Biology and Ecology",
    creditHours: 4,
    gradeLevel: ["Grade 9", "Grade 10", "Grade 11"],
    totalTeachers: 2,
    totalStudents: 68,
    status: "Active",
  },
  {
    id: "8",
    subjectId: "SUB008",
    name: "Art & Design",
    code: "ART-101",
    department: "Arts",
    description: "Visual Arts and Creative Design",
    creditHours: 2,
    gradeLevel: ["Grade 9", "Grade 10"],
    totalTeachers: 1,
    totalStudents: 34,
    status: "Inactive",
  },
];

const ITEMS_PER_PAGE = 10;

export default function SubjectsManagementDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>("subject");

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.subjectId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || subject.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || subject.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedSubjects = filteredSubjects.slice(startIndex, endIndex);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "Inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleRowClick = (subject: Subject) => {
    setSelectedSubject(subject);
    setDetailsSheetOpen(true);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("Importing file:", file.name);
      setImportDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const downloadTemplate = () => {
    const csvContent =
      "Name,Code,Department,Credit Hours,Status\nMathematics,MATH-101,Sciences,4,Active";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subjects_template.csv";
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
          <h1 className="text-xl font-bold">Subjects Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage subjects and course information
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Subjects</DialogTitle>
                <DialogDescription>
                  Upload a CSV to bulk import subjects
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
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="flex-1 sm:flex-none" asChild>
            <Link href="/admin/subjects/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
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
                placeholder="Search subjects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={departmentFilter}
              onValueChange={(val) => {
                setDepartmentFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Sciences">Sciences</SelectItem>
                <SelectItem value="Languages">Languages</SelectItem>
                <SelectItem value="Humanities">Humanities</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Arts">Arts</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
            <span className="font-medium">
              Subject List ({filteredSubjects.length})
            </span>
            <span>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredSubjects.length)} of{" "}
              {filteredSubjects.length}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-background border-b">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Subject</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Department</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Teacher</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Students</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background w-[50px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubjects.map((subject) => (
                  <tr
                    key={subject.id}
                    onClick={() => handleRowClick(subject)}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {subject.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">
                            {subject.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {subject.code}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <Badge variant="outline">{subject.department}</Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">
                          {subject.totalTeachers} {subject.totalTeachers === 1 ? 'Teacher' : 'Teachers'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {subject.creditHours} Credit Hours
                        </p>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-medium">
                          {subject.totalStudents}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          subject.status
                        )}`}>
                        {subject.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubject(subject);
                              setEditDialogOpen(true);
                            }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSubject(subject);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Basic Details Sheet */}
      <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
          {selectedSubject && (
            <>
              <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedSubject.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <SheetTitle className="mb-1">
                        {selectedSubject.name}
                      </SheetTitle>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md whitespace-nowrap">
                        {selectedSubject.department}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedSubject.code}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      alert(`View all students enrolled in ${selectedSubject.name}\n\nThis would navigate to Students page with a filter for this subject.`);
                    }}>
                    <Users className="h-4 w-4 mr-2" />
                    Students
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      alert(`View materials for ${selectedSubject.name}\n\nThis would open a materials management interface.`);
                    }}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Materials
                  </Button>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {/* Subject Info - Collapsible */}
                  <Collapsible
                    open={openSection === "subject"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "subject" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Subject Information
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Department
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedSubject.department}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Credit Hours
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedSubject.creditHours}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Total Students
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedSubject.totalStudents}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Total Teachers
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedSubject.totalTeachers}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Description
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedSubject.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Teaching Staff - Collapsible */}
                  <Collapsible
                    open={openSection === "staff"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "staff" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Teaching Staff
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="pt-2">
                          <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                {selectedSubject.totalTeachers} {selectedSubject.totalTeachers === 1 ? 'Teacher' : 'Teachers'}
                              </span>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                View Teachers page for class assignments
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Grade Levels - Collapsible */}
                  <Collapsible
                    open={openSection === "grades"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "grades" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Grade Levels
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="pt-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedSubject.gradeLevel.map((grade, index) => (
                              <Badge key={index} variant="secondary">
                                {grade}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            Total: {selectedSubject.gradeLevel.length} levels
                          </p>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedSubject?.name}? This
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
                setDeleteDialogOpen(false);
                setSelectedSubject(null);
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
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update subject information for {selectedSubject?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject Name</label>
                <Input defaultValue={selectedSubject?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject Code</label>
                <Input defaultValue={selectedSubject?.code} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select defaultValue={selectedSubject?.department}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sciences">Sciences</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Credit Hours</label>
                <Input
                  type="number"
                  defaultValue={selectedSubject?.creditHours}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input defaultValue={selectedSubject?.description} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedSubject?.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
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
