"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, User, Mail, Phone, MapPin, Briefcase, Calendar, GraduationCap, Building } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChangePasswordCard } from "@/components/profile/change-password-card";
import { PasswordChangePrompt } from "@/components/profile/password-change-prompt";

interface TeacherProfile {
  id: string;
  staffNumber: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  fullName: string;
  dateOfBirth: string | Date;
  gender: string;
  phoneNumber: string;
  nrcNumber?: string | null;
  address?: string;
  qualification: string | null;
  yearsExperience?: number;
  specialization?: string | null;
  status: string;
  dateOfHire: string | Date;
  email: string;
  department?: {
    name: string;
    code: string;
  } | null;
  subjects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  classTeacherAssignment?: {
    className: string;
    gradeLevel: string;
  } | null;
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasDefaultPassword, setHasDefaultPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
    // Check if user has default password from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setHasDefaultPassword(user.hasDefaultPassword || false);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch("/api/teacher/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `Failed to fetch profile (${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Validate response structure
      if (!result || typeof result !== "object") {
        throw new Error("Invalid response format from server");
      }

      // Extract data from the API response wrapper
      const profileData = result.success ? result.data : result;

      if (!profileData) {
        throw new Error("No profile data returned from server");
      }

      setProfile(profileData);
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatQualification = (qual: string) => {
    const qualMap: Record<string, string> = {
      DIPLOMA: "Diploma",
      BACHELOR: "Bachelor's Degree",
      MASTER: "Master's Degree",
      DOCTORATE: "Doctorate",
      CERTIFICATE: "Certificate",
    };
    return qualMap[qual] || qual;
  };

  const formatGender = (gender: string) => {
    return gender === "MALE" ? "Male" : "Female";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Alert variant="destructive">
          <AlertDescription>{error || "Profile not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Password Change Prompt Dialog */}
      <PasswordChangePrompt hasDefaultPassword={hasDefaultPassword} />

      {/* Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-1">
          <h1 className="text-xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your profile information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Staff Number</Label>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.staffNumber}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        profile.status === "ACTIVE" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {profile.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">First Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.firstName}</span>
                  </div>
                </div>

                {profile.middleName && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Middle Name</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{profile.middleName}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Last Name</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.lastName}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Gender</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{formatGender(profile.gender)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {profile.dateOfBirth
                        ? format(new Date(profile.dateOfBirth), "MMM dd, yyyy")
                        : "Not specified"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.phoneNumber}</span>
                  </div>
                </div>

                {profile.address && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs text-muted-foreground">Address</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{profile.address}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Professional Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Qualification</Label>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {profile.qualification ? formatQualification(profile.qualification) : "Not specified"}
                    </span>
                  </div>
                </div>

                {profile.specialization && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Specialization</Label>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{profile.specialization}</span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Hire Date</Label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {profile.dateOfHire
                        ? format(new Date(profile.dateOfHire), "MMM dd, yyyy")
                        : "Not specified"}
                    </span>
                  </div>
                </div>

                {profile.department && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Department</Label>
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {profile.department.name} ({profile.department.code})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Assignments */}
        <div className="space-y-6">
          {/* Subjects Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.subjects && profile.subjects.length > 0 ? (
                <div className="space-y-2">
                  {profile.subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between p-2 border rounded-md"
                    >
                      <span className="text-sm font-medium">{subject.name}</span>
                      <span className="text-xs text-muted-foreground">{subject.code}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No subjects assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Class Assignments Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class Teacher Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.classTeacherAssignment ? (
                <div className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {profile.classTeacherAssignment.gradeLevel} - {profile.classTeacherAssignment.className}
                    </span>
                    <span className="text-xs text-muted-foreground">Class Teacher</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No class teacher assignment</p>
              )}
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
