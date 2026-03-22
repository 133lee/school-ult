"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassOption {
  id: string;
  name: string;
  grade: string;
  subject: string;
  subjectCode: string;
  enrolled: number;
}

interface TermOption {
  id: string;
  name: string;
  termType: string;
  academicYear: string;
}

interface ClassReportsHeaderProps {
  selectedClass: string;
  onClassChange: (classId: string) => void;
  selectedTerm: string;
  onTermChange: (termId: string) => void;
  classes: ClassOption[];
  terms: TermOption[];
}

export function ClassReportsHeader({
  selectedClass,
  onClassChange,
  selectedTerm,
  onTermChange,
  classes,
  terms,
}: ClassReportsHeaderProps) {
  const selectedClassData = classes.find((c) => c.id === selectedClass);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-0">
            <CardTitle className="text-base">Class Reports</CardTitle>
            <p className="text-muted-foreground text-sm">
              {selectedClassData
                ? `${selectedClassData.subject} - ${selectedClassData.name} • ${selectedClassData.enrolled} students`
                : "View and analyze student report cards by class and term"}
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <Select value={selectedClass} onValueChange={onClassChange}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((classOption) => (
                  <SelectItem key={classOption.id} value={classOption.id}>
                    {classOption.subject} - {classOption.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={onTermChange}>
              <SelectTrigger className="w-[200px]">
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
