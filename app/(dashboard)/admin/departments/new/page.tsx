"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AddDepartmentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentHead: "",
    headEmail: "",
    headPhone: "",
    officeLocation: "",
    establishedYear: "",
    status: "Active",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // TODO: Add API call to save department
    alert("Department added successfully!");
    router.push("/admin/departments");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/departments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Add New Department</h1>
          <p className="text-muted-foreground text-sm">
            Fill in the information below to add a new department
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Department Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                required
                placeholder="e.g., Sciences"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                required
                placeholder="Enter department description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="officeLocation">Office Location *</Label>
                <Input
                  id="officeLocation"
                  required
                  placeholder="e.g., Building A, Room 101"
                  value={formData.officeLocation}
                  onChange={(e) => handleChange("officeLocation", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="establishedYear">Established Year *</Label>
                <Input
                  id="establishedYear"
                  required
                  placeholder="e.g., 2005"
                  value={formData.establishedYear}
                  onChange={(e) => handleChange("establishedYear", e.target.value)}
                />
              </div>
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

        {/* Department Head Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Department Head Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="departmentHead">Department Head Name *</Label>
              <Input
                id="departmentHead"
                required
                placeholder="e.g., Dr. Sarah Johnson"
                value={formData.departmentHead}
                onChange={(e) => handleChange("departmentHead", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headEmail">Email *</Label>
                <Input
                  id="headEmail"
                  type="email"
                  required
                  placeholder="email@school.edu"
                  value={formData.headEmail}
                  onChange={(e) => handleChange("headEmail", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headPhone">Phone *</Label>
                <Input
                  id="headPhone"
                  type="tel"
                  required
                  placeholder="(555) 123-4567"
                  value={formData.headPhone}
                  onChange={(e) => handleChange("headPhone", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Link href="/admin/departments">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Department
          </Button>
        </div>
      </form>
    </div>
  );
}
