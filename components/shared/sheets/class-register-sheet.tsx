"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Search,
  Save,
  UserCheck,
  Calendar,
  Clock,
  Info,
  History,
  AlertCircle,
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  studentId: string;
  gender: string;
  photoUrl?: string;
}

interface RegisterEntry {
  studentId: string;
  status: "P" | "L" | "A" | "L-AR" | "E";
  markedAt: Date;
  notes?: string;
}

interface Amendment {
  originalStatus: string;
  newStatus: string;
  amendedAt: Date;
  amendedBy: string;
  reason: string;
  reportedBy?: string;
}

interface ClassRegisterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classData: {
    id: string;
    name: string;
    gradeLevel: string;
  } | null;
}

// Mock student data - would come from API
const mockStudents: Student[] = [
  { id: "1", name: "John Doe", studentId: "STU001", gender: "Male" },
  { id: "2", name: "Jane Smith", studentId: "STU002", gender: "Female" },
  { id: "3", name: "Mike Johnson", studentId: "STU003", gender: "Male" },
  { id: "4", name: "Sarah Williams", studentId: "STU004", gender: "Female" },
  { id: "5", name: "David Brown", studentId: "STU005", gender: "Male" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "P":
      return "bg-green-100 text-green-700 border-green-300";
    case "L":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";
    case "A":
      return "bg-red-100 text-red-700 border-red-300";
    case "L-AR":
      return "bg-orange-100 text-orange-700 border-orange-300";
    case "E":
      return "bg-blue-100 text-blue-700 border-blue-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "P":
      return "Present";
    case "L":
      return "Late";
    case "A":
      return "Absent";
    case "L-AR":
      return "Late After Register";
    case "E":
      return "Excused";
    default:
      return "Not Marked";
  }
};

export function ClassRegisterSheet({
  open,
  onOpenChange,
  classData,
}: ClassRegisterSheetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [register, setRegister] = useState<Record<string, RegisterEntry>>({});
  const [amendments, setAmendments] = useState<Record<string, Amendment[]>>({});
  const [showAmendmentHistory, setShowAmendmentHistory] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Current date for register
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Filter students by search
  const filteredStudents = mockStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMarkAttendance = (
    studentId: string,
    status: "P" | "L" | "A" | "L-AR" | "E"
  ) => {
    setRegister((prev) => ({
      ...prev,
      [studentId]: {
        studentId,
        status,
        markedAt: new Date(),
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleMarkAllPresent = () => {
    const allPresent: Record<string, RegisterEntry> = {};
    filteredStudents.forEach((student) => {
      allPresent[student.id] = {
        studentId: student.id,
        status: "P",
        markedAt: new Date(),
      };
    });
    setRegister((prev) => ({
      ...prev,
      ...allPresent,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveRegister = () => {
    const markedCount = Object.keys(register).length;
    const presentCount = Object.values(register).filter((r) => r.status === "P").length;
    const lateCount = Object.values(register).filter((r) => r.status === "L").length;
    const absentCount = Object.values(register).filter((r) => r.status === "A").length;

    // In a real app, this would save to the database
    toast.success("Class Register Saved Successfully!", {
      description: `${classData?.name} - ${markedCount} of ${mockStudents.length} students marked (Present: ${presentCount}, Late: ${lateCount}, Absent: ${absentCount})`,
    });

    setHasUnsavedChanges(false);
  };

  const handleViewAmendments = (studentId: string) => {
    setSelectedStudentForHistory(studentId);
    setShowAmendmentHistory(true);
  };

  const getRegisterStats = () => {
    const total = mockStudents.length;
    const marked = Object.keys(register).length;
    const present = Object.values(register).filter((r) => r.status === "P").length;
    const late = Object.values(register).filter((r) => r.status === "L").length;
    const absent = Object.values(register).filter((r) => r.status === "A").length;
    const lateAfterRegister = Object.values(register).filter((r) => r.status === "L-AR").length;
    const excused = Object.values(register).filter((r) => r.status === "E").length;

    return { total, marked, present, late, absent, lateAfterRegister, excused };
  };

  const stats = getRegisterStats();

  if (!classData) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl p-0 overflow-hidden flex flex-col">
          <SheetHeader className="p-6 pb-4 border-b pt-16 shrink-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <SheetTitle className="text-xl">Official Class Register</SheetTitle>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {classData.name} • {classData.gradeLevel}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formattedDate}</span>
                </div>
              </div>
              <Badge variant="outline" className="bg-white dark:bg-gray-900">
                Source of Truth
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-6 gap-2 mt-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{stats.present}</div>
                <div className="text-[10px] text-green-600">Present</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{stats.late}</div>
                <div className="text-[10px] text-yellow-600">Late</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{stats.absent}</div>
                <div className="text-[10px] text-red-600">Absent</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{stats.lateAfterRegister}</div>
                <div className="text-[10px] text-orange-600">L-AR</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{stats.excused}</div>
                <div className="text-[10px] text-blue-600">Excused</div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-2 text-center">
                <div className="text-lg font-bold">{stats.total - stats.marked}</div>
                <div className="text-[10px] text-gray-600">Unmarked</div>
              </div>
            </div>
          </SheetHeader>

          {/* Info Alert */}
          <div className="px-6 pt-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                This is the official daily register. Students marked absent here can be
                auto-updated to "Late After Register" if they appear in any lesson today.
              </AlertDescription>
            </Alert>
          </div>

          {/* Search and Actions */}
          <div className="px-6 py-4 space-y-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button size="default" onClick={handleMarkAllPresent}>
                <UserCheck className="h-4 w-4 mr-2" />
                All Present
              </Button>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground">Legend:</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">P - Present</Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">L - Late</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">A - Absent</Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">L-AR - Late After Register</Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">E - Excused</Badge>
            </div>
          </div>

          {/* Student List */}
          <div className="flex-1 overflow-auto px-6">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-20 bg-background border-b">
                <tr>
                  <th className="p-3 text-left font-semibold text-sm bg-background">
                    Student
                  </th>
                  <th className="p-3 text-left font-semibold text-sm bg-background">
                    Gender
                  </th>
                  <th className="p-3 text-center font-semibold text-sm bg-background">
                    Status
                  </th>
                  <th className="p-3 text-center font-semibold text-sm bg-background w-[60px]">
                    History
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const entry = register[student.id];
                  const studentAmendments = amendments[student.id] || [];
                  const hasAmendments = studentAmendments.length > 0;

                  return (
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
                            <p className="font-semibold text-sm">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.studentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-sm text-gray-600">{student.gender}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant={entry?.status === "P" ? "default" : "outline"}
                            className={
                              entry?.status === "P"
                                ? "bg-green-600 hover:bg-green-700 w-10 h-10 p-0"
                                : "w-10 h-10 p-0"
                            }
                            onClick={() => handleMarkAttendance(student.id, "P")}>
                            <span className="font-semibold">P</span>
                          </Button>
                          <Button
                            size="sm"
                            variant={entry?.status === "L" ? "default" : "outline"}
                            className={
                              entry?.status === "L"
                                ? "bg-yellow-600 hover:bg-yellow-700 w-10 h-10 p-0"
                                : "w-10 h-10 p-0"
                            }
                            onClick={() => handleMarkAttendance(student.id, "L")}>
                            <span className="font-semibold">L</span>
                          </Button>
                          <Button
                            size="sm"
                            variant={entry?.status === "A" ? "default" : "outline"}
                            className={
                              entry?.status === "A"
                                ? "bg-red-600 hover:bg-red-700 w-10 h-10 p-0"
                                : "w-10 h-10 p-0"
                            }
                            onClick={() => handleMarkAttendance(student.id, "A")}>
                            <span className="font-semibold">A</span>
                          </Button>
                          <Button
                            size="sm"
                            variant={entry?.status === "E" ? "default" : "outline"}
                            className={
                              entry?.status === "E"
                                ? "bg-blue-600 hover:bg-blue-700 w-10 h-10 p-0"
                                : "w-10 h-10 p-0"
                            }
                            onClick={() => handleMarkAttendance(student.id, "E")}>
                            <span className="font-semibold">E</span>
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 relative"
                            onClick={() => handleViewAmendments(student.id)}
                            disabled={!hasAmendments}>
                            <History className="h-4 w-4" />
                            {hasAmendments && (
                              <span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full"></span>
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t shrink-0 bg-background">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                {stats.marked} of {stats.total} students marked
                {hasUnsavedChanges && (
                  <span className="text-orange-600 ml-2">• Unsaved changes</span>
                )}
              </div>
              <Button
                size="lg"
                onClick={handleSaveRegister}
                disabled={!hasUnsavedChanges}
                className="min-w-[150px]">
                <Save className="h-5 w-5 mr-2" />
                Save Register
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Amendment History Dialog */}
      <Dialog open={showAmendmentHistory} onOpenChange={setShowAmendmentHistory}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Amendment History</DialogTitle>
            <DialogDescription>
              {selectedStudentForHistory &&
                mockStudents.find((s) => s.id === selectedStudentForHistory)?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-[400px] overflow-auto">
            {selectedStudentForHistory &&
            amendments[selectedStudentForHistory]?.length > 0 ? (
              amendments[selectedStudentForHistory].map((amendment, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(amendment.originalStatus)}>
                        {getStatusLabel(amendment.originalStatus)}
                      </Badge>
                      <span>→</span>
                      <Badge className={getStatusColor(amendment.newStatus)}>
                        {getStatusLabel(amendment.newStatus)}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(amendment.amendedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{amendment.reason}</p>
                  {amendment.reportedBy && (
                    <p className="text-xs text-muted-foreground">
                      Reported by: {amendment.reportedBy}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No amendments recorded</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAmendmentHistory(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
