"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  School,
  Users,
  GraduationCap,
  Clock,
  Bell,
  Database,
  Save,
  Upload,
  Shield,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [schoolInfo, setSchoolInfo] = useState({
    name: "Ultimate School",
    address: "123 Education Street",
    phone: "+260 123 456 789",
    email: "info@ultimateschool.edu",
    website: "www.ultimateschool.edu",
  });

  const [academicSettings, setAcademicSettings] = useState({
    currentYear: "2024-2025",
    currentTerm: "Term 1",
    gradingSystem: "percentage",
  });

  const [assessmentWeights, setAssessmentWeights] = useState({
    cat1: 20,
    midTerm: 30,
    endOfTerm: 50,
  });

  const [timetableSettings, setTimetableSettings] = useState({
    schoolStartTime: "08:00",
    schoolEndTime: "15:00",
    periodDuration: 40,
    breakDuration: 20,
    lunchDuration: 40,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    lowAttendanceAlert: 75,
    failingGradeAlert: 50,
  });

  const handleSaveSchoolInfo = () => {
    toast.success("School information saved successfully!");
  };

  const handleSaveAcademicSettings = () => {
    toast.success("Academic settings saved successfully!");
  };

  const handleSaveAssessmentWeights = () => {
    const total = assessmentWeights.cat1 + assessmentWeights.midTerm + assessmentWeights.endOfTerm;
    if (total !== 100) {
      toast.error(`Assessment weights must total 100%. Current total: ${total}%`);
      return;
    }
    toast.success("Assessment weights saved successfully!");
  };

  const handleSaveTimetableSettings = () => {
    toast.success("Timetable settings saved successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification settings saved successfully!");
  };

  // Handle logo upload
  const handleUploadLogo = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error("File size must be less than 2MB");
          return;
        }
        toast.success(`Logo uploaded: ${file.name}`);
      }
    };
    input.click();
  };

  // Handle data exports
  const handleExportData = async (dataType: string) => {
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 600));

      let csvContent = "";
      if (dataType === "students") {
        csvContent = "Student ID,Name,Class,Email\nSTU001,John Doe,9A,john@school.com\nSTU002,Jane Smith,9B,jane@school.com\n";
      } else if (dataType === "teachers") {
        csvContent = "Teacher ID,Name,Subject,Department,Email\nTCH001,Dr. Sarah Johnson,Mathematics,Science,sarah@school.com\n";
      } else if (dataType === "attendance") {
        csvContent = "Date,Student,Status\n2024-10-25,STU001,Present\n";
      } else if (dataType === "grades") {
        csvContent = "Student,Subject,Score,Grade\nJohn Doe,Mathematics,85,A\n";
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${dataType}-export-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${dataType} data exported successfully`);
    } catch (error) {
      toast.error(`Failed to export ${dataType} data`);
    }
  };

  // Handle backup creation
  const handleCreateBackup = async () => {
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 1000));
      const backupDate = new Date().toLocaleString();
      toast.success(`Database backup created successfully on ${backupDate}`);
    } catch (error) {
      toast.error("Failed to create backup");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage system configuration and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="school" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="school">
            <School className="h-4 w-4 mr-2" />
            School
          </TabsTrigger>
          <TabsTrigger value="academic">
            <GraduationCap className="h-4 w-4 mr-2" />
            Academic
          </TabsTrigger>
          <TabsTrigger value="timetable">
            <Clock className="h-4 w-4 mr-2" />
            Timetable
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            Data
          </TabsTrigger>
        </TabsList>

        {/* School Information Tab */}
        <TabsContent value="school">
          <Card>
            <CardHeader>
              <CardTitle>School Information</CardTitle>
              <CardDescription>
                Update your school's basic information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={schoolInfo.name}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolEmail">Email</Label>
                  <Input
                    id="schoolEmail"
                    type="email"
                    value={schoolInfo.email}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolPhone">Phone</Label>
                  <Input
                    id="schoolPhone"
                    value={schoolInfo.phone}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolWebsite">Website</Label>
                  <Input
                    id="schoolWebsite"
                    value={schoolInfo.website}
                    onChange={(e) =>
                      setSchoolInfo({ ...schoolInfo, website: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schoolAddress">Address</Label>
                <Input
                  id="schoolAddress"
                  value={schoolInfo.address}
                  onChange={(e) =>
                    setSchoolInfo({ ...schoolInfo, address: e.target.value })
                  }
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>School Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted">
                    <School className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <Button variant="outline" onClick={handleUploadLogo}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Recommended size: 200x200px. Max file size: 2MB
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSchoolInfo}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Academic Configuration Tab */}
        <TabsContent value="academic">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Year & Term</CardTitle>
                <CardDescription>
                  Configure current academic year and term settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year</Label>
                    <Input
                      id="academicYear"
                      value={academicSettings.currentYear}
                      onChange={(e) =>
                        setAcademicSettings({
                          ...academicSettings,
                          currentYear: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentTerm">Current Term</Label>
                    <Select
                      value={academicSettings.currentTerm}
                      onValueChange={(value) =>
                        setAcademicSettings({
                          ...academicSettings,
                          currentTerm: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradingSystem">Grading System</Label>
                  <Select
                    value={academicSettings.gradingSystem}
                    onValueChange={(value) =>
                      setAcademicSettings({
                        ...academicSettings,
                        gradingSystem: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                      <SelectItem value="gpa">GPA (0.0-4.0)</SelectItem>
                      <SelectItem value="letter">Letter (A-F)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveAcademicSettings}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Weights</CardTitle>
                <CardDescription>
                  Configure the weight distribution for different assessments (must total 100%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cat1Weight">CAT 1 Weight (%)</Label>
                    <Input
                      id="cat1Weight"
                      type="number"
                      min="0"
                      max="100"
                      value={assessmentWeights.cat1}
                      onChange={(e) =>
                        setAssessmentWeights({
                          ...assessmentWeights,
                          cat1: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="midTermWeight">Mid-Term Weight (%)</Label>
                    <Input
                      id="midTermWeight"
                      type="number"
                      min="0"
                      max="100"
                      value={assessmentWeights.midTerm}
                      onChange={(e) =>
                        setAssessmentWeights({
                          ...assessmentWeights,
                          midTerm: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eotWeight">End of Term Weight (%)</Label>
                    <Input
                      id="eotWeight"
                      type="number"
                      min="0"
                      max="100"
                      value={assessmentWeights.endOfTerm}
                      onChange={(e) =>
                        setAssessmentWeights({
                          ...assessmentWeights,
                          endOfTerm: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm font-medium">
                    Total Weight:{" "}
                    <span
                      className={
                        assessmentWeights.cat1 +
                          assessmentWeights.midTerm +
                          assessmentWeights.endOfTerm ===
                        100
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {assessmentWeights.cat1 +
                        assessmentWeights.midTerm +
                        assessmentWeights.endOfTerm}
                      %
                    </span>
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveAssessmentWeights}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timetable Settings Tab */}
        <TabsContent value="timetable">
          <Card>
            <CardHeader>
              <CardTitle>Timetable Configuration</CardTitle>
              <CardDescription>
                Configure school day schedule and period durations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startTime">School Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={timetableSettings.schoolStartTime}
                    onChange={(e) =>
                      setTimetableSettings({
                        ...timetableSettings,
                        schoolStartTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">School End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={timetableSettings.schoolEndTime}
                    onChange={(e) =>
                      setTimetableSettings({
                        ...timetableSettings,
                        schoolEndTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodDuration">Period Duration (minutes)</Label>
                  <Input
                    id="periodDuration"
                    type="number"
                    value={timetableSettings.periodDuration}
                    onChange={(e) =>
                      setTimetableSettings({
                        ...timetableSettings,
                        periodDuration: parseInt(e.target.value) || 40,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                  <Input
                    id="breakDuration"
                    type="number"
                    value={timetableSettings.breakDuration}
                    onChange={(e) =>
                      setTimetableSettings({
                        ...timetableSettings,
                        breakDuration: parseInt(e.target.value) || 20,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunchDuration">Lunch Duration (minutes)</Label>
                  <Input
                    id="lunchDuration"
                    type="number"
                    value={timetableSettings.lunchDuration}
                    onChange={(e) =>
                      setTimetableSettings({
                        ...timetableSettings,
                        lunchDuration: parseInt(e.target.value) || 40,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveTimetableSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure alert thresholds and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        emailNotifications: checked,
                      })
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.smsNotifications}
                    onCheckedChange={(checked) =>
                      setNotificationSettings({
                        ...notificationSettings,
                        smsNotifications: checked,
                      })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Alert Thresholds</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="attendanceAlert">
                      Low Attendance Alert (%)
                    </Label>
                    <Input
                      id="attendanceAlert"
                      type="number"
                      min="0"
                      max="100"
                      value={notificationSettings.lowAttendanceAlert}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          lowAttendanceAlert: parseInt(e.target.value) || 75,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when student attendance falls below this percentage
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gradeAlert">Failing Grade Alert (%)</Label>
                    <Input
                      id="gradeAlert"
                      type="number"
                      min="0"
                      max="100"
                      value={notificationSettings.failingGradeAlert}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          failingGradeAlert: parseInt(e.target.value) || 50,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when student grade falls below this percentage
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage admin accounts and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Admin User</p>
                      <p className="text-sm text-muted-foreground">
                        admin@school.com
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      Super Admin
                    </span>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">Password Policy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Strong Passwords</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimum 8 characters, uppercase, lowercase, and numbers
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & Backup Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export data and manage system backups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Export Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => handleExportData('students')}>Export Students Data</Button>
                    <Button variant="outline" onClick={() => handleExportData('teachers')}>Export Teachers Data</Button>
                    <Button variant="outline" onClick={() => handleExportData('attendance')}>Export Attendance Records</Button>
                    <Button variant="outline" onClick={() => handleExportData('grades')}>Export Grade Reports</Button>
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Backup Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Automatic Backups</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically backup data daily
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="space-y-2">
                      <Label>Backup Frequency</Label>
                      <Select defaultValue="daily">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={handleCreateBackup}>
                      <Database className="h-4 w-4 mr-2" />
                      Create Backup Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
