"use client";

import React, { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Phone,
  MapPin,
  MoreVertical,
  RefreshCw,
  Edit,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
  Upload,
  Plus,
  Download,
  FileText,
  BookOpen,
  Calendar,
  Award,
  ChevronDown,
  Send,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { toast } from "sonner";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { TeacherAssignmentDialog } from "@/components/dialogs/assignments";

interface Teacher {
  id: string;
  name: string;
  teacherId: string;
  email: string;
  phone: string;
  photoUrl: string;
  subject: string;
  department: string;
  hireDate: string;
  gender: string;
  dateOfBirth: string;
  qualification: string;
  experience: string;
  address: string;
  status: "Active" | "On Leave" | "Inactive";
  classesAssigned: string[];
}

const teachers: Teacher[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    teacherId: "TCH001",
    email: "sarah.johnson@school.edu",
    phone: "(555) 123-4567",
    photoUrl: "https://i.pravatar.cc/150?img=5",
    subject: "Mathematics",
    department: "Sciences",
    hireDate: "2018-08-15",
    gender: "Female",
    dateOfBirth: "1985-03-22",
    qualification: "Ph.D. in Mathematics",
    experience: "12 years",
    address: "123 Main Street, San Francisco, CA 94103",
    status: "Active",
    classesAssigned: ["Class 9A", "Class 10A", "Class 11A"],
  },
  {
    id: "2",
    name: "Mr. James Wilson",
    teacherId: "TCH002",
    email: "james.wilson@school.edu",
    phone: "(555) 234-5678",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    subject: "English Literature",
    department: "Languages",
    hireDate: "2019-01-10",
    gender: "Male",
    dateOfBirth: "1988-07-15",
    qualification: "M.A. in English",
    experience: "8 years",
    address: "456 Oak Avenue, San Francisco, CA 94105",
    status: "Active",
    classesAssigned: ["Class 9B", "Class 10B"],
  },
  {
    id: "3",
    name: "Ms. Emily Chen",
    teacherId: "TCH003",
    email: "emily.chen@school.edu",
    phone: "(555) 345-6789",
    photoUrl: "https://i.pravatar.cc/150?img=9",
    subject: "Physics",
    department: "Sciences",
    hireDate: "2017-09-01",
    gender: "Female",
    dateOfBirth: "1987-11-08",
    qualification: "M.Sc. in Physics",
    experience: "10 years",
    address: "789 Pine Street, San Francisco, CA 94107",
    status: "Active",
    classesAssigned: ["Class 10A", "Class 11A", "Class 12A"],
  },
  {
    id: "4",
    name: "Dr. Michael Brown",
    teacherId: "TCH004",
    email: "michael.brown@school.edu",
    phone: "(555) 456-7890",
    photoUrl: "https://i.pravatar.cc/150?img=13",
    subject: "Chemistry",
    department: "Sciences",
    hireDate: "2016-07-20",
    gender: "Male",
    dateOfBirth: "1982-05-14",
    qualification: "Ph.D. in Chemistry",
    experience: "15 years",
    address: "321 Elm Street, San Francisco, CA 94109",
    status: "Active",
    classesAssigned: ["Class 9A", "Class 10A"],
  },
  {
    id: "5",
    name: "Mrs. Lisa Anderson",
    teacherId: "TCH005",
    email: "lisa.anderson@school.edu",
    phone: "(555) 567-8901",
    photoUrl: "https://i.pravatar.cc/150?img=20",
    subject: "History",
    department: "Humanities",
    hireDate: "2020-02-15",
    gender: "Female",
    dateOfBirth: "1990-09-30",
    qualification: "M.A. in History",
    experience: "6 years",
    address: "654 Cedar Lane, San Francisco, CA 94111",
    status: "On Leave",
    classesAssigned: ["Class 11A", "Class 12A"],
  },
  {
    id: "6",
    name: "Mr. David Martinez",
    teacherId: "TCH006",
    email: "david.martinez@school.edu",
    phone: "(555) 678-9012",
    photoUrl: "https://i.pravatar.cc/150?img=15",
    subject: "Computer Science",
    department: "Technology",
    hireDate: "2019-08-01",
    gender: "Male",
    dateOfBirth: "1989-12-10",
    qualification: "B.Tech in CS",
    experience: "7 years",
    address: "987 Maple Drive, San Francisco, CA 94113",
    status: "Active",
    classesAssigned: ["Class 9A", "Class 10A", "Class 11A"],
  },
];

const ITEMS_PER_PAGE = 10;

export default function TeacherManagementDashboard() {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [sendingInvites, setSendingInvites] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openSection, setOpenSection] = useState<string | null>("professional");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success("Teacher data refreshed successfully");
    } catch (error) {
      toast.error("Failed to refresh teacher data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAssignTeacher = async (
    teacherId: string,
    classId: string,
    subject: string
  ) => {
    // TODO: Implement backend API call
    // For now, just show success message
    console.log(`Assigning teacher ${teacherId} to class ${classId} for ${subject}`);
    toast.success("Assignment will be saved to backend");
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" || teacher.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" || teacher.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700 border-green-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Inactive":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const handleRowClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailsSheetOpen(true);
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

      // Expected headers for teachers
      const requiredHeaders = ["name", "email", "subject", "department"];
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
      const importedTeachers: typeof teachers = [];
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

        const newTeacher = {
          id: `TCH${Date.now()}-${i}`,
          name: rowData["name"],
          email: rowData["email"],
          subject: rowData["subject"],
          department: rowData["department"],
          status: (rowData["status"] || "Active") as "Active" | "Inactive",
          phone: rowData["phone"] || "N/A",
          qualifications: rowData["qualifications"] || "N/A",
          joinDate: new Date().toLocaleDateString(),
          classes: [],
          performance: {
            avgScore: 0,
            passRate: 0,
            attendance: 0,
          },
        };

        // Validate required fields
        if (newTeacher.name && newTeacher.email && newTeacher.subject) {
          importedTeachers.push(newTeacher);
        } else {
          errorCount++;
        }
      }

      if (importedTeachers.length === 0) {
        toast.error("No valid teacher records found in the CSV");
        return;
      }

      // Add imported teachers to the list
      setTeachers([...teachers, ...importedTeachers]);

      setImportDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast.success(
        `Successfully imported ${importedTeachers.length} teacher${
          importedTeachers.length > 1 ? "s" : ""
        }${errorCount > 0 ? ` (${errorCount} invalid rows skipped)` : ""}`
      );
    } catch (error) {
      console.error("Error importing file:", error);
      toast.error("Failed to import CSV file. Please check the format.");
    }
  };

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/teachers_template.csv";
    link.download = "teachers_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkInvite = async () => {
    setSendingInvites(true);

    // Simulate sending invites
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real application, this would:
    // 1. Get all teachers who haven't been invited yet
    // 2. Send email invites with temporary passwords
    // 3. Update teacher status to "invited"

    console.log("Sending invites to all teachers...");
    setSendingInvites(false);
    setInviteDialogOpen(false);
    alert(`Invites sent successfully to ${teachers.length} teachers!`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Teachers Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage teacher information and assignments
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
                <DialogTitle>Import Teachers</DialogTitle>
                <DialogDescription>
                  Upload a CSV to bulk import teachers
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
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setInviteDialogOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send Invites
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Login Invites</DialogTitle>
                <DialogDescription>
                  Send email invites to all teachers with their login credentials
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm">
                    This will send email invites to <strong>{teachers.length} teachers</strong> with:
                  </p>
                  <ul className="list-disc list-inside text-sm mt-2 space-y-1 text-muted-foreground">
                    <li>Temporary login credentials</li>
                    <li>Link to set their password</li>
                    <li>Welcome message with instructions</li>
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setInviteDialogOpen(false)}
                    className="flex-1"
                    disabled={sendingInvites}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkInvite}
                    className="flex-1"
                    disabled={sendingInvites}>
                    <Send className="h-4 w-4 mr-2" />
                    {sendingInvites ? "Sending..." : "Send Invites"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button className="flex-1 sm:flex-none" asChild>
            <Link href="/admin/teachers/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
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
                placeholder="Search teachers..."
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
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {filteredTeachers.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3 text-sm text-gray-500">
                <span className="font-medium">
                  Teacher List ({filteredTeachers.length})
                </span>
                <span>
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredTeachers.length)} of{" "}
                  {filteredTeachers.length}
                </span>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0 z-20 bg-background border-b">
                    <tr>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Teacher</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Subject & Department</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Contact Information</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background">Status</th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-background w-[50px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTeachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    onClick={() => handleRowClick(teacher)}
                    className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={teacher.photoUrl}
                            alt={teacher.name}
                          />
                          <AvatarFallback>
                            {teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {teacher.teacherId}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-sm">
                        <p className="font-medium text-gray-800">
                          {teacher.subject}
                        </p>
                        <p className="text-xs text-gray-500">
                          {teacher.department}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-sm">
                        <div className="flex items-center gap-1.5 text-gray-700 mb-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-xs">{teacher.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Phone className="h-3 w-3" />
                          <span className="text-xs">{teacher.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                          teacher.status
                        )}`}>
                        {teacher.status}
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
                              setSelectedTeacher(teacher);
                              setEditDialogOpen(true);
                            }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTeacher(teacher);
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
            </>
          ) : (
            <Empty className="h-96">
              <EmptyContent>
                <EmptyMedia variant="icon">
                  <BookOpen className="h-6 w-6" />
                </EmptyMedia>
                <EmptyHeader>
                  <EmptyTitle>No teachers found</EmptyTitle>
                  <EmptyDescription>
                    {searchQuery || departmentFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters or search terms"
                      : "Start by adding new teachers to the system"}
                  </EmptyDescription>
                </EmptyHeader>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* Basic Details Sheet */}
      <Sheet open={detailsSheetOpen} onOpenChange={setDetailsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0 overflow-hidden flex flex-col">
          {selectedTeacher && (
            <>
              <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedTeacher.photoUrl}
                      alt={selectedTeacher.name}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedTeacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <SheetTitle className="mb-1">{selectedTeacher.name}</SheetTitle>
                      <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md whitespace-nowrap">
                        {selectedTeacher.subject}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {selectedTeacher.teacherId}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = `tel:${selectedTeacher.phone}`}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => window.location.href = `mailto:${selectedTeacher.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </SheetHeader>

              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4">
                  {/* Professional Info - Collapsible */}
                  <Collapsible
                    open={openSection === "professional"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "professional" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Professional Information
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Subject
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.subject}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Department
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.department}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Qualification
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.qualification}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Experience
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.experience}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Hire Date
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.hireDate}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Contact Info - Collapsible */}
                  <Collapsible
                    open={openSection === "contact"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "contact" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Contact Information
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pt-2">
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Email
                            </label>
                            <p className="text-sm font-medium mt-0.5 break-all">
                              {selectedTeacher.email}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Phone
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.phone}
                            </p>
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">
                              Gender
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.gender}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-muted-foreground">
                              Address
                            </label>
                            <p className="text-sm font-medium mt-0.5">
                              {selectedTeacher.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Classes Assigned - Collapsible */}
                  <Collapsible
                    open={openSection === "classes"}
                    onOpenChange={(isOpen) =>
                      setOpenSection(isOpen ? "classes" : null)
                    }
                    className="border rounded-lg">
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Classes Assigned
                      </h3>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                      <div className="px-4 pb-4">
                        <div className="pt-2 space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {selectedTeacher.classesAssigned.map((className, index) => (
                              <Badge key={index} variant="secondary">
                                {className}
                              </Badge>
                            ))}
                          </div>
                          <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                              Total: {selectedTeacher.classesAssigned.length} classes
                            </p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAssignmentDialogOpen(true)}
                              className="w-full"
                            >
                              <BookOpen className="h-4 w-4 mr-2" />
                              Manage Assignments
                            </Button>
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
            <DialogTitle>Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedTeacher?.name}? This
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
                setSelectedTeacher(null);
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
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update teacher information for {selectedTeacher?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input defaultValue={selectedTeacher?.name} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher ID</label>
                <Input defaultValue={selectedTeacher?.teacherId} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input defaultValue={selectedTeacher?.email} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input defaultValue={selectedTeacher?.phone} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Input defaultValue={selectedTeacher?.subject} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select defaultValue={selectedTeacher?.department}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sciences">Sciences</SelectItem>
                    <SelectItem value="Languages">Languages</SelectItem>
                    <SelectItem value="Humanities">Humanities</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select defaultValue={selectedTeacher?.status}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
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

      {/* Teacher Assignment Dialog */}
      <TeacherAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        teacher={selectedTeacher}
        availableClasses={[
          { id: "1", name: "Class 9A", gradeLevel: "Grade 9", subjects: ["Mathematics", "English", "Physics", "Chemistry", "History"] },
          { id: "2", name: "Class 9B", gradeLevel: "Grade 9", subjects: ["Mathematics", "English", "Physics", "Chemistry", "Geography"] },
          { id: "3", name: "Class 10A", gradeLevel: "Grade 10", subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology"] },
          { id: "4", name: "Class 10B", gradeLevel: "Grade 10", subjects: ["Mathematics", "English", "Physics", "Chemistry", "Computer Science"] },
          { id: "5", name: "Class 11A", gradeLevel: "Grade 11", subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology"] },
          { id: "6", name: "Class 12A", gradeLevel: "Grade 12", subjects: ["Mathematics", "English", "Physics", "Chemistry", "Computer Science"] },
        ]}
        onAssign={handleAssignTeacher}
        currentAssignments={selectedTeacher?.classesAssigned.map((cls) => ({
          classId: cls,
          className: cls,
          subject: selectedTeacher.subject || "",
        })) || []}
      />
    </div>
  );
}
