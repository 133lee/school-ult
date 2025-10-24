"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddClassPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    gradeLevel: "",
    academicYear: "",
    classTeacher: "",
    capacity: "",
    room: "",
    schedule: "",
    status: "Active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Add API call to save class
    alert("Class added successfully!");
    router.push("/admin/classes");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/classes">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Class</h1>
          <p className="text-muted-foreground text-sm">
            Fill in the information below to add a new class
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Class Name *</Label>
                <Input
                  id="name"
                  required
                  placeholder="e.g., Class 9A"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Grade Level *</Label>
                <Select
                  required
                  value={formData.gradeLevel}
                  onValueChange={(value) => handleChange("gradeLevel", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grade 9">Grade 9</SelectItem>
                    <SelectItem value="Grade 10">Grade 10</SelectItem>
                    <SelectItem value="Grade 11">Grade 11</SelectItem>
                    <SelectItem value="Grade 12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year *</Label>
                <Input
                  id="academicYear"
                  required
                  placeholder="e.g., 2024-2025"
                  value={formData.academicYear}
                  onChange={(e) => handleChange("academicYear", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classTeacher">Class Teacher *</Label>
                <Select
                  required
                  value={formData.classTeacher}
                  onValueChange={(value) => handleChange("classTeacher", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher1">Dr. Sarah Johnson</SelectItem>
                    <SelectItem value="teacher2">Mr. James Wilson</SelectItem>
                    <SelectItem value="teacher3">Ms. Emily Chen</SelectItem>
                    <SelectItem value="teacher4">Dr. Michael Brown</SelectItem>
                  </SelectContent>
                </Select>
                <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-xs text-yellow-800">
                    <strong>Important:</strong> A teacher can only be assigned as class teacher to ONE class per academic year/term.
                    If this teacher is already a class teacher elsewhere, they must be unassigned first.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  required
                  min="1"
                  max="50"
                  placeholder="e.g., 35"
                  value={formData.capacity}
                  onChange={(e) => handleChange("capacity", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room *</Label>
                <Input
                  id="room"
                  required
                  placeholder="e.g., Room 101"
                  value={formData.room}
                  onChange={(e) => handleChange("room", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule *</Label>
              <Input
                id="schedule"
                required
                placeholder="e.g., Monday - Friday, 8:00 AM - 3:00 PM"
                value={formData.schedule}
                onChange={(e) => handleChange("schedule", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                required
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Link href="/admin/classes">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Class
          </Button>
        </div>
      </form>
    </div>
  );
}
