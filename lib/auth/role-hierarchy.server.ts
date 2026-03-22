/**
 * Server-Only Role Hierarchy Functions
 *
 * Functions that require database access and can only run on the server.
 * Do NOT import this file in client components.
 */

import { Role } from '@/types/prisma-enums';
import prisma from '@/lib/db/prisma';
import { hasRoleAuthority } from './role-hierarchy';

/**
 * Check if a user's role meets the minimum required role
 *
 * ⚠️ SERVER ONLY - Requires database access
 *
 * @example
 * // User is HOD, checking if they can perform TEACHER action
 * await userHasMinimumRole('user123', 'TEACHER') // true
 *
 * // User is TEACHER, checking if they can perform HOD action
 * await userHasMinimumRole('user123', 'HOD') // false
 */
export async function userHasMinimumRole(
  userId: string,
  minimumRole: Role
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user) return false;

  return hasRoleAuthority(user.role, minimumRole);
}
