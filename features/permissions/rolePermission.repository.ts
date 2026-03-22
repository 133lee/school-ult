import prisma from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";
import { RolePermission, Role, Permission } from "@/types/prisma-enums";

/**
 * RolePermission Repository - Data Access Layer
 *
 * Manages role-based permissions.
 * No business logic - pure data access.
 */
export class RolePermissionRepository {
  /**
   * Create a new role permission
   */
  async create(data: Prisma.RolePermissionCreateInput): Promise<RolePermission> {
    try {
      return await prisma.rolePermission.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new Error("Permission already assigned to this role");
        }
      }
      throw error;
    }
  }

  /**
   * Create role permission within transaction
   */
  async createInTransaction(
    tx: Prisma.TransactionClient,
    data: Prisma.RolePermissionCreateInput
  ): Promise<RolePermission> {
    return tx.rolePermission.create({ data });
  }

  /**
   * Find role permission by ID
   */
  async findById(id: string): Promise<RolePermission | null> {
    return prisma.rolePermission.findUnique({
      where: { id },
    });
  }

  /**
   * Find all role permissions
   */
  async findAll(): Promise<RolePermission[]> {
    return prisma.rolePermission.findMany({
      orderBy: [
        { role: "asc" },
        { permission: "asc" },
      ],
    });
  }

  /**
   * Find permissions by role
   */
  async findByRole(role: Role): Promise<RolePermission[]> {
    return prisma.rolePermission.findMany({
      where: { role },
      orderBy: { permission: "asc" },
    });
  }

  /**
   * Find roles by permission
   */
  async findByPermission(permission: Permission): Promise<RolePermission[]> {
    return prisma.rolePermission.findMany({
      where: { permission },
      orderBy: { role: "asc" },
    });
  }

  /**
   * Find by role and permission (unique)
   */
  async findByRoleAndPermission(
    role: Role,
    permission: Permission
  ): Promise<RolePermission | null> {
    return prisma.rolePermission.findUnique({
      where: {
        role_permission: {
          role,
          permission,
        },
      },
    });
  }

  /**
   * Check if role has permission
   */
  async hasPermission(role: Role, permission: Permission): Promise<boolean> {
    const result = await this.findByRoleAndPermission(role, permission);
    return result !== null;
  }

  /**
   * Get all permissions for a role
   */
  async getPermissions(role: Role): Promise<Permission[]> {
    const rolePermissions = await this.findByRole(role);
    return rolePermissions.map(rp => rp.permission);
  }

  /**
   * Find many with filters
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.RolePermissionWhereInput;
    orderBy?: Prisma.RolePermissionOrderByWithRelationInput;
  }) {
    const { skip = 0, take = 50, where, orderBy } = params;

    return prisma.rolePermission.findMany({
      skip,
      take: Math.min(take, 100),
      where,
      orderBy: orderBy || [
        { role: "asc" },
        { permission: "asc" },
      ],
    });
  }

  /**
   * Count role permissions
   */
  async count(where?: Prisma.RolePermissionWhereInput): Promise<number> {
    return prisma.rolePermission.count({ where });
  }

  /**
   * Delete role permission
   */
  async delete(id: string): Promise<RolePermission> {
    try {
      return await prisma.rolePermission.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Role permission not found");
        }
      }
      throw error;
    }
  }

  /**
   * Delete by role and permission
   */
  async deleteByRoleAndPermission(
    role: Role,
    permission: Permission
  ): Promise<RolePermission> {
    try {
      return await prisma.rolePermission.delete({
        where: {
          role_permission: {
            role,
            permission,
          },
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          throw new Error("Role permission not found");
        }
      }
      throw error;
    }
  }

  /**
   * Bulk create role permissions
   */
  async bulkCreate(
    data: Prisma.RolePermissionCreateManyInput[]
  ): Promise<Prisma.BatchPayload> {
    return prisma.rolePermission.createMany({
      data,
      skipDuplicates: true,
    });
  }

  /**
   * Delete all permissions for a role
   */
  async deleteByRole(role: Role): Promise<Prisma.BatchPayload> {
    return prisma.rolePermission.deleteMany({
      where: { role },
    });
  }

  /**
   * Transaction wrapper
   */
  async withTransaction<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>
  ): Promise<T> {
    return prisma.$transaction(fn);
  }
}

// Singleton instance
export const rolePermissionRepository = new RolePermissionRepository();
