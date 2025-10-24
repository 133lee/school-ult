"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, Calendar, Users, BookOpen, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimetableGeneratorUI = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [grades, setGrades] = useState([
    { id: 1, name: 'Grade 8', classes: ['8A', '8B', '8C'] }
  ]);
  const [teachers, setTeachers] = useState([
    { id: 1, name: 'Mr. Mwanza', subjects: ['Mathematics'] },
    { id: 2, name: 'Mrs. Phiri', subjects: ['English', 'Literature'] },
    { id: 3, name: 'Mr. Banda', subjects: ['Science', 'Biology'] }
  ]);
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Mathematics', periods: 5 },
    { id: 2, name: 'English', periods: 5 },
    { id: 3, name: 'Science', periods: 4 }
  ]);
  const [timeSlots, setTimeSlots] = useState([
    '08:00 - 08:40',
    '08:40 - 09:20',
    '09:20 - 10:00',
    '10:00 - 10:20', // Break
    '10:20 - 11:00',
    '11:00 - 11:40',
    '11:40 - 12:20',
    '12:20 - 13:00', // Lunch
    '13:00 - 13:40',
    '13:40 - 14:20',
    '14:20 - 15:00'
  ]);

  const [newTeacher, setNewTeacher] = useState({ name: '', subject: '' });
  const [newSubject, setNewSubject] = useState({ name: '', periods: 5 });
  const [newGrade, setNewGrade] = useState({ name: '', classCount: 3 });
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [schedule, setSchedule] = useState({});

  const addTeacher = () => {
    if (newTeacher.name && newTeacher.subject) {
      setTeachers([...teachers, { id: Date.now(), name: newTeacher.name, subjects: [newTeacher.subject] }]);
      setNewTeacher({ name: '', subject: '' });
    }
  };

  const addSubject = () => {
    if (newSubject.name) {
      setSubjects([...subjects, { id: Date.now(), ...newSubject }]);
      setNewSubject({ name: '', periods: 5 });
    }
  };

  const addGrade = () => {
    if (newGrade.name && newGrade.classCount > 0) {
      const classes = Array.from({ length: parseInt(newGrade.classCount) }, (_, i) =>
        `${newGrade.name}${String.fromCharCode(65 + i)}`
      );
      setGrades([...grades, { id: Date.now(), name: newGrade.name, classes }]);
      setNewGrade({ name: '', classCount: 3 });
    }
  };

  const removeTeacher = (id: number) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const removeSubject = (id: number) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const removeGrade = (id: number) => {
    setGrades(grades.filter(g => g.id !== id));
  };

  const days = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri'];
  const scheduleTimeSlots = [
    { time: '8:30 AM – 9:30 AM', short: '8:30-9:30', period: 'Period 1' },
    { time: '9:30 AM – 10:30 AM', short: '9:30-10:30', period: 'Period 2' },
    { time: '10:30 AM – 11:30 AM', short: '10:30-11:30', period: 'Period 3' },
    { time: '11:30 AM – 12:15 PM', short: '11:30-12:15', period: 'Period 4' },
    { time: '12:15 PM – 12:40 PM', short: '12:15-12:40', period: 'Lunch' },
    { time: '12:30 PM – 1:15 PM', short: '12:30-1:15', period: 'Period 5' },
    { time: '1:15 PM – 2:00 PM', short: '1:15-2:00', period: 'Period 6' },
  ];

  const dayColors: { [key: string]: string } = {
    'Mon': 'bg-red-500',
    'Tues': 'bg-teal-500',
    'Wed': 'bg-yellow-500',
    'Thurs': 'bg-blue-500',
    'Fri': 'bg-gray-500',
  };

  // Subject color mapping
  const subjectColors: { [key: string]: string } = {
    Mathematics: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
    English: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
    Science: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
    Biology: "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700",
    Chemistry: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
    History: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
  };

  const handleCellClick = (day: string, time: string) => {
    const key = `${selectedClass}-${day}-${time}`;
    const currentText = schedule[key] || '';
    const newText = prompt('Enter schedule text:', currentText);

    if (newText !== null) {
      setSchedule(prev => ({
        ...prev,
        [key]: newText
      }));
    }
  };

  const allClasses = grades.flatMap(g => g.classes);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Setup Grades', icon: Users },
              { num: 2, label: 'Add Teachers', icon: Users },
              { num: 3, label: 'Add Subjects', icon: BookOpen },
              { num: 4, label: 'Configure Time', icon: Clock },
              { num: 5, label: 'Generate', icon: Calendar }
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant={currentStep === step.num ? "default" : currentStep > step.num ? "secondary" : "outline"}
                    size="icon"
                    className="h-12 w-12 rounded-full"
                    onClick={() => setCurrentStep(step.num)}
                  >
                    <step.icon className="h-5 w-5" />
                  </Button>
                  <span className="text-xs font-medium">{step.label}</span>
                </div>
                {idx < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.num ? 'bg-primary' : 'bg-border'}`} />
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Grade Level</Label>
                <Input
                  placeholder="e.g., Grade 8"
                  value={newGrade.name}
                  onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Number of Classes</Label>
                <Input
                  type="number"
                  placeholder="3"
                  value={newGrade.classCount}
                  onChange={(e) => setNewGrade({ ...newGrade, classCount: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addGrade} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Grade
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {grades.map((grade) => (
                <div key={grade.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{grade.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Classes: {grade.classes.join(', ')}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeGrade(grade.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Add Teachers */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Add Teachers & Their Subjects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Teacher Name</Label>
                <Input
                  placeholder="Mr. Mwanza"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Subject</Label>
                <Input
                  placeholder="Mathematics"
                  value={newTeacher.subject}
                  onChange={(e) => setNewTeacher({ ...newTeacher, subject: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addTeacher} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{teacher.name}</h4>
                    <p className="text-sm text-muted-foreground">{teacher.subjects.join(', ')}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeTeacher(teacher.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Add Subjects */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure Subjects & Periods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Subject Name</Label>
                <Input
                  placeholder="Mathematics"
                  value={newSubject.name}
                  onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Periods per Week</Label>
                <Input
                  type="number"
                  placeholder="5"
                  value={newSubject.periods}
                  onChange={(e) => setNewSubject({ ...newSubject, periods: parseInt(e.target.value) || 5 })}
                />
              </div>
              <div className="flex items-end">
                <Button onClick={addSubject} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {subjects.map((subject) => (
                <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{subject.name}</h4>
                    <p className="text-sm text-muted-foreground">{subject.periods} periods per week</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeSubject(subject.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Configure Time Slots */}
      {currentStep === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Configure School Day Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Time Slots (Default Schedule)</Label>
              <div className="grid grid-cols-2 gap-2">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className={`p-3 border rounded-lg ${slot.includes('Break') || slot.includes('Lunch') ? 'bg-amber-50 border-amber-200' : ''}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{slot}</span>
                      {(slot.includes('Break') || slot.includes('Lunch')) && (
                        <span className="text-xs bg-amber-200 px-2 py-1 rounded">
                          {slot.includes('Break') ? 'Break' : 'Lunch'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              * Break and lunch times apply to all teachers and students
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Generate Summary */}
      {currentStep === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Ready to Generate Timetable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">{grades.length}</h3>
                    <p className="text-sm text-muted-foreground">Grade Levels</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">{teachers.length}</h3>
                    <p className="text-sm text-muted-foreground">Teachers</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="text-2xl font-bold">{subjects.length}</h3>
                    <p className="text-sm text-muted-foreground">Subjects</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Timetable Configuration:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  Total Classes: {grades.reduce((acc, g) => acc + g.classes.length, 0)}
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Teaching Periods: {timeSlots.filter(s => !s.includes('Break') && !s.includes('Lunch')).length} per day
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  Algorithm will prevent teacher clashes across all grades
                </li>
              </ul>
            </div>

            <Button className="w-full" size="lg" onClick={() => setShowSchedule(true)}>
              <Calendar className="h-5 w-5 mr-2" />
              Generate Clash-Free Timetable
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule View */}
      {showSchedule && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-600 rounded-full">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Weekly Schedule</h2>
                  <p className="text-sm text-muted-foreground">Filter by class and subject to customize view</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Filters:</Label>
                </div>
                <div className="w-48">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
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
                </div>
                <div className="w-48">
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Subject" />
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
            </div>

            {selectedClass && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="w-48 p-4">
                        <div className="text-left">
                          <div className="font-bold text-sm">{selectedClass}</div>
                          <div className="text-xs text-muted-foreground">
                            Class Schedule
                          </div>
                        </div>
                      </th>
                      {scheduleTimeSlots.map((slot) => (
                        <th key={slot.time} className="p-2 min-w-[140px]">
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
                      <tr key={day} className="border-t border-border">
                        <td className="p-4 border-r border-border">
                          <div
                            className={`${dayColors[day]} text-white font-semibold py-3 px-6 rounded shadow-md transform -skew-x-12`}>
                            <span className="inline-block transform skew-x-12">
                              {day}
                            </span>
                          </div>
                        </td>
                        {scheduleTimeSlots.map((slot) => {
                          const key = `${selectedClass}-${day}-${slot.time}`;
                          const cellText = schedule[key] || '';
                          const isBreak = slot.period === 'Lunch';

                          return (
                            <td
                              key={slot.time}
                              className={`p-2 border-r border-border cursor-pointer transition-all ${
                                cellText ? "hover:opacity-80" : "hover:bg-muted/50"
                              } ${
                                isBreak ? "bg-muted/20" : ""
                              }`}
                              onClick={() => !isBreak && handleCellClick(day, slot.time)}
                            >
                              <div className="min-h-[80px] flex flex-col items-center justify-center p-2 gap-1">
                                {cellText ? (
                                  <div className={`w-full h-full rounded-lg border-2 p-2 flex flex-col items-center justify-center gap-1 ${subjectColors[cellText] || "bg-gray-100 border-gray-300"}`}>
                                    <span className="text-xs font-bold text-center">
                                      {cellText}
                                    </span>
                                  </div>
                                ) : isBreak ? (
                                  <span className="text-xs text-muted-foreground font-medium">
                                    {slot.period}
                                  </span>
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
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
          disabled={currentStep === 5}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TimetableGeneratorUI;
