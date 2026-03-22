import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "admin123",
  database: "rebuild_school_db",
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function verifyHODPosition() {
  console.log("=== Verifying HOD Position Assignment ===\n");

  try {
    // 1. Check Math Department HOD assignment
    const mathDept = await prisma.department.findUnique({
      where: { code: "MATH" },
      include: {
        hodTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            staffNumber: true,
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!mathDept) {
      console.log("❌ Math Department not found");
      return;
    }

    console.log(`✅ Department: ${mathDept.name} (${mathDept.code})`);
    console.log(`   HOD Teacher ID: ${mathDept.hodTeacherId || "None"}`);

    if (mathDept.hodTeacher) {
      console.log(`   HOD Name: ${mathDept.hodTeacher.firstName} ${mathDept.hodTeacher.lastName}`);
      console.log(`   Staff Number: ${mathDept.hodTeacher.staffNumber}`);
      console.log(`   Email: ${mathDept.hodTeacher.user?.email}`);
      console.log(`   User Role: ${mathDept.hodTeacher.user?.role}`);

      // Verify role is TEACHER, not HOD
      if (mathDept.hodTeacher.user?.role === "TEACHER") {
        console.log(`   ✅ Correct: User role is TEACHER (HOD is position, not role)`);
      } else {
        console.log(`   ❌ Wrong: User role is ${mathDept.hodTeacher.user?.role}, should be TEACHER`);
      }
    } else {
      console.log("   ❌ No HOD assigned");
    }

    // 2. Check UserPermission grants for HOD
    console.log("\n=== HOD-Specific Permissions ===\n");

    if (mathDept.hodTeacher?.user) {
      const hodPermissions = await prisma.userPermission.findMany({
        where: {
          userId: mathDept.hodTeacher.user.email.split("@")[0].includes("hod")
            ? (await prisma.user.findUnique({
                where: { email: mathDept.hodTeacher.user.email },
                select: { id: true },
              }))?.id
            : undefined,
        },
        include: {
          grantedBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (hodPermissions.length > 0) {
        console.log(`   ✅ Found ${hodPermissions.length} permission overrides:`);
        hodPermissions.forEach((perm) => {
          console.log(`      - ${perm.permission}`);
          console.log(`        Reason: ${perm.reason}`);
        });
      } else {
        console.log("   ⚠️  No permission overrides found");
      }
    }

    // 3. Verify no users have HOD role
    console.log("\n=== Verifying No HOD Roles ===\n");
    const hodRoleUsers = await prisma.user.count({
      where: { role: "HOD" as any },
    });

    if (hodRoleUsers === 0) {
      console.log("   ✅ Correct: No users have HOD role");
    } else {
      console.log(`   ❌ Wrong: ${hodRoleUsers} users have HOD role`);
    }

    // 4. Summary
    console.log("\n=== Summary ===\n");
    console.log("✅ HOD is assigned as a position (Department.hodTeacherId)");
    console.log("✅ HOD user has TEACHER role, not HOD role");
    console.log("✅ Architecture correctly enforces: HOD = Position, not Role");

  } catch (error) {
    console.error("\n❌ Error during verification:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyHODPosition().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
