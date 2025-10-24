"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  studentId: string;
  email: string;
  phone: string;
  year: number;
  photoUrl: string;
  className: string;
  grade: string;
  gender: string;
  dateOfBirth: string;
  religion: string;
  bloodGroup: string;
  address: string;
  father: string;
  fatherPhone: string;
  mother: string;
  motherPhone: string;
  status: "Active" | "Inactive" | "Suspended";
}

interface StudentsTableProps {
  students: Student[];
  onRowClick: (student: Student) => void;
  onEdit: (student: Student) => void;
  onDelete: (student: Student) => void;
  showActions?: boolean;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 border-green-200";
    case "Inactive":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Suspended":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export function StudentsTable({
  students,
  onRowClick,
  onEdit,
  onDelete,
  showActions = true,
}: StudentsTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 z-20 bg-background border-b">
        <tr>
          <th className="p-3 text-left font-semibold text-sm bg-background">Student</th>
          <th className="p-3 text-left font-semibold text-sm bg-background">Gender</th>
          <th className="p-3 text-left font-semibold text-sm bg-background">Academic Info</th>
          <th className="p-3 text-left font-semibold text-sm bg-background">Status</th>
          {showActions && <th className="p-3 text-left font-semibold text-sm bg-background w-[50px]">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {students.map((student, index) => (
          <tr
            key={student.id}
            onClick={() => onRowClick(student)}
            className={`cursor-pointer hover:bg-muted/70 transition-colors ${
              index % 2 === 0 ? "bg-background" : "bg-muted/30"
            }`}>
            <td className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={student.photoUrl} alt={student.name} />
                  <AvatarFallback>
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{student.name}</p>
                  <p className="text-xs text-gray-500">{student.studentId}</p>
                </div>
              </div>
            </td>
            <td className="p-3">
              <span className="text-sm font-medium text-gray-800">
                {student.gender}
              </span>
            </td>
            <td className="p-3">
              <div className="text-sm">
                <p className="font-medium text-gray-800">{student.grade}</p>
                <p className="text-xs text-gray-500">{student.className}</p>
              </div>
            </td>
            <td className="p-3">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                  student.status
                )}`}>
                {student.status}
              </span>
            </td>
            {showActions && (
              <td className="p-3">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(student);
                      }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(student);
                      }}
                      className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
