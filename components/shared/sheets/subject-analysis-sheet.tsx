"use client";

import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubjectData {
  name: string;
  className?: string;
  totalStudents: number;
  maleStudents: number;
  femaleStudents: number;
  gradeDistribution: {
    grade: string;
    range: string;
    male: number;
    female: number;
    total: number;
    percentage: number;
  }[];
  topPerformers: {
    id: string;
    name: string;
    studentId: string;
    score: number;
    grade: string;
  }[];
  needsAttention: {
    id: string;
    name: string;
    studentId: string;
    score: number;
    grade: string;
  }[];
}

interface SubjectAnalysisSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjectData: SubjectData | null;
  availableSubjects?: string[]; // List of subjects the teacher teaches
  onSubjectChange?: (subject: string) => void; // Callback when subject changes
  gradeLevel?: "junior" | "senior"; // Grade level determines which grading scale to use
}

export function SubjectAnalysisSheet({
  open,
  onOpenChange,
  subjectData,
  availableSubjects = [],
  onSubjectChange,
  gradeLevel = "junior", // Default to junior (grades 8-9)
}: SubjectAnalysisSheetProps) {
  const [assessmentType, setAssessmentType] = useState("CAT1");

  if (!subjectData) return null;

  const handleSubjectChange = (subject: string) => {
    if (onSubjectChange) {
      onSubjectChange(subject);
    }
  };

  // Define pass criteria based on grade level
  const getPassCriteria = () => {
    if (gradeLevel === "junior") {
      // Grades 8-9: Pass is grades 1-4 (40% and above)
      return ["1", "2", "3", "4", "Distinction", "Merit", "Credit", "Pass"];
    } else {
      // Grades 10-12/Form 1-4: Pass is grades 1-8 (40% and above)
      return ["1", "2", "3", "4", "5", "6", "7", "8",
              "Distinction 1", "Distinction 2", "Merit 3", "Merit 4",
              "Credit 5", "Credit 6", "Satisfactory 7", "Satisfactory 8"];
    }
  };

  // Define distinction criteria based on grade level
  const getDistinctionCriteria = () => {
    if (gradeLevel === "junior") {
      // Grades 8-9: Distinction is grade 1 (75% and above)
      return ["1", "Distinction"];
    } else {
      // Grades 10-12/Form 1-4: Distinction is grades 1-2 (70% and above)
      return ["1", "2", "Distinction 1", "Distinction 2"];
    }
  };

  const studentsRecorded = subjectData.totalStudents;
  const studentsAbsent = 0;
  const passCriteria = getPassCriteria();
  const studentsPassed = subjectData.gradeDistribution
    .filter((g) => passCriteria.some(criteria => g.grade.includes(criteria)))
    .reduce((sum, g) => sum + g.total, 0);
  const passRate = ((studentsPassed / studentsRecorded) * 100).toFixed(1);

  const distinctionCriteria = getDistinctionCriteria();
  const qualityPass = subjectData.gradeDistribution
    .filter((g) => distinctionCriteria.some(criteria => g.grade.includes(criteria)))
    .reduce((sum, g) => sum + g.total, 0);
  const qualityRate = studentsPassed > 0 ? ((qualityPass / studentsPassed) * 100).toFixed(1) : "0.0";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[60vw] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="border-b bg-white p-6 shrink-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <div>
                  <SheetTitle className="text-2xl">
                    {subjectData.name}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    Complete Class Performance Analysis
                    {subjectData.className && ` - ${subjectData.className}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // TODO: Implement export functionality
                  console.log("Exporting analysis for:", subjectData.name);
                }}>
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
            <div className="flex gap-2">
              {availableSubjects.length > 0 && (
                <Select
                  value={subjectData.name}
                  onValueChange={handleSubjectChange}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Select Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSubjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={assessmentType} onValueChange={setAssessmentType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CAT1">CAT 1</SelectItem>
                  <SelectItem value="MID">Mid-Term</SelectItem>
                  <SelectItem value="EOT">End of Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 to-white">
            <div className="space-y-6">
              {/* Summary Stats - 3 Cards in a Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Male:</span>
                        <span className="font-medium">
                          {subjectData.maleStudents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Female:</span>
                        <span className="font-medium">
                          {subjectData.femaleStudents}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">
                          {subjectData.totalStudents}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Recorded Entries
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Male:</span>
                        <span className="font-medium">
                          {subjectData.maleStudents}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Female:</span>
                        <span className="font-medium">
                          {subjectData.femaleStudents}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">{studentsRecorded}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Absent Students
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Male:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Female:</span>
                        <span className="font-medium">0</span>
                      </div>
                      <div className="flex justify-between border-t pt-1">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold">{studentsAbsent}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Analysis Table with Pass Rate Cards */}
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-4 py-3 border-r text-left text-sm font-medium">
                            Grade
                          </th>
                          <th className="px-4 py-3 border-r text-left text-sm font-medium">
                            Range
                          </th>
                          <th className="px-4 py-3 border-r text-center text-sm font-medium">
                            Male
                          </th>
                          <th className="px-4 py-3 border-r text-center text-sm font-medium">
                            Female
                          </th>
                          <th className="px-4 py-3 border-r text-center text-sm font-medium">
                            Total
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium">
                            Percentage
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subjectData.gradeDistribution.map((grade, index) => (
                          <tr
                            key={grade.grade}
                            className={`border-b ${
                              index % 2 === 0 ? "bg-background" : "bg-muted/50"
                            }`}>
                            <td className="px-4 py-3 border-r text-sm font-medium">
                              {grade.grade}
                            </td>
                            <td className="px-4 py-3 border-r text-sm text-muted-foreground">
                              {grade.range || "-"}
                            </td>
                            <td className="px-4 py-3 border-r text-sm text-center">
                              {grade.male}
                            </td>
                            <td className="px-4 py-3 border-r text-sm text-center">
                              {grade.female}
                            </td>
                            <td className="px-4 py-3 border-r text-sm text-center font-medium">
                              {grade.total}
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              {grade.percentage}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pass Rate Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Quantity Pass Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Students Passed:
                            </span>
                            <span className="font-medium">
                              {studentsPassed}/{studentsRecorded}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Pass Rate:
                            </span>
                            <span className="text-lg font-bold">
                              {passRate}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            Formula: (Students passed ÷ Students who sat) × 100
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Quality Pass Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Quality Pass (Dist 1&2):
                            </span>
                            <span className="font-medium">
                              {qualityPass}/{studentsPassed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">
                              Quality Rate:
                            </span>
                            <span className="text-lg font-bold">
                              {qualityRate}%
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                            Formula: (Distinction 1&2 ÷ Students passed) × 100
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
