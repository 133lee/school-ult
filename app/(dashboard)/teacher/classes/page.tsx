"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  GraduationCap,
  MoreVertical,
  Check,
  X,
  Clock,
  Eye,
  ListCheck,
  Download,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AttendanceTrendChart } from "@/components/classes/attendance-trend-chart";
import { DetailedAttendanceSheet } from "@/components/classes/detailed-attendance-sheet";
import { History } from "lucide-react";
import { useInvalidation } from "@/hooks/useInvalidation";
import { toast } from "sonner";

type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface ClassData {
  id: string;
  name: string;
  gradeLevel?: string;
  totalStudents?: number;
  capacity?: number;
  isClassTeacher: boolean;
  teachingSubject?: string;
  status: string;
}

interface StudentData {
  id: string;
  name: string;
  gender: "M" | "F";
  age: number;
}

export default function TeacherClassesPage() {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState<
    Record<string, AttendanceStatus>
  >({});
  const [attendanceRemarks, setAttendanceRemarks] = useState<
    Record<string, string>
  >({});
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [activeTermId, setActiveTermId] = useState<string | null>(null);
  const [attendanceSheetOpen, setAttendanceSheetOpen] = useState(false);

  // State for API data
  const [classTeacherClasses, setClassTeacherClasses] = useState<ClassData[]>(
    []
  );
  const [subjectTeacherClasses, setSubjectTeacherClasses] = useState<
    ClassData[]
  >([]);
  const [studentsByClass, setStudentsByClass] = useState<
    Record<string, StudentData[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allClasses = [...classTeacherClasses, ...subjectTeacherClasses];
  const selectedClass = allClasses.find((c) => c.id === selectedClassId);
  const selectedStudents = selectedClassId
    ? studentsByClass[selectedClassId] || []
    : [];

  // Check if selected class is a class teacher class (not subject teacher)
  const isClassTeacher = classTeacherClasses.some(
    (c) => c.id === selectedClassId
  );

  // Fetch active term on mount
  useEffect(() => {
    const fetchActiveTerm = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await fetch("/api/terms/active", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();

          // API returns { success: true, data: {...} } - must check success flag
          if (!result.success) {
            console.error("Failed to fetch active term:", result.error);
            return;
          }

          const data = result.data;
          setActiveTermId(data.id);
        } else if (response.status === 401) {
          console.error("Unauthorized - please log in again");
        }
      } catch (err) {
        console.error("Error fetching active term:", err);
      }
    };

    fetchActiveTerm();
  }, []);

  // Fetch classes helper
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch("/api/teacher/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();

        // API returns { success: true, data: {...} } - must check success flag
        if (!result.success) {
          setError(result.error || "Failed to load classes");
          setClassTeacherClasses([]);
          setSubjectTeacherClasses([]);
          return;
        }

        const data = result.data;
        setClassTeacherClasses(data.classTeacherClasses || []);
        setSubjectTeacherClasses(data.subjectTeacherClasses || []);
        setError(null); // Clear any previous errors

        // Set default selected class (first class teacher class, or first subject teacher class)
        if (data.classTeacherClasses?.length > 0) {
          setSelectedClassId(data.classTeacherClasses[0].id);
        } else if (data.subjectTeacherClasses?.length > 0) {
          setSelectedClassId(data.subjectTeacherClasses[0].id);
        }
        // If no classes at all, that's OK - will show empty state
      } else if (response.status === 401) {
        setError("Unauthorized - please log in again");
      } else {
        // Parse error message from API if available
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || `Failed to load classes (${response.status})`);
      }
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Error loading classes");
    } finally {
      setLoading(false);
    }
  };

  /**
   * FRESHNESS POLICY:
   * - Refetch on mount
   * - Immediate refetch on 'teacher-classes' invalidation (operational page)
   * - Operational correctness: Teacher must see newly assigned classes without manual refresh
   *
   * ARCHITECTURAL INVARIANT:
   * - Invalidation signals MUST NOT be discarded
   * - Visibility guard removed: operational data requires eager correctness
   * - Cost of refetch is acceptable; frequency is low
   */
  useInvalidation('teacher-classes', () => {
    fetchClasses(); // Always refetch - correctness > micro-optimization
  });

  // Fetch classes on mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Fetch students when a class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassId || studentsByClass[selectedClassId]) {
        // Already have students for this class
        return;
      }

      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const response = await fetch(
          `/api/teacher/classes/${selectedClassId}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const result = await response.json();

          // API returns { success: true, data: {...} } - must check success flag
          if (!result.success) {
            console.error("API returned success=false:", result.error);
            return;
          }

          const data = result.data;
          setStudentsByClass((prev) => ({
            ...prev,
            [selectedClassId]: data.students || [],
          }));
        } else if (response.status === 401) {
          console.error("Unauthorized - please log in again");
        } else {
          console.error("Failed to load students");
        }
      } catch (err) {
        console.error("Error fetching students:", err);
      }
    };

    fetchStudents();
  }, [selectedClassId, studentsByClass]);

  const handleOpenAttendance = () => {
    // Initialize all students as PRESENT by default
    const initialRecords: Record<string, AttendanceStatus> = {};
    selectedStudents.forEach((student) => {
      initialRecords[student.id] = "PRESENT";
    });
    setAttendanceRecords(initialRecords);
    setAttendanceRemarks({});
    setAttendanceDialogOpen(true);
  };

  const handleAttendanceStatusChange = (
    studentId: string,
    status: AttendanceStatus
  ) => {
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!activeTermId) {
      toast.error("No active term found. Please contact administrator.");
      return;
    }

    if (!selectedClassId) {
      toast.error("No class selected.");
      return;
    }

    try {
      setSavingAttendance(true);
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("No authentication token found. Please log in again.");
        return;
      }

      // Create date at UTC midnight for consistent storage across timezones
      const now = new Date();
      const todayUtc = new Date(Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        0, 0, 0, 0
      ));

      const payload = {
        classId: selectedClassId,
        termId: activeTermId,
        date: todayUtc.toISOString(),
        records: selectedStudents.map((student) => ({
          studentId: student.id,
          status: attendanceRecords[student.id],
          remarks: attendanceRemarks[student.id] || undefined,
        })),
      };

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();

        // API returns { success: true, data: {...} } - must check success flag
        if (!result.success) {
          toast.error(result.error || "Failed to save attendance");
          return;
        }

        toast.success("Attendance saved successfully!");
        setAttendanceDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to save attendance");
      }
    } catch (err) {
      console.error("Error saving attendance:", err);
      toast.error("Error saving attendance. Please try again.");
    } finally {
      setSavingAttendance(false);
    }
  };

  // Calculate gender distribution for selected class
  const genderDistribution = selectedStudents.reduce(
    (acc, student) => {
      if (student.gender === "M") {
        acc.boys++;
      } else {
        acc.girls++;
      }
      return acc;
    },
    { boys: 0, girls: 0 }
  );

  // Export class list as CSV
  const handleExportClassList = async (classId: string, mode: "class" | "subject") => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      toast.info("Generating class list...");

      const response = await fetch(
        `/api/teacher/classes/export-class-list?classId=${classId}&mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to export class list");
      }

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1]?.replace(/"/g, "")
        : `class_list_${new Date().toISOString().split("T")[0]}.csv`;

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("Class list exported successfully");
    } catch (error: any) {
      console.error("Error exporting class list:", error);
      toast.error(error.message || "Failed to export class list");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">My Classes</h1>
          <p className="text-muted-foreground text-sm">
            {loading
              ? "Loading classes..."
              : `${allClasses.length} ${
                  allClasses.length === 1 ? "class" : "classes"
                } assigned to you`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Class List with Tabs */}
        <div className="lg:col-span-2">
          <Card className="flex flex-col h-[calc(100vh-7rem)]">
            <CardContent className="flex-1 overflow-hidden p-0">
              <Tabs
                defaultValue="class-teacher"
                className="h-full flex flex-col">
                <div className="px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="class-teacher">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Class Teacher
                    </TabsTrigger>
                    <TabsTrigger value="subject-teacher">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Subject Teacher
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent
                  value="class-teacher"
                  className="flex-1 overflow-hidden mt-0 px-6 pb-6">
                  <ScrollArea className="h-full">
                    <div className="pt-4">
                      {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <p>Loading class assignments...</p>
                        </div>
                      ) : (
                        <>
                          <table className="w-full">
                            <thead className="border-b">
                              <tr>
                                <th className="text-left py-3 px-2 font-semibold text-sm">
                                  Class
                                </th>
                                <th className="text-left py-3 px-2 font-semibold text-sm">
                                  Subject
                                </th>
                                <th className="text-left py-3 px-2 font-semibold text-sm">
                                  Status
                                </th>
                                <th className="text-center py-3 px-2 font-semibold text-sm">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {classTeacherClasses.map((classItem, index) => (
                                <tr
                                  key={classItem.id}
                                  className={`border-b hover:bg-muted/50 transition-colors ${
                                    index % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/30"
                                  } ${
                                    selectedClassId === classItem.id
                                      ? "bg-primary/10"
                                      : ""
                                  }`}>
                                  <td className="py-3 px-2">
                                    <div>
                                      <p className="font-semibold text-sm">
                                        {classItem.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {classItem.totalStudents || 0}/
                                        {classItem.capacity || 0} students
                                      </p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">
                                    <span className="text-sm font-medium text-blue-600">
                                      {classItem.teachingSubject || "—"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2">
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-100 text-green-700 hover:bg-green-100">
                                      {classItem.status}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <div className="flex gap-1 justify-center">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setSelectedClassId(classItem.id)
                                        }
                                        className="h-8 w-8 p-0"
                                        title="View details">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleExportClassList(classItem.id, "class")
                                        }
                                        className="h-8 w-8 p-0"
                                        title="Export class list">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {classTeacherClasses.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              <p>No class assigned as class teacher</p>
                            </div>
                          )}
                        </>
                      )}

                      {/* Attendance Trend Chart - Only for Class Teacher */}
                      {classTeacherClasses.length > 0 && (
                        <AttendanceTrendChart
                          classId={classTeacherClasses[0].id}
                          className={classTeacherClasses[0].name}
                        />
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent
                  value="subject-teacher"
                  className="flex-1 overflow-hidden mt-0 px-6 pb-6">
                  <ScrollArea className="h-full">
                    <div className="pt-4">
                      {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <p>Loading class assignments...</p>
                        </div>
                      ) : (
                        <>
                          <table className="w-full">
                            <thead className="border-b">
                              <tr>
                                <th className="text-left py-3 px-2 font-semibold text-sm">
                                  Class
                                </th>
                                <th className="text-left py-3 px-2 font-semibold text-sm">
                                  Subject
                                </th>
                                <th className="text-left py-3 px-2 font-semibold text-sm">
                                  Status
                                </th>
                                <th className="text-center py-3 px-2 font-semibold text-sm">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {subjectTeacherClasses.map((classItem, index) => (
                                <tr
                                  key={classItem.id}
                                  className={`border-b hover:bg-muted/50 transition-colors ${
                                    index % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/30"
                                  } ${
                                    selectedClassId === classItem.id
                                      ? "bg-primary/10"
                                      : ""
                                  }`}>
                                  <td className="py-3 px-2">
                                    <div>
                                      <p className="font-semibold text-sm">
                                        {classItem.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {classItem.totalStudents || 0}/
                                        {classItem.capacity || 0} students
                                      </p>
                                    </div>
                                  </td>
                                  <td className="py-3 px-2">
                                    <span className="text-sm font-medium text-blue-600">
                                      {classItem.teachingSubject}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2">
                                    <Badge
                                      variant="secondary"
                                      className="bg-green-100 text-green-700 hover:bg-green-100">
                                      {classItem.status}
                                    </Badge>
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <div className="flex gap-1 justify-center">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          setSelectedClassId(classItem.id)
                                        }
                                        className="h-8 w-8 p-0"
                                        title="View details">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleExportClassList(classItem.id, "subject")
                                        }
                                        className="h-8 w-8 p-0"
                                        title="Export class list">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {subjectTeacherClasses.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                              <p>No classes assigned as subject teacher</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Details Card */}
        <div className="lg:col-span-1">
          <Card className="h-[calc(100vh-7rem)] flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {selectedClass ? selectedClass.name : "Details"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {selectedClass
                      ? `${selectedStudents.length} students`
                      : "Select a class to view details"}
                  </CardDescription>
                </div>
                {selectedClass && selectedStudents.length > 0 && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">
                        Males: {genderDistribution.boys}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-pink-50 text-pink-700 rounded">
                      <Users className="h-3 w-3" />
                      <span className="font-medium">
                        Females: {genderDistribution.girls}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-0">
              {selectedClass ? (
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 pr-4 px-6">
                    <div className="border rounded-md mt-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="border-r">Name</TableHead>
                            <TableHead className="border-r">Gender</TableHead>
                            <TableHead className="text-right">Age</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium text-sm border-r">
                                {student.name}
                              </TableCell>
                              <TableCell className="text-sm border-r">
                                {student.gender}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                {student.age}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                  {isClassTeacher && (
                    <div className="mt-auto px-6 pt-4 border-t space-y-2">
                      <Button className="w-full" onClick={handleOpenAttendance}>
                        <ListCheck className="h-4 w-4 mr-2" />
                        Take Register
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setAttendanceSheetOpen(true)}>
                        <History className="h-4 w-4 mr-2" />
                        View Attendance
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No class selected
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Attendance Dialog */}
      <Dialog
        open={attendanceDialogOpen}
        onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="min-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg">
                  Take Register - {selectedClass?.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md">
                  <Check className="h-4 w-4" />
                  <span className="font-semibold">
                    {
                      Object.values(attendanceRecords).filter(
                        (s) => s === "PRESENT"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-md">
                  <X className="h-4 w-4" />
                  <span className="font-semibold">
                    {
                      Object.values(attendanceRecords).filter(
                        (s) => s === "ABSENT"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">
                    {
                      Object.values(attendanceRecords).filter(
                        (s) => s === "LATE"
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="border rounded-lg overflow-hidden">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50 backdrop-blur z-10">
                  <TableRow>
                    <TableHead className="w-16 text-center">#</TableHead>
                    <TableHead className="min-w-[250px]">
                      Student Name
                    </TableHead>
                    <TableHead className="w-20 text-center">Gender</TableHead>
                    <TableHead className="w-[200px] text-center">
                      Attendance Status
                    </TableHead>
                    <TableHead className="min-w-[280px]">Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedStudents.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-muted/30">
                      <TableCell className="text-center text-muted-foreground font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                            student.gender === "M"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-pink-100 text-pink-700"
                          }`}>
                          {student.gender}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1.5 justify-center">
                          <Button
                            variant={
                              attendanceRecords[student.id] === "PRESENT"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttendanceStatusChange(
                                student.id,
                                "PRESENT"
                              )
                            }
                            className="h-9 w-9 p-0"
                            title="Present">
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={
                              attendanceRecords[student.id] === "ABSENT"
                                ? "destructive"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttendanceStatusChange(student.id, "ABSENT")
                            }
                            className="h-9 w-9 p-0"
                            title="Absent">
                            <X className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={
                              attendanceRecords[student.id] === "LATE"
                                ? "secondary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttendanceStatusChange(student.id, "LATE")
                            }
                            className="h-9 w-9 p-0"
                            title="Late">
                            <Clock className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={
                              attendanceRecords[student.id] === "EXCUSED"
                                ? "secondary"
                                : "outline"
                            }
                            size="sm"
                            onClick={() =>
                              handleAttendanceStatusChange(
                                student.id,
                                "EXCUSED"
                              )
                            }
                            className="h-9 px-3"
                            title="Excused">
                            <span className="text-xs font-semibold">EXC</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {attendanceRecords[student.id] === "ABSENT" ||
                        attendanceRecords[student.id] === "EXCUSED" ||
                        attendanceRecords[student.id] === "LATE" ? (
                          <Textarea
                            placeholder={`Reason for ${attendanceRecords[
                              student.id
                            ]?.toLowerCase()}...`}
                            className="text-xs min-h-[65px] resize-none"
                            value={attendanceRemarks[student.id] || ""}
                            onChange={(e) =>
                              setAttendanceRemarks((prev) => ({
                                ...prev,
                                [student.id]: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No remarks needed
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <DialogFooter className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-muted-foreground">
                Total Students:{" "}
                <span className="font-semibold text-foreground">
                  {selectedStudents.length}
                </span>
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setAttendanceDialogOpen(false)}
                  disabled={savingAttendance}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAttendance}
                  disabled={savingAttendance}>
                  {savingAttendance ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detailed Attendance Sheet */}
      <DetailedAttendanceSheet
        open={attendanceSheetOpen}
        onOpenChange={setAttendanceSheetOpen}
        classData={
          selectedClass
            ? {
                id: selectedClass.id,
                name: selectedClass.name,
                gradeLevel: selectedClass.gradeLevel,
              }
            : null
        }
      />
    </div>
  );
}
