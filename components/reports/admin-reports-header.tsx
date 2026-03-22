"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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

interface AdminReportsHeaderProps {
  selectedGrade: string;
  onGradeChange: (gradeId: string) => void;
  selectedClass: string;
  onClassChange: (classId: string) => void;
  selectedSubject: string;
  onSubjectChange: (subjectId: string) => void;
  selectedTerm: string;
  onTermChange: (termId: string) => void;
  grades: GradeOption[];
  classes: ClassOption[];
  subjects: SubjectOption[];
  terms: TermOption[];
  hideClassFilter?: boolean;
}

export function AdminReportsHeader({
  selectedGrade,
  onGradeChange,
  selectedClass,
  onClassChange,
  selectedSubject,
  onSubjectChange,
  selectedTerm,
  onTermChange,
  grades,
  classes,
  subjects,
  terms,
  hideClassFilter = false,
}: AdminReportsHeaderProps) {
  const selectedGradeData = grades.find((g) => g.id === selectedGrade);
  const selectedClassData = classes.find((c) => c.id === selectedClass);

  const getDescription = () => {
    if (hideClassFilter) {
      // For aggregated view (Subject Analysis)
      return selectedGradeData
        ? `${selectedGradeData.name} - All Classes (Aggregated)`
        : "Select grade, subject, and term to view reports";
    }
    // For class-specific view (Performance Lists)
    return selectedGradeData && selectedClassData
      ? `${selectedGradeData.name} - ${selectedClassData.name}`
      : "Select grade, class, subject, and term to view reports";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-base">Report Filters</CardTitle>
            <p className="text-muted-foreground text-sm">{getDescription()}</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={selectedGrade} onValueChange={onGradeChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((grade) => (
                  <SelectItem key={grade.id} value={grade.id}>
                    {grade.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {!hideClassFilter && (
              <Select value={selectedClass} onValueChange={onClassChange} disabled={!selectedGrade}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classOption) => (
                    <SelectItem key={classOption.id} value={classOption.id}>
                      {classOption.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={onTermChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map((term) => (
                  <SelectItem key={term.id} value={term.id}>
                    {term.name} ({term.termType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
