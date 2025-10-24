"use client";

import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2, Users } from "lucide-react";

interface Class {
  id: string;
  classId: string;
  name: string;
  gradeLevel: string;
  academicYear: string;
  classTeacher: string;
  totalStudents: number;
  capacity: number;
  subjects: string[];
  schedule: string;
  room: string;
  status: "Active" | "Inactive";
}

interface ClassesTableProps {
  classes: Class[];
  onRowClick: (classItem: Class) => void;
  onEdit: (classItem: Class) => void;
  onDelete: (classItem: Class) => void;
  showActions?: boolean;
}

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 border-green-200";
    case "Inactive":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

const getCapacityColor = (current: number, capacity: number) => {
  const percentage = (current / capacity) * 100;
  if (percentage >= 90) return "text-red-600";
  if (percentage >= 75) return "text-yellow-600";
  return "text-green-600";
};

export function ClassesTable({
  classes,
  onRowClick,
  onEdit,
  onDelete,
  showActions = true,
}: ClassesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Class</TableHead>
          <TableHead>Class Teacher</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Status</TableHead>
          {showActions && <TableHead className="w-[50px]">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((classItem) => (
          <TableRow
            key={classItem.id}
            onClick={() => onRowClick(classItem)}
            className="cursor-pointer hover:bg-gray-50 transition-colors">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {classItem.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{classItem.name}</p>
                  <p className="text-xs text-gray-500">{classItem.gradeLevel}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <p className="font-medium text-gray-800">
                  {classItem.classTeacher}
                </p>
                <p className="text-xs text-gray-500">{classItem.academicYear}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-gray-500" />
                <span
                  className={`text-sm font-medium ${getCapacityColor(
                    classItem.totalStudents,
                    classItem.capacity
                  )}`}>
                  {classItem.totalStudents}/{classItem.capacity}
                </span>
              </div>
            </TableCell>
            <TableCell>
              <p className="text-sm">{classItem.room}</p>
            </TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                  classItem.status
                )}`}>
                {classItem.status}
              </span>
            </TableCell>
            {showActions && (
              <TableCell>
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
                        onEdit(classItem);
                      }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(classItem);
                      }}
                      className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
