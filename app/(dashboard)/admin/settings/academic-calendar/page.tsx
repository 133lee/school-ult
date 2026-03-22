"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Plus,
  CheckCircle,
  Lock,
  Loader2,
  AlertCircle,
  ChevronLeft,
  GraduationCap,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreateAcademicYearDialog } from "@/components/settings/create-academic-year-dialog";
import { EditAcademicYearDialog } from "@/components/settings/edit-academic-year-dialog";
import { CreateTermDialog } from "@/components/settings/create-term-dialog";
import { EditTermDialog } from "@/components/settings/edit-term-dialog";
import { useGrades } from "@/hooks/useGrades";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AcademicYear {
  id: string;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isClosed: boolean;
}

interface Term {
  id: string;
  termType: "TERM_1" | "TERM_2" | "TERM_3";
  startDate: string;
  endDate: string;
  isActive: boolean;
  academicYear: {
    id: string;
    year: number;
  };
}

export default function AcademicCalendarPage() {
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [termsLoading, setTermsLoading] = useState(false);

  // Dialog states
  const [createYearDialogOpen, setCreateYearDialogOpen] = useState(false);
  const [editYearDialogOpen, setEditYearDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [createTermDialogOpen, setCreateTermDialogOpen] = useState(false);
  const [editTermDialogOpen, setEditTermDialogOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [yearToClose, setYearToClose] = useState<string | null>(null);

  // Fetch grades
  const { grades, isLoading: gradesLoading } = useGrades();

  // Fetch academic years
  const fetchAcademicYears = async () => {
    try {
      setLoading(true);

      // Get auth token
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please login again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("/api/academic-years", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Parse error message from API if available
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to fetch academic years (${response.status})`
        );
      }

      const data = await response.json();
      setAcademicYears(data.data || []);

      // Auto-select active year
      const activeYear = data.data?.find((y: AcademicYear) => y.isActive);
      if (activeYear && !selectedYearId) {
        setSelectedYearId(activeYear.id);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load academic years";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch terms for selected year
  const fetchTerms = async (academicYearId?: string) => {
    if (!academicYearId) {
      setTerms([]);
      return;
    }

    try {
      setTermsLoading(true);

      // Get auth token
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please login again.",
          variant: "destructive",
        });
        setTermsLoading(false);
        return;
      }

      const url = `/api/terms?academicYearId=${academicYearId}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch terms (${response.status})`
        );
      }

      const data = await response.json();
      setTerms(data.data || []);
    } catch (error) {
      console.error("Error fetching terms:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load terms";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTermsLoading(false);
    }
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  useEffect(() => {
    if (selectedYearId) {
      fetchTerms(selectedYearId);
    }
  }, [selectedYearId]);

  // Activate academic year
  const handleActivateYear = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/academic-years/${id}/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to activate");
      }

      toast({
        title: "Success",
        description: "Academic year activated",
      });

      fetchAcademicYears();
    } catch (error: any) {
      console.error("Error activating academic year:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Close academic year
  const handleCloseYearClick = (id: string) => {
    setYearToClose(id);
    setCloseDialogOpen(true);
  };

  const handleCloseYearConfirm = async () => {
    if (!yearToClose) return;

    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please login again.",
          variant: "destructive",
        });
        setCloseDialogOpen(false);
        setYearToClose(null);
        return;
      }

      const response = await fetch(`/api/academic-years/${yearToClose}/close`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to close");
      }

      toast({
        title: "Success",
        description: "Academic year closed successfully",
      });

      fetchAcademicYears();
    } catch (error: any) {
      console.error("Error closing academic year:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCloseDialogOpen(false);
      setYearToClose(null);
    }
  };

  // Activate term
  const handleActivateTerm = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/terms/${id}/activate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to activate");
      }

      toast({
        title: "Success",
        description: "Term activated",
      });

      fetchTerms(selectedYearId);
    } catch (error: any) {
      console.error("Error activating term:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Deactivate term
  const handleDeactivateTerm = async (id: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required. Please login again.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`/api/terms/${id}/deactivate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to deactivate");
      }

      toast({
        title: "Success",
        description: "Term deactivated",
      });

      fetchTerms(selectedYearId);
    } catch (error: any) {
      console.error("Error deactivating term:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getTermLabel = (termType: string) => {
    switch (termType) {
      case "TERM_1":
        return "Term 1";
      case "TERM_2":
        return "Term 2";
      case "TERM_3":
        return "Term 3";
      default:
        return termType;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start">
        <div className="flex items-center justify-between w-full space-y-2 md:space-y-0 md:flex-row">
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Settings
            </Button>
          </Link>

          <div>
            <h1 className="text-xl font-bold text-right">Academic Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Manage academic years and terms
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="pt-0">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-orange-900">
                Critical System Configuration
              </p>
              <p className="text-sm text-orange-700">
                Changes to the academic calendar affect assessments, attendance
                records, and reports across the entire system. Please ensure you
                understand the impact before making modifications.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="years" className="space-y-4">
        <TabsList>
          <TabsTrigger value="years">Academic Years</TabsTrigger>
          <TabsTrigger value="terms">Terms</TabsTrigger>
          <TabsTrigger value="grades">Grade Levels</TabsTrigger>
        </TabsList>

        {/* Academic Years Tab */}
        <TabsContent value="years" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Academic Years</h2>
            <Button onClick={() => setCreateYearDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Academic Year
            </Button>
          </div>

          <div className="grid gap-4">
            {academicYears.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No academic years found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first academic year to get started
                  </p>
                  <Button onClick={() => setCreateYearDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Academic Year
                  </Button>
                </CardContent>
              </Card>
            ) : (
              academicYears.map((year) => (
                <Card key={year.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Academic Year {year.year}
                      </CardTitle>
                      <div className="flex gap-2">
                        {year.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        )}
                        {year.isClosed && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <Lock className="h-3 w-3" />
                            Closed
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {new Date(year.startDate).toLocaleDateString()} -{" "}
                          {new Date(year.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!year.isActive && !year.isClosed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateYear(year.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </Button>
                        )}
                        {year.isActive && !year.isClosed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCloseYearClick(year.id)}>
                            <Lock className="mr-2 h-4 w-4" />
                            Close Year
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedYear(year);
                            setEditYearDialogOpen(true);
                          }}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Terms Tab */}
        <TabsContent value="terms" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold">Terms</h2>
              <Select value={selectedYearId} onValueChange={setSelectedYearId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.year} {year.isActive ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setCreateTermDialogOpen(true)}
              disabled={!selectedYearId}>
              <Plus className="h-4 w-4 mr-2" />
              New Term
            </Button>
          </div>

          {termsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : terms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No terms found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {selectedYearId
                    ? "Create terms for this academic year"
                    : "Select an academic year to view terms"}
                </p>
                {selectedYearId && (
                  <Button onClick={() => setCreateTermDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Term
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {terms.map((term) => (
                <Card key={term.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {getTermLabel(term.termType)} - {term.academicYear.year}
                      </CardTitle>
                      <div className="flex gap-2">
                        {term.isActive && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        <p>
                          {new Date(term.startDate).toLocaleDateString()} -{" "}
                          {new Date(term.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!term.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleActivateTerm(term.id)}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeactivateTerm(term.id)}>
                            Deactivate
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTerm(term);
                            setEditTermDialogOpen(true);
                          }}>
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Grade Levels Tab */}
        <TabsContent value="grades" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Grade Levels</h2>
            <div className="text-sm text-muted-foreground">
              {grades.length} of 12 grades configured
            </div>
          </div>

          {gradesLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : grades.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No grade levels found</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Run the seed script to initialize all grade levels
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      npx tsx scripts/seed-grades.ts
                    </code>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>
                      <strong>Zambian Education System:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>Primary: Grades 1-7</li>
                      <li>Junior Secondary: Grades 8-9</li>
                      <li>
                        Senior Secondary: Grades 10-12 (Form 1-4 equivalent)
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {grades.map((grade) => (
                  <Card key={grade.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <GraduationCap className="h-4 w-4" />
                          {grade.name}
                        </CardTitle>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            grade.schoolLevel === "PRIMARY"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}>
                          {grade.schoolLevel}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        <p>Sequence: {grade.sequence}</p>
                        <p className="text-xs mt-1">Level: {grade.level}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {grades.length < 12 && (
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardContent className="pt-6">
                    <div className="flex gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-orange-900">
                          Incomplete Grade Configuration
                        </p>
                        <p className="text-sm text-orange-700">
                          Expected 12 grade levels but found {grades.length}.
                          Run the seed script to add missing grades:
                        </p>
                        <div className="bg-white p-3 rounded border border-orange-200">
                          <code className="text-sm text-orange-900">
                            npx tsx scripts/seed-grades.ts
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateAcademicYearDialog
        open={createYearDialogOpen}
        onOpenChange={setCreateYearDialogOpen}
        onSuccess={fetchAcademicYears}
      />

      <EditAcademicYearDialog
        open={editYearDialogOpen}
        onOpenChange={setEditYearDialogOpen}
        year={selectedYear}
        onSuccess={fetchAcademicYears}
      />

      <CreateTermDialog
        open={createTermDialogOpen}
        onOpenChange={setCreateTermDialogOpen}
        academicYearId={selectedYearId}
        onSuccess={() => fetchTerms(selectedYearId)}
      />

      <EditTermDialog
        open={editTermDialogOpen}
        onOpenChange={setEditTermDialogOpen}
        term={selectedTerm}
        onSuccess={() => fetchTerms(selectedYearId)}
      />

      {/* Close Academic Year Confirmation Dialog */}
      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Close Academic Year</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-left pt-3">
              Are you sure you want to close this academic year? This action
              will prevent further modifications to this year's data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCloseYearConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Close Year
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
