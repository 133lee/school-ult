"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserWithPermissions } from "@/hooks/usePermissions";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface UsersListTableProps {
  users: UserWithPermissions[];
  isLoading: boolean;
  onUserSelect: (userId: string) => void;
  selectedUserId: string | null;
  selectedUserIds?: string[];
  onMultiSelect?: (userIds: string[]) => void;
  multiSelectMode?: boolean;
}

// NOTE: HOD is a POSITION (Department.hodTeacherId), not a role
// HOD status is displayed separately if needed, not in role colors/labels
const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  ADMIN: "destructive",
  HEAD_TEACHER: "default",
  DEPUTY_HEAD: "secondary",
  TEACHER: "outline",
  CLERK: "outline",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  HEAD_TEACHER: "Head Teacher",
  DEPUTY_HEAD: "Deputy Head",
  TEACHER: "Teacher",
  CLERK: "Clerk",
};

export function UsersListTable({
  users,
  isLoading,
  onUserSelect,
  selectedUserId,
  selectedUserIds = [],
  onMultiSelect,
  multiSelectMode = false,
}: UsersListTableProps) {
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "??";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatLastLogin = (lastLogin: Date | null) => {
    if (!lastLogin) return "Never";
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleToggleUser = (userId: string) => {
    if (!onMultiSelect) return;

    if (selectedUserIds.includes(userId)) {
      onMultiSelect(selectedUserIds.filter(id => id !== userId));
    } else {
      onMultiSelect([...selectedUserIds, userId]);
    }
  };

  const handleToggleAll = () => {
    if (!onMultiSelect) return;

    if (selectedUserIds.length === users.length) {
      onMultiSelect([]);
    } else {
      onMultiSelect(users.map(u => u.id));
    }
  };

  const allSelected = users.length > 0 && selectedUserIds.length === users.length;
  const someSelected = selectedUserIds.length > 0 && selectedUserIds.length < users.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-muted border-t-primary"></div>
          <p className="text-sm text-muted-foreground mt-3">Loading users...</p>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {multiSelectMode && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleToggleAll}
                  aria-label="Select all users"
                  className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                />
              </TableHead>
            )}
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Login</TableHead>
            <TableHead className="text-right">Overrides</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.id}
              className={cn(
                "cursor-pointer transition-colors",
                !multiSelectMode && selectedUserId === user.id && "bg-muted/50",
                multiSelectMode && selectedUserIds.includes(user.id) && "bg-muted/50"
              )}
              onClick={() => {
                if (multiSelectMode) {
                  handleToggleUser(user.id);
                } else {
                  onUserSelect(user.id);
                }
              }}
            >
              {multiSelectMode && (
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={() => handleToggleUser(user.id)}
                    aria-label={`Select ${user.email}`}
                  />
                </TableCell>
              )}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(user.profile?.firstName, user.profile?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {user.profile
                        ? `${user.profile.firstName} ${user.profile.lastName}`
                        : user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    {user.profile?.staffNumber && (
                      <p className="text-xs text-muted-foreground">
                        {user.profile.staffNumber}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={roleColors[user.role] || "outline"}>
                  {roleLabels[user.role] || user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  {user.isActive ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Inactive</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {formatLastLogin(user.lastLogin)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {user.userPermissions.length > 0 ? (
                  <Badge variant="secondary">{user.userPermissions.length}</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">None</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
