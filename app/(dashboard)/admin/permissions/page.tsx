"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { UsersListTable } from "@/components/permissions/users-list-table";
import { RoleAssignment } from "@/components/permissions/role-assignment";
import { PermissionOverrides } from "@/components/permissions/permission-overrides";
import { AuditLog } from "@/components/permissions/audit-log";
import { usePermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";

export default function PermissionsManagement() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const { users, meta, isLoading, refetch } = usePermissions(
    { search: search || undefined },
    { page, pageSize }
  );

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "User permissions have been refreshed",
    });
  };

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleToggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedUserIds([]);
    setSelectedUserId(null);
  };

  const handlePageChange = (newPage: number) => {
    if (meta && newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    if (!meta) return pages;

    const totalPages = meta.totalPages;
    const currentPage = meta.page;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "ellipsis",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "ellipsis",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "ellipsis",
          totalPages
        );
      }
    }

    return pages;
  };

  const selectedUser = users?.find((u) => u.id === selectedUserId);
  const selectedUsers = users?.filter((u) => selectedUserIds.includes(u.id)) || [];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Permissions Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user roles, permissions, and access control
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={bulkMode ? "default" : "outline"}
            size="sm"
            onClick={handleToggleBulkMode}
          >
            <UserCheck className="h-4 w-4 mr-2" />
            {bulkMode ? `Bulk Mode (${selectedUserIds.length} selected)` : "Bulk Assign"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Card className="flex flex-col max-h-[calc(100vh-16rem)]">
        <CardContent className="p-6 flex flex-col flex-1 min-h-0">
          <Tabs defaultValue="users" className="flex flex-col flex-1 min-h-0">
            {/* Tabs Header with Search */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="role-assignment" disabled={bulkMode || !selectedUserId}>
                  Role Assignment
                </TabsTrigger>
                <TabsTrigger value="overrides" disabled={bulkMode ? selectedUserIds.length === 0 : !selectedUserId}>
                  Permission Overrides {bulkMode && selectedUserIds.length > 0 && `(${selectedUserIds.length})`}
                </TabsTrigger>
                <TabsTrigger value="audit">Audit Log</TabsTrigger>
              </TabsList>

              {/* Search */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Users List Tab */}
            <TabsContent value="users" className="m-0 flex-1 overflow-auto">
              <UsersListTable
                users={users || []}
                isLoading={isLoading}
                onUserSelect={handleUserSelect}
                selectedUserId={selectedUserId}
                multiSelectMode={bulkMode}
                selectedUserIds={selectedUserIds}
                onMultiSelect={setSelectedUserIds}
              />
            </TabsContent>

            {/* Role Assignment Tab */}
            <TabsContent value="role-assignment" className="m-0 flex-1 overflow-auto">
              {selectedUser && (
                <RoleAssignment user={selectedUser} onUpdate={refetch} />
              )}
            </TabsContent>

            {/* Permission Overrides Tab */}
            <TabsContent value="overrides" className="m-0 flex-1 overflow-auto">
              {bulkMode && selectedUsers.length > 0 ? (
                <PermissionOverrides user={selectedUsers[0]} users={selectedUsers} onUpdate={refetch} />
              ) : (
                selectedUser && (
                  <PermissionOverrides user={selectedUser} onUpdate={refetch} />
                )
              )}
            </TabsContent>

            {/* Audit Log Tab */}
            <TabsContent value="audit" className="m-0 flex-1 overflow-auto">
              <AuditLog />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Pagination */}
      {!isLoading && users && users.length > 0 && meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((meta.page - 1) * pageSize) + 1} to {Math.min(meta.page * pageSize, meta.total)} of {meta.total} users
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(page - 1)}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {getPageNumbers().map((pageNum, index) =>
                pageNum === "ellipsis" ? (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum as number)}
                      isActive={pageNum === page}
                      className="cursor-pointer">
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(page + 1)}
                  className={
                    page === meta.totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
