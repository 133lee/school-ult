"use client";

import React, { useState } from 'react';
import { Plus, Trash2, Save, Calendar, Users, BookOpen, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const TimetableGeneratorUI = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [grades, setGrades] = useState([
    { id: 1, name: 'Grade 8', classes: ['8A', '8B', '8C'] }
  ]);
  const [teachers, setTeachers] = useState([
    { id: 1, name: 'Mr. Mwanza', subjects: ['Mathematics', 'Physics'] },
    { id: 2, name: 'Mrs. Phiri', subjects: ['English', 'Literature'] },
    { id: 3, name: 'Mr. Banda', subjects: ['Science', 'Biology'] },
    { id: 4, name: 'Ms. Chirwa', subjects: ['Chemistry', 'Mathematics'] }
  ]);
  const [subjects, setSubjects] = useState([
    { id: 1, name: 'Mathematics', periods: 5 },
    { id: 2, name: 'English', periods: 5 },
    { id: 3, name: 'Science', periods: 4 }
  ]);
  const [timeSlots, setTimeSlots] = useState([
    { time: '7:00 AM – 7:40 AM', short: '7:00-7:40', period: 'Period 1', isBreak: false },
    { time: '7:40 AM – 8:20 AM', short: '7:40-8:20', period: 'Period 2', isBreak: false },
    { time: '8:20 AM – 9:00 AM', short: '8:20-9:00', period: 'Period 3', isBreak: false },
    { time: '9:00 AM – 9:40 AM', short: '9:00-9:40', period: 'Period 4', isBreak: false },
    { time: '9:40 AM – 10:00 AM', short: '9:40-10:00', period: 'Break', isBreak: true },
    { time: '10:00 AM – 10:40 AM', short: '10:00-10:40', period: 'Period 5', isBreak: false },
    { time: '10:40 AM – 11:20 AM', short: '10:40-11:20', period: 'Period 6', isBreak: false },
    { time: '11:20 AM – 12:00 PM', short: '11:20-12:00', period: 'Period 7', isBreak: false },
    { time: '12:00 PM – 12:40 PM', short: '12:00-12:40', period: 'Period 8', isBreak: false },
    { time: '12:40 PM – 1:00 PM', short: '12:40-1:00', period: 'Lunch', isBreak: true },
    { time: '1:00 PM – 1:40 PM', short: '1:00-1:40', period: 'Period 9', isBreak: false },
    { time: '1:40 PM – 2:20 PM', short: '1:40-2:20', period: 'Period 10', isBreak: false }
  ]);

  const [newTeacher, setNewTeacher] = useState({ name: '', primarySubject: '', secondarySubject: '' });
  const [newSubject, setNewSubject] = useState({ name: '', periods: 5 });
  const [newGrade, setNewGrade] = useState({ name: '', classCount: 3 });
  const [newTimeSlot, setNewTimeSlot] = useState({ time: '', period: '', isBreak: false });
  const [showSchedule, setShowSchedule] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [schedule, setSchedule] = useState({});

  const addTeacher = () => {
    if (newTeacher.name && newTeacher.primarySubject) {
      const subjects = newTeacher.secondarySubject
        ? [newTeacher.primarySubject, newTeacher.secondarySubject]
        : [newTeacher.primarySubject];
      setTeachers([...teachers, { id: Date.now(), name: newTeacher.name, subjects }]);
      setNewTeacher({ name: '', primarySubject: '', secondarySubject: '' });
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

  const addTimeSlot = () => {
    if (newTimeSlot.time && newTimeSlot.period) {
      // Generate short version from time (e.g., "7:00 AM – 7:40 AM" -> "7:00-7:40")
      const short = newTimeSlot.time
        .replace(/\s+/g, '')
        .split('–')
        .map(t => t.replace(/AM|PM/g, '').trim())
        .join('-');

      setTimeSlots([...timeSlots, {
        time: newTimeSlot.time,
        short,
        period: newTimeSlot.period,
        isBreak: newTimeSlot.isBreak
      }]);
      setNewTimeSlot({ time: '', period: '', isBreak: false });
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

  const days = ['Mon', 'Tues', 'Wed', 'Thurs', 'Fri'];

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
            <p className="text-sm text-muted-foreground mt-2">
              Teachers must have at least a primary subject. A secondary subject is optional.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Teacher Name</Label>
                <Input
                  placeholder="Mr. Mwanza"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Primary Subject *</Label>
                <Input
                  placeholder="Mathematics"
                  value={newTeacher.primarySubject}
                  onChange={(e) => setNewTeacher({ ...newTeacher, primarySubject: e.target.value })}
                />
              </div>
              <div>
                <Label>Secondary Subject (Optional)</Label>
                <Input
                  placeholder="Science"
                  value={newTeacher.secondarySubject}
                  onChange={(e) => setNewTeacher({ ...newTeacher, secondarySubject: e.target.value })}
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
                    <p className="text-sm text-muted-foreground">
                      {teacher.subjects.length === 1 ? (
                        <>Primary: {teacher.subjects[0]}</>
                      ) : (
                        <>Primary: {teacher.subjects[0]} | Secondary: {teacher.subjects[1]}</>
                      )}
                    </p>
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
            <p className="text-sm text-muted-foreground mt-2">
              Add, remove, and configure time slots. Toggle breaks/lunch periods as needed.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add New Time Slot */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <Label>Time Range</Label>
                <Input
                  placeholder="7:00 AM – 7:40 AM"
                  value={newTimeSlot.time}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, time: e.target.value })}
                />
              </div>
              <div>
                <Label>Period Name</Label>
                <Input
                  placeholder="Period 1"
                  value={newTimeSlot.period}
                  onChange={(e) => setNewTimeSlot({ ...newTimeSlot, period: e.target.value })}
                />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-break"
                    checked={newTimeSlot.isBreak}
                    onCheckedChange={(checked) => setNewTimeSlot({ ...newTimeSlot, isBreak: checked })}
                  />
                  <Label htmlFor="is-break" className="text-sm cursor-pointer">
                    Break/Lunch
                  </Label>
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={addTimeSlot} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </div>
            </div>

            {/* Time Slots List */}
            <div className="space-y-2">
              <Label>Time Slots ({timeSlots.length} total, {timeSlots.filter(s => !s.isBreak).length} teaching periods)</Label>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className={`p-4 border-2 rounded-lg transition-colors ${slot.isBreak ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 grid grid-cols-3 gap-4 items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{slot.period}</span>
                            {slot.isBreak && (
                              <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded font-medium">
                                Break
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">{slot.time}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Duration: {slot.short}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slot.isBreak}
                            onCheckedChange={() => toggleBreak(idx)}
                          />
                          <Label className="text-xs cursor-pointer" onClick={() => toggleBreak(idx)}>
                            {slot.isBreak ? 'Break Period' : 'Teaching Period'}
                          </Label>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeTimeSlot(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Total Teaching Periods:</strong> {timeSlots.filter(s => !s.isBreak).length} periods per day
              </p>
              <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                Break and lunch times apply to all teachers and students. The timetable generator will automatically skip these periods.
              </p>
            </div>
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
                  Teaching Periods: {timeSlots.filter(s => !s.isBreak).length} per day
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
                      {timeSlots.map((slot) => (
                        <th key={slot.time} className="p-2 min-w-[95px] w-[95px] border-t bg-background">
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
                        {timeSlots.map((slot) => {
                          const key = `${selectedClass}-${day}-${slot.time}`;
                          const cellText = schedule[key] || '';

                          return (
                            <td
                              key={slot.time}
                              className={`p-2 border-r border-border ${!slot.isBreak ? 'cursor-pointer' : ''} transition-all ${
                                cellText ? "hover:opacity-80" : !slot.isBreak ? "hover:bg-muted/50" : ""
                              } ${
                                slot.isBreak ? "bg-amber-50 dark:bg-amber-900/20" : ""
                              }`}
                              onClick={() => !slot.isBreak && handleCellClick(day, slot.time)}
                            >
                              <div className="min-h-[80px] flex flex-col items-center justify-center p-2 gap-1">
                                {cellText ? (
                                  <div className={`w-full h-full rounded-lg border-2 p-2 flex flex-col items-center justify-center gap-1 ${subjectColors[cellText] || "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600"}`}>
                                    <span className="text-xs font-bold text-center">
                                      {cellText}
                                    </span>
                                  </div>
                                ) : slot.isBreak ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-xs text-amber-700 dark:text-amber-300 font-medium">
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
