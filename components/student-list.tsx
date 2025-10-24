"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  X,
  Phone,
  MapPin,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Student {
  id: string;
  name: string;
  studentId: string;
  year: number;
  photoUrl: string;
  className: string;
  gender: string;
  dateOfBirth: string;
  religion: string;
  bloodGroup: string;
  address: string;
  father: string;
  fatherPhone: string;
  mother: string;
  motherPhone: string;
}

const students: Student[] = [
  {
    id: "1",
    name: "Amara Olson",
    studentId: "E-6547",
    year: 2019,
    photoUrl: "https://i.pravatar.cc/150?img=1",
    className: "Class VII",
    gender: "Female",
    dateOfBirth: "15-08-2005",
    religion: "Christian",
    bloodGroup: "A+",
    address: "1234 Main Street, San Francisco, CA 94103",
    father: "John Olson",
    fatherPhone: "+1 555-123-4567",
    mother: "Sarah Olson",
    motherPhone: "+1 555-987-6543",
  },
  {
    id: "2",
    name: "Julie Von",
    studentId: "D-4512",
    year: 2020,
    photoUrl: "https://i.pravatar.cc/150?img=5",
    className: "Class VI",
    gender: "Female",
    dateOfBirth: "22-03-2006",
    religion: "Christian",
    bloodGroup: "B+",
    address: "5678 Oak Avenue, San Francisco, CA 94105",
    father: "Michael Von",
    fatherPhone: "+1 555-234-5678",
    mother: "Emma Von",
    motherPhone: "+1 555-876-5432",
  },
  {
    id: "3",
    name: "Jocelyn Walker",
    studentId: "C-9514",
    year: 2016,
    photoUrl: "https://i.pravatar.cc/150?img=9",
    className: "Class VIII",
    gender: "Female",
    dateOfBirth: "10-11-2003",
    religion: "Christian",
    bloodGroup: "O+",
    address: "9012 Pine Street, San Francisco, CA 94107",
    father: "David Walker",
    fatherPhone: "+1 555-345-6789",
    mother: "Lisa Walker",
    motherPhone: "+1 555-765-4321",
  },
  {
    id: "4",
    name: "Jaiden Zulauf",
    studentId: "E-8221",
    year: 2019,
    photoUrl: "https://i.pravatar.cc/150?img=12",
    className: "Class VII",
    gender: "Male",
    dateOfBirth: "05-07-2005",
    religion: "Christian",
    bloodGroup: "AB+",
    address: "3456 Elm Street, San Francisco, CA 94109",
    father: "Robert Zulauf",
    fatherPhone: "+1 555-456-7890",
    mother: "Michelle Zulauf",
    motherPhone: "+1 555-654-3210",
  },
  {
    id: "5",
    name: "Trisha Berge",
    studentId: "F-6522",
    year: 2018,
    photoUrl: "https://i.pravatar.cc/150?img=20",
    className: "Class VI",
    gender: "Female",
    dateOfBirth: "29-04-2004",
    religion: "Christian",
    bloodGroup: "B+",
    address: "1942 Harrison Street, San Francisco, CA 94103",
    father: "Richard Berge",
    fatherPhone: "+1 603-965-4668",
    mother: "Maren Berge",
    motherPhone: "+1 660-687-7027",
  },
  {
    id: "6",
    name: "Morris Mayert",
    studentId: "H-2787",
    year: 2016,
    photoUrl: "https://i.pravatar.cc/150?img=13",
    className: "Class VIII",
    gender: "Male",
    dateOfBirth: "18-12-2003",
    religion: "Christian",
    bloodGroup: "A-",
    address: "7890 Cedar Lane, San Francisco, CA 94111",
    father: "Thomas Mayert",
    fatherPhone: "+1 555-567-8901",
    mother: "Patricia Mayert",
    motherPhone: "+1 555-543-2109",
  },
  {
    id: "7",
    name: "Ronny Kemmer",
    studentId: "I-5746",
    year: 2021,
    photoUrl: "https://i.pravatar.cc/150?img=15",
    className: "Class V",
    gender: "Male",
    dateOfBirth: "14-09-2007",
    religion: "Christian",
    bloodGroup: "O-",
    address: "2345 Maple Drive, San Francisco, CA 94113",
    father: "Steven Kemmer",
    fatherPhone: "+1 555-678-9012",
    mother: "Nancy Kemmer",
    motherPhone: "+1 555-432-1098",
  },
  {
    id: "8",
    name: "Bianka Tromp",
    studentId: "B-1687",
    year: 2021,
    photoUrl: "https://i.pravatar.cc/150?img=25",
    className: "Class V",
    gender: "Female",
    dateOfBirth: "03-02-2007",
    religion: "Christian",
    bloodGroup: "B-",
    address: "6789 Birch Avenue, San Francisco, CA 94115",
    father: "Daniel Tromp",
    fatherPhone: "+1 555-789-0123",
    mother: "Karen Tromp",
    motherPhone: "+1 555-321-0987",
  },
  {
    id: "9",
    name: "Gregg Quigley",
    studentId: "E-2712",
    year: 2019,
    photoUrl: "https://i.pravatar.cc/150?img=33",
    className: "Class VII",
    gender: "Male",
    dateOfBirth: "27-06-2005",
    religion: "Christian",
    bloodGroup: "A+",
    address: "4567 Willow Court, San Francisco, CA 94117",
    father: "James Quigley",
    fatherPhone: "+1 555-890-1234",
    mother: "Barbara Quigley",
    motherPhone: "+1 555-210-9876",
  },
  {
    id: "10",
    name: "Carissa Gottlieb",
    studentId: "C-9510",
    year: 2017,
    photoUrl: "https://i.pravatar.cc/150?img=45",
    className: "Class IX",
    gender: "Female",
    dateOfBirth: "11-01-2002",
    religion: "Christian",
    bloodGroup: "O+",
    address: "8901 Spruce Street, San Francisco, CA 94119",
    father: "William Gottlieb",
    fatherPhone: "+1 555-901-2345",
    mother: "Jennifer Gottlieb",
    motherPhone: "+1 555-109-8765",
  },
];

const chartData = [
  { subject: "Maths", score: 82 },
  { subject: "Science", score: 75 },
  { subject: "English", score: 88 },
  { subject: "History", score: 79 },
  { subject: "Geography", score: 85 },
  { subject: "Physics", score: 71 },
];

const subjectRankings = [
  { subject: "Maths", score: 82, rank: 5, total: 45, trend: "up" },
  { subject: "Science", score: 75, rank: 12, total: 45, trend: "down" },
  { subject: "English", score: 88, rank: 3, total: 45, trend: "up" },
  { subject: "History", score: 79, rank: 8, total: 45, trend: "same" },
  { subject: "Geography", score: 85, rank: 4, total: 45, trend: "up" },
  { subject: "Physics", score: 71, rank: 15, total: 45, trend: "down" },
];

const chartConfig = {
  score: {
    label: "Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function StudentDashboard() {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex gap-6 h-[calc(100vh-10rem)]">
      {/* Student List Table */}
      <Card
        className={`transition-all duration-300 flex flex-col h-full ${
          selectedStudent ? "w-2/5" : "w-full"
        }`}>
        <CardHeader>
          <CardTitle>Students</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for students or ID"
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  {!selectedStudent && <TableHead>Class</TableHead>}
                  <TableHead>Student ID</TableHead>
                  {!selectedStudent && <TableHead>Year</TableHead>}
                  {!selectedStudent && <TableHead>Blood Group</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id
                        ? "bg-slate-100"
                        : "hover:bg-gray-50"
                    }`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={student.photoUrl}
                            alt={student.name}
                          />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{student.name}</p>
                          {selectedStudent && (
                            <p className="text-xs text-gray-500">
                              {student.className}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!selectedStudent && (
                      <TableCell>{student.className}</TableCell>
                    )}
                    <TableCell className="text-gray-600">
                      {student.studentId}
                    </TableCell>
                    {!selectedStudent && (
                      <TableCell className="text-gray-600">
                        {student.year}
                      </TableCell>
                    )}
                    {!selectedStudent && (
                      <TableCell className="text-gray-600">
                        {student.bloodGroup}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Student Detail Panel */}
      {selectedStudent && (
        <Card className="w-3/5 h-full animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden border-0 shadow-lg">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 text-white p-6 relative shrink-0">
              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300">
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-4 border-white/30 ring-4 ring-white/10 shadow-xl">
                  <AvatarImage
                    src={selectedStudent.photoUrl}
                    alt={selectedStudent.name}
                  />
                  <AvatarFallback className="text-xl bg-slate-500">
                    {selectedStudent.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {selectedStudent.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium">
                      {selectedStudent.className}
                    </span>
                    <span className="text-white/70 text-sm">
                      ID: {selectedStudent.studentId}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden p-4 bg-gradient-to-br from-gray-50 to-white">
              <Carousel className="h-full">
                <CarouselContent className="h-full">
                  {/* Performance Tab (Default) */}
                  <CarouselItem>
                    <div className="h-full flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-bold text-gray-800">
                            Performance Overview
                          </h2>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Current semester academic standing
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 flex-1 overflow-hidden">
                        {/* Radar Chart */}
                        <div className="flex items-start justify-center bg-white rounded-xl shadow-sm border border-gray-100 p-4 pt-6">
                          <ChartContainer
                            config={chartConfig}
                            className="aspect-square max-h-[240px] w-full">
                            <RadarChart data={chartData}>
                              <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent />}
                              />
                              <PolarAngleAxis
                                dataKey="subject"
                                className="text-xs"
                              />
                              <PolarGrid />
                              <Radar
                                dataKey="score"
                                fill="var(--color-score)"
                                fillOpacity={0.6}
                                dot={{
                                  r: 4,
                                  fillOpacity: 1,
                                }}
                              />
                            </RadarChart>
                          </ChartContainer>
                        </div>

                        {/* Rankings Table */}
                        <div className="overflow-hidden flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full">
                          <div className="flex items-center justify-between mb-3 shrink-0">
                            <h3 className="text-sm font-bold text-gray-800">
                              Class Rankings
                            </h3>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                              Top 15
                            </span>
                          </div>
                          <div className="flex-1 min-h-0 overflow-auto">
                            <ScrollArea>
                              <div className="space-y-2 pr-2 pb-2">
                                {subjectRankings.map((item, index) => (
                                    <div
                                        key={item.subject}
                                        className="group flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-transparent rounded-lg hover:from-slate-100 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-slate-200">
                                      <div className="flex items-center gap-2 flex-1">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs group-hover:bg-slate-600 group-hover:text-white transition-colors shrink-0">
                                          {index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-xs text-gray-800 truncate">
                                            {item.subject}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                        <span className="font-medium text-slate-700">
                                          {item.score}%
                                        </span>
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 shrink-0">
                                        <div className="text-right">
                                          <p className="text-sm font-bold text-slate-700">
                                            #{item.rank}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            /{item.total}
                                          </p>
                                        </div>
                                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-opacity-10 shrink-0">
                                          {item.trend === "up" && (
                                              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100">
                                                <TrendingUp className="h-3 w-3 text-green-600" />
                                              </div>
                                          )}
                                          {item.trend === "down" && (
                                              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100">
                                                <TrendingDown className="h-3 w-3 text-red-600" />
                                              </div>
                                          )}
                                          {item.trend === "same" && (
                                              <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100">
                                                <Minus className="h-3 w-3 text-gray-400" />
                                              </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                ))}
                              </div>
                              <ScrollBar orientation='vertical'/>
                            </ScrollArea>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Basic Details Tab */}
                  <CarouselItem>
                    <div className="h-full overflow-auto">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">
                            Basic Details
                          </h2>
                          <p className="text-sm text-gray-500 mt-1">
                            Personal information and contacts
                          </p>
                        </div>
                        <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                          <MoreVertical className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>

                      <div className="space-y-5">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                            Student Info
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Gender
                              </p>
                              <p className="font-semibold text-gray-800">
                                {selectedStudent.gender}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Date of Birth
                              </p>
                              <p className="font-semibold text-gray-800">
                                {selectedStudent.dateOfBirth}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Religion
                              </p>
                              <p className="font-semibold text-gray-800">
                                {selectedStudent.religion}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-xs text-gray-500 mb-1 font-medium">
                                Blood Group
                              </p>
                              <p className="font-semibold text-gray-800">
                                {selectedStudent.bloodGroup}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                          <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                            Contact Info
                          </h3>
                          <div className="space-y-4">
                            <div className="p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100">
                              <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-blue-500" />
                                Address
                              </p>
                              <p className="font-medium text-gray-800 text-sm">
                                {selectedStudent.address}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-4 bg-gradient-to-br from-slate-50 to-transparent rounded-lg border border-slate-100">
                                <p className="text-xs text-gray-500 mb-2 font-medium">
                                  Father
                                </p>
                                <p className="font-semibold text-gray-800 mb-2">
                                  {selectedStudent.father}
                                </p>
                                <div className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-md">
                                  <Phone className="h-3 w-3 text-slate-500" />
                                  <p className="text-xs text-gray-700 font-medium">
                                    {selectedStudent.fatherPhone}
                                  </p>
                                </div>
                              </div>
                              <div className="p-4 bg-gradient-to-br from-slate-50 to-transparent rounded-lg border border-slate-100">
                                <p className="text-xs text-gray-500 mb-2 font-medium">
                                  Mother
                                </p>
                                <p className="font-semibold text-gray-800 mb-2">
                                  {selectedStudent.mother}
                                </p>
                                <div className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-md">
                                  <Phone className="h-3 w-3 text-slate-500" />
                                  <p className="text-xs text-gray-700 font-medium">
                                    {selectedStudent.motherPhone}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Attendance Tab */}
                  <CarouselItem>
                    <div className="h-full flex flex-col">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                          Attendance
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Daily attendance records
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-center p-8">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">📅</span>
                          </div>
                          <p className="text-gray-400 font-medium">
                            Attendance data coming soon...
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* Fees History Tab */}
                  <CarouselItem>
                    <div className="h-full flex flex-col">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                          Fees History
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Payment records and dues
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-center p-8">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">💰</span>
                          </div>
                          <p className="text-gray-400 font-medium">
                            Fees history coming soon...
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>

                  {/* School Bus Tab */}
                  <CarouselItem>
                    <div className="h-full flex flex-col">
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                          School Bus
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Transportation details
                        </p>
                      </div>
                      <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-center p-8">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🚌</span>
                          </div>
                          <p className="text-gray-400 font-medium">
                            School bus info coming soon...
                          </p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </Carousel>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
