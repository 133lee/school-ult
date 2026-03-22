/**
 * Test Script: Direct API Test for Teacher Classes
 *
 * Purpose: Test the service layer directly to verify data flow
 * Run: npx tsx scripts/test-api-teacher-classes.ts <teacherEmail>
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(__dirname, "../.env") });

import prisma from "../lib/db/prisma";
import { teacherClassService } from "../features/teachers/teacher-class.service";

async function testTeacherClassesAPI(teacherEmail: string) {
  console.log("=".repeat(80));
  console.log("DIRECT API SERVICE TEST - TEACHER CLASSES");
  console.log("=".repeat(80));
  console.log(`Teacher Email: ${teacherEmail}`);
  console.log("");

  try {
    // Step 1: Get User ID
    console.log("STEP 1: FIND USER");
    console.log("-".repeat(80));
    const user = await prisma.user.findUnique({
      where: { email: teacherEmail },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      console.log("❌ User not found");
      return;
    }

    console.log(`✅ User found: ${user.id}`);
    console.log("");

    // Step 2: Call Service Method Directly
    console.log("STEP 2: CALL SERVICE METHOD");
    console.log("-".repeat(80));
    console.log(`Calling: teacherClassService.getClassesForTeacher("${user.id}")`);
    console.log("");

    const result = await teacherClassService.getClassesForTeacher(user.id);

    console.log("SERVICE RESPONSE:");
    console.log("-".repeat(80));
    console.log(JSON.stringify(result, null, 2));
    console.log("");

    // Step 3: Analysis
    console.log("ANALYSIS:");
    console.log("-".repeat(80));
    console.log(`Class Teacher Classes Count: ${result.classTeacherClasses.length}`);
    console.log(`Subject Teacher Classes Count: ${result.subjectTeacherClasses.length}`);
    console.log(`All Classes Count: ${result.allClasses.length}`);
    console.log("");

    if (result.classTeacherClasses.length > 0) {
      console.log("Class Teacher Classes:");
      result.classTeacherClasses.forEach((c, idx) => {
        console.log(`  [${idx + 1}] ${c.name} - ${c.teachingSubject}`);
      });
      console.log("");
    }

    if (result.subjectTeacherClasses.length > 0) {
      console.log("Subject Teacher Classes:");
      result.subjectTeacherClasses.forEach((c, idx) => {
        console.log(`  [${idx + 1}] ${c.name} - ${c.teachingSubject}`);
      });
      console.log("");
    }

    if (result.classTeacherClasses.length === 0 && result.subjectTeacherClasses.length === 0) {
      console.log("⚠️  SERVICE RETURNED EMPTY LISTS");
      console.log("   This confirms the bug is in the service layer, not the API route or frontend.");
    } else {
      console.log("✅ SERVICE RETURNED DATA");
      console.log("   If UI shows empty, the bug is in API serialization or frontend parsing.");
    }

    console.log("=".repeat(80));

  } catch (error) {
    console.error("ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
const teacherEmail = process.argv[2];

if (!teacherEmail) {
  console.error("Usage: npx tsx scripts/test-api-teacher-classes.ts <teacher-email>");
  process.exit(1);
}

testTeacherClassesAPI(teacherEmail)
  .catch((error) => {
    console.error("Error running test:", error);
    process.exit(1);
  });
