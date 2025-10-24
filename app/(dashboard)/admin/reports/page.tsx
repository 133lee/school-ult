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
  Calendar,
  BarChart3,
  PieChart,
  FileSpreadsheet,
  ClipboardList,
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
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

const AdminReports = () => {
  const [reportType, setReportType] = useState("attendance");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [dateRange, setDateRange] = useState("this-month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Sample data for charts
  const attendanceData = [
    { name: "Grade 8", present: 95, absent: 5 },
    { name: "Grade 9", present: 92, absent: 8 },
    { name: "Grade 10", present: 88, absent: 12 },
    { name: "Grade 11", present: 90, absent: 10 },
    { name: "Grade 12", present: 85, absent: 15 },
  ];

  const performanceData = [
    { name: "Math", average: 75 },
    { name: "English", average: 82 },
    { name: "Science", average: 78 },
    { name: "History", average: 80 },
    { name: "Biology", average: 76 },
  ];

  const gradeDistribution = [
    { name: "A", value: 120, color: "#10b981" },
    { name: "B", value: 230, color: "#3b82f6" },
    { name: "C", value: 180, color: "#f59e0b" },
    { name: "D", value: 90, color: "#ef4444" },
    { name: "F", value: 30, color: "#6b7280" },
  ];

  const teacherStats = [
    { name: "Mr. Smith", classes: 12, attendance: 96 },
    { name: "Mrs. Johnson", classes: 10, attendance: 98 },
    { name: "Dr. Williams", classes: 8, attendance: 94 },
    { name: "Ms. Brown", classes: 15, attendance: 92 },
  ];

  const handleGenerateReport = () => {
    console.log("Generating report:", {
      reportType,
      selectedClass,
      selectedSubject,
      dateRange,
      startDate,
      endDate,
    });
  };

  const handleExportPDF = () => {
    console.log("Exporting PDF...");
    alert("PDF export functionality would be implemented here");
  };

  const handleExportExcel = () => {
    console.log("Exporting Excel...");
    alert("Excel export functionality would be implemented here");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Generate comprehensive reports and insights
          </p>
        </div>
      </div>

      <Tabs defaultValue="attendance" onValueChange={setReportType}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attendance">
            <ClipboardList className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="academic">
            <GraduationCap className="h-4 w-4 mr-2" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="teacher">
            <Users className="h-4 w-4 mr-2" />
            Teacher
          </TabsTrigger>
          <TabsTrigger value="financial">
            <TrendingUp className="h-4 w-4 mr-2" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="system">
            <BarChart3 className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Filters Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Report Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label>Class/Grade</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    <SelectItem value="8">Grade 8</SelectItem>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="math">Mathematics</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
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

        {/* Attendance Reports */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">92.4%</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4,523</div>
                <p className="text-xs text-muted-foreground">Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">371</div>
                <p className="text-xs text-muted-foreground">Students</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Attendance by Grade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="present" fill="#10b981" name="Present %" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Reports */}
        <TabsContent value="academic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">78.2%</div>
                <p className="text-xs text-muted-foreground">All subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">120</div>
                <p className="text-xs text-muted-foreground">Grade A students</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Need Support</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">30</div>
                <p className="text-xs text-muted-foreground">Below passing grade</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average" fill="#3b82f6" name="Average Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={gradeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Teacher Reports */}
        <TabsContent value="teacher" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teacherStats.map((teacher) => (
                  <div key={teacher.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{teacher.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {teacher.classes} classes assigned
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{teacher.attendance}%</div>
                      <p className="text-xs text-muted-foreground">Attendance marking</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Reports */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$245,890</div>
                <p className="text-xs text-muted-foreground">This term</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Outstanding Fees</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">$34,120</div>
                <p className="text-xs text-muted-foreground">Pending payment</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87.8%</div>
                <p className="text-xs text-muted-foreground">This term</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Financial charts would be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Reports */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Database Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.4 GB</div>
                <p className="text-xs text-muted-foreground">Total storage</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2h ago</div>
                <p className="text-xs text-muted-foreground">Successful</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { action: "Data backup completed", time: "2 hours ago", status: "success" },
                  { action: "User login: admin@school.edu", time: "3 hours ago", status: "info" },
                  { action: "Report generated: Attendance", time: "5 hours ago", status: "info" },
                  { action: "System update applied", time: "1 day ago", status: "success" },
                ].map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded">
                    <span className="text-sm">{log.action}</span>
                    <span className="text-xs text-muted-foreground">{log.time}</span>
                  </div>
                ))}
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

export default AdminReports;
