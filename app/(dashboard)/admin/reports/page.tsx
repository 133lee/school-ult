"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  AlertCircle,
  BarChart3,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSubjectAnalysisContent } from "@/components/admin/admin-subject-analysis-content";
import { AdminReportsHeader } from "@/components/reports/admin-reports-header";
import { PerformanceListsContent } from "@/components/reports/performance-lists-content";
import { api } from "@/lib/api-client";

interface GradeOption {
  id: string;
  name: string;
  level: string;
}

interface ClassOption {
  id: string;
  name: string;
  gradeId: string;
  gradeName: string;
}

interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

interface TermOption {
  id: string;
  name: string;
  termType: string;
  academicYear: string;
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<
    "subject-analysis" | "performance-lists"
  >("subject-analysis");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");
  const [grades, setGrades] = useState<GradeOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [terms, setTerms] = useState<TermOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Fetch initial data function (extracted for manual refresh)
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch grades (8-12 only for secondary)
      // api.get returns { data: { grades: [...] }, meta: ... }
      const gradesResponse = await api.get("/admin/reports/grades");
      const gradesData = gradesResponse.data?.grades || [];
      if (gradesData.length > 0) {
        const secondaryGrades = gradesData.filter((g: any) =>
          ["GRADE_8", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"].includes(
            g.level
          )
        );
        setGrades(secondaryGrades);
        if (secondaryGrades.length > 0) {
          setSelectedGrade(secondaryGrades[0].id);
        }
      }

      // Fetch terms
      const termsResponse = await api.get("/admin/reports/terms");
      const termsData = termsResponse.data?.terms || [];
      setTerms(termsData);
      const activeTerm = termsData.find((t: any) => t.isActive);
      if (activeTerm) {
        setSelectedTerm(activeTerm.id);
      }

      // Fetch subjects
      const subjectsResponse = await api.get("/admin/reports/subjects");
      const subjectsData = subjectsResponse.data?.subjects || [];
      setSubjects(subjectsData);
      if (subjectsData.length > 0) {
        setSelectedSubject(subjectsData[0].id);
      }

      setLoading(false);
    } catch (err: any) {
      console.error("Error fetching initial data:", err);
      setError(err.message || "Failed to load initial data");
      setLoading(false);
    }
  };

  // Fetch initial data on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchInitialData();
  }, []);

  // Fetch classes when grade changes
  useEffect(() => {
    async function fetchClasses() {
      if (!selectedGrade) {
        setClasses([]);
        setSelectedClass("");
        return;
      }

      try {
        const classesResponse = await api.get(
          `/admin/reports/classes?gradeId=${selectedGrade}`
        );
        const classesData = classesResponse.data?.classes || [];
        setClasses(classesData);
        if (classesData.length > 0) {
          setSelectedClass(classesData[0].id);
        } else {
          setSelectedClass("");
        }
      } catch (err: any) {
        console.error("Error fetching classes:", err);
        setClasses([]);
        setSelectedClass("");
      }
    }

    fetchClasses();
  }, [selectedGrade]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex flex-col space-y-1">
          <h1 className="text-xl font-bold">Reports & Analysis</h1>
          <p className="text-muted-foreground text-sm">
            Analyze class performance and view detailed subject statistics
          </p>
        </div>
        <Button
          onClick={fetchInitialData}
          variant="outline"
          size="sm"
          disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!loading && (
        <Tabs
          value={activeTab}
          onValueChange={(v) =>
            setActiveTab(v as "subject-analysis" | "performance-lists")
          }
          className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger
              value="subject-analysis"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Subject Analysis
            </TabsTrigger>
            <TabsTrigger
              value="performance-lists"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Lists
            </TabsTrigger>
          </TabsList>

          {/* Subject Analysis Tab - Aggregated by Grade */}
          <TabsContent value="subject-analysis" className="mt-6 space-y-6">
            <AdminReportsHeader
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedTerm={selectedTerm}
              onTermChange={setSelectedTerm}
              grades={grades}
              classes={classes}
              subjects={subjects}
              terms={terms}
              hideClassFilter={true}
            />

            {!selectedGrade || !selectedSubject || !selectedTerm ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      Select filters to view analysis
                    </p>
                    <p className="text-sm mt-2">
                      Choose grade, subject, and term to view aggregated subject
                      analysis
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              (() => {
                const selectedSubjectData = subjects.find(
                  (s) => s.id === selectedSubject
                );
                const selectedGradeData = grades.find(
                  (g) => g.id === selectedGrade
                );

                return (
                  <AdminSubjectAnalysisContent
                    gradeId={selectedGrade}
                    subjectId={selectedSubject}
                    termId={selectedTerm}
                    gradeName={selectedGradeData?.name || ""}
                    subjectName={selectedSubjectData?.name || ""}
                  />
                );
              })()
            )}
          </TabsContent>

          {/* Performance Lists Tab */}
          <TabsContent value="performance-lists" className="mt-6 space-y-6">
            <AdminReportsHeader
              selectedGrade={selectedGrade}
              onGradeChange={setSelectedGrade}
              selectedClass={selectedClass}
              onClassChange={setSelectedClass}
              selectedSubject={selectedSubject}
              onSubjectChange={setSelectedSubject}
              selectedTerm={selectedTerm}
              onTermChange={setSelectedTerm}
              grades={grades}
              classes={classes}
              subjects={subjects}
              terms={terms}
            />

            {!selectedClass || !selectedTerm ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      Select filters to view performance
                    </p>
                    <p className="text-sm mt-2">
                      Choose grade, class, and term to view student performance
                      lists
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PerformanceListsContent
                classId={selectedClass}
                termId={selectedTerm}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
