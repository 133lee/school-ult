import { useState, useEffect, useCallback } from "react";

export interface PermissionsFilters {
  search?: string;
  role?: string;
  status?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface UserWithPermissions {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
  profile?: {
    id: string;
    firstName: string;
    lastName: string;
    staffNumber: string;
  } | null;
  userPermissions: Array<{
    id: string;
    permission: string;
    expiresAt: Date | null;
    reason: string | null;
    grantedBy: {
      firstName: string;
      lastName: string;
    } | null;
    createdAt: Date;
  }>;
}

export function usePermissions(
  filters?: PermissionsFilters,
  pagination?: PaginationParams
) {
  const [users, setUsers] = useState<UserWithPermissions[]>([]);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (pagination?.page) params.append("page", pagination.page.toString());
      if (pagination?.pageSize)
        params.append("pageSize", pagination.pageSize.toString());

      const response = await fetch(`/api/permissions/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.data);
      setMeta(data.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [filters?.search, filters?.role, filters?.status, pagination?.page, pagination?.pageSize]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/permissions/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update role");
      }

      await fetchUsers();
      return data.data;
    } catch (err) {
      throw err;
    }
  };

  const addPermissionOverride = async (
    userId: string,
    permission: string,
    expiresAt: Date | null,
    reason: string
  ) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/permissions/users/${userId}/overrides`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permission, expiresAt, reason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add permission override");
      }

      await fetchUsers();
      return data.data;
    } catch (err) {
      throw err;
    }
  };

  const removePermissionOverride = async (userId: string, permission: string) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `/api/permissions/users/${userId}/overrides/${permission}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove permission override");
      }

      await fetchUsers();
      return data.data;
    } catch (err) {
      throw err;
    }
  };

  return {
    users,
    meta,
    isLoading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    addPermissionOverride,
    removePermissionOverride,
  };
}
