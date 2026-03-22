import prisma from "../lib/db/prisma";

async function testHODValidation() {
  console.log("=== Testing HOD Validation ===\n");

  try {
    const department = await prisma.department.findFirst();
    if (!department) {
      console.log("❌ No departments found");
      return;
    }

    console.log(`Testing with department: ${department.name}\n`);

    // Test 1: Invalid teacher ID
    console.log("1. Test assigning invalid teacher ID:");
    try {
      await prisma.department.update({
        where: { id: department.id },
        data: {
          hodTeacher: {
            connect: { id: "invalid-id-12345" },
          },
        },
      });
      console.log("❌ Should have failed with invalid ID");
    } catch (error) {
      console.log("✅ Correctly rejected invalid teacher ID");
      console.log(`   Error: ${error instanceof Error ? error.message : error}`);
    }

    // Test 2: Valid teacher ID
    console.log("\n2. Test assigning valid teacher ID:");
    const teacher = await prisma.teacherProfile.findFirst({
      where: { status: "ACTIVE" },
    });

    if (!teacher) {
      console.log("⚠️  No active teachers found");
    } else {
      try {
        await prisma.department.update({
          where: { id: department.id },
          data: {
            hodTeacher: {
              connect: { id: teacher.id },
            },
          },
        });
        console.log(`✅ Successfully assigned ${teacher.firstName} ${teacher.lastName} as HOD`);
      } catch (error) {
        console.log("❌ Failed to assign valid teacher");
        console.log(`   Error: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Test 3: Disconnecting HOD
    console.log("\n3. Test removing HOD:");
    try {
      await prisma.department.update({
        where: { id: department.id },
        data: {
          hodTeacher: {
            disconnect: true,
          },
        },
      });
      console.log("✅ Successfully removed HOD");
    } catch (error) {
      console.log("❌ Failed to remove HOD");
      console.log(`   Error: ${error instanceof Error ? error.message : error}`);
    }

    console.log("\n✅ Validation tests complete!");
  } catch (error) {
    console.error("\n❌ Error during testing:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testHODValidation().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
