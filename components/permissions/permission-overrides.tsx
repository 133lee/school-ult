"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePermissions, UserWithPermissions } from "@/hooks/usePermissions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Trash2, Calendar, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface PermissionOverridesProps {
  user: UserWithPermissions;
  users?: UserWithPermissions[];
  onUpdate: () => void;
}

// All available permissions organized by category with readable labels
// These codes MUST match the Prisma Permission enum values exactly
const PERMISSION_CATEGORIES = [
  {
    name: "Student Management",
    permissions: [
      { code: "CREATE_STUDENT", label: "Create Students" },
      { code: "READ_STUDENT", label: "View Students" },
      { code: "UPDATE_STUDENT", label: "Edit Student Records" },
      { code: "DELETE_STUDENT", label: "Delete Students" },
    ],
  },
  {
    name: "Teacher Management",
    permissions: [
      { code: "CREATE_TEACHER", label: "Create Teachers" },
      { code: "READ_TEACHER", label: "View Teachers" },
      { code: "UPDATE_TEACHER", label: "Edit Teacher Records" },
      { code: "DELETE_TEACHER", label: "Delete Teachers" },
    ],
  },
  {
    name: "Class Management",
    permissions: [
      { code: "CREATE_CLASS", label: "Create Classes" },
      { code: "READ_CLASS", label: "View Classes" },
      { code: "UPDATE_CLASS", label: "Edit Classes" },
      { code: "DELETE_CLASS", label: "Delete Classes" },
    ],
  },
  {
    name: "Assessment Management",
    permissions: [
      { code: "CREATE_ASSESSMENT", label: "Create Assessments" },
      { code: "READ_ASSESSMENT", label: "View Assessments" },
      { code: "UPDATE_ASSESSMENT", label: "Edit Assessments" },
      { code: "DELETE_ASSESSMENT", label: "Delete Assessments" },
      { code: "ENTER_RESULTS", label: "Enter Assessment Results" },
    ],
  },
  {
    name: "Attendance",
    permissions: [
      { code: "MARK_ATTENDANCE", label: "Mark Attendance" },
      { code: "VIEW_ATTENDANCE", label: "View Attendance Records" },
    ],
  },
  {
    name: "Reports",
    permissions: [
      { code: "VIEW_REPORTS", label: "View Reports" },
      { code: "GENERATE_REPORTS", label: "Generate Reports" },
    ],
  },
  {
    name: "System Administration",
    permissions: [
      { code: "MANAGE_ROLES", label: "Manage User Roles" },
      { code: "MANAGE_PERMISSIONS", label: "Manage Permissions" },
      { code: "MANAGE_ACADEMIC_YEAR", label: "Manage Academic Years" },
      { code: "MANAGE_TERMS", label: "Manage Terms" },
      { code: "MANAGE_TIMETABLE", label: "Manage Timetables" },
      { code: "APPROVE_PROMOTION", label: "Approve Student Promotions" },
    ],
  },
];

export function PermissionOverrides({
  user,
  users,
  onUpdate,
}: PermissionOverridesProps) {
  const { toast } = useToast();
  const { addPermissionOverride, removePermissionOverride } = usePermissions();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const isBulkMode = users && users.length > 1;
  const targetUsers = users || [user];

  // Get all existing permission codes for the user
  const existingPermissions = user.userPermissions.map(
    (p) => p.permission
  );

  const handleTogglePermission = (permissionCode: string) => {
    if (existingPermissions.includes(permissionCode)) {
      // Don't allow selecting already granted permissions
      return;
    }

    setSelectedPermissions((prev) =>
      prev.includes(permissionCode)
        ? prev.filter((p) => p !== permissionCode)
        : [...prev, permissionCode]
    );
  };

  const handleSelectAll = () => {
    const allAvailable = PERMISSION_CATEGORIES.flatMap((cat) =>
      cat.permissions.map((p) => p.code)
    ).filter((code) => !existingPermissions.includes(code));

    if (selectedPermissions.length === allAvailable.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions(allAvailable);
    }
  };

  const handleClearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSaveOverrides = async () => {
    if (selectedPermissions.length === 0) {
      toast({
        title: "No Permissions Selected",
        description: "Please select at least one permission to grant",
        variant: "destructive",
      });
      return;
    }

    if (!reason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for granting these permissions",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      for (const targetUser of targetUsers) {
        for (const permission of selectedPermissions) {
          await addPermissionOverride(
            targetUser.id,
            permission,
            expiryDate ? new Date(expiryDate) : null,
            reason
          );
        }
      }

      const totalGrants = selectedPermissions.length * targetUsers.length;

      toast({
        title: "Overrides Saved",
        description: isBulkMode
          ? `Successfully granted ${selectedPermissions.length} permission(s) to ${targetUsers.length} user(s) (${totalGrants} total grants)`
          : `Successfully granted ${selectedPermissions.length} permission override(s)`,
      });

      // Reset form
      setSelectedPermissions([]);
      setReason("");
      setExpiryDate("");
      onUpdate();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save overrides",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveOverride = async (permission: string) => {
    try {
      setIsRemoving(permission);
      await removePermissionOverride(user.id, permission);

      toast({
        title: "Override Removed",
        description: "Permission override has been removed",
      });

      onUpdate();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to remove override",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  const allAvailableCount = PERMISSION_CATEGORIES.flatMap((cat) =>
    cat.permissions.map((p) => p.code)
  ).filter((code) => !existingPermissions.includes(code)).length;

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Grant New Permissions Column */}
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="shrink-0">
          <h3 className="text-lg font-semibold">Grant New Permissions</h3>
          <p className="text-sm text-muted-foreground">
            {isBulkMode
              ? `Granting permissions to ${targetUsers.length} user(s)`
              : "Select permissions to grant to this user"}
          </p>
        </div>
        {/* Bulk Users Display */}
        {isBulkMode && (
          <div className="bg-muted/50 p-3 rounded-lg border shrink-0">
            <div className="flex flex-wrap gap-2">
              {targetUsers.map((u) => (
                <Badge key={u.id} variant="secondary">
                  {u.profile
                    ? `${u.profile.firstName} ${u.profile.lastName}`
                    : u.email}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Selection Controls */}
        <div className="flex items-center justify-between shrink-0">
          <div className="text-sm text-muted-foreground">
            {selectedPermissions.length} of {allAvailableCount} selected
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={allAvailableCount === 0}>
              {selectedPermissions.length === allAvailableCount
                ? "Deselect All"
                : "Select All"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={selectedPermissions.length === 0}>
              Clear
            </Button>
          </div>
        </div>

        {/* Permissions List */}
        <div className="border rounded-lg overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <div className="p-1">
              {PERMISSION_CATEGORIES.map((category) => (
                <div key={category.name} className="mb-4">
                  {/* Category Header */}
                  <div className="px-3 py-2 bg-gray-500 rounded-md mb-1">
                    <h4 className="font-semibold text-sm">{category.name}</h4>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-1">
                    {category.permissions.map((permission) => {
                      const isGranted = existingPermissions.includes(
                        permission.code
                      );
                      const isSelected = selectedPermissions.includes(
                        permission.code
                      );

                      return (
                        <div
                          key={permission.code}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-md transition-colors",
                            isGranted
                              ? "opacity-50 cursor-not-allowed"
                              : "cursor-pointer hover:bg-accent",
                            isSelected && "bg-accent"
                          )}
                          onClick={() =>
                            !isGranted &&
                            handleTogglePermission(permission.code)
                          }>
                          <Checkbox
                            checked={isGranted || isSelected}
                            disabled={isGranted}
                            onCheckedChange={() =>
                              !isGranted &&
                              handleTogglePermission(permission.code)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                isGranted &&
                                  "line-through text-muted-foreground"
                              )}>
                              {permission.label}
                            </p>
                          </div>
                          {isGranted && (
                            <Badge
                              variant="secondary"
                              className="text-xs shrink-0">
                              Granted
                            </Badge>
                          )}
                          {isSelected && !isGranted && (
                            <Check className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reason and Expiry */}
        <div className="space-y-3 pt-2 border-t shrink-0">
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Provide a reason for granting these permissions..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Expiry Date (Optional)
            </Label>
            <Input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveOverrides}
          disabled={selectedPermissions.length === 0 || isSubmitting}
          className="w-full shrink-0">
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            `Save Overrides (${selectedPermissions.length})`
          )}
        </Button>
      </div>

      {/* Current Overrides Column */}
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Current Overrides</h3>
          <p className="text-sm text-muted-foreground">
            Active permission overrides for{" "}
            {user.profile
              ? `${user.profile.firstName} ${user.profile.lastName}`
              : user.email}
          </p>
        </div>

        {/* Overrides List */}
        <div className="max-h-96 overflow-y-auto">
          {user.userPermissions.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                No permission overrides
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {user.userPermissions.map((userPermission) => (
                <div
                  key={userPermission.id}
                  className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {userPermission.permission}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Permission override
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOverride(userPermission.permission)}
                      disabled={isRemoving === userPermission.permission}>
                      {isRemoving === userPermission.permission ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </div>

                  {userPermission.reason && (
                    <div className="text-xs bg-muted/50 p-2 rounded">
                      <span className="font-medium">Reason:</span>{" "}
                      {userPermission.reason}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      Granted:{" "}
                      {new Date(userPermission.createdAt).toLocaleDateString()}
                    </span>
                    {userPermission.expiresAt && (
                      <Badge
                        variant={
                          new Date(userPermission.expiresAt) < new Date()
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs">
                        Expires:{" "}
                        {new Date(
                          userPermission.expiresAt
                        ).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
