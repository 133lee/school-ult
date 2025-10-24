"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { ClassDetailsSheet } from "@/components/shared/sheets/class-details-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  GraduationCap,
  LayoutGrid,
  ChevronUp,
  ClipboardCheck,
  ArrowLeft,
  Save,
  X,
  Check,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
  // For subject teachers: the specific subject they teach in this class
  teachingSubject?: string;
  // Whether current user is the class teacher or subject teacher
  isClassTeacher?: boolean;
}

// Mock data - Classes where current teacher is the class teacher
// IMPORTANT: A teacher can only be a class teacher for ONE class at a time per academic year/term
const myClassTeacherClasses: Class[] = [
  {
    id: "1",
    classId: "CLS001",
    name: "Class 9A",
    gradeLevel: "Grade 9",
    academicYear: "2024-2025",
    classTeacher: "Current Teacher", // Would be current user
    totalStudents: 32,
    capacity: 35,
    subjects: ["Mathematics", "English", "Physics", "Chemistry", "History"],
    schedule: "Monday - Friday, 8:00 AM - 3:00 PM",
    room: "Room 101",
    status: "Active",
    isClassTeacher: true,
    teachingSubject: "English", // Class teacher also teaches English to their class
  },
  // NOTE: Only ONE class where isClassTeacher is true
  // A teacher cannot manage multiple classes as class teacher simultaneously
];

// Mock data - Classes where current teacher teaches a subject
const mySubjectTeacherClasses: Class[] = [
  {
    id: "3",
    classId: "CLS003",
    name: "Class 10A",
    gradeLevel: "Grade 10",
    academicYear: "2024-2025",
    classTeacher: "Mr. David Wilson",
    totalStudents: 28,
    capacity: 35,
    subjects: ["Mathematics", "English", "Physics", "Chemistry", "Biology"],
    schedule: "Monday - Friday, 8:00 AM - 3:00 PM",
    room: "Room 201",
    status: "Active",
    isClassTeacher: false,
    teachingSubject: "Mathematics",
  },
  {
    id: "5",
    classId: "CLS005",
    name: "Class 11A",
    gradeLevel: "Grade 11",
    academicYear: "2024-2025",
    classTeacher: "Ms. Sarah Johnson",
    totalStudents: 25,
    capacity: 30,
    subjects: [
      "Advanced Math",
      "English Literature",
      "Physics",
      "Chemistry",
      "History",
    ],
    schedule: "Monday - Friday, 8:00 AM - 3:30 PM",
    room: "Room 301",
    status: "Active",
    isClassTeacher: false,
    teachingSubject: "Physics",
  },
];

// Combined list for filtering purposes
const myClasses: Class[] = [
  ...myClassTeacherClasses,
  ...mySubjectTeacherClasses,
];

const ITEMS_PER_PAGE = 10;

// Gender distribution data per class
const classGenderData: Record<string, { male: number; female: number }> = {
  all: { male: 45, female: 40 }, // All classes combined
  "1": { male: 18, female: 14 }, // Class 9A
  "3": { male: 15, female: 13 }, // Class 10A
  "5": { male: 12, female: 13 }, // Class 11A
};

const genderChartConfig = {
  students: {
    label: "Students",
  },
  male: {
    label: "Male",
    color: "black", // Blue
  },
  female: {
    label: "Female",
    color: "#d1d5db", // Light gray
  },
} satisfies ChartConfig;

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

const getCapacityColor = (current: number, capacity: number) => {
  const percentage = (current / capacity) * 100;
  if (percentage >= 90) return "text-red-600";
  if (percentage >= 75) return "text-yellow-600";
  return "text-green-600";
};

export default function TeacherMyClassesDashboard() {
  const router = useRouter();
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(true);
  const [selectedClassForChart, setSelectedClassForChart] = useState("all");
  const [showAttendanceView, setShowAttendanceView] = useState(false);
  const [attendanceType, setAttendanceType] = useState<
    "class-register" | "lesson"
  >("class-register");
  const [attendance, setAttendance] = useState<
    Record<string, "present" | "absent" | "late" | "excused">
  >({});
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showRegisterView, setShowRegisterView] = useState(false);
  const [registerStatus, setRegisterStatus] = useState<
    Record<string, "P" | "L" | "A" | "L-AR" | "E">
  >({});

  // Get selected class data for attendance
  const selectedClassData = React.useMemo(() => {
    return myClasses.find((c) => c.id === selectedClassForChart) || null;
  }, [selectedClassForChart]);

  // Mock student data for attendance
  const studentsForAttendance = React.useMemo(() => {
    if (!selectedClassData) return [];
    // Generate mock students based on the class
    const count = selectedClassData.totalStudents;
    const maleCount = classGenderData[selectedClassData.id]?.male || 0;
    const femaleCount = classGenderData[selectedClassData.id]?.female || 0;

    const students = [];
    for (let i = 1; i <= maleCount; i++) {
      students.push({
        id: `${selectedClassData.id}-M${i}`,
        name: `Male Student ${i}`,
        studentId: `STU${selectedClassData.id}M${String(i).padStart(3, "0")}`,
        gender: "Male",
        photoUrl: `https://i.pravatar.cc/150?img=${i + 10}`,
      });
    }
    for (let i = 1; i <= femaleCount; i++) {
      students.push({
        id: `${selectedClassData.id}-F${i}`,
        name: `Female Student ${i}`,
        studentId: `STU${selectedClassData.id}F${String(i).padStart(3, "0")}`,
        gender: "Female",
        photoUrl: `https://i.pravatar.cc/150?img=${i + 5}`,
      });
    }
    return students;
  }, [selectedClassData]);

  // Filter students by search query
  const filteredStudents = React.useMemo(() => {
    if (!studentSearchQuery) return studentsForAttendance;
    return studentsForAttendance.filter(
      (student) =>
        student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        student.studentId
          .toLowerCase()
          .includes(studentSearchQuery.toLowerCase())
    );
  }, [studentsForAttendance, studentSearchQuery]);

  const handleBackToClasses = () => {
    setShowAttendanceView(false);
    setShowRegisterView(false);
    setAttendance({});
    setRegisterStatus({});
    setStudentSearchQuery("");
    setAttendanceType("class-register");
  };

  const handleBackToClassesFromRegister = () => {
    setShowRegisterView(false);
    setRegisterStatus({});
    setStudentSearchQuery("");
  };

  const handleMarkRegister = (
    studentId: string,
    status: "P" | "L" | "A" | "L-AR" | "E"
  ) => {
    setRegisterStatus((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresentRegister = () => {
    const allPresent: Record<string, "P"> = {};
    filteredStudents.forEach((student) => {
      allPresent[student.id] = "P";
    });
    setRegisterStatus((prev) => ({
      ...prev,
      ...allPresent,
    }));
  };

  const handleSaveRegister = () => {
    const markedCount = Object.keys(registerStatus).length;
    const presentCount = Object.values(registerStatus).filter((s) => s === "P").length;
    const lateCount = Object.values(registerStatus).filter((s) => s === "L").length;
    const absentCount = Object.values(registerStatus).filter((s) => s === "A").length;
    const lateAfterRegisterCount = Object.values(registerStatus).filter((s) => s === "L-AR").length;
    const excusedCount = Object.values(registerStatus).filter((s) => s === "E").length;

    toast.success("Class Register Saved Successfully!", {
      description: `${selectedClassData?.name} - ${markedCount} of ${studentsForAttendance.length} students marked (Present: ${presentCount}, Late: ${lateCount}, Absent: ${absentCount}, L-AR: ${lateAfterRegisterCount}, Excused: ${excusedCount})`,
    });

    setShowRegisterView(false);
    setRegisterStatus({});
    setStudentSearchQuery("");
  };

  const handleMarkAttendance = (
    studentId: string,
    status: "present" | "absent" | "late" | "excused"
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, "present"> = {};
    filteredStudents.forEach((student) => {
      allPresent[student.id] = "present";
    });
    setAttendance((prev) => ({
      ...prev,
      ...allPresent,
    }));
  };

  const handleSaveAttendance = () => {
    const markedCount = Object.keys(attendance).length;
    const presentCount = Object.values(attendance).filter(
      (s) => s === "present"
    ).length;
    const absentCount = Object.values(attendance).filter(
      (s) => s === "absent"
    ).length;
    const lateCount = Object.values(attendance).filter(
      (s) => s === "late"
    ).length;

    const attendanceTypeLabel =
      attendanceType === "class-register"
        ? "Class Register"
        : "Lesson Attendance";

    toast.success(`${attendanceTypeLabel} Saved Successfully!`, {
      description: `${selectedClassData?.name} - ${markedCount} of ${studentsForAttendance.length} students marked (Present: ${presentCount}, Late: ${lateCount}, Absent: ${absentCount})`,
    });

    setShowAttendanceView(false);
    setAttendance({});
    setStudentSearchQuery("");
    setAttendanceType("class-register");
  };

  const genderChartData = React.useMemo(() => {
    const data = classGenderData[selectedClassForChart] || classGenderData.all;
    return [
      { gender: "male", students: data.male, fill: "var(--color-male)" },
      { gender: "female", students: data.female, fill: "var(--color-female)" },
    ];
  }, [selectedClassForChart]);

  const totalStudents = React.useMemo(() => {
    return genderChartData.reduce((acc, curr) => acc + curr.students, 0);
  }, [genderChartData]);

  const handleRowClick = (classItem: Class) => {
    setSelectedClass(classItem);
    setDetailsSheetOpen(true);
  };

  const handleViewStudents = () => {
    if (selectedClass) {
      // Navigate to My Students page with class filter
      router.push(`/teacher/my-students?class=${selectedClass.id}`);
      setDetailsSheetOpen(false);
    }
  };

  const handleViewSchedule = () => {
    if (selectedClass) {
      // Navigate to schedule page
      router.push(`/teacher/schedule?class=${selectedClass.id}`);
      setDetailsSheetOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold">My Classes</h1>
          <p className="text-muted-foreground text-sm">
            {myClasses.length} classes assigned to you
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side - Class List or Attendance View */}
        <div className={cardsVisible ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card className="flex flex-col h-[calc(100vh-14.2rem)]">
            <CardHeader>
              {!showAttendanceView && !showRegisterView ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <CardTitle className="text-base">My Classes</CardTitle>
                      <CardDescription className="text-xs">
                        {myClasses.length} classes assigned to you
                      </CardDescription>
                    </div>
                    {!cardsVisible && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCardsVisible(true)}>
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Show Cards
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={showRegisterView ? handleBackToClassesFromRegister : handleBackToClasses}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Classes
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 overflow-hidden flex flex-col">
              {showRegisterView ? (
                <>
                  {/* Class Register View */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-base text-gray-900">
                      Official Class Register
                    </h3>
                    <p className="text-xs text-gray-500">
                      Daily morning attendance - Source of Truth
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="relative w-[320px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search students..."
                        className="pl-10"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button size="sm" onClick={handleMarkAllPresentRegister}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      All Present
                    </Button>
                  </div>
                  <div className="overflow-auto h-[490px]">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-20 bg-background border-b">
                        <tr>
                          <th className="p-3 text-left font-semibold text-sm bg-background">
                            Name
                          </th>
                          <th className="p-3 text-left font-semibold text-sm bg-background">
                            Gender
                          </th>
                          <th className="p-3 text-center font-semibold text-sm bg-background">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student, index) => (
                          <tr
                            key={student.id}
                            className={`hover:bg-muted/70 transition-colors ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/30"
                            }`}>
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold text-sm">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {student.id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm">{student.gender}</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center justify-center gap-1.5">
                                <Button
                                  size="sm"
                                  variant={
                                    registerStatus[student.id] === "P"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    registerStatus[student.id] === "P"
                                      ? "bg-green-600 hover:bg-green-700 w-10 h-9 p-0"
                                      : "w-10 h-9 p-0"
                                  }
                                  onClick={() => handleMarkRegister(student.id, "P")}>
                                  <span className="font-semibold text-xs">P</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    registerStatus[student.id] === "L"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    registerStatus[student.id] === "L"
                                      ? "bg-yellow-600 hover:bg-yellow-700 w-10 h-9 p-0"
                                      : "w-10 h-9 p-0"
                                  }
                                  onClick={() => handleMarkRegister(student.id, "L")}>
                                  <span className="font-semibold text-xs">L</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    registerStatus[student.id] === "A"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    registerStatus[student.id] === "A"
                                      ? "bg-red-600 hover:bg-red-700 w-10 h-9 p-0"
                                      : "w-10 h-9 p-0"
                                  }
                                  onClick={() => handleMarkRegister(student.id, "A")}>
                                  <span className="font-semibold text-xs">A</span>
                                </Button>
                                <Button
                                  size="sm"
                                  variant={
                                    registerStatus[student.id] === "E"
                                      ? "default"
                                      : "outline"
                                  }
                                  className={
                                    registerStatus[student.id] === "E"
                                      ? "bg-blue-600 hover:bg-blue-700 w-10 h-9 p-0"
                                      : "w-10 h-9 p-0"
                                  }
                                  onClick={() => handleMarkRegister(student.id, "E")}>
                                  <span className="font-semibold text-xs">E</span>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Legend:</span>
                      <span className="ml-2">P-Present</span>
                      <span className="ml-2">L-Late</span>
                      <span className="ml-2">A-Absent</span>
                      <span className="ml-2">E-Excused</span>
                    </div>
                    <Button onClick={handleSaveRegister}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Register
                    </Button>
                  </div>
                </>
              ) : showAttendanceView ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold text-base text-gray-900">
                      {attendanceType === "class-register"
                        ? "Class Register"
                        : "Lesson Attendance"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {attendanceType === "class-register"
                        ? "Daily morning attendance for the class"
                        : `Attendance for ${
                            selectedClassData?.teachingSubject || "this lesson"
                          }`}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <div className="relative w-[320px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search students..."
                        className="pl-10"
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button size="sm" onClick={handleMarkAllPresent}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      All Present
                    </Button>
                  </div>
                  <div className="overflow-auto h-[490px]">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 z-20 bg-background border-b">
                        <tr>
                          <th className="p-3 text-left font-semibold text-sm bg-background">
                            Name
                          </th>
                          <th className="p-3 text-left font-semibold text-sm bg-background">
                            Gender
                          </th>
                          <th className="p-3 text-center font-semibold text-sm bg-background">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((student, index) => {
                          const status = attendance[student.id];
                          return (
                            <tr
                              key={student.id}
                              className={`hover:bg-muted/70 transition-colors ${
                                index % 2 === 0
                                  ? "bg-background"
                                  : "bg-muted/30"
                              }`}>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarFallback>
                                      {student.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="font-semibold text-sm">
                                    {student.name}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3">
                                <p className="text-sm text-gray-600">
                                  {student.gender}
                                </p>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    size="sm"
                                    variant={
                                      status === "present"
                                        ? "default"
                                        : "outline"
                                    }
                                    className={
                                      status === "present"
                                        ? "bg-green-600 hover:bg-green-700 w-10 h-10 p-0"
                                        : "w-10 h-10 p-0"
                                    }
                                    onClick={() =>
                                      handleMarkAttendance(
                                        student.id,
                                        "present"
                                      )
                                    }>
                                    <span className="font-semibold">P</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      status === "late" ? "default" : "outline"
                                    }
                                    className={
                                      status === "late"
                                        ? "bg-yellow-600 hover:bg-yellow-700 w-10 h-10 p-0"
                                        : "w-10 h-10 p-0"
                                    }
                                    onClick={() =>
                                      handleMarkAttendance(student.id, "late")
                                    }>
                                    <span className="font-semibold">L</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      status === "absent"
                                        ? "default"
                                        : "outline"
                                    }
                                    className={
                                      status === "absent"
                                        ? "bg-red-600 hover:bg-red-700 w-10 h-10 p-0"
                                        : "w-10 h-10 p-0"
                                    }
                                    onClick={() =>
                                      handleMarkAttendance(student.id, "absent")
                                    }>
                                    <span className="font-semibold">A</span>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={
                                      status === "excused"
                                        ? "default"
                                        : "outline"
                                    }
                                    className={
                                      status === "excused"
                                        ? "bg-blue-600 hover:bg-blue-700 w-10 h-10 p-0"
                                        : "w-10 h-10 p-0"
                                    }
                                    onClick={() =>
                                      handleMarkAttendance(
                                        student.id,
                                        "excused"
                                      )
                                    }>
                                    <span className="font-semibold">E</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Save Button at bottom */}
                  <div className="flex justify-end pt-4 mt-4 border-t">
                    <Button
                      onClick={handleSaveAttendance}
                      size="lg"
                      className="h-12 px-8 rounded-full shadow-md hover:shadow-lg transition-all">
                      <Save className="h-5 w-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <ScrollArea className="flex-1">
                    {/* Class I Manage (Class Teacher) - Only ONE class per teacher */}
                    {myClassTeacherClasses.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-sm text-gray-900">
                              Class I Manage
                            </h3>
                            <p className="text-xs text-gray-500">
                              The class where you are the class teacher
                            </p>
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {myClassTeacherClasses.length} class
                          </span>
                        </div>
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 z-20 bg-background border-b">
                            <tr>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Class
                              </th>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Students
                              </th>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Subject
                              </th>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Status
                              </th>
                              <th className="p-3 text-center font-semibold text-sm bg-background w-[100px]">
                                Class Register
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {myClassTeacherClasses.map((classItem, index) => (
                              <tr
                                key={classItem.id}
                                onClick={() => handleRowClick(classItem)}
                                className={`cursor-pointer hover:bg-muted/70 transition-colors ${
                                  index % 2 === 0
                                    ? "bg-background"
                                    : "bg-muted/30"
                                }`}>
                                <td className="p-3">
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {classItem.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {classItem.gradeLevel}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3 w-3 text-gray-500" />
                                    <span
                                      className={`text-sm font-medium ${getCapacityColor(
                                        classItem.totalStudents,
                                        classItem.capacity
                                      )}`}>
                                      {classItem.totalStudents}/
                                      {classItem.capacity}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  {classItem.teachingSubject ? (
                                    <span className="text-sm font-medium text-blue-600">
                                      {classItem.teachingSubject}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-400 italic">
                                      None
                                    </span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                      classItem.status
                                    )}`}>
                                    {classItem.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedClassForChart(classItem.id);
                                        setShowRegisterView(true);
                                      }}>
                                      <ClipboardCheck className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Classes I Teach (Subject Teacher) */}
                    {mySubjectTeacherClasses.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-sm text-gray-900">
                              Classes I Teach
                            </h3>
                            <p className="text-xs text-gray-500">
                              Classes where you teach a specific subject
                            </p>
                          </div>
                          <span className="text-xs font-medium text-gray-500">
                            {mySubjectTeacherClasses.length} class
                            {mySubjectTeacherClasses.length !== 1 ? "es" : ""}
                          </span>
                        </div>
                        <table className="w-full border-collapse">
                          <thead className="sticky top-0 z-20 bg-background border-b">
                            <tr>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Class
                              </th>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Students
                              </th>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Subject
                              </th>
                              <th className="p-3 text-left font-semibold text-sm bg-background">
                                Status
                              </th>
                              <th className="p-3 text-center font-semibold text-sm bg-background w-[120px]">
                                Lesson Attendance
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {mySubjectTeacherClasses.map((classItem, index) => (
                              <tr
                                key={classItem.id}
                                onClick={() => handleRowClick(classItem)}
                                className={`cursor-pointer hover:bg-muted/70 transition-colors ${
                                  index % 2 === 0
                                    ? "bg-background"
                                    : "bg-muted/30"
                                }`}>
                                <td className="p-3">
                                  <div>
                                    <p className="font-semibold text-sm">
                                      {classItem.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {classItem.gradeLevel}
                                    </p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-3 w-3 text-gray-500" />
                                    <span
                                      className={`text-sm font-medium ${getCapacityColor(
                                        classItem.totalStudents,
                                        classItem.capacity
                                      )}`}>
                                      {classItem.totalStudents}/
                                      {classItem.capacity}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className="text-sm font-medium text-blue-600">
                                    {classItem.teachingSubject}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                      classItem.status
                                    )}`}>
                                    {classItem.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center justify-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedClassForChart(classItem.id);
                                        setAttendanceType("lesson");
                                        setShowAttendanceView(true);
                                      }}>
                                      <ClipboardCheck className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </ScrollArea>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Cards and Chart */}
        {cardsVisible && (
          <div className="lg:col-span-1">
            {/* 2x2 Stats Cards Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {showAttendanceView ? (
                <>
                  {/* Attendance View Card 1: Attendance Type */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Type
                      </CardTitle>
                      <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {attendanceType === "class-register"
                          ? "Class Register"
                          : "Lesson"}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {attendanceType === "class-register"
                          ? "Morning attendance"
                          : selectedClassData?.teachingSubject ||
                            "Subject attendance"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Attendance View Card 2: Class Info */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Class
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold">
                        {selectedClassData?.name}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedClassData?.totalStudents} students
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  {/* Card 1: Class I Manage */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        I Manage
                      </CardTitle>
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {myClassTeacherClasses.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {myClassTeacherClasses.length === 1 ? "My class" : "No class assigned"}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Card 2: Classes I Teach */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        I Teach
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {mySubjectTeacherClasses.length}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        As subject teacher
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Gender Distribution Chart */}
            <Card className="flex flex-col ">
              <CardHeader className="items-center pb-0">
                <CardTitle className="text-sm">Gender Distribution</CardTitle>

                <CardAction className="text-xs">
                  <Select
                    value={selectedClassForChart}
                    onValueChange={setSelectedClassForChart}>
                    <SelectTrigger className="w-[180px] h-7">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes Combined</SelectItem>
                      {myClasses.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardAction>
              </CardHeader>
              <CardContent className="flex-1">
                <ChartContainer
                  config={genderChartConfig}
                  className="mx-auto aspect-square max-h-[200px]">
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                      data={genderChartData}
                      dataKey="students"
                      nameKey="gender"
                      innerRadius={50}
                      strokeWidth={5}>
                      <Label
                        content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                            return (
                              <text
                                x={viewBox.cx}
                                y={viewBox.cy}
                                textAnchor="middle"
                                dominantBaseline="middle">
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-2xl font-bold">
                                  {totalStudents.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  className="fill-muted-foreground text-xs">
                                  Students
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </CardContent>
              <CardContent className="flex-col gap-2 text-xs">
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "black" }}></div>
                    <span className="text-xs">
                      Male: {genderChartData[0].students}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#d1d5db" }}></div>
                    <span className="text-xs">
                      Female: {genderChartData[1].students}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My Schedule Button */}
            <Link href="/teacher/schedule" className="w-full">
              <Button className="w-full bg-black hover:bg-black/90 text-white mt-6">
                <BookOpen className="h-4 w-4 mr-2" />
                My Schedule
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Class Details Sheet */}
      <ClassDetailsSheet
        classItem={selectedClass}
        open={detailsSheetOpen}
        onOpenChange={setDetailsSheetOpen}
        onViewStudents={handleViewStudents}
        onViewSchedule={handleViewSchedule}
        showActionButtons={true}
        isClassTeacher={selectedClass?.isClassTeacher || false}
      />
    </div>
  );
}
