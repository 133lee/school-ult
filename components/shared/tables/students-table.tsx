"use client";

import React from "react";
import { Student, StudentStatus, Gender } from "@/types/prisma-enums";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreVertical,
  Edit,
  Trash2,
  Check,
  X,
  Heart,
  Link,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Extended type for additional optional fields that might come from relations
type ExtendedStudent = Student & {
  photoUrl?: string;
  className?: string;
  grade?: string;
  vulnerabilityStatus?: string;
  vulnerabilityNotes?: string;
  hasGuardian?: boolean;
};

interface Parent {
  id: string;
  name: string;
  children: string[];
  status: "Active" | "Inactive";
}

interface StudentsTableProps {
  students: ExtendedStudent[];
  parents?: Parent[];
  onRowClick: (student: ExtendedStudent) => void;
  onEdit: (student: ExtendedStudent) => void;
  onDelete: (student: ExtendedStudent) => void;
  onEmergencyContact?: (student: ExtendedStudent) => void;
  onLinkGuardian?: (student: ExtendedStudent) => void;
  showActions?: boolean;
}

const statusVariants: Record<StudentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "default",
  SUSPENDED: "destructive",
  GRADUATED: "outline",
  WITHDRAWN: "secondary",
  TRANSFERRED: "secondary",
  DECEASED: "destructive",
};

export function StudentsTable({
  students,
  parents = [],
  onRowClick,
  onEdit,
  onDelete,
  onEmergencyContact,
  onLinkGuardian,
  showActions = true,
}: StudentsTableProps) {
  // Helper to get student full name
  const getFullName = (student: ExtendedStudent) => {
    const parts = [student.firstName, student.middleName, student.lastName].filter(Boolean);
    return parts.join(" ") || "Unknown";
  };

  // Helper to check if student has guardian
  const checkHasGuardian = (student: ExtendedStudent) => {
    // First check the hasGuardian property if provided
    if (student.hasGuardian !== undefined) {
      return student.hasGuardian;
    }

    // Otherwise check parents array if provided
    const fullName = getFullName(student);
    return parents.some((p) => p.children.includes(fullName));
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Guardian</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 6 : 5} className="text-center text-muted-foreground">
                No students found
              </TableCell>
            </TableRow>
          ) : (
            students.map((student) => (
              <TableRow
                key={student.id}
                onClick={() => onRowClick(student)}
                className="cursor-pointer"
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={student.photoUrl}
                        alt={getFullName(student)}
                      />
                      <AvatarFallback>
                        {student.firstName?.[0]}{student.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm">
                        {getFullName(student)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium">
                    {student.gender === Gender.MALE ? "M" : student.gender === Gender.FEMALE ? "F" : "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p className="font-medium">{student.grade || "N/A"}</p>
                    <p className="text-xs text-muted-foreground">{student.className || "-"}</p>
                  </div>
                </TableCell>
                <TableCell>
                  {checkHasGuardian(student) ? (
                    <Badge variant="default" className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                      <Check className="h-3 w-3 mr-1" />
                      Linked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="h-3 w-3 mr-1" />
                      Not Linked
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariants[student.status]}>
                    {student.status}
                  </Badge>
                </TableCell>
                {showActions && (
                  <TableCell className="text-right">
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
                        {onLinkGuardian && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onLinkGuardian(student);
                            }}>
                            <Link className="h-4 w-4 mr-2" />
                            Link Guardian
                          </DropdownMenuItem>
                        )}
                        {onEmergencyContact && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onEmergencyContact(student);
                            }}>
                            <Heart className="h-4 w-4 mr-2" />
                            Emergency Contact
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(student);
                          }}
                          className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
