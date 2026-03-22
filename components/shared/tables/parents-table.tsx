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
  Link,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Guardian, ParentStatus } from "@/types/prisma-enums";

type ExtendedGuardian = Guardian & {
  _count?: {
    studentGuardians?: number;
  };
};

interface ParentsTableProps {
  parents: ExtendedGuardian[];
  onRowClick: (parent: ExtendedGuardian) => void;
  onEdit: (parent: ExtendedGuardian) => void;
  onDelete: (parent: ExtendedGuardian) => void;
  onContact?: (parent: ExtendedGuardian) => void;
  onLinkStudent?: (parent: ExtendedGuardian) => void;
  showActions?: boolean;
}

const getStatusVariant = (status: ParentStatus) => {
  switch (status) {
    case ParentStatus.ACTIVE:
      return "default";
    case ParentStatus.INACTIVE:
      return "secondary";
    case ParentStatus.DECEASED:
      return "destructive";
    default:
      return "outline";
  }
};

export function ParentsTable({
  parents,
  onRowClick,
  onEdit,
  onDelete,
  onContact,
  onLinkStudent,
  showActions = true,
}: ParentsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Parent/Guardian</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Students</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {parents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 5 : 4} className="text-center text-muted-foreground">
                No parents found
              </TableCell>
            </TableRow>
          ) : (
            parents.map((parent) => {
              const fullName = `${parent.firstName} ${parent.lastName}`;
              const initials = `${parent.firstName[0]}${parent.lastName[0]}`;

              return (
                <TableRow
                  key={parent.id}
                  onClick={() => onRowClick(parent)}
                  className="cursor-pointer"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{fullName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{parent.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {parent._count?.studentGuardians || 0}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {parent._count?.studentGuardians === 1 ? "student" : "students"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(parent.status)}>
                      {parent.status}
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
                              onEdit(parent);
                            }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          {onLinkStudent && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onLinkStudent(parent);
                              }}>
                              <Link className="h-4 w-4 mr-2" />
                              Link Student
                            </DropdownMenuItem>
                          )}
                          {onContact && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onContact(parent);
                              }}>
                              <Phone className="h-4 w-4 mr-2" />
                              Contact
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(parent);
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
