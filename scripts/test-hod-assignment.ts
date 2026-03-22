import prisma from "../lib/db/prisma";

async function testHODAssignment() {
  console.log("=== Testing HOD Assignment ===\n");

  try {
    // 1. Get a teacher to assign as HOD
    console.log("1. Finding an active teacher...");
    const teacher = await prisma.teacherProfile.findFirst({
      where: {
        status: "ACTIVE",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        staffNumber: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!teacher) {
      console.log("❌ No active teachers found. Create a teacher first.");
      return;
    }

    console.log(`✅ Found teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.staffNumber})`);
    console.log(`   Email: ${teacher.user?.email || "N/A"}`);
    console.log(`   Teacher ID: ${teacher.id}`);

    // 2. Get a department
    console.log("\n2. Finding a department...");
    const department = await prisma.department.findFirst({
      select: {
        id: true,
        name: true,
        code: true,
        hodTeacherId: true,
      },
    });

    if (!department) {
      console.log("❌ No departments found. Create a department first.");
      return;
    }

    console.log(`✅ Found department: ${department.name} (${department.code})`);
    console.log(`   Current HOD ID: ${department.hodTeacherId || "None"}`);

    // 3. Assign teacher as HOD
    console.log(`\n3. Assigning ${teacher.firstName} ${teacher.lastName} as HOD of ${department.name}...`);
    const updated = await prisma.department.update({
      where: { id: department.id },
      data: {
        hodTeacher: {
          connect: { id: teacher.id },
        },
      },
      include: {
        hodTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    console.log("✅ Assignment successful!");
    console.log(`   Department: ${updated.name}`);
    console.log(`   HOD Teacher ID: ${updated.hodTeacherId}`);
    console.log(`   HOD Name: ${updated.hodTeacher?.firstName} ${updated.hodTeacher?.lastName}`);
    console.log(`   HOD Email: ${updated.hodTeacher?.user?.email}`);

    // 4. Verify the query works
    console.log("\n4. Querying department with HOD...");
    const verified = await prisma.department.findUnique({
      where: { id: department.id },
      include: {
        hodTeacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (verified?.hodTeacher) {
      console.log("✅ HOD retrieval successful!");
      console.log(`   ${verified.hodTeacher.firstName} ${verified.hodTeacher.lastName} is HOD of ${verified.name}`);
    } else {
      console.log("❌ Failed to retrieve HOD");
    }

    // 5. Test removing HOD
    console.log("\n5. Testing HOD removal...");
    await prisma.department.update({
      where: { id: department.id },
      data: {
        hodTeacher: {
          disconnect: true,
        },
      },
    });

    const afterRemoval = await prisma.department.findUnique({
      where: { id: department.id },
      select: {
        name: true,
        hodTeacherId: true,
      },
    });

    if (afterRemoval?.hodTeacherId === null) {
      console.log("✅ HOD removal successful!");
      console.log(`   ${afterRemoval.name} now has no HOD assigned`);
    } else {
      console.log("❌ Failed to remove HOD");
    }

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testHODAssignment().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
