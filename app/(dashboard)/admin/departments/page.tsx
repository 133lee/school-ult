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
  BookOpen,
  MapPin,
  Award,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";

interface Department {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  departmentHead: string;
  headEmail: string;
  headPhone: string;
  officeLocation: string;
  totalTeachers: number;
  totalSubjects: number;
  totalStudents: number;
  status: "Active" | "Inactive";
  establishedYear: string;
}

const departments: Department[] = [
  {
    id: "1",
    departmentId: "DEPT001",
    name: "Sciences",
    description: "Mathematics, Physics, Chemistry, Biology and related scientific disciplines",
    departmentHead: "Dr. Sarah Johnson",
    headEmail: "sarah.johnson@school.edu",
    headPhone: "(555) 123-4567",
    officeLocation: "Building A, Room 101",
    totalTeachers: 12,
    totalSubjects: 8,
    totalStudents: 245,
    status: "Active",
    establishedYear: "1995",
  },
  {
    id: "2",
    departmentId: "DEPT002",
    name: "Languages",
    description: "English, Literature, Foreign Languages and Communication Studies",
    departmentHead: "Mr. James Wilson",
    headEmail: "james.wilson@school.edu",
    headPhone: "(555) 234-5678",
    officeLocation: "Building B, Room 205",
    totalTeachers: 8,
    totalSubjects: 5,
    totalStudents: 198,
    status: "Active",
    establishedYear: "1995",
  },
  {
    id: "3",
    departmentId: "DEPT003",
    name: "Humanities",
    description: "History, Geography, Social Studies and Cultural Studies",
    departmentHead: "Mrs. Lisa Anderson",
    headEmail: "lisa.anderson@school.edu",
    headPhone: "(555) 345-6789",
    officeLocation: "Building C, Room 302",
    totalTeachers: 6,
    totalSubjects: 4,
    totalStudents: 156,
    status: "Active",
    establishedYear: "1998",
  },
  {
    id: "4",
    departmentId: "DEPT004",
    name: "Technology",
    description: "Computer Science, Information Technology and Digital Media",
    departmentHead: "Mr. David Martinez",
    headEmail: "david.martinez@school.edu",
    headPhone: "(555) 456-7890",
    officeLocation: "Building D, Room 401",
    totalTeachers: 5,
    totalSubjects: 3,
    totalStudents: 132,
    status: "Active",
    establishedYear: "2005",
  },
  {
    id: "5",
    departmentId: "DEPT005",
    name: "Arts",
    description: "Visual Arts, Music, Drama and Creative Expression",
    departmentHead: "Ms. Jennifer Lee",
    headEmail: "jennifer.lee@school.edu",
    headPhone: "(555) 567-8901",
    officeLocation: "Building E, Room 101",
    totalTeachers: 4,
    totalSubjects: 6,
    totalStudents: 98,
    status: "Active",
    establishedYear: "2000",
  },
];

const ITEMS_PER_PAGE = 10;

interface Teacher {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  joinYear: string;
}

// Mock data for department teachers
const allTeachers: Teacher[] = [
  { id: "T001", name: "Mr. John Smith", email: "john.smith@school.edu", status: "Active", joinYear: "2015" },
  { id: "T002", name: "Mrs. Mary Johnson", email: "mary.johnson@school.edu", status: "Active", joinYear: "2018" },
  { id: "T003", name: "Mr. David Wilson", email: "david.wilson@school.edu", status: "Active", joinYear: "2020" },
  { id: "T004", name: "Ms. Sarah Brown", email: "sarah.brown@school.edu", status: "Inactive", joinYear: "2019" },
  { id: "T005", name: "Mr. Robert Garcia", email: "robert.garcia@school.edu", status: "Active", joinYear: "2016" },
  { id: "T006", name: "Mrs. Emily Davis", email: "emily.davis@school.edu", status: "Active", joinYear: "2021" },
  { id: "T007", name: "Mr. James Miller", email: "james.miller@school.edu", status: "Active", joinYear: "2017" },
  { id: "T008", name: "Ms. Lisa Anderson", email: "lisa.anderson@school.edu", status: "Active", joinYear: "2019" },
];

// Department to teachers mapping
const departmentMembers: Record<string, string[]> = {
  "1": ["T001", "T002", "T005", "T007"], // Sciences
  "2": ["T003", "T004", "T008"], // Languages
  "3": ["T006"], // Humanities
  "4": [], // Technology
  "5": [], // Arts
};

export default function DepartmentsManagementDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>("info");

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.departmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.departmentHead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || dept.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredDepartments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedDepartments = filteredDepartments.slice(startIndex, endIndex);

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

  const handleRowClick = (dept: Department) => {
    setSelectedDepartment(dept);
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
      "Name,Description,Department Head,Office Location,Status\nSciences,Mathematics and Science subjects,John Doe,Building A Room 101,Active";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "departments_template.csv";
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
          <h1 className="text-xl font-bold">Departments Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage academic departments and leadership
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
                <DialogTitle>Import Departments</DialogTitle>
                <DialogDescription>
                  Upload a CSV to bulk import departments
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
            <Link href="/admin/departments/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Department
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
                placeholder="Search departments..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
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
              Department List ({filteredDepartments.length})
            </span>
            <span>
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredDepartments.length)} of{" "}
              {filteredDepartments.length}
            </span>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-20 bg-background border-b">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Department</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Department Head</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Teachers</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Subjects</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background w-[50px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    onClick={() => handleRowClick(dept)}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {dept.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">{dept.name}</p>
                          <p className="text-xs text-gray-500">
                            {dept.departmentId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">
                          {dept.departmentHead}
                        </p>
                        <p className="text-xs text-gray-500">
                          {dept.officeLocation}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-medium">
                          {dept.totalTeachers}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="h-3 w-3 text-gray-500" />
                        <span className="text-sm font-medium">
                          {dept.totalSubjects}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          dept.status
                        )}`}>
                        {dept.status}
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
                              setSelectedDepartment(dept);
                              setEditDialogOpen(true);
                            }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDepartment(dept);
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
          {selectedDepartment && (
            <>
              <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedDepartment.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <SheetTitle className="mb-1">
                        {selectedDepartment.name}
                      </SheetTitle>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md whitespace-nowrap">
                        {selectedDepartment.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedDepartment.departmentId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      toast.info(`Navigating to ${selectedDepartment.totalTeachers} teachers in ${selectedDepartment.name}`);
                      // In a real app: router.push(`/admin/teachers?department=${selectedDepartment?.id}`)
                    }}>
                    <Users className="h-4 w-4 mr-2" />
                    Teachers
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      toast.info(`Navigating to ${selectedDepartment.totalSubjects} subjects in ${selectedDepartment.name}`);
                      // In a real app: router.push(`/admin/subjects?department=${selectedDepartment?.id}`)
                    }}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Subjects
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    const deptMembers = departmentMembers[selectedDepartment.id] || [];
                    setSelectedMembers(deptMembers);
                    setMemberSearchQuery("");
                    setMembersDialogOpen(true);
                  }}
                  className="w-full mt-4"
                  size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Members
                </Button>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {/* Department Info - Collapsible */}
                  <Collapsible
                    open={openSection === "info"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "info" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Department Information
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Description
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.description}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Established
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.establishedYear}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Office Location
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.officeLocation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Department Head - Collapsible */}
                  <Collapsible
                    open={openSection === "head"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "head" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Department Head
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Name
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.departmentHead}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Email
                            </label>
                            <p className="text-sm font-medium mt-0.5 break-all">
                              {selectedDepartment.headEmail}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Phone
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.headPhone}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Statistics - Collapsible */}
                  <Collapsible
                    open={openSection === "stats"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "stats" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Statistics
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Total Teachers
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.totalTeachers}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Total Subjects
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.totalSubjects}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Total Students Enrolled
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedDepartment.totalStudents}
                            </p>
                          </div>
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
            <DialogTitle>Delete Department</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedDepartment?.name}? This
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
                setSelectedDepartment(null);
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
            <DialogTitle>Edit Department</DialogTitle>
            <DialogDescription>
              Update department information for {selectedDepartment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Department Name</label>
                <Input defaultValue={selectedDepartment?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Established Year</label>
                <Input defaultValue={selectedDepartment?.establishedYear} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input defaultValue={selectedDepartment?.description} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Office Location</label>
              <Input defaultValue={selectedDepartment?.officeLocation} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedDepartment?.status}>
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

      {/* Department Members Dialog */}
      <Dialog open={membersDialogOpen} onOpenChange={setMembersDialogOpen}>
        <DialogContent className="!w-[90vw] !max-w-[1200px] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Department Members</DialogTitle>
            <DialogDescription>
              Add or remove members from {selectedDepartment?.name} department
            </DialogDescription>
          </DialogHeader>

          {/* Two Column Layout */}
          <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4 min-h-0">
            {/* Column 1: Available Teachers */}
            <div className="border rounded-lg p-4 space-y-4 overflow-hidden flex flex-col">
              <h4 className="font-semibold text-sm shrink-0">Available Teachers</h4>

              <div className="space-y-4 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <label htmlFor="member-search" className="text-sm font-medium">
                    Search Teachers
                  </label>
                  <Input
                    id="member-search"
                    placeholder="Search by name or email..."
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  {allTeachers
                    .filter((teacher) =>
                      teacher.name
                        .toLowerCase()
                        .includes(memberSearchQuery.toLowerCase()) ||
                      teacher.email
                        .toLowerCase()
                        .includes(memberSearchQuery.toLowerCase())
                    )
                    .map((teacher) => (
                      <button
                        key={teacher.id}
                        onClick={() => {
                          if (selectedMembers.includes(teacher.id)) {
                            setSelectedMembers(
                              selectedMembers.filter((id) => id !== teacher.id)
                            );
                          } else {
                            setSelectedMembers([...selectedMembers, teacher.id]);
                          }
                        }}
                        className={`w-full text-left p-3 rounded-md transition-colors text-sm border ${
                          selectedMembers.includes(teacher.id)
                            ? "bg-green-50 border-green-200"
                            : "bg-white hover:bg-primary/10 border-muted hover:border-primary cursor-pointer hover:shadow-sm"
                        }`}>
                        <div className="font-medium">{teacher.name}</div>
                        <div className="text-xs opacity-75">{teacher.email}</div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Column 2: Selected Members */}
            <div className="border rounded-lg p-4 overflow-hidden flex flex-col">
              <h4 className="font-semibold text-sm mb-3 shrink-0">
                Department Members ({selectedMembers.length})
              </h4>

              {selectedMembers.length > 0 ? (
                <ScrollArea className="flex-1 border rounded-lg p-2">
                  <div className="space-y-2">
                    {selectedMembers.map((memberId) => {
                      const teacher = allTeachers.find((t) => t.id === memberId);
                      if (!teacher) return null;
                      return (
                        <div
                          key={memberId}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <div className="font-medium text-sm">
                              {teacher.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Joined {teacher.joinYear}
                            </div>
                            <Badge
                              variant={
                                teacher.status === "Active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="mt-1 text-xs">
                              {teacher.status}
                            </Badge>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              setSelectedMembers(
                                selectedMembers.filter((id) => id !== memberId)
                              )
                            }>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center">
                  <div className="text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No members assigned yet</p>
                    <p className="text-xs opacity-75">
                      Select teachers from the left to add them
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 shrink-0 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setMembersDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(
                  `Updated ${selectedDepartment?.name} members (${selectedMembers.length} members)`
                );
                setMembersDialogOpen(false);
              }}>
              Save Members
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
