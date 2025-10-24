"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { SubjectAnalysisSheet } from "@/components/shared/sheets/subject-analysis-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Search,
  Filter,
  BarChart3,
  BookOpen,
  ChevronDown,
} from "lucide-react";

// Mock data for teacher's subjects
// In real app, this would come from teacher's profile (primarySubject, secondarySubject)
const teacherSubjects = [
  {
    id: "1",
    name: "Mathematics",
    classes: ["Class 9A", "Class 10A"],
    totalStudents: 85,
    averageScore: 78.5,
    passRate: 94.1,
    trend: "up" as const,
  },
  {
    id: "2",
    name: "Physics",
    classes: ["Class 11A"],
    totalStudents: 42,
    averageScore: 72.3,
    passRate: 88.1,
    trend: "down" as const,
  },
];

// Get subject names for dynamic column headers
const teacherSubjectNames = teacherSubjects.map(s => s.name);

// Mock student data with performance metrics
const studentsPerformance = [
  {
    id: "1",
    name: "Sarah Johnson",
    studentId: "STU001",
    className: "Class 9A",
    photoUrl: "https://i.pravatar.cc/150?img=5",
    subjects: {
      Mathematics: { score: 92, grade: "Dist 1", trend: "up" as const },
      Physics: { score: 0, grade: "-", trend: "same" as const },
    },
    averageScore: 92,
    status: "Active" as const,
  },
  {
    id: "2",
    name: "Michael Chen",
    studentId: "STU002",
    className: "Class 9A",
    photoUrl: "https://i.pravatar.cc/150?img=12",
    subjects: {
      Mathematics: { score: 88, grade: "Dist 1", trend: "up" as const },
      Physics: { score: 0, grade: "-", trend: "same" as const },
    },
    averageScore: 88,
    status: "Active" as const,
  },
  {
    id: "3",
    name: "Emma Williams",
    studentId: "STU003",
    className: "Class 10A",
    photoUrl: "https://i.pravatar.cc/150?img=25",
    subjects: {
      Mathematics: { score: 85, grade: "Dist 1", trend: "same" as const },
      Physics: { score: 0, grade: "-", trend: "same" as const },
    },
    averageScore: 85,
    status: "Active" as const,
  },
  {
    id: "4",
    name: "James Brown",
    studentId: "STU004",
    className: "Class 11A",
    photoUrl: "https://i.pravatar.cc/150?img=33",
    subjects: {
      Mathematics: { score: 0, grade: "-", trend: "same" as const },
      Physics: { score: 79, grade: "Dist 2", trend: "up" as const },
    },
    averageScore: 79,
    status: "Active" as const,
  },
  {
    id: "5",
    name: "Olivia Davis",
    studentId: "STU005",
    className: "Class 11A",
    photoUrl: "https://i.pravatar.cc/150?img=45",
    subjects: {
      Mathematics: { score: 0, grade: "-", trend: "same" as const },
      Physics: { score: 75, grade: "Dist 1", trend: "down" as const },
    },
    averageScore: 75,
    status: "Active" as const,
  },
  {
    id: "6",
    name: "Alex Martinez",
    studentId: "STU006",
    className: "Class 9A",
    photoUrl: "https://i.pravatar.cc/150?img=15",
    subjects: {
      Mathematics: { score: 38, grade: "Fail", trend: "down" as const },
      Physics: { score: 0, grade: "-", trend: "same" as const },
    },
    averageScore: 38,
    status: "Active" as const,
  },
];

// Top performers across all classes
const topPerformers = studentsPerformance
  .filter((s) => s.averageScore >= 85)
  .sort((a, b) => b.averageScore - a.averageScore)
  .slice(0, 5);

export default function TeacherPerformanceOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [assessmentFilter, setAssessmentFilter] = useState("CAT1");
  const [expandedSection, setExpandedSection] = useState<
    "top" | "attention" | null
  >("top");
  const [analysisSheetOpen, setAnalysisSheetOpen] = useState(false);
  const [selectedGradeLevel, setSelectedGradeLevel] = useState<"junior" | "senior">("senior");
  const [selectedSubjectData, setSelectedSubjectData] = useState<{
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
  } | null>(null);

  const filteredStudents = studentsPerformance.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass =
      classFilter === "all" || student.className === classFilter;
    const matchesSubject =
      subjectFilter === "all" ||
      student.subjects[subjectFilter as keyof typeof student.subjects].score >
        0;

    return matchesSearch && matchesClass && matchesSubject;
  });

  // Mock data for subject analysis - Senior (Form 1-4 / Grades 10-12)
  const mathematicsAnalysisSenior = {
    name: "Mathematics",
    className: classFilter === "all" ? undefined : classFilter,
    totalStudents: 85,
    maleStudents: 45,
    femaleStudents: 40,
    gradeDistribution: [
      {
        grade: "Distinction 1",
        range: "75-100%",
        male: 10,
        female: 8,
        total: 18,
        percentage: 21.2,
      },
      {
        grade: "Distinction 2",
        range: "70-74%",
        male: 6,
        female: 7,
        total: 13,
        percentage: 15.3,
      },
      {
        grade: "Merit 3",
        range: "65-69%",
        male: 8,
        female: 6,
        total: 14,
        percentage: 16.5,
      },
      {
        grade: "Merit 4",
        range: "60-64%",
        male: 7,
        female: 5,
        total: 12,
        percentage: 14.1,
      },
      {
        grade: "Credit 5",
        range: "55-59%",
        male: 5,
        female: 4,
        total: 9,
        percentage: 10.6,
      },
      {
        grade: "Credit 6",
        range: "50-54%",
        male: 4,
        female: 3,
        total: 7,
        percentage: 8.2,
      },
      {
        grade: "Satisfactory 7",
        range: "45-49%",
        male: 2,
        female: 3,
        total: 5,
        percentage: 5.9,
      },
      {
        grade: "Satisfactory 8",
        range: "40-44%",
        male: 2,
        female: 2,
        total: 4,
        percentage: 4.7,
      },
      {
        grade: "Unsatisfactory 9",
        range: "0-39%",
        male: 1,
        female: 2,
        total: 3,
        percentage: 3.5,
      },
    ],
    topPerformers: [
      {
        id: "1",
        name: "Sarah Johnson",
        studentId: "STU001",
        score: 92,
        grade: "Dist 1",
      },
      {
        id: "2",
        name: "Michael Chen",
        studentId: "STU002",
        score: 88,
        grade: "Dist 1",
      },
      {
        id: "3",
        name: "Emma Williams",
        studentId: "STU003",
        score: 85,
        grade: "Dist 1",
      },
      {
        id: "7",
        name: "David Lee",
        studentId: "STU007",
        score: 83,
        grade: "Dist 1",
      },
      {
        id: "8",
        name: "Sophie Turner",
        studentId: "STU008",
        score: 81,
        grade: "Dist 1",
      },
    ],
    needsAttention: [
      {
        id: "6",
        name: "Alex Martinez",
        studentId: "STU006",
        score: 38,
        grade: "Fail",
      },
      {
        id: "9",
        name: "Ryan Cooper",
        studentId: "STU009",
        score: 35,
        grade: "Fail",
      },
      {
        id: "10",
        name: "Mia Anderson",
        studentId: "STU010",
        score: 32,
        grade: "Fail",
      },
    ],
  };

  // Mock data for subject analysis - Junior (Grades 8-9)
  const mathematicsAnalysisJunior = {
    name: "Mathematics",
    className: classFilter === "all" ? undefined : classFilter,
    totalStudents: 85,
    maleStudents: 45,
    femaleStudents: 40,
    gradeDistribution: [
      {
        grade: "Distinction",
        range: "75-100%",
        male: 16,
        female: 13,
        total: 29,
        percentage: 34.1,
      },
      {
        grade: "Merit",
        range: "60-74%",
        male: 14,
        female: 12,
        total: 26,
        percentage: 30.6,
      },
      {
        grade: "Credit",
        range: "50-59%",
        male: 9,
        female: 7,
        total: 16,
        percentage: 18.8,
      },
      {
        grade: "Pass",
        range: "40-49%",
        male: 4,
        female: 5,
        total: 9,
        percentage: 10.6,
      },
      {
        grade: "Fail",
        range: "0-39%",
        male: 2,
        female: 3,
        total: 5,
        percentage: 5.9,
      },
    ],
    topPerformers: [
      {
        id: "1",
        name: "Sarah Johnson",
        studentId: "STU001",
        score: 92,
        grade: "Dist",
      },
      {
        id: "2",
        name: "Michael Chen",
        studentId: "STU002",
        score: 88,
        grade: "Dist",
      },
      {
        id: "3",
        name: "Emma Williams",
        studentId: "STU003",
        score: 85,
        grade: "Dist",
      },
      {
        id: "4",
        name: "Liam Johnson",
        studentId: "STU004",
        score: 84,
        grade: "Dist",
      },
      {
        id: "7",
        name: "David Lee",
        studentId: "STU007",
        score: 83,
        grade: "Dist",
      },
    ],
    needsAttention: [
      {
        id: "6",
        name: "Alex Martinez",
        studentId: "STU006",
        score: 38,
        grade: "Fail",
      },
      {
        id: "9",
        name: "Ryan Cooper",
        studentId: "STU009",
        score: 35,
        grade: "Fail",
      },
      {
        id: "10",
        name: "Mia Anderson",
        studentId: "STU010",
        score: 32,
        grade: "Fail",
      },
    ],
  };

  // Use the appropriate grading scale based on selected grade level
  const mathematicsAnalysisData = selectedGradeLevel === "junior"
    ? mathematicsAnalysisJunior
    : mathematicsAnalysisSenior;

  const physicsAnalysisData = {
    name: "Physics",
    className: classFilter === "all" ? undefined : classFilter,
    totalStudents: 42,
    maleStudents: 23,
    femaleStudents: 19,
    gradeDistribution: [
      {
        grade: "Distinction 1",
        range: "80-100%",
        male: 5,
        female: 4,
        total: 9,
        percentage: 21.4,
      },
      {
        grade: "Distinction 2",
        range: "70-79%",
        male: 6,
        female: 5,
        total: 11,
        percentage: 26.2,
      },
      {
        grade: "Credit",
        range: "60-69%",
        male: 5,
        female: 4,
        total: 9,
        percentage: 21.4,
      },
      {
        grade: "Pass",
        range: "50-59%",
        male: 4,
        female: 3,
        total: 7,
        percentage: 16.7,
      },
      {
        grade: "Fail",
        range: "0-49%",
        male: 3,
        female: 3,
        total: 6,
        percentage: 14.3,
      },
    ],
    topPerformers: [
      {
        id: "4",
        name: "James Brown",
        studentId: "STU004",
        score: 79,
        grade: "Dist 2",
      },
      {
        id: "5",
        name: "Olivia Davis",
        studentId: "STU005",
        score: 75,
        grade: "Dist 1",
      },
      {
        id: "11",
        name: "Ethan Wilson",
        studentId: "STU011",
        score: 74,
        grade: "Dist 2",
      },
      {
        id: "12",
        name: "Isabella Martinez",
        studentId: "STU012",
        score: 72,
        grade: "Dist 2",
      },
      {
        id: "13",
        name: "Liam Thompson",
        studentId: "STU013",
        score: 71,
        grade: "Dist 2",
      },
    ],
    needsAttention: [
      {
        id: "14",
        name: "Noah Garcia",
        studentId: "STU014",
        score: 39,
        grade: "Fail",
      },
      {
        id: "15",
        name: "Ava Rodriguez",
        studentId: "STU015",
        score: 36,
        grade: "Fail",
      },
    ],
  };

  const handleViewSubjectAnalysis = () => {
    // Determine which subject to show based on filter
    if (subjectFilter === "Mathematics") {
      setSelectedSubjectData(mathematicsAnalysisData);
    } else if (subjectFilter === "Physics") {
      setSelectedSubjectData(physicsAnalysisData);
    } else {
      // Default to Mathematics when "all" is selected
      setSelectedSubjectData(mathematicsAnalysisData);
    }
    setAnalysisSheetOpen(true);
  };

  const handleSubjectChange = (subject: string) => {
    // Update the subject data when subject is changed in the sheet
    if (subject === "Mathematics") {
      setSelectedSubjectData(mathematicsAnalysisData);
    } else if (subject === "Physics") {
      setSelectedSubjectData(physicsAnalysisData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Performance Overview</h1>
          <p className="text-muted-foreground text-sm">
            Monitor student performance across all your subjects and classes
          </p>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Student Performance List */}
        <Card className="md:col-span-2 flex flex-col h-[calc(100vh-13rem)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Student Performance</CardTitle>
                <CardDescription className="text-xs">
                  Condensed view of all students across your classes
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={assessmentFilter} onValueChange={setAssessmentFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAT1">CAT 1</SelectItem>
                    <SelectItem value="MID">Mid-Term</SelectItem>
                    <SelectItem value="EOT">End of Term</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedGradeLevel} onValueChange={(value: "junior" | "senior") => setSelectedGradeLevel(value)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Grades 8-9</SelectItem>
                    <SelectItem value="senior">Forms 1-4 / Gr 10-12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  <SelectItem value="Class 9A">Class 9A</SelectItem>
                  <SelectItem value="Class 10A">Class 10A</SelectItem>
                  <SelectItem value="Class 11A">Class 11A</SelectItem>
                </SelectContent>
              </Select>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col">
            <div className="overflow-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-background border-b">
                  <tr>
                    <th className="p-3 text-left font-semibold text-sm bg-background">
                      Student
                    </th>
                    <th className="p-3 text-left font-semibold text-sm bg-background">
                      Class
                    </th>
                    {/* Dynamic subject columns based on teacher's subjects */}
                    {teacherSubjectNames.map((subjectName) => (
                      <th key={subjectName} className="p-3 text-center font-semibold text-sm bg-background">
                        {subjectName}
                      </th>
                    ))}
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
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={student.photoUrl}
                              alt={student.name}
                            />
                            <AvatarFallback className="text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {student.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs">
                          {student.className}
                        </Badge>
                      </td>
                      {/* Dynamic subject data columns */}
                      {teacherSubjectNames.map((subjectName) => {
                        const subjectData = student.subjects[subjectName as keyof typeof student.subjects];
                        return (
                          <td key={subjectName} className="p-3 text-center">
                            {subjectData && subjectData.score > 0 ? (
                              <div className="flex flex-col items-center">
                                <span className="font-semibold">
                                  {subjectData.score}%
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] mt-1">
                                  {subjectData.grade}
                                </Badge>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Top Performers & Need Attention */}
        <div className="space-y-4">
          {/* Subject Analysis Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleViewSubjectAnalysis}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Subject Analysis
          </Button>

          {/* Top Performers */}
          <Card>
            <CardHeader
              className="pb-3 cursor-pointer"
              onClick={() =>
                setExpandedSection(expandedSection === "top" ? null : "top")
              }>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    Top Performers
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {classFilter === "all"
                      ? "Best student per subject"
                      : `Top 3 in ${classFilter}`}
                  </CardDescription>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSection === "top" ? "transform rotate-180" : ""
                  }`}
                />
              </div>
            </CardHeader>
            {expandedSection === "top" && (
              <CardContent>
                <ScrollArea className="h-[220px]">
                  {classFilter === "all" ? (
                    // Show top performer per subject
                    <div className="space-y-4">
                      {/* Mathematics Top Performer */}
                      {(() => {
                        const mathTop = studentsPerformance
                          .filter((s) => s.subjects.Mathematics.score > 0)
                          .sort(
                            (a, b) =>
                              b.subjects.Mathematics.score -
                              a.subjects.Mathematics.score
                          )[0];

                        return mathTop ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs font-semibold">
                                  Mathematics
                                </p>
                              </div>
                              <Badge variant="outline" className="text-[10px]">
                                {mathTop.className}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                1
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={mathTop.photoUrl}
                                  alt={mathTop.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {mathTop.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {mathTop.name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">
                                  {mathTop.subjects.Mathematics.score}%
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {mathTop.subjects.Mathematics.grade}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}

                      {/* Physics Top Performer */}
                      {(() => {
                        const physicsTop = studentsPerformance
                          .filter((s) => s.subjects.Physics.score > 0)
                          .sort(
                            (a, b) =>
                              b.subjects.Physics.score -
                              a.subjects.Physics.score
                          )[0];

                        return physicsTop ? (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-3 w-3 text-muted-foreground" />
                                <p className="text-xs font-semibold">Physics</p>
                              </div>
                              <Badge variant="outline" className="text-[10px]">
                                {physicsTop.className}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                1
                              </div>
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={physicsTop.photoUrl}
                                  alt={physicsTop.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {physicsTop.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {physicsTop.name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-sm">
                                  {physicsTop.subjects.Physics.score}%
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {physicsTop.subjects.Physics.grade}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    // Show top 3 for selected class
                    <div className="space-y-3">
                      {studentsPerformance
                        .filter((s) => s.className === classFilter)
                        .sort((a, b) => b.averageScore - a.averageScore)
                        .slice(0, 3)
                        .map((student, index) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                              {index + 1}
                            </div>
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={student.photoUrl}
                                alt={student.name}
                              />
                              <AvatarFallback className="text-xs">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {student.name}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">
                                {student.averageScore}%
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            )}
          </Card>

          {/* Students Needing Attention */}
          <Card>
            <CardHeader
              className="pb-3 cursor-pointer"
              onClick={() =>
                setExpandedSection(
                  expandedSection === "attention" ? null : "attention"
                )
              }>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Need Attention
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Students scoring below 40%
                  </CardDescription>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSection === "attention"
                      ? "transform rotate-180"
                      : ""
                  }`}
                />
              </div>
            </CardHeader>
            {expandedSection === "attention" && (
              <CardContent>
                <ScrollArea className="h-[220px]">
                  <div className="space-y-4">
                    {/* Mathematics Students Needing Attention */}
                    {(() => {
                      const mathNeedsAttention = studentsPerformance
                        .filter(
                          (s) =>
                            s.subjects.Mathematics.score > 0 &&
                            s.subjects.Mathematics.score < 40
                        )
                        .sort(
                          (a, b) =>
                            a.subjects.Mathematics.score -
                            b.subjects.Mathematics.score
                        )
                        .slice(0, 5);

                      return mathNeedsAttention.length > 0 ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs font-semibold">Mathematics</p>
                          </div>
                          <div className="space-y-2">
                            {mathNeedsAttention.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive font-bold text-xs">
                                  !
                                </div>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={student.photoUrl}
                                    alt={student.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.className}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sm text-destructive">
                                    {student.subjects.Mathematics.score}%
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {student.subjects.Mathematics.grade}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* Physics Students Needing Attention */}
                    {(() => {
                      const physicsNeedsAttention = studentsPerformance
                        .filter(
                          (s) =>
                            s.subjects.Physics.score > 0 &&
                            s.subjects.Physics.score < 40
                        )
                        .sort(
                          (a, b) =>
                            a.subjects.Physics.score - b.subjects.Physics.score
                        )
                        .slice(0, 5);

                      return physicsNeedsAttention.length > 0 ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs font-semibold">Physics</p>
                          </div>
                          <div className="space-y-2">
                            {physicsNeedsAttention.map((student) => (
                              <div
                                key={student.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-destructive/10 text-destructive font-bold text-xs">
                                  !
                                </div>
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={student.photoUrl}
                                    alt={student.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {student.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">
                                    {student.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {student.className}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-sm text-destructive">
                                    {student.subjects.Physics.score}%
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {student.subjects.Physics.grade}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* No students need attention */}
                    {studentsPerformance.every(
                      (s) =>
                        (s.subjects.Mathematics.score === 0 ||
                          s.subjects.Mathematics.score >= 40) &&
                        (s.subjects.Physics.score === 0 ||
                          s.subjects.Physics.score >= 40)
                    ) && (
                      <div className="text-center py-8 text-muted-foreground text-sm">
                        No students need attention
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Subject Analysis Sheet */}
      <SubjectAnalysisSheet
        open={analysisSheetOpen}
        onOpenChange={setAnalysisSheetOpen}
        subjectData={selectedSubjectData}
        availableSubjects={["Mathematics", "Physics"]}
        onSubjectChange={handleSubjectChange}
        gradeLevel={selectedGradeLevel}
      />
    </div>
  );
}
