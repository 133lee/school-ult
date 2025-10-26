"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ClassesTable } from "@/components/shared/data-tables/classes-table";
import { ClassDetailsSheet } from "@/components/shared/sheets/class-details-sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Users,
  GraduationCap,
  ChevronDown,
  Calendar,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ClassAssignmentDialog, StudentAssignmentDialog } from "@/components/dialogs/assignments";

interface Class {
  id: string;
  classId: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  classTeacher: string;
  totalStudents: number;
  capacity: number;
  subjects: string[];
  schedule: string;
  room: string;
  status: "Active" | "Inactive";
}

const classes: Class[] = [
  {
    id: "1",
    classId: "CLS001",
    name: "Class 9A",
    gradeLevel: "Grade 9",
    academicYear: "2024-2025",
    classTeacher: "Dr. Sarah Johnson",
    totalStudents: 32,
    capacity: 35,
    subjects: ["Mathematics", "English", "Physics", "Chemistry", "History"],
    schedule: "Monday - Friday, 8:00 AM - 3:00 PM",
    room: "Room 101",
    status: "Active",
  },
  {
    id: "2",
    classId: "CLS002",
    name: "Class 9B",
    gradeLevel: "Grade 9",
    academicYear: "2024-2025",
    classTeacher: "Mr. James Wilson",
    totalStudents: 30,
    capacity: 35,
    subjects: ["Mathematics", "English", "Physics", "Chemistry", "Geography"],
    schedule: "Monday - Friday, 8:00 AM - 3:00 PM",
    room: "Room 102",
    status: "Active",
  },
  {
    id: "3",
    classId: "CLS003",
    name: "Class 10A",
    gradeLevel: "Grade 10",
    academicYear: "2024-2025",
    classTeacher: "Ms. Emily Chen",
    totalStudents: 28,
    capacity: 35,
    subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology"],
    schedule: "Monday - Friday, 8:00 AM - 3:00 PM",
    room: "Room 201",
    status: "Active",
  },
  {
    id: "4",
    classId: "CLS004",
    name: "Class 10B",
    gradeLevel: "Grade 10",
    academicYear: "2024-2025",
    classTeacher: "Dr. Michael Brown",
    totalStudents: 33,
    capacity: 35,
    subjects: ["Mathematics", "English", "Physics", "Chemistry", "Computer Science"],
    schedule: "Monday - Friday, 8:00 AM - 3:00 PM",
    room: "Room 202",
    status: "Active",
  },
  {
    id: "5",
    classId: "CLS005",
    name: "Class 11A",
    gradeLevel: "Grade 11",
    academicYear: "2024-2025",
    classTeacher: "Mrs. Lisa Anderson",
    totalStudents: 25,
    capacity: 30,
    subjects: ["Advanced Math", "English Literature", "Physics", "Chemistry", "History"],
    schedule: "Monday - Friday, 8:00 AM - 3:30 PM",
    room: "Room 301",
    status: "Active",
  },
  {
    id: "6",
    classId: "CLS006",
    name: "Class 12A",
    gradeLevel: "Grade 12",
    academicYear: "2024-2025",
    classTeacher: "Mr. David Martinez",
    totalStudents: 27,
    capacity: 30,
    subjects: ["Calculus", "English Literature", "Physics", "Chemistry", "Computer Science"],
    schedule: "Monday - Friday, 8:00 AM - 4:00 PM",
    room: "Room 401",
    status: "Active",
  },
];

const ITEMS_PER_PAGE = 10;

export default function ClassesManagementDashboard() {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>("details");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [studentAssignmentDialogOpen, setStudentAssignmentDialogOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Class data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh class data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAssignClass = async (
    teacherId: string,
    classId: string,
    subject: string
  ) => {
    // TODO: Implement backend API call
    // For now, just show success message
    console.log(`Assigning teacher ${teacherId} to class ${classId} for ${subject}`);
    toast.success("Assignment will be saved to backend");
  };

  const handleAssignStudent = async (
    studentId: string,
    classId: string
  ) => {
    // TODO: Implement backend API call
    // For now, just show success message
    console.log(`Assigning student ${studentId} to class ${classId}`);
    toast.success("Assignment will be saved to backend");
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.classId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.classTeacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGradeLevel =
      gradeLevelFilter === "all" || classItem.gradeLevel === gradeLevelFilter;
    const matchesStatus =
      statusFilter === "all" || classItem.status === statusFilter;

    return matchesSearch && matchesGradeLevel && matchesStatus;
  });

  const totalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);

  const handleRowClick = (classItem: Class) => {
    setSelectedClass(classItem);
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
      "Name,Grade Level,Class Teacher,Capacity,Room,Status\nClass 9A,Grade 9,John Doe,35,Room 101,Active";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "classes_template.csv";
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
          <h1 className="text-xl font-bold">Classes Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage class sections and assignments
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
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Classes</DialogTitle>
                <DialogDescription>
                  Upload a CSV to bulk import classes
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
            <Link href="/admin/classes/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Class
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
                placeholder="Search classes..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={gradeLevelFilter}
              onValueChange={(val) => {
                setGradeLevelFilter(val);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Grade Level" />
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
              Class List ({filteredClasses.length})
            </span>
            <Button
              size="sm"
              onClick={() => setStudentAssignmentDialogOpen(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              Assign Students
            </Button>
          </div>
          <ScrollArea className="flex-1">
            {filteredClasses.length > 0 ? (
              <ClassesTable
                classes={paginatedClasses}
                onRowClick={handleRowClick}
                onEdit={(classItem) => {
                  setSelectedClass(classItem);
                  setEditDialogOpen(true);
                }}
                onDelete={(classItem) => {
                  setSelectedClass(classItem);
                  setDeleteDialogOpen(true);
                }}
                showActions={true}
              />
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <GraduationCap className="h-6 w-6" />
                  </EmptyMedia>
                  <EmptyTitle>No classes found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || gradeLevelFilter !== "all" || statusFilter !== "all"
                      ? "No classes match your current filters. Try adjusting your search criteria."
                      : "Get started by creating your first class section."}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
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
        </CardContent>
      </Card>

      {/* Basic Details Sheet */}
      <ClassDetailsSheet
        classItem={selectedClass}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        showActionButtons={true}
        onManageTeachers={() => setAssignmentDialogOpen(true)}
      />

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedClass?.name}? This action
              cannot be undone.
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
                setSelectedClass(null);
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
            <DialogTitle>Edit Class</DialogTitle>
            <DialogDescription>
              Update class information for {selectedClass?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Class Name</label>
                <Input defaultValue={selectedClass?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Grade Level</label>
                <Select defaultValue={selectedClass?.gradeLevel}>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room</label>
                <Input defaultValue={selectedClass?.room} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Capacity</label>
                <Input
                  type="number"
                  defaultValue={selectedClass?.capacity}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Input defaultValue={selectedClass?.academicYear} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedClass?.status}>
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

      {/* Class Assignment Dialog */}
      <ClassAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        classItem={selectedClass}
        availableTeachers={[
          { id: "1", name: "Dr. Sarah Johnson", subject: "Mathematics", primarySubject: "Mathematics", secondarySubject: "Physics" },
          { id: "2", name: "Mr. James Wilson", subject: "English Literature", primarySubject: "English", secondarySubject: "Literature" },
          { id: "3", name: "Ms. Emily Chen", subject: "Physics", primarySubject: "Physics", secondarySubject: "Mathematics" },
          { id: "4", name: "Dr. Michael Brown", subject: "Chemistry", primarySubject: "Chemistry", secondarySubject: undefined },
          { id: "5", name: "Mrs. Lisa Anderson", subject: "History", primarySubject: "History", secondarySubject: undefined },
          { id: "6", name: "Mr. David Martinez", subject: "Computer Science", primarySubject: "Computer Science", secondarySubject: undefined },
        ]}
        onAssign={handleAssignClass}
        currentAssignments={[]}
      />

      {/* Student Assignment Dialog */}
      <StudentAssignmentDialog
        open={studentAssignmentDialogOpen}
        onOpenChange={setStudentAssignmentDialogOpen}
        availableClasses={classes.map((cls) => ({
          id: cls.id,
          name: cls.name,
          gradeLevel: cls.gradeLevel,
          capacity: cls.capacity,
        }))}
        availableStudents={[
          { id: "s1", name: "Ahmed Ali", studentId: "STU001", gradeLevel: "Grade 9", status: "Active" },
          { id: "s2", name: "Fatima Hassan", studentId: "STU002", gradeLevel: "Grade 9", status: "Active" },
          { id: "s3", name: "Mohamed Ibrahim", studentId: "STU003", gradeLevel: "Grade 9", status: "Active" },
          { id: "s4", name: "Layla Ahmed", studentId: "STU004", gradeLevel: "Grade 10", status: "Active" },
          { id: "s5", name: "Omar Khalid", studentId: "STU005", gradeLevel: "Grade 10", status: "Active" },
          { id: "s6", name: "Noor Mahmoud", studentId: "STU006", gradeLevel: "Grade 10", status: "Active" },
          { id: "s7", name: "Hana Rashid", studentId: "STU007", gradeLevel: "Grade 11", status: "Active" },
          { id: "s8", name: "Zain Abdullah", studentId: "STU008", gradeLevel: "Grade 11", status: "Active" },
          { id: "s9", name: "Maha Saleh", studentId: "STU009", gradeLevel: "Grade 12", status: "Active" },
          { id: "s10", name: "Karim Hassan", studentId: "STU010", gradeLevel: "Grade 12", status: "Active" },
        ]}
        onAssign={handleAssignStudent}
        currentAssignments={{}}
      />
    </div>
  );
}
