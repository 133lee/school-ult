"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Building, FileText, Users, Calendar, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ChangePasswordCard } from "@/components/profile/change-password-card";
import { PasswordChangePrompt } from "@/components/profile/password-change-prompt";

interface HODProfile {
  id: string;
  email: string;
  role: string;
  hasDefaultPassword: boolean;
  lastLogin: string | null;
  createdAt: string;
  department: {
    id: string;
    name: string;
    code: string;
    description: string | null;
    status: string;
    createdAt: string;
    totalSubjects: number;
    totalTeachers: number;
    subjects: Array<{
      id: string;
      name: string;
      code: string;
    }>;
    teachers: Array<{
      id: string;
      staffNumber: string;
      firstName: string;
      lastName: string;
      qualification: string;
    }>;
  };
}

export default function HodProfilePage() {
  const [profile, setProfile] = useState<HODProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasDefaultPassword, setHasDefaultPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");

      if (!token) {
        setError("Authentication token not found. Please login again.");
        return;
      }

      const response = await fetch("/api/hod/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to fetch profile (${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // Validate response structure
      if (!result || !result.data) {
        throw new Error("Invalid response format from server");
      }

      setProfile(result.data);
      setHasDefaultPassword(result.data.hasDefaultPassword || false);
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

  const formatStatus = (status: string) => {
    return status === "ACTIVE" ? "Active" : "Inactive";
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
            View your profile and department information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Account & Department Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.email}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Role</label>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Head of Department</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Last Login</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile.lastLogin
                        ? format(new Date(profile.lastLogin), "PPp")
                        : "Never"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Account Created</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(profile.createdAt), "PPP")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Department Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Department Name</label>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.department.name}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Department Code</label>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{profile.department.code}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        profile.department.status === "ACTIVE"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {formatStatus(profile.department.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Department Since</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {format(new Date(profile.department.createdAt), "PPP")}
                    </span>
                  </div>
                </div>

                {profile.department.description && (
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs text-muted-foreground">Description</label>
                    <p className="text-sm">{profile.department.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Department Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{profile.department.totalSubjects}</p>
                  <p className="text-xs text-muted-foreground">Subjects</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-2xl font-bold">{profile.department.totalTeachers}</p>
                  <p className="text-xs text-muted-foreground">Teachers</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Security */}
        <div className="space-y-6">
          <ChangePasswordCard />
        </div>
      </div>
    </div>
  );
}
