"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Award,
  AlertTriangle,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// Sample data for class rankings
const subjectRankings = [
  {
    subject: "Mathematics",
    score: 85,
    rank: 3,
    total: 45,
    trend: "up" as const,
  },
  {
    subject: "English",
    score: 78,
    rank: 12,
    total: 45,
    trend: "down" as const,
  },
  { subject: "Science", score: 92, rank: 1, total: 45, trend: "up" as const },
  {
    subject: "History",
    score: 71,
    rank: 18,
    total: 45,
    trend: "same" as const,
  },
  { subject: "Geography", score: 88, rank: 5, total: 45, trend: "up" as const },
  { subject: "Physics", score: 82, rank: 8, total: 45, trend: "down" as const },
  {
    subject: "Chemistry",
    score: 79,
    rank: 15,
    total: 45,
    trend: "same" as const,
  },
  { subject: "Biology", score: 90, rank: 2, total: 45, trend: "up" as const },
];

// Generate mock detailed analysis data for each subject
const generateSubjectAnalysis = (subject: string) => {
  const gradeDistribution = [
    {
      grade: "Distinction 1",
      range: "75-100",
      male: 8,
      female: 10,
      total: 18,
      percentage: 40,
    },
    {
      grade: "Distinction 2",
      range: "65-74",
      male: 6,
      female: 7,
      total: 13,
      percentage: 28.9,
    },
    {
      grade: "Credit",
      range: "50-64",
      male: 4,
      female: 5,
      total: 9,
      percentage: 20,
    },
    {
      grade: "Pass",
      range: "40-49",
      male: 2,
      female: 1,
      total: 3,
      percentage: 6.7,
    },
    {
      grade: "Fail",
      range: "0-39",
      male: 1,
      female: 1,
      total: 2,
      percentage: 4.4,
    },
  ];

  const summaryStats = {
    totalStudents: 45,
    totalMales: 21,
    totalFemales: 24,
    totalRecorded: 45,
    recordedMales: 21,
    recordedFemales: 24,
    totalAbsent: 0,
    absentMales: 0,
    absentFemales: 0,
    totalPassed: 43,
    totalQualityPass: 31,
    quantityPassPercentage: 95.6,
    qualityPassPercentage: 72.1,
  };

  const topPerformers = [
    {
      id: 1,
      first_name: "Sarah",
      last_name: "Johnson",
      student_id: "ST001",
      score: 98,
      grade: "Dist 1",
    },
    {
      id: 2,
      first_name: "Michael",
      last_name: "Chen",
      student_id: "ST002",
      score: 96,
      grade: "Dist 1",
    },
    {
      id: 3,
      first_name: "Emma",
      last_name: "Williams",
      student_id: "ST003",
      score: 94,
      grade: "Dist 1",
    },
    {
      id: 4,
      first_name: "James",
      last_name: "Brown",
      student_id: "ST004",
      score: 92,
      grade: "Dist 1",
    },
    {
      id: 5,
      first_name: "Olivia",
      last_name: "Davis",
      student_id: "ST005",
      score: 90,
      grade: "Dist 1",
    },
  ];

  const needsAttention = [
    {
      id: 41,
      first_name: "Alex",
      last_name: "Martinez",
      student_id: "ST041",
      score: 38,
      grade: "Fail",
    },
    {
      id: 42,
      first_name: "Jordan",
      last_name: "Taylor",
      student_id: "ST042",
      score: 35,
      grade: "Fail",
    },
  ];

  return {
    subject,
    gradeDistribution,
    summaryStats,
    topPerformers,
    needsAttention,
  };
};

type SubjectRanking = {
  subject: string;
  score: number;
  rank: number;
  total: number;
  trend: "up" | "down" | "same";
};

const ClassRankingsWithAnalysis = () => {
  const [selectedSubject, setSelectedSubject] = useState<SubjectRanking | null>(
    null
  );
  const [analysisData, setAnalysisData] = useState<ReturnType<
    typeof generateSubjectAnalysis
  > | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleSubjectClick = (subject: SubjectRanking) => {
    const analysis = generateSubjectAnalysis(subject.subject);
    setAnalysisData(analysis);
    setSelectedSubject(subject);
    setSheetOpen(true);
  };

  const closeAnalysis = () => {
    setSheetOpen(false);
    setSelectedSubject(null);
    setAnalysisData(null);
  };

  return (
    <>
      {/* Class Rankings Card */}
      <Card className="flex flex-col h-[450px]">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Class Rankings</CardTitle>
              <CardDescription className="text-xs">
                Position in class by subject - Click any subject for detailed
                analysis
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              Class Total: 45
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 pb-4">
          <ScrollArea className="h-full">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-16">
                      No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                      Subject
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-20">
                      Score
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-24">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground w-20">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {subjectRankings.map((item, index) => (
                    <tr
                      key={item.subject}
                      onClick={() => handleSubjectClick(item)}
                      className="group border-b hover:bg-accent transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground font-bold text-xs group-hover:bg-foreground group-hover:text-background transition-colors">
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm">{item.subject}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-sm">
                          {item.score}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <p className="text-sm font-bold">{item.rank}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {item.trend === "up" && (
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                              <TrendingUp className="h-3 w-3" />
                            </div>
                          )}
                          {item.trend === "down" && (
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                              <TrendingDown className="h-3 w-3" />
                            </div>
                          )}
                          {item.trend === "same" && (
                            <div className="w-6 h-6 flex items-center justify-center rounded-full bg-muted">
                              <Minus className="h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Subject Analysis Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[60vw] p-0 overflow-hidden">
          {selectedSubject && analysisData && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="border-b bg-white p-6 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                      <SheetTitle className="text-2xl">
                        {analysisData.subject}
                      </SheetTitle>
                      <p className="text-sm text-muted-foreground">
                        Complete Class Performance Analysis
                      </p>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              {/* Content */}
              <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-50 to-white">
                <div className="space-y-6">
                  {/* Summary Stats */}
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
                              {analysisData.summaryStats.totalMales}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Female:
                            </span>
                            <span className="font-medium">
                              {analysisData.summaryStats.totalFemales}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">
                              {analysisData.summaryStats.totalStudents}
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
                              {analysisData.summaryStats.recordedMales}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Female:
                            </span>
                            <span className="font-medium">
                              {analysisData.summaryStats.recordedFemales}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">
                              {analysisData.summaryStats.totalRecorded}
                            </span>
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
                            <span className="font-medium">
                              {analysisData.summaryStats.absentMales}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Female:
                            </span>
                            <span className="font-medium">
                              {analysisData.summaryStats.absentFemales}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-1">
                            <span className="font-medium">Total:</span>
                            <span className="font-bold">
                              {analysisData.summaryStats.totalAbsent}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Analysis Table */}
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
                            {analysisData.gradeDistribution.map(
                              (grade, index) => (
                                <tr
                                  key={grade.grade}
                                  className={`border-b ${
                                    index % 2 === 0
                                      ? "bg-background"
                                      : "bg-muted/50"
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
                              )
                            )}
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
                                  {analysisData.summaryStats.totalPassed}/
                                  {analysisData.summaryStats.totalRecorded}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Pass Rate:
                                </span>
                                <span className="text-lg font-bold">
                                  {
                                    analysisData.summaryStats
                                      .quantityPassPercentage
                                  }
                                  %
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                Formula: (Students passed ÷ Students who sat) ×
                                100
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
                                  {analysisData.summaryStats.totalQualityPass}/
                                  {analysisData.summaryStats.totalPassed}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">
                                  Quality Rate:
                                </span>
                                <span className="text-lg font-bold">
                                  {
                                    analysisData.summaryStats
                                      .qualityPassPercentage
                                  }
                                  %
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                                Formula: (Distinction 1&2 ÷ Students passed) ×
                                100
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Performers and Students Needing Attention */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <Award className="w-5 h-5" />
                          <span>Top Performers</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-80">
                          <div className="space-y-3">
                            {analysisData.topPerformers.map(
                              (student, index) => (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
                                      {index + 1}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">
                                        {student.first_name} {student.last_name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {student.student_id}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold">
                                      {student.score}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {student.grade}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>

                    {/* Students Needing Attention */}
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <AlertTriangle className="w-5 h-5" />
                          <span>Students Needing Attention</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-80">
                          <div className="space-y-3">
                            {analysisData.needsAttention.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-accent transition-colors cursor-pointer">
                                <div className="flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-foreground text-background rounded-full flex items-center justify-center text-xs font-bold">
                                    !
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {student.first_name} {student.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {student.student_id}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold">{student.score}%</p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.grade}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ClassRankingsWithAnalysis;
