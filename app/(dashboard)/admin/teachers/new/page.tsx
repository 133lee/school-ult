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
import { ArrowLeft, Save, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AddTeacherPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    primarySubject: "",
    secondarySubject: "",
    department: "",
    qualification: "",
    experience: "",
    hireDate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjectsList = [
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Geography",
    "Computer Science",
    "Physical Education",
    "Art",
    "Music",
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Check if secondary subject is same as primary
    if (
      formData.secondarySubject &&
      formData.secondarySubject !== "none" &&
      formData.primarySubject === formData.secondarySubject
    ) {
      newErrors.secondarySubject =
        "Secondary subject cannot be the same as primary subject";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form submitted:", formData);
      // TODO: Add API call to save teacher
      alert("Teacher added successfully!");
      router.push("/admin/teachers");
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user makes changes
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Get selected subjects for summary
  const selectedSubjects = [];
  if (formData.primarySubject) selectedSubjects.push(formData.primarySubject);
  if (formData.secondarySubject && formData.secondarySubject !== "none") {
    selectedSubjects.push(formData.secondarySubject);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/teachers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Teacher</h1>
          <p className="text-muted-foreground text-sm">
            Fill in the information below to add a new teacher
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender *</Label>
                <Select
                  required
                  value={formData.gender}
                  onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primarySubject">Primary Subject *</Label>
                <Select
                  required
                  value={formData.primarySubject}
                  onValueChange={(value) => handleChange("primarySubject", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select primary subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Geography">Geography</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Physical Education">Physical Education</SelectItem>
                    <SelectItem value="Art">Art</SelectItem>
                    <SelectItem value="Music">Music</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The main subject this teacher specializes in
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondarySubject">Secondary Subject (Optional)</Label>
                <Select
                  value={formData.secondarySubject}
                  onValueChange={(value) => handleChange("secondarySubject", value)}>
                  <SelectTrigger
                    className={errors.secondarySubject ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select secondary subject (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectsList.map((subject) => (
                      <SelectItem
                        key={subject}
                        value={subject}
                        disabled={subject === formData.primarySubject}
                      >
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.secondarySubject ? (
                  <p className="text-xs text-destructive">{errors.secondarySubject}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Teachers can teach up to 2 subjects maximum
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                required
                value={formData.department}
                onValueChange={(value) => handleChange("department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sciences">Sciences</SelectItem>
                  <SelectItem value="Languages">Languages</SelectItem>
                  <SelectItem value="Humanities">Humanities</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Physical Education">Physical Education</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification *</Label>
                <Input
                  id="qualification"
                  required
                  placeholder="e.g., M.Sc. in Mathematics"
                  value={formData.qualification}
                  onChange={(e) => handleChange("qualification", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience *</Label>
                <Input
                  id="experience"
                  required
                  placeholder="e.g., 5 years"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hireDate">Hire Date *</Label>
              <Input
                id="hireDate"
                type="date"
                required
                value={formData.hireDate}
                onChange={(e) => handleChange("hireDate", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subject Summary */}
        <Card className="mb-6 bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">Subject Assignment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSubjects.length > 0 ? (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Subjects Selected</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <div className="mt-2 space-y-1">
                      {selectedSubjects.map((subject, idx) => (
                        <div key={subject} className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {idx === 0 ? "Primary:" : "Secondary:"}
                          </span>
                          <span className="text-sm">{subject}</span>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">No Subjects Selected</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Select at least a primary subject above to continue
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Link href="/admin/teachers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Teacher
          </Button>
        </div>
      </form>
    </div>
  );
}
