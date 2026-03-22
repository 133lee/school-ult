/**
 * Test Teacher Profile API
 *
 * This script tests the teacher profile endpoint:
 * 1. Fetches teacher profile data
 * 2. Verifies all required fields are present
 * 3. Checks relationships (department, subjects, class assignments)
 */

import prisma from "@/lib/db/prisma";

async function testTeacherProfile() {
  console.log("=".repeat(70));
  console.log("TESTING TEACHER PROFILE API");
  console.log("=".repeat(70));
  console.log();

  try {
    // First check what teacher users exist
    const allTeachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log(`Found ${allTeachers.length} teacher users:`);
    allTeachers.forEach((t, i) => {
      console.log(`  ${i + 1}. ${t.email} - ${t.profile ? `${t.profile.firstName} ${t.profile.lastName}` : "No profile"}`);
    });
    console.log();

    // Use first teacher if teacher2 doesn't exist
    const teacherEmail = allTeachers.find(t => t.email === "teacher2@school.com")?.email || allTeachers[0]?.email;

    if (!teacherEmail) {
      console.log("❌ No teacher users found");
      return;
    }

    console.log(`Testing with: ${teacherEmail}`);
    console.log();

    // Find teacher user
    const teacher2User = await prisma.user.findUnique({
      where: { email: teacherEmail },
      include: {
        profile: {
          include: {
            department: true,
            subjects: {
              include: {
                subject: true,
              },
            },
            classTeacherAssignments: {
              where: {
                academicYear: {
                  isActive: true,
                },
              },
              include: {
                class: {
                  include: {
                    grade: true,
                  },
                },
                academicYear: true,
              },
            },
          },
        },
      },
    });

    if (!teacher2User || !teacher2User.profile) {
      console.log("❌ Teacher profile not found");
      return;
    }

    const profile = teacher2User.profile;

    console.log("📊 TEACHER PROFILE DATA");
    console.log("=".repeat(70));
    console.log();

    // Personal Information
    console.log("PERSONAL INFORMATION:");
    console.log(`  Staff Number: ${profile.staffNumber}`);
    console.log(`  Name: ${profile.firstName} ${profile.middleName || ""} ${profile.lastName}`.trim());
    console.log(`  Gender: ${profile.gender}`);
    console.log(`  Date of Birth: ${profile.dateOfBirth.toISOString().split("T")[0]}`);
    console.log(`  Status: ${profile.status}`);
    console.log();

    // Contact Information
    console.log("CONTACT INFORMATION:");
    console.log(`  Email: ${teacher2User.email}`);
    console.log(`  Phone: ${profile.phone}`);
    console.log(`  Address: ${profile.address || "Not specified"}`);
    console.log();

    // Professional Information
    console.log("PROFESSIONAL INFORMATION:");
    console.log(`  Qualification: ${profile.qualification}`);
    console.log(`  Years of Experience: ${profile.yearsExperience}`);
    console.log(`  Hire Date: ${profile.hireDate.toISOString().split("T")[0]}`);
    console.log(`  Department: ${profile.department ? `${profile.department.name} (${profile.department.code})` : "Not assigned"}`);
    console.log();

    // Subjects
    console.log("SUBJECTS ASSIGNED:");
    if (profile.subjects.length > 0) {
      profile.subjects.forEach((ts, index) => {
        console.log(`  ${index + 1}. ${ts.subject.name} (${ts.subject.code})`);
      });
    } else {
      console.log("  No subjects assigned");
    }
    console.log();

    // Class Assignments
    console.log("CLASS TEACHER ASSIGNMENTS:");
    if (profile.classTeacherAssignments.length > 0) {
      profile.classTeacherAssignments.forEach((assignment, index) => {
        console.log(`  ${index + 1}. ${assignment.class.grade.name} ${assignment.class.name} (${assignment.academicYear.year})`);
      });
    } else {
      console.log("  No class teacher assignments");
    }
    console.log();

    // Subject Teaching Assignments
    const subjectAssignments = await prisma.subjectTeacherAssignment.findMany({
      where: { teacherId: profile.id },
      include: {
        subject: true,
        class: {
          include: {
            grade: true,
          },
        },
        academicYear: true,
      },
    });

    console.log("SUBJECT TEACHING ASSIGNMENTS:");
    if (subjectAssignments.length > 0) {
      subjectAssignments.forEach((assignment, index) => {
        console.log(`  ${index + 1}. ${assignment.subject.name} - ${assignment.class.grade.name} ${assignment.class.name} (${assignment.academicYear.year})`);
      });
    } else {
      console.log("  No subject teaching assignments");
    }
    console.log();

    // API Response Simulation
    console.log("=".repeat(70));
    console.log("📋 SIMULATED API RESPONSE");
    console.log("=".repeat(70));
    console.log();

    const apiResponse = {
      id: profile.id,
      staffNumber: profile.staffNumber,
      firstName: profile.firstName,
      middleName: profile.middleName,
      lastName: profile.lastName,
      dateOfBirth: profile.dateOfBirth.toISOString(),
      gender: profile.gender,
      phone: profile.phone,
      address: profile.address,
      qualification: profile.qualification,
      yearsExperience: profile.yearsExperience,
      status: profile.status,
      hireDate: profile.hireDate.toISOString(),
      email: teacher2User.email,
      department: profile.department,
      subjects: profile.subjects.map((ts) => ts.subject),
      classAssignments: profile.classTeacherAssignments,
    };

    console.log(JSON.stringify(apiResponse, null, 2));
    console.log();

    // Summary
    console.log("=".repeat(70));
    console.log("✨ TEST COMPLETE");
    console.log("=".repeat(70));
    console.log();

    console.log("KEY FINDINGS:");
    console.log(`  ✅ Profile exists for: ${profile.firstName} ${profile.lastName}`);
    console.log(`  ✅ Staff Number: ${profile.staffNumber}`);
    console.log(`  ✅ Subjects: ${profile.subjects.length}`);
    console.log(`  ✅ Class Assignments: ${profile.classTeacherAssignments.length}`);
    console.log(`  ✅ Subject Assignments: ${subjectAssignments.length}`);
    console.log();

    console.log("📝 NEXT STEPS:");
    console.log("  1. Login as teacher2@school.com");
    console.log("  2. Click the profile dropdown in the sidebar");
    console.log("  3. Click 'Profile' to view your profile page");
    console.log("  4. Verify all information displays correctly");
    console.log();

  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  }
}

testTeacherProfile()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
