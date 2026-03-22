"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ReportCardData {
  id: string;
  student: {
    id: string;
    studentNumber: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: string;
  };
  totalMarks: number | null;
  averageMark: number | null;
  position: number | null;
  outOf: number | null;
  attendance: number;
  daysPresent: number;
  daysAbsent: number;
  promotionStatus: string | null;
  subjects: {
    id: string;
    subject: {
      name: string;
      code: string;
    };
    catMark: number | null;
    midMark: number | null;
    eotMark: number | null;
    totalMark: number | null;
    grade: string | null;
    remarks: string | null;
  }[];
}

interface ClassReportsTableProps {
  reportCards: ReportCardData[];
}

// Helper function to get ECZ grade label
const getGradeLabel = (grade: string | null): string => {
  if (!grade) return "-";

  const gradeMap: Record<string, string> = {
    GRADE_1: "1",
    GRADE_2: "2",
    GRADE_3: "3",
    GRADE_4: "4",
    GRADE_5: "5",
    GRADE_6: "6",
    GRADE_7: "7",
    GRADE_8: "8",
    GRADE_9: "9",
  };

  return gradeMap[grade] || grade;
};

// Helper function to get grade variant
const getGradeVariant = (
  grade: string | null
): "default" | "secondary" | "destructive" => {
  if (!grade) return "secondary";

  if (grade === "GRADE_1" || grade === "GRADE_2") return "default"; // Distinction
  if (grade === "GRADE_9") return "destructive"; // Fail
  return "secondary";
};

// Helper function to get promotion status variant
const getPromotionVariant = (
  status: string | null
): "default" | "secondary" | "destructive" => {
  if (!status) return "secondary";
  if (status === "PROMOTED") return "default";
  if (status === "REPEAT") return "destructive";
  return "secondary";
};

// Helper function to format student name
const formatStudentName = (
  firstName: string,
  middleName: string | undefined,
  lastName: string
): string => {
  const parts = [firstName, middleName, lastName].filter(Boolean);
  return parts.join(" ");
};

// Helper function to get student initials
const getStudentInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export function ClassReportsTable({ reportCards }: ClassReportsTableProps) {
  // Sort report cards by position (if available)
  const sortedReportCards = [...reportCards].sort((a, b) => {
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">No.</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-center">Average</TableHead>
            <TableHead className="text-center">Position</TableHead>
            <TableHead className="text-center">Attendance</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReportCards.map((report, index) => {
            const fullName = formatStudentName(
              report.student.firstName,
              report.student.middleName,
              report.student.lastName
            );
            const initials = getStudentInitials(
              report.student.firstName,
              report.student.lastName
            );

            const attendancePercentage =
              report.daysPresent + report.daysAbsent > 0
                ? (report.daysPresent /
                    (report.daysPresent + report.daysAbsent)) *
                  100
                : 0;

            // Calculate average grade from subjects
            const subjectGrades = report.subjects
              .map((s) => s.grade)
              .filter((g) => g !== null);
            const averageGradeValue =
              subjectGrades.length > 0
                ? subjectGrades.reduce((sum, grade) => {
                    const gradeNum = parseInt(
                      grade?.replace("GRADE_", "") || "9"
                    );
                    return sum + gradeNum;
                  }, 0) / subjectGrades.length
                : null;

            let averageGrade = null;
            if (averageGradeValue !== null) {
              const roundedGrade = Math.round(averageGradeValue);
              averageGrade = `GRADE_${roundedGrade}`;
            }

            return (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {report.student.studentNumber}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">
                      {report.averageMark !== null
                        ? `${report.averageMark.toFixed(1)}%`
                        : "-"}
                    </span>
                    {/* {averageGrade && (
                      <Badge
                        variant={getGradeVariant(averageGrade)}
                        className="text-xs">
                        Grade {getGradeLabel(averageGrade)}
                      </Badge>
                    )} */}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {report.position !== null && report.outOf !== null ? (
                    <span className="font-medium">
                      {report.position}/{report.outOf}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`font-medium ${
                        attendancePercentage >= 90
                          ? "text-green-600"
                          : attendancePercentage >= 75
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}>
                      {attendancePercentage.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {report.daysPresent}/
                      {report.daysPresent + report.daysAbsent}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {report.promotionStatus ? (
                    <Badge
                      variant={getPromotionVariant(report.promotionStatus)}>
                      {report.promotionStatus.charAt(0) +
                        report.promotionStatus.slice(1).toLowerCase()}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
