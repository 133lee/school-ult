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
  Phone,
  Mail,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TeacherProfile, StaffStatus } from "@/types/prisma-enums";

type TeacherWithRelations = TeacherProfile & {
  departments?: Array<{ department: { name: string; code: string } }>;
  subjects?: Array<{ subject: { id: string; name: string; code: string } }>;
  user?: { email: string } | null;
};

interface TeachersTableProps {
  teachers: TeacherWithRelations[];
  onRowClick: (teacher: TeacherWithRelations) => void;
  onEdit: (teacher: TeacherWithRelations) => void;
  onDelete: (teacher: TeacherWithRelations) => void;
  onContact?: (teacher: TeacherWithRelations) => void;
  showActions?: boolean;
}

const getStatusVariant = (status: StaffStatus) => {
  switch (status) {
    case StaffStatus.ACTIVE:
      return "default";
    case StaffStatus.ON_LEAVE:
      return "outline";
    case StaffStatus.SUSPENDED:
      return "secondary";
    case StaffStatus.TERMINATED:
    case StaffStatus.RETIRED:
      return "destructive";
    default:
      return "outline";
  }
};

export function TeachersTable({
  teachers,
  onRowClick,
  onEdit,
  onDelete,
  onContact,
  showActions = true,
}: TeachersTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Teacher</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 5 : 4} className="text-center text-muted-foreground">
                No teachers found
              </TableCell>
            </TableRow>
          ) : (
            teachers.map((teacher) => {
              const fullName = `${teacher.firstName} ${teacher.lastName}`;
              const initials = `${teacher.firstName[0]}${teacher.lastName[0]}`;
              const subjectsList = teacher.subjects?.map(ts => ts.subject.name) || [];

              return (
                <TableRow
                  key={teacher.id}
                  onClick={() => onRowClick(teacher)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {teacher.staffNumber}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{teacher.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {subjectsList.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">
                            {subjectsList[0]}
                            {subjectsList.length > 1 && (
                              <Badge variant="secondary" className="ml-2">
                                +{subjectsList.length - 1}
                              </Badge>
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          No subjects assigned
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(teacher.status)}>
                      {teacher.status}
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
                              onEdit(teacher);
                            }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {onContact && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onContact(teacher);
                              }}>
                              <Phone className="h-4 w-4 mr-2" />
                              Contact
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(teacher);
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
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
