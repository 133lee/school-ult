"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  Users,
  BookOpen,
  Clock,
  Filter,
  Download,
  Eye,
  AlertCircle,
  CheckCircle,
  Settings,
  FileText,
  Printer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const TimetableGeneratorUI = () => {
  const [currentStep, setCurrentStep] = useState(1);

  // All available classes from the system (organized by grade)
  const availableClassesData = [
    { id: "1", name: "Class 9A", gradeLevel: "Grade 9", capacity: 30 },
    { id: "2", name: "Class 9B", gradeLevel: "Grade 9", capacity: 28 },
    { id: "3", name: "Class 9C", gradeLevel: "Grade 9", capacity: 32 },
    { id: "4", name: "Class 10A", gradeLevel: "Grade 10", capacity: 30 },
    { id: "5", name: "Class 10B", gradeLevel: "Grade 10", capacity: 29 },
    { id: "6", name: "Class 11A", gradeLevel: "Grade 11", capacity: 25 },
    { id: "7", name: "Class 12A", gradeLevel: "Grade 12", capacity: 24 },
  ];

  // Subject Master Data - Will be fetched from /api/subjects
  // For now, using mock data structured to match Subjects page schema
  const subjectMasterData = [
    {
      id: "1",
      name: "Mathematics",
      gradePeriods: [
        { gradeLevel: "Grade 9", periodsPerWeek: 6, compulsory: true },
        { gradeLevel: "Grade 10", periodsPerWeek: 7, compulsory: true },
        { gradeLevel: "Grade 11", periodsPerWeek: 7, compulsory: true },
        { gradeLevel: "Grade 12", periodsPerWeek: 7, compulsory: true },
      ],
    },
    {
      id: "2",
      name: "English Language",
      gradePeriods: [
        { gradeLevel: "Grade 9", periodsPerWeek: 6, compulsory: true },
        { gradeLevel: "Grade 10", periodsPerWeek: 6, compulsory: true },
        { gradeLevel: "Grade 11", periodsPerWeek: 6, compulsory: true },
        { gradeLevel: "Grade 12", periodsPerWeek: 6, compulsory: true },
      ],
    },
    {
      id: "3",
      name: "Physics",
      gradePeriods: [
        { gradeLevel: "Grade 10", periodsPerWeek: 6, compulsory: false },
        { gradeLevel: "Grade 11", periodsPerWeek: 6, compulsory: false },
        { gradeLevel: "Grade 12", periodsPerWeek: 6, compulsory: false },
      ],
    },
    {
      id: "4",
      name: "Chemistry",
      gradePeriods: [
        { gradeLevel: "Grade 9", periodsPerWeek: 6, compulsory: false },
        { gradeLevel: "Grade 10", periodsPerWeek: 6, compulsory: false },
        { gradeLevel: "Grade 11", periodsPerWeek: 6, compulsory: false },
        { gradeLevel: "Grade 12", periodsPerWeek: 6, compulsory: false },
      ],
    },
    {
      id: "5",
      name: "Biology",
      gradePeriods: [
        { gradeLevel: "Grade 9", periodsPerWeek: 6, compulsory: true },
        { gradeLevel: "Grade 10", periodsPerWeek: 6, compulsory: false },
        { gradeLevel: "Grade 11", periodsPerWeek: 6, compulsory: false },
        { gradeLevel: "Grade 12", periodsPerWeek: 6, compulsory: false },
      ],
    },
    {
      id: "6",
      name: "Computer Studies",
      gradePeriods: [
        { gradeLevel: "Grade 9", periodsPerWeek: 4, compulsory: false },
        { gradeLevel: "Grade 10", periodsPerWeek: 4, compulsory: false },
        { gradeLevel: "Grade 11", periodsPerWeek: 4, compulsory: false },
        { gradeLevel: "Grade 12", periodsPerWeek: 4, compulsory: false },
      ],
    },
    {
      id: "7",
      name: "Social Studies",
      gradePeriods: [
        { gradeLevel: "Grade 9", periodsPerWeek: 6, compulsory: true },
        { gradeLevel: "Grade 10", periodsPerWeek: 5, compulsory: false },
        { gradeLevel: "Grade 11", periodsPerWeek: 5, compulsory: false },
        { gradeLevel: "Grade 12", periodsPerWeek: 5, compulsory: false },
      ],
    },
    {
      id: "8",
      name: "Religious Education",
      gradePeriods: [
        { gradeLevel: "Grade 9", periodsPerWeek: 5, compulsory: true },
        { gradeLevel: "Grade 10", periodsPerWeek: 4, compulsory: false },
        { gradeLevel: "Grade 11", periodsPerWeek: 4, compulsory: false },
        { gradeLevel: "Grade 12", periodsPerWeek: 4, compulsory: false },
      ],
    },
  ];

  // Track which classes are selected for this timetable
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([
    "1",
    "2",
    "3",
    "4",
    "5",
  ]);

  // Convert selected classes to grades format for the timetable generator
  const grades = React.useMemo(() => {
    const classMap = new Map<
      string,
      { id: string; name: string; classes: string[] }
    >();

    selectedClassIds.forEach((classId) => {
      const classData = availableClassesData.find((c) => c.id === classId);
      if (classData) {
        if (!classMap.has(classData.gradeLevel)) {
          classMap.set(classData.gradeLevel, {
            id: classData.gradeLevel,
            name: classData.gradeLevel,
            classes: [],
          });
        }
        classMap.get(classData.gradeLevel)!.classes.push(classData.name);
      }
    });

    return Array.from(classMap.values());
  }, [selectedClassIds]);

  // All available teachers from the system (in a real app, this would be fetched from database)
  const availableTeachers = [
    { id: 1, name: "Mr. Mwanza", subjects: ["Mathematics", "Physics"] },
    { id: 2, name: "Mrs. Phiri", subjects: ["English", "Literature"] },
    { id: 3, name: "Mr. Banda", subjects: ["Science", "Biology"] },
    { id: 4, name: "Ms. Chirwa", subjects: ["Chemistry", "Mathematics"] },
  ];

  // Track which teachers are selected for this timetable
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<number[]>([
    1, 2, 3, 4,
  ]);

  // Filtered teachers based on selection
  const teachers = availableTeachers.filter((t) =>
    selectedTeacherIds.includes(t.id)
  );
  const [subjects, setSubjects] = useState([
    { id: 1, name: "Mathematics", periods: 5 },
    { id: 2, name: "English", periods: 5 },
    { id: 3, name: "Science", periods: 4 },
  ]);
  const [timeSlots, setTimeSlots] = useState([
    {
      time: "7:00 AM  7:40 AM",
      short: "7:00-7:40",
      period: "Period 1",
      isBreak: false,
    },
    {
      time: "7:40 AM  8:20 AM",
      short: "7:40-8:20",
      period: "Period 2",
      isBreak: false,
    },
    {
      time: "8:20 AM  9:00 AM",
      short: "8:20-9:00",
      period: "Period 3",
      isBreak: false,
    },
    {
      time: "9:00 AM  9:40 AM",
      short: "9:00-9:40",
      period: "Period 4",
      isBreak: false,
    },
    {
      time: "9:40 AM  10:00 AM",
      short: "9:40-10:00",
      period: "Break",
      isBreak: true,
    },
    {
      time: "10:00 AM  10:40 AM",
      short: "10:00-10:40",
      period: "Period 5",
      isBreak: false,
    },
    {
      time: "10:40 AM  11:20 AM",
      short: "10:40-11:20",
      period: "Period 6",
      isBreak: false,
    },
    {
      time: "11:20 AM  12:00 PM",
      short: "11:20-12:00",
      period: "Period 7",
      isBreak: false,
    },
    {
      time: "12:00 PM  12:40 PM",
      short: "12:00-12:40",
      period: "Period 8",
      isBreak: false,
    },
    {
      time: "12:40 PM  1:00 PM",
      short: "12:40-1:00",
      period: "Lunch",
      isBreak: true,
    },
  ]);

  const [teacherAssignments, setTeacherAssignments] = useState<
    Record<string, boolean>
  >({});
  const [classSubjects, setClassSubjects] = useState<Record<string, boolean>>(
    {}
  );
  const [generationOptions, setGenerationOptions] = useState({
    avoidConsecutive: true,
    morningPriority: true,
  });

  const [newSubject, setNewSubject] = useState({
    name: "",
    periods: 5,
  });
  const [newGrade, setNewGrade] = useState({ name: "", classCount: "3" });
  const [newTimeSlot, setNewTimeSlot] = useState({
    time: "",
    period: "",
    isBreak: false,
  });
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [schedule, setSchedule] = useState<Record<string, any>>({});
  const [viewMode, setViewMode] = useState("class");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Get suggested periods for a subject based on selected grades
  const getSuggestedPeriods = (subjectName: string): number => {
    // Get unique grades from selected classes
    const selectedGrades = new Set(
      selectedClassIds
        .map((id) => availableClassesData.find((c) => c.id === id)?.gradeLevel)
        .filter(Boolean)
    );

    if (selectedGrades.size === 0) return 5; // default

    // Find subject in master data
    const subject = subjectMasterData.find((s) => s.name === subjectName);
    if (!subject) return 5; // Subject not found, return default

    // Get periods for selected grades
    const allocationsByGrade = Array.from(selectedGrades).map((grade) => {
      const gradePeriod = subject.gradePeriods.find(
        (gp) => gp.gradeLevel === grade
      );
      return gradePeriod?.periodsPerWeek || null;
    });

    // Filter valid allocations
    const validAllocations = allocationsByGrade.filter(
      (a): a is number => a !== null
    );

    if (validAllocations.length > 0) {
      // Return the highest allocation (if grades differ, use max)
      return Math.max(...validAllocations);
    }

    return 5; // default fallback
  };

  // Check if subject is compulsory in any of the selected grades
  const isSubjectCompulsory = (subjectName: string): boolean => {
    const selectedGrades = new Set(
      selectedClassIds
        .map((id) => availableClassesData.find((c) => c.id === id)?.gradeLevel)
        .filter(Boolean)
    );

    // Find subject in master data
    const subject = subjectMasterData.find((s) => s.name === subjectName);
    if (!subject) return false;

    return Array.from(selectedGrades).some((grade) => {
      const gradePeriod = subject.gradePeriods.find(
        (gp) => gp.gradeLevel === grade
      );
      return gradePeriod?.compulsory === true;
    });
  };

  const addSubject = () => {
    if (newSubject.name) {
      // Auto-populate periods from Zambian curriculum if available
      const suggestedPeriods = getSuggestedPeriods(newSubject.name);
      setSubjects([
        ...subjects,
        { id: Date.now(), name: newSubject.name, periods: suggestedPeriods },
      ]);
      setNewSubject({
        name: "",
        periods: 5,
      });
    }
  };

  // Toggle class selection
  const toggleClassSelection = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleTeacherSelection = (teacherId: number) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(teacherId)
        ? prev.filter((id) => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const removeSubject = (id: number) => {
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  // Get all available subjects from Subject Master for selected grades
  const getAvailableSubjects = (): string[] => {
    const selectedGrades = new Set(
      selectedClassIds
        .map((id) => availableClassesData.find((c) => c.id === id)?.gradeLevel)
        .filter(Boolean)
    );

    if (selectedGrades.size === 0) return [];

    // Get subjects that have periods defined for any of the selected grades
    const availableSubjects = subjectMasterData
      .filter((subject) =>
        subject.gradePeriods.some((gp) =>
          selectedGrades.has(gp.gradeLevel)
        )
      )
      .map((subject) => subject.name)
      .sort();

    return availableSubjects;
  };

  // Toggle all classes for a subject (Select All / Deselect All)
  const toggleAllClassesForSubject = (subjectName: string) => {
    const allClassesList = grades.flatMap((g) => g.classes);
    const subjectAssignedInAnyClass = allClassesList.some(
      (cls) => classSubjects[`${cls}-${subjectName}`]
    );

    // If all are selected, deselect all. Otherwise, select all.
    const newClassSubjects = { ...classSubjects };
    allClassesList.forEach((cls) => {
      if (subjectAssignedInAnyClass) {
        // Deselect all
        newClassSubjects[`${cls}-${subjectName}`] = false;
      } else {
        // Select all
        newClassSubjects[`${cls}-${subjectName}`] = true;
      }
    });
    setClassSubjects(newClassSubjects);
  };

  const addTimeSlot = () => {
    if (newTimeSlot.time && newTimeSlot.period) {
      const short = newTimeSlot.time
        .replace(/\s+/g, "")
        .split("")
        .map((t) => t.replace(/AM|PM/g, "").trim())
        .join("-");

      setTimeSlots([
        ...timeSlots,
        {
          time: newTimeSlot.time,
          short,
          period: newTimeSlot.period,
          isBreak: newTimeSlot.isBreak,
        },
      ]);
      setNewTimeSlot({ time: "", period: "", isBreak: false });
    }
  };

  const removeTimeSlot = (index: number) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const toggleBreak = (index: number) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], isBreak: !updated[index].isBreak };
    setTimeSlots(updated);
  };

  const toggleTeacherAssignment = (
    teacherId: number,
    subject: string,
    className: string
  ) => {
    const key = `${teacherId}-${subject}-${className}`;
    setTeacherAssignments((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleClassSubject = (className: string, subjectName: string) => {
    const key = `${className}-${subjectName}`;
    setClassSubjects((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const validateConfiguration = () => {
    const errors: string[] = [];
    const allClasses = grades.flatMap((g) => g.classes);

    let classesWithSubjects = 0;
    allClasses.forEach((cls) => {
      const hasSubjects = subjects.some(
        (sub) => classSubjects[`${cls}-${sub.name}`]
      );
      if (hasSubjects) classesWithSubjects++;
    });

    if (classesWithSubjects === 0) {
      errors.push(
        "No subjects assigned to any class. Please assign subjects in Step 3."
      );
    }

    let assignedTeachers = 0;
    teachers.forEach((teacher) => {
      teacher.subjects.forEach((subject) => {
        allClasses.forEach((cls) => {
          if (teacherAssignments[`${teacher.id}-${subject}-${cls}`]) {
            assignedTeachers++;
          }
        });
      });
    });

    if (assignedTeachers === 0) {
      errors.push(
        "No teachers assigned to classes. Please assign teachers in Step 4."
      );
    }

    const teachingPeriods = timeSlots.filter((s) => !s.isBreak).length;

    allClasses.forEach((cls) => {
      const classSubjectsArray = subjects.filter(
        (sub) => classSubjects[`${cls}-${sub.name}`]
      );
      const periodsNeeded = classSubjectsArray.reduce(
        (sum, sub) => sum + sub.periods,
        0
      );
      const availablePeriodsPerWeek = teachingPeriods * 5;

      if (periodsNeeded > availablePeriodsPerWeek) {
        errors.push(
          `${cls}: Needs ${periodsNeeded} periods but only ${availablePeriodsPerWeek} available per week`
        );
      }
    });

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleGenerate = () => {
    if (validateConfiguration()) {
      setShowSchedule(true);
      if (!selectedClass && allClasses.length > 0) {
        setSelectedClass(allClasses[0]);
      }
    }
  };

  const days = ["Mon", "Tues", "Wed", "Thurs", "Fri"];

  const dayColors = {
    Mon: "bg-red-500",
    Tues: "bg-teal-500",
    Wed: "bg-yellow-500",
    Thurs: "bg-blue-500",
    Fri: "bg-gray-500",
  };

  const subjectColors = {
    Mathematics:
      "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    English:
      "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    Science:
      "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    Biology:
      "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700",
    Chemistry:
      "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
    History:
      "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
    Physics:
      "bg-indigo-100 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700",
    Literature:
      "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700",
  };

  const handleCellClick = (day: string, time: string) => {
    const key =
      viewMode === "class"
        ? `${selectedClass}-${day}-${time}`
        : `${selectedTeacher}-${day}-${time}`;

    const currentText = schedule[key] || "";
    const newText = prompt("Enter schedule text:", currentText);

    if (newText !== null) {
      setSchedule((prev) => ({
        ...prev,
        [key]: newText,
      }));
    }
  };

  const allClasses = grades.flatMap((g) => g.classes);

  const getTeacherWorkload = (teacherId: number) => {
    let count = 0;
    teachers
      .find((t) => t.id === teacherId)
      ?.subjects.forEach((subject) => {
        allClasses.forEach((cls) => {
          if (teacherAssignments[`${teacherId}-${subject}-${cls}`]) {
            const sub = subjects.find((s) => s.name === subject);
            count += sub?.periods || 0;
          }
        });
      });
    return count;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Grades", icon: Users },
              { num: 2, label: "Select Teachers", icon: Users },
              { num: 3, label: "Subjects", icon: BookOpen },
              { num: 4, label: "Assign", icon: Users },
              { num: 5, label: "Time", icon: Clock },
              { num: 6, label: "Generate", icon: Calendar },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant={
                      currentStep === step.num
                        ? "default"
                        : currentStep > step.num
                        ? "secondary"
                        : "outline"
                    }
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setCurrentStep(step.num)}>
                    <step.icon className="h-5 w-5" />
                  </Button>
                  <span className="text-xs font-medium text-center">
                    {step.label}
                  </span>
                </div>
                {idx < 5 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      currentStep > step.num ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Setup Grades */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Grade Levels & Classes</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Students stay in their home classroom. Teachers rotate between
              classes.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Class Selector - Auto-populated from System */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {/* Group classes by grade */}
                {Array.from(
                  availableClassesData.reduce((acc, cls) => {
                    if (!acc.has(cls.gradeLevel)) {
                      acc.set(cls.gradeLevel, []);
                    }
                    acc.get(cls.gradeLevel)!.push(cls);
                    return acc;
                  }, new Map<string, typeof availableClassesData>())
                ).map(([gradeLevel, classesInGrade]) => (
                  <div
                    key={gradeLevel}
                    className="border rounded-lg p-4 space-y-3">
                    <h4 className="font-semibold text-sm">{gradeLevel}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {classesInGrade.map((cls) => (
                        <label
                          key={cls.id}
                          className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-muted transition-colors">
                          <input
                            type="checkbox"
                            checked={selectedClassIds.includes(cls.id)}
                            onChange={() => toggleClassSelection(cls.id)}
                            className="cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {cls.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Cap: {cls.capacity}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Classes Summary */}
            <div className="space-y-2">
              <Label>Selected Classes ({selectedClassIds.length})</Label>
              {selectedClassIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {availableClassesData
                    .filter((cls) => selectedClassIds.includes(cls.id))
                    .map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm">
                        <span>{cls.name}</span>
                        <button
                          onClick={() => toggleClassSelection(cls.id)}
                          className="ml-1 hover:opacity-75">
                          ✕
                        </button>
                      </div>
                    ))}
                </div>
              ) : (
                <Empty className="min-h-[100px] border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Filter className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle>No classes selected</EmptyTitle>
                    <EmptyDescription>
                      Select classes above to include in the timetable
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select Teachers */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Teachers for This Timetable</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Choose which teachers will teach in this timetable. Their subjects
              are already configured in the system.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {availableTeachers.length > 0 ? (
                availableTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input
                      type="checkbox"
                      id={`teacher-${teacher.id}`}
                      checked={selectedTeacherIds.includes(teacher.id)}
                      onChange={() => toggleTeacherSelection(teacher.id)}
                      className="rounded"
                    />
                    <Label
                      htmlFor={`teacher-${teacher.id}`}
                      className="ml-3 flex-1 cursor-pointer">
                      <div>
                        <h4 className="font-semibold">{teacher.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Subjects: {teacher.subjects.join(", ")}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))
              ) : (
                <Empty className="min-h-[200px] border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Users className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle>No teachers available</EmptyTitle>
                    <EmptyDescription>
                      No teachers have been added to the system yet
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>

            {selectedTeacherIds.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Selected Teachers</AlertTitle>
                <AlertDescription>
                  {selectedTeacherIds.length} teacher
                  {selectedTeacherIds.length !== 1 ? "s" : ""} selected for this
                  timetable
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Subjects & Class Assignment */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Subjects & Assign to Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Subject Name *</Label>
                <Select
                  value={newSubject.name}
                  onValueChange={(value) => {
                    const suggestedPeriods = getSuggestedPeriods(value);
                    setNewSubject({ name: value, periods: suggestedPeriods });
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="max-h-[300px] overflow-y-auto">
                      {getAvailableSubjects().map((subject) => {
                        const isCompulsory = isSubjectCompulsory(subject);
                        return (
                          <SelectItem key={subject} value={subject}>
                            <span>{subject}</span>
                            {isCompulsory && (
                              <span className="ml-2 text-red-500">*</span>
                            )}
                          </SelectItem>
                        );
                      })}
                    </div>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  * = Compulsory subject
                </p>
              </div>
              <div>
                <Label>Periods per Week</Label>
                <Input
                  type="number"
                  placeholder="Auto-filled from curriculum"
                  value={newSubject.periods}
                  onChange={(e) =>
                    setNewSubject({
                      ...newSubject,
                      periods: parseInt(e.target.value) || newSubject.periods,
                    })
                  }
                  min="1"
                  max="20"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {newSubject.name
                    ? `${getSuggestedPeriods(newSubject.name)} recommended`
                    : "Select subject first"}
                </p>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addSubject}
                  className="w-full"
                  disabled={!newSubject.name}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </div>

            {subjects.length > 0 ? (
              <div className="space-y-4">
                <Label className="text-base">Assign Subjects to Classes</Label>
                {subjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{subject.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {subject.periods} periods/week
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleAllClassesForSubject(subject.name)
                          }
                          className="text-xs">
                          Select All
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubject(subject.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-2">
                      {allClasses.map((cls) => (
                        <div key={cls} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`${subject.name}-${cls}`}
                            checked={
                              classSubjects[`${cls}-${subject.name}`] || false
                            }
                            onChange={() =>
                              toggleClassSubject(cls, subject.name)
                            }
                            className="rounded"
                          />
                          <Label
                            htmlFor={`${subject.name}-${cls}`}
                            className="text-sm cursor-pointer">
                            {cls}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty className="min-h-[200px] border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <BookOpen className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>No subjects added</EmptyTitle>
                  <EmptyDescription>
                    Add your first subject above to continue with class
                    assignments
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Teacher Assignment */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Assign Teachers to Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teachers.length > 0 ? (
              teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{teacher.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {teacher.subjects.join(", ")}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTeacherWorkload(teacher.id)} periods/week
                    </div>
                  </div>

                  {teacher.subjects.map((subject) => (
                    <div key={subject} className="pl-4 border-l-2 space-y-2">
                      <Label className="text-sm font-medium">{subject}</Label>
                      <div className="grid grid-cols-6 gap-2">
                        {allClasses.map((cls) => {
                          const isSubjectInClass =
                            classSubjects[`${cls}-${subject}`];
                          return (
                            <div
                              key={cls}
                              className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`${teacher.id}-${subject}-${cls}`}
                                checked={
                                  teacherAssignments[
                                    `${teacher.id}-${subject}-${cls}`
                                  ] || false
                                }
                                onChange={() =>
                                  toggleTeacherAssignment(
                                    teacher.id,
                                    subject,
                                    cls
                                  )
                                }
                                disabled={!isSubjectInClass}
                                className="rounded disabled:opacity-50"
                              />
                              <Label
                                htmlFor={`${teacher.id}-${subject}-${cls}`}
                                className="text-sm cursor-pointer disabled:opacity-50">
                                {cls}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <Empty className="min-h-[300px] border-0">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Users className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle>No teachers to assign</EmptyTitle>
                  <EmptyDescription>
                    Add teachers in Step 2 to assign them to classes
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Time Slots */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure School Day Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <Label>Time Range</Label>
                <Input
                  placeholder="7:00 AM  7:40 AM"
                  value={newTimeSlot.time}
                  onChange={(e) =>
                    setNewTimeSlot({ ...newTimeSlot, time: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Period Name</Label>
                <Input
                  placeholder="Period 1"
                  value={newTimeSlot.period}
                  onChange={(e) =>
                    setNewTimeSlot({ ...newTimeSlot, period: e.target.value })
                  }
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-break"
                    checked={newTimeSlot.isBreak}
                    onCheckedChange={(checked) =>
                      setNewTimeSlot({ ...newTimeSlot, isBreak: checked })
                    }
                  />
                  <Label htmlFor="is-break" className="text-sm cursor-pointer">
                    Break
                  </Label>
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={addTimeSlot} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border-2 rounded-lg ${
                      slot.isBreak ? "bg-amber-50 dark:bg-amber-900/20" : ""
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                        <div>
                          <span className="font-semibold text-sm">
                            {slot.period}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {slot.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slot.isBreak}
                            onCheckedChange={() => toggleBreak(idx)}
                          />
                          <Label className="text-xs">
                            {slot.isBreak ? "Break" : "Teaching"}
                          </Label>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTimeSlot(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <Empty className="min-h-[200px] border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Clock className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle>No time slots configured</EmptyTitle>
                    <EmptyDescription>
                      Add your first time slot above to define the school day
                      schedule
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </div>

            <Alert>
              <Clock className="h-4 w-4" />
              <AlertTitle>Teaching Periods</AlertTitle>
              <AlertDescription>
                Total Teaching Periods:{" "}
                {timeSlots.filter((s) => !s.isBreak).length} per day
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Step 6: Generate Options */}
      {currentStep === 6 && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Options & Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Generation Options
                </Label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Avoid consecutive periods for same subject</Label>
                  <Switch
                    checked={generationOptions.avoidConsecutive}
                    onCheckedChange={(checked) =>
                      setGenerationOptions({
                        ...generationOptions,
                        avoidConsecutive: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Prioritize morning slots for core subjects</Label>
                  <Switch
                    checked={generationOptions.morningPriority}
                    onCheckedChange={(checked) =>
                      setGenerationOptions({
                        ...generationOptions,
                        morningPriority: checked,
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">{allClasses.length}</h3>
                  <p className="text-sm text-muted-foreground">Total Classes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">{teachers.length}</h3>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">{subjects.length}</h3>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="text-2xl font-bold">
                    {timeSlots.filter((s) => !s.isBreak).length * 5}
                  </h3>
                  <p className="text-sm text-muted-foreground">Periods/Week</p>
                </CardContent>
              </Card>
            </div>

            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuration Issues</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1 text-sm">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationErrors.length === 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Ready to Generate</AlertTitle>
                <AlertDescription>
                  Configuration is complete and valid. Click generate to create
                  your timetable.
                </AlertDescription>
              </Alert>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleGenerate}
              disabled={validationErrors.length > 0}>
              <Calendar className="h-5 w-5 mr-2" />
              Generate Timetable
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule View */}
      {showSchedule && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Weekly Schedule</h2>
                <p className="text-sm text-muted-foreground">
                  Teachers rotate to classes
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 border rounded-lg p-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-32 border-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Class View</SelectItem>
                      <SelectItem value="teacher">Teacher View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {viewMode === "class" ? (
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={selectedTeacher}
                    onValueChange={setSelectedTeacher}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select Teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.name}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={selectedSubject}
                  onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.name} value={subject.name}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timetable Grid */}
            {((viewMode === "class" && selectedClass) ||
              (viewMode === "teacher" && selectedTeacher)) && (
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-20 bg-background border-b">
                    <tr>
                      <th className="w-32 p-4 border-r text-left">
                        <div className="font-bold text-sm">
                          {viewMode === "class"
                            ? selectedClass
                            : selectedTeacher}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {viewMode === "class"
                            ? "Class Schedule"
                            : "Teacher Schedule"}
                        </div>
                      </th>
                      {timeSlots.map((slot) => (
                        <th
                          key={slot.time}
                          className="p-2 min-w-[95px] border-r text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold text-primary">
                              {slot.period}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {slot.short}
                            </span>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map((day) => (
                      <tr key={day} className="border-b">
                        <td className="p-4 border-r font-semibold">{day}</td>
                        {timeSlots.map((slot) => {
                          const key =
                            viewMode === "class"
                              ? `${selectedClass}-${day}-${slot.time}`
                              : `${selectedTeacher}-${day}-${slot.time}`;
                          const cellText = schedule[key] || "";

                          return (
                            <td
                              key={slot.time}
                              className={`p-2 border-r ${
                                !slot.isBreak ? "cursor-pointer" : ""
                              } transition-all ${
                                cellText
                                  ? "hover:opacity-80"
                                  : !slot.isBreak
                                  ? "hover:bg-muted/50"
                                  : ""
                              } ${
                                slot.isBreak
                                  ? "bg-amber-50 dark:bg-amber-900/20"
                                  : ""
                              }`}
                              onClick={() =>
                                !slot.isBreak && handleCellClick(day, slot.time)
                              }>
                              <div className="min-h-[80px] flex flex-col items-center justify-center p-2">
                                {cellText ? (
                                  <div
                                    className={`w-full h-full rounded-lg border-2 p-2 flex flex-col items-center justify-center ${
                                      subjectColors[
                                        cellText as keyof typeof subjectColors
                                      ] ||
                                      "bg-gray-100 dark:bg-gray-800 border-gray-300"
                                    }`}>
                                    <span className="text-xs font-bold text-center">
                                      {cellText}
                                    </span>
                                  </div>
                                ) : slot.isBreak ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span className="text-xs text-amber-700 font-medium">
                                      {slot.period}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">
                                    Click to assign
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Teacher Workload Summary */}
            {viewMode === "teacher" && (
              <div className="mt-6">
                <h3 className="font-semibold mb-4">Teacher Workload Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  {teachers.map((teacher) => {
                    const workload = getTeacherWorkload(teacher.id);
                    const maxWorkload =
                      timeSlots.filter((s) => !s.isBreak).length * 5;
                    const percentage = Math.round(
                      (workload / maxWorkload) * 100
                    );

                    return (
                      <Card key={teacher.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">
                                {teacher.name}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {teacher.subjects.join(", ")}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {workload}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                periods
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage > 80
                                  ? "bg-red-500"
                                  : percentage > 60
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {percentage}% capacity
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}>
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(6, currentStep + 1))}
          disabled={currentStep === 6}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default TimetableGeneratorUI;
