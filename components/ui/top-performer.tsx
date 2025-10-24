"use client";

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, X, Phone, MapPin, MoreVertical } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
        motherPhone: "+1 555-987-6543"
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
        motherPhone: "+1 555-876-5432"
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
        motherPhone: "+1 555-765-4321"
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
        motherPhone: "+1 555-654-3210"
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
        motherPhone: "+1 660-687-7027"
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
        motherPhone: "+1 555-543-2109"
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
        motherPhone: "+1 555-432-1098"
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
        motherPhone: "+1 555-321-0987"
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
        motherPhone: "+1 555-210-9876"
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
        motherPhone: "+1 555-109-8765"
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

const chartConfig = {
    score: {
        label: "Score",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export default function StudentDashboard() {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex gap-6 h-full">
            {/* Student List Table */}
            <Card className={`transition-all duration-300 ${selectedStudent ? 'w-2/5' : 'w-full'}`}>
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
                <CardContent>
                    <ScrollArea className="h-[calc(100vh-200px)]">
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
                                                ? 'bg-slate-100'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={student.photoUrl} alt={student.name} />
                                                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium text-sm">{student.name}</p>
                                                    {selectedStudent && (
                                                        <p className="text-xs text-gray-500">{student.className}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        {!selectedStudent && <TableCell>{student.className}</TableCell>}
                                        <TableCell className="text-gray-600">{student.studentId}</TableCell>
                                        {!selectedStudent && <TableCell className="text-gray-600">{student.year}</TableCell>}
                                        {!selectedStudent && <TableCell className="text-gray-600">{student.bloodGroup}</TableCell>}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </CardContent>
            </Card>

            {/* Student Detail Panel */}
            {selectedStudent && (
                <Card className="w-3/5 animate-in slide-in-from-right duration-300">
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white p-6 rounded-t-lg relative">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-6">
                                <Avatar className="h-20 w-20 border-4 border-white/20">
                                    <AvatarImage src={selectedStudent.photoUrl} alt={selectedStudent.name} />
                                    <AvatarFallback className="text-xl">
                                        {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h1 className="text-2xl font-bold">{selectedStudent.name}</h1>
                                    <p className="text-white/80 mt-1">
                                        {selectedStudent.className} | Student ID: {selectedStudent.studentId}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* Basic Details */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-semibold text-gray-800">Basic Details</h2>
                                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                                            <MoreVertical className="h-5 w-5 text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Gender</p>
                                            <p className="font-medium text-gray-800">{selectedStudent.gender}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Date of Birth</p>
                                            <p className="font-medium text-gray-800">{selectedStudent.dateOfBirth}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Religion</p>
                                            <p className="font-medium text-gray-800">{selectedStudent.religion}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Blood Group</p>
                                            <p className="font-medium text-gray-800">{selectedStudent.bloodGroup}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 mt-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Address</p>
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                                <p className="font-medium text-gray-800 text-sm">{selectedStudent.address}</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Father</p>
                                                <p className="font-medium text-gray-800">{selectedStudent.father}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                    <p className="text-sm text-gray-600">{selectedStudent.fatherPhone}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">Mother</p>
                                                <p className="font-medium text-gray-800">{selectedStudent.mother}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Phone className="h-3 w-3 text-gray-400" />
                                                    <p className="text-sm text-gray-600">{selectedStudent.motherPhone}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="border-t pt-6">
                                    <div className="flex gap-6 border-b mb-6">
                                        <button className="pb-3 px-1 border-b-2 border-slate-700 font-medium text-slate-700 text-sm">
                                            Progress
                                        </button>
                                        <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 text-sm">
                                            Attendance
                                        </button>
                                        <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 text-sm">
                                            Fees History
                                        </button>
                                        <button className="pb-3 px-1 text-gray-500 hover:text-gray-700 text-sm">
                                            School Bus
                                        </button>
                                    </div>

                                    {/* Radar Chart for Subject Scores */}
                                    <Card>
                                        <CardHeader className="items-center pb-4">
                                            <CardTitle>Subject Performance</CardTitle>
                                            <CardDescription>
                                                Current semester performance across all subjects
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-0">
                                            <ChartContainer
                                                config={chartConfig}
                                                className="mx-auto aspect-square max-h-[300px]"
                                            >
                                                <RadarChart data={chartData}>
                                                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                                                    <PolarAngleAxis dataKey="subject" />
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
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                </Card>
            )}
        </div>
    );
}