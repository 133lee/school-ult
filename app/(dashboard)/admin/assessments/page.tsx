"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  GraduationCap,
  Edit,
  Save,
  X as XIcon,
  Plus,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/components/ui/empty";

interface Assessment {
  id: string;
  title: string;
  type: string;
  class: string;
  subject: string;
  teacher: string;
  maxScore: number;
  scheduledDate: Date;
  status: "pending" | "approved" | "rejected";
  submittedDate?: Date;
  studentsGraded: number;
  totalStudents: number;
}

interface GradeScale {
  letter: string;
  description: string;
  minPercent: number;
  maxPercent: number;
}

interface AssessmentWeight {
  name: string;
  weight: number;
}

interface GradingConfig {
  name: string;
  gradeRange: string;
  grades: GradeScale[];
  weights: AssessmentWeight[];
}

const assessmentsData: Assessment[] = [
  {
    id: "1",
    title: "CAT 1 - Mathematics",
    type: "CAT",
    class: "9A",
    subject: "Mathematics",
    teacher: "Mr. Smith",
    maxScore: 100,
    scheduledDate: new Date(2025, 9, 20),
    status: "pending",
    submittedDate: new Date(2025, 9, 21),
    studentsGraded: 32,
    totalStudents: 32,
  },
  {
    id: "2",
    title: "Mid-Term Physics",
    type: "MID",
    class: "10A",
    subject: "Physics",
    teacher: "Dr. Williams",
    maxScore: 100,
    scheduledDate: new Date(2025, 10, 15),
    status: "approved",
    submittedDate: new Date(2025, 10, 16),
    studentsGraded: 28,
    totalStudents: 28,
  },
  {
    id: "3",
    title: "CAT 2 - English",
    type: "CAT",
    class: "11A",
    subject: "English",
    teacher: "Mrs. Johnson",
    maxScore: 100,
    scheduledDate: new Date(2025, 10, 25),
    status: "pending",
    studentsGraded: 0,
    totalStudents: 25,
  },
];

const getStatusConfig = (status: Assessment["status"]) => {
  switch (status) {
    case "pending":
      return { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending Review" };
    case "approved":
      return { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Approved" };
    case "rejected":
      return { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected" };
  }
};

export default function AdminAssessmentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // New assessment form state
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    type: "",
    class: "",
    subject: "",
    teacher: "",
    maxScore: 100,
    scheduledDate: new Date(),
  });

  // Grading configuration state
  const [editingConfig, setEditingConfig] = useState<string | null>(null);

  const [primaryConfig, setPrimaryConfig] = useState<GradingConfig>({
    name: "Primary Level",
    gradeRange: "Grades 1-7",
    grades: [
      { letter: "E", description: "Excellent", minPercent: 80, maxPercent: 100 },
      { letter: "VG", description: "Very Good", minPercent: 70, maxPercent: 79 },
      { letter: "G", description: "Good", minPercent: 60, maxPercent: 69 },
      { letter: "S", description: "Satisfactory", minPercent: 50, maxPercent: 59 },
      { letter: "W", description: "Weak", minPercent: 0, maxPercent: 49 },
    ],
    weights: [
      { name: "CAT 1", weight: 15 },
      { name: "CAT 2", weight: 15 },
      { name: "End of Term", weight: 70 },
    ],
  });

  const [juniorConfig, setJuniorConfig] = useState<GradingConfig>({
    name: "Junior Secondary",
    gradeRange: "Grades 8-9",
    grades: [
      { letter: "1", description: "Distinction", minPercent: 75, maxPercent: 100 },
      { letter: "2", description: "Merit", minPercent: 60, maxPercent: 74 },
      { letter: "3", description: "Credit", minPercent: 50, maxPercent: 59 },
      { letter: "4", description: "Pass", minPercent: 40, maxPercent: 49 },
      { letter: "F", description: "Fail", minPercent: 0, maxPercent: 39 },
    ],
    weights: [
      { name: "CAT 1", weight: 10 },
      { name: "CAT 2", weight: 10 },
      { name: "Mid-Term", weight: 20 },
      { name: "End of Term", weight: 60 },
    ],
  });

  const [seniorConfig, setSeniorConfig] = useState<GradingConfig>({
    name: "Senior Secondary",
    gradeRange: "Grades 10-12 (Form 1-4)",
    grades: [
      { letter: "1", description: "Distinction 1", minPercent: 75, maxPercent: 100 },
      { letter: "2", description: "Distinction 2", minPercent: 70, maxPercent: 74 },
      { letter: "3", description: "Merit 3", minPercent: 65, maxPercent: 69 },
      { letter: "4", description: "Merit 4", minPercent: 60, maxPercent: 64 },
      { letter: "5", description: "Credit 5", minPercent: 55, maxPercent: 59 },
      { letter: "6", description: "Credit 6", minPercent: 50, maxPercent: 54 },
      { letter: "7", description: "Satisfactory 7", minPercent: 45, maxPercent: 49 },
      { letter: "8", description: "Satisfactory 8", minPercent: 40, maxPercent: 44 },
      { letter: "9", description: "Unsatisfactory 9", minPercent: 0, maxPercent: 39 },
    ],
    weights: [
      { name: "CAT 1", weight: 10 },
      { name: "CAT 2", weight: 10 },
      { name: "CAT 3", weight: 10 },
      { name: "Mid-Term", weight: 20 },
      { name: "End of Term", weight: 50 },
    ],
  });

  const filteredAssessments = assessmentsData.filter((assessment) => {
    const matchesSearch =
      assessment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assessment.teacher.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === "all" || assessment.class === classFilter;
    const matchesSubject = subjectFilter === "all" || assessment.subject === subjectFilter;
    const matchesStatus = statusFilter === "all" || assessment.status === statusFilter;
    return matchesSearch && matchesClass && matchesSubject && matchesStatus;
  });

  const handleApprove = () => {
    console.log("Approving assessment:", selectedAssessment?.id);
    toast.success("Assessment approved and results published!");
    setApproveDialogOpen(false);
    setSelectedAssessment(null);
  };

  const handleReject = () => {
    console.log("Rejecting assessment:", selectedAssessment?.id);
    toast.info("Assessment rejected. Teacher has been notified.");
    setRejectDialogOpen(false);
    setSelectedAssessment(null);
  };

  const handleCreateAssessment = () => {
    // In a real application, this would:
    // 1. Create the assessment in the database
    // 2. Assign it to the specified teacher
    // 3. Send a notification to the teacher
    console.log("Creating assessment:", newAssessment);

    // Simulate notification to teacher
    const notificationMessage = `New assessment "${newAssessment.title}" has been created for ${newAssessment.class} - ${newAssessment.subject}. Please enter grades by ${format(newAssessment.scheduledDate, "MMM d, yyyy")}.`;

    toast.success(`Assessment created successfully and notification sent to ${newAssessment.teacher}`);

    // Reset form and close dialog
    setNewAssessment({
      title: "",
      type: "",
      class: "",
      subject: "",
      teacher: "",
      maxScore: 100,
      scheduledDate: new Date(),
    });
    setCreateDialogOpen(false);
  };

  const updateGradeScale = (
    configType: "primary" | "junior" | "senior",
    index: number,
    field: keyof GradeScale,
    value: string | number
  ) => {
    const configs = { primary: primaryConfig, junior: juniorConfig, senior: seniorConfig };
    const setters = { primary: setPrimaryConfig, junior: setJuniorConfig, senior: setSeniorConfig };

    const config = { ...configs[configType] };
    config.grades[index] = { ...config.grades[index], [field]: value };
    setters[configType](config);
  };

  const updateWeight = (
    configType: "primary" | "junior" | "senior",
    index: number,
    value: number
  ) => {
    const configs = { primary: primaryConfig, junior: juniorConfig, senior: seniorConfig };
    const setters = { primary: setPrimaryConfig, junior: setJuniorConfig, senior: setSeniorConfig };

    const config = { ...configs[configType] };
    config.weights[index] = { ...config.weights[index], weight: value };
    setters[configType](config);
  };

  const getTotalWeight = (weights: AssessmentWeight[]) => {
    return weights.reduce((sum, w) => sum + w.weight, 0);
  };

  const handleSaveConfig = (configName: string) => {
    // In a real application, this would save to the backend/database
    console.log(`Saving configuration for: ${configName}`);

    // Exit edit mode
    setEditingConfig(null);

    // Show success message
    toast.success(`${configName} configuration saved successfully!`);
  };

  const stats = {
    total: assessmentsData.length,
    pending: assessmentsData.filter((a) => a.status === "pending").length,
    approved: assessmentsData.filter((a) => a.status === "approved").length,
    rejected: assessmentsData.filter((a) => a.status === "rejected").length,
  };

  const renderGradingConfig = (
    config: GradingConfig,
    configType: "primary" | "junior" | "senior",
    colorMap: { [key: string]: string }
  ) => {
    const isEditing = editingConfig === configType;
    const totalWeight = getTotalWeight(config.weights);
    const isValidWeight = totalWeight === 100;

    return (
      <Card key={configType}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>{config.name}</CardTitle>
              <Badge variant="outline">{config.gradeRange}</Badge>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingConfig(null)}
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSaveConfig(config.name)}
                    disabled={!isValidWeight}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingConfig(configType)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">Grading Scale</h4>
            {isEditing ? (
              <div className="space-y-3">
                {config.grades.map((grade, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 p-3 border rounded">
                    <div>
                      <Label className="text-xs">Letter</Label>
                      <Input
                        value={grade.letter}
                        onChange={(e) =>
                          updateGradeScale(configType, index, "letter", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={grade.description}
                        onChange={(e) =>
                          updateGradeScale(configType, index, "description", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Min %</Label>
                      <Input
                        type="number"
                        value={grade.minPercent}
                        onChange={(e) =>
                          updateGradeScale(configType, index, "minPercent", parseInt(e.target.value) || 0)
                        }
                        className="mt-1"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Max %</Label>
                      <Input
                        type="number"
                        value={grade.maxPercent}
                        onChange={(e) =>
                          updateGradeScale(configType, index, "maxPercent", parseInt(e.target.value) || 0)
                        }
                        className="mt-1"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {config.grades.map((grade, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 border rounded ${colorMap[grade.letter] || "bg-gray-50 dark:bg-gray-900/20"}`}
                  >
                    <span className="font-semibold">
                      {grade.letter} ({grade.description})
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {grade.minPercent}-{grade.maxPercent}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Assessment Weights</h4>
            {isEditing ? (
              <div className="space-y-2">
                {config.weights.map((weight, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded">
                    <Label className="flex-1">{weight.name}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={weight.weight}
                        onChange={(e) =>
                          updateWeight(configType, index, parseInt(e.target.value) || 0)
                        }
                        className="w-20"
                        min={0}
                        max={100}
                      />
                      <span className="text-sm font-medium">%</span>
                    </div>
                  </div>
                ))}
                <div
                  className={`mt-2 p-3 rounded text-sm font-medium ${
                    isValidWeight
                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                      : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                  }`}
                >
                  Total: {totalWeight}% {isValidWeight ? "✓" : "❌ Must equal 100%"}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {config.weights.map((weight, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <span>{weight.name}</span>
                    <span className="font-bold">{weight.weight}%</span>
                  </div>
                ))}
                <div className="mt-2 p-2 bg-muted rounded text-xs">
                  Total: 100% ({config.weights.map((w) => w.name).join(" + ")})
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assessment Management</h1>
          <p className="text-muted-foreground text-sm">
            Create and manage assessments across all classes
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Assessment
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="review">
            <FileText className="h-4 w-4 mr-2" />
            Review Queue
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarIcon className="h-4 w-4 mr-2" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity and Stats Cards Side by Side */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Recent Activity - Takes 2 columns */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Assessment Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessmentsData.slice(0, 5).map((assessment) => (
                      <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            assessment.subject === "Mathematics" ? "bg-blue-100" :
                            assessment.subject === "Physics" ? "bg-green-100" :
                            "bg-purple-100"
                          }`}>
                            <GraduationCap className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm">{assessment.title}</h4>
                            <p className="text-xs text-muted-foreground">
                              {assessment.teacher} • {assessment.class} • {format(assessment.scheduledDate, "MMM d")}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusConfig(assessment.status).color}>
                          {getStatusConfig(assessment.status).label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards - 2x2 Grid in 1 column */}
            <div className="grid gap-4 grid-cols-2 md:col-span-1">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground">This term</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-600">
                    Pending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </div>
                  <p className="text-xs text-muted-foreground">Review</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </div>
                  <p className="text-xs text-muted-foreground">Published</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">
                    Rejected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </div>
                  <p className="text-xs text-muted-foreground">Returned</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Review Queue Tab */}
        <TabsContent value="review" className="space-y-6">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search assessments or teachers..."
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
                <SelectItem value="9A">9A</SelectItem>
                <SelectItem value="10A">10A</SelectItem>
                <SelectItem value="11A">11A</SelectItem>
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
                <SelectItem value="English">English</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assessments List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assessments for Review</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAssessments.length > 0 ? (
                <ScrollArea className="h-[calc(100vh-28rem)]">
                  <div className="space-y-3">
                    {filteredAssessments.map((assessment) => {
                      const config = getStatusConfig(assessment.status);
                      const StatusIcon = config.icon;

                      return (
                        <div
                          key={assessment.id}
                          className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-base">
                                    {assessment.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {assessment.class} • {assessment.subject} • {assessment.teacher}
                                  </p>
                                </div>
                                <Badge className={config.color}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {config.label}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Type: {assessment.type}</span>
                                <span>•</span>
                                <span>Max Score: {assessment.maxScore}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <CalendarIcon className="h-3 w-3" />
                                  {format(assessment.scheduledDate, "MMM d, yyyy")}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{
                                      width: `${
                                        (assessment.studentsGraded / assessment.totalStudents) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {assessment.studentsGraded}/{assessment.totalStudents} students graded
                                </span>
                              </div>

                              {assessment.submittedDate && (
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {format(assessment.submittedDate, "MMM d, yyyy")}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {assessment.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700"
                                    onClick={() => {
                                      setSelectedAssessment(assessment);
                                      setRejectDialogOpen(true);
                                    }}>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAssessment(assessment);
                                      setApproveDialogOpen(true);
                                    }}>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <Empty className="border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <FileText className="h-6 w-6" />
                    </EmptyMedia>
                    <EmptyTitle>No assessments found</EmptyTitle>
                    <EmptyDescription>
                      {searchQuery || classFilter !== "all" || subjectFilter !== "all" || statusFilter !== "all"
                        ? "No assessments match your current filters. Try adjusting your search criteria."
                        : "No assessments have been created yet. Create your first assessment to get started."}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Assessment
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[500px] flex items-center justify-center text-muted-foreground">
                Calendar view showing all scheduled assessments would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          {renderGradingConfig(primaryConfig, "primary", {
            E: "bg-green-50 dark:bg-green-900/20 border-green-200",
            VG: "bg-blue-50 dark:bg-blue-900/20 border-blue-200",
            G: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200",
            S: "bg-orange-50 dark:bg-orange-900/20 border-orange-200",
            W: "bg-red-50 dark:bg-red-900/20 border-red-200",
          })}

          {renderGradingConfig(juniorConfig, "junior", {
            A: "bg-green-50 dark:bg-green-900/20 border-green-200",
            B: "bg-blue-50 dark:bg-blue-900/20 border-blue-200",
            C: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200",
            D: "bg-orange-50 dark:bg-orange-900/20 border-orange-200",
            E: "bg-red-50 dark:bg-red-900/20 border-red-200",
          })}

          {renderGradingConfig(seniorConfig, "senior", {
            A: "bg-green-50 dark:bg-green-900/20 border-green-200",
            B: "bg-blue-50 dark:bg-blue-900/20 border-blue-200",
            C: "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200",
            D: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200",
            E: "bg-orange-50 dark:bg-orange-900/20 border-orange-200",
            F: "bg-red-50 dark:bg-red-900/20 border-red-200",
          })}

          {/* Note */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                    Configuration Note
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Each grade level group has its own grading scale and assessment weights.
                    Click "Edit" to customize the grading scale and assessment weights for each level.
                    Teachers will automatically see the correct configuration based on the class they are teaching.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve &quot;{selectedAssessment?.title}&quot;?
              Results will be published to students and parents.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Assessment</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject &quot;{selectedAssessment?.title}&quot;?
              The teacher will be notified and asked to review.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Assessment Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Assessment</DialogTitle>
            <DialogDescription>
              Create a new assessment and notify the assigned teacher
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assessment Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., CAT 1 - Mathematics"
                  value={newAssessment.title}
                  onChange={(e) =>
                    setNewAssessment({ ...newAssessment, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Assessment Type</Label>
                <Select
                  value={newAssessment.type}
                  onValueChange={(value) =>
                    setNewAssessment({ ...newAssessment, type: value })
                  }>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CAT">CAT (Continuous Assessment Test)</SelectItem>
                    <SelectItem value="MID">Mid-Term Exam</SelectItem>
                    <SelectItem value="FINAL">End of Term Exam</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class">Class</Label>
                <Select
                  value={newAssessment.class}
                  onValueChange={(value) =>
                    setNewAssessment({ ...newAssessment, class: value })
                  }>
                  <SelectTrigger id="class">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9A">Grade 9A</SelectItem>
                    <SelectItem value="9B">Grade 9B</SelectItem>
                    <SelectItem value="10A">Grade 10A</SelectItem>
                    <SelectItem value="10B">Grade 10B</SelectItem>
                    <SelectItem value="11A">Grade 11A</SelectItem>
                    <SelectItem value="11B">Grade 11B</SelectItem>
                    <SelectItem value="12A">Grade 12A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={newAssessment.subject}
                  onValueChange={(value) =>
                    setNewAssessment({ ...newAssessment, subject: value })
                  }>
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher">Assign to Teacher</Label>
                <Select
                  value={newAssessment.teacher}
                  onValueChange={(value) =>
                    setNewAssessment({ ...newAssessment, teacher: value })
                  }>
                  <SelectTrigger id="teacher">
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr. Smith">Mr. Smith (Mathematics)</SelectItem>
                    <SelectItem value="Dr. Williams">Dr. Williams (Physics)</SelectItem>
                    <SelectItem value="Mrs. Johnson">Mrs. Johnson (English)</SelectItem>
                    <SelectItem value="Mr. Brown">Mr. Brown (Chemistry)</SelectItem>
                    <SelectItem value="Ms. Davis">Ms. Davis (Biology)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxScore">Maximum Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  value={newAssessment.maxScore}
                  onChange={(e) =>
                    setNewAssessment({
                      ...newAssessment,
                      maxScore: parseInt(e.target.value) || 100,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !newAssessment.scheduledDate && "text-muted-foreground"
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newAssessment.scheduledDate ? (
                      format(newAssessment.scheduledDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newAssessment.scheduledDate}
                    onSelect={(date) =>
                      date &&
                      setNewAssessment({ ...newAssessment, scheduledDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100">
                  Teacher Notification
                </h4>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  The assigned teacher will receive a notification about this assessment and will be able to enter grades for their students.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateAssessment}
              disabled={
                !newAssessment.title ||
                !newAssessment.type ||
                !newAssessment.class ||
                !newAssessment.subject ||
                !newAssessment.teacher
              }>
              <Plus className="h-4 w-4 mr-2" />
              Create & Notify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
