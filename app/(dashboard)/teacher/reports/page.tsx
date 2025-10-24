"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  Printer,
  TrendingUp,
  Users,
  GraduationCap,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const TeacherReports = () => {
  const [selectedClass, setSelectedClass] = useState("9A");
  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [dateRange, setDateRange] = useState("this-month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sample data
  const myClasses = ["9A", "10A", "11A"];
  const mySubjects = ["Mathematics", "Physics"];

  const classPerformance = [
    { class: "9A", average: 75, high: 95, low: 45 },
    { class: "10A", average: 82, high: 98, low: 55 },
    { class: "11A", average: 78, high: 92, low: 50 },
  ];

  const attendanceData = [
    { name: "Week 1", attendance: 95 },
    { name: "Week 2", attendance: 92 },
    { name: "Week 3", attendance: 88 },
    { name: "Week 4", attendance: 90 },
  ];

  const studentProgress = [
    { name: "John Doe", cat1: 75, cat2: 80, endTerm: 85 },
    { name: "Jane Smith", cat1: 88, cat2: 90, endTerm: 92 },
    { name: "Mike Johnson", cat1: 65, cat2: 70, endTerm: 72 },
    { name: "Sarah Williams", cat1: 92, cat2: 95, endTerm: 98 },
  ];

  const topicAnalysis = [
    { topic: "Algebra", score: 85 },
    { topic: "Geometry", score: 78 },
    { topic: "Trigonometry", score: 72 },
    { topic: "Calculus", score: 68 },
    { topic: "Statistics", score: 82 },
  ];

  const handleGenerateReport = () => {
    console.log("Generating teacher report");
  };

  const handleExportPDF = () => {
    alert("PDF export would be implemented here");
  };

  const handleExportExcel = () => {
    alert("Excel export would be implemented here");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-muted-foreground text-sm">
            View and analyze your class performance
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {myClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mySubjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this-week">This Week</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="this-term">This Term</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex items-end">
              <Button onClick={handleGenerateReport} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance">
            <GraduationCap className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="attendance">
            <ClipboardList className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="analysis">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78.3%</div>
                <p className="text-xs text-muted-foreground">{selectedClass} - {selectedSubject}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">98%</div>
                <p className="text-xs text-muted-foreground">Sarah Williams</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Students Below 60%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">Need support</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Class Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#3b82f6" name="Class Average" />
                  <Bar dataKey="high" fill="#10b981" name="Highest Score" />
                  <Bar dataKey="low" fill="#ef4444" name="Lowest Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Individual Student Progress ({selectedClass})</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={studentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cat1" stroke="#f59e0b" name="CAT 1" />
                  <Line type="monotone" dataKey="cat2" stroke="#3b82f6" name="CAT 2" />
                  <Line type="monotone" dataKey="endTerm" stroke="#10b981" name="End Term" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">91.2%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Classes Marked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">45/48</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Chronic Absences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Students</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Attendance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} name="Attendance %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Students Requiring Attention</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Mike Johnson", attendance: 65, absences: 7 },
                  { name: "Lisa Brown", attendance: 72, absences: 5 },
                ].map((student) => (
                  <div key={student.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{student.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {student.absences} absences this month
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-destructive">
                      {student.attendance}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Topic-wise Performance ({selectedSubject})</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topicAnalysis} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="topic" type="category" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#3b82f6" name="Average Score %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Improvement Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topicAnalysis
                    .filter(t => t.score < 75)
                    .sort((a, b) => a.score - b.score)
                    .map((topic) => (
                      <div key={topic.topic} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{topic.topic}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{topic.score}%</span>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Needs Review
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Strong Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topicAnalysis
                    .filter(t => t.score >= 80)
                    .sort((a, b) => b.score - a.score)
                    .map((topic) => (
                      <div key={topic.topic} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{topic.topic}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{topic.score}%</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Excellent
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Focus on Calculus & Trigonometry
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    These topics show lower performance. Consider additional practice sessions or review materials.
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Strong Performance in Algebra & Statistics
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Students excel in these areas. Use as foundation for more advanced concepts.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                    Monitor 3 Students
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Mike Johnson, Tom Davis, and Lisa Brown need additional support.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={handleExportPDF} variant="outline" className="flex-1">
              <FileText className="h-4 w-4 mr-2" />
              Export as PDF
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="flex-1">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export as Excel
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherReports;
