import prisma from "../lib/db/prisma";
import { classService } from "../features/classes/class.service";

/**
 * Test script to verify Classes page UI-API-DB data flow
 * Checks:
 * 1. Database has class data with all required relations
 * 2. Service layer returns data correctly
 * 3. All expected fields are populated
 * 4. Relations (grade, students, teachers, subjects) are accessible
 */

async function testClassesDataFlow() {
  console.log("\n" + "=".repeat(70));
  console.log("🔍 TESTING CLASSES PAGE DATA FLOW");
  console.log("=".repeat(70) + "\n");

  try {
    // ===========================================
    // TEST 1: Check Database Level
    // ===========================================
    console.log("📊 TEST 1: Database Level - Raw Data Check");
    console.log("-".repeat(70));

    const dbClasses = await prisma.class.findMany({
      include: {
        grade: true,
        _count: {
          select: {
            enrollments: { where: { status: "ACTIVE" } },
          },
        },
      },
      take: 5,
    });

    console.log(`✓ Found ${dbClasses.length} classes in database`);

    if (dbClasses.length > 0) {
      const sampleClass = dbClasses[0];
      console.log(`\nSample Class: ${sampleClass.name}`);
      console.log(`  - ID: ${sampleClass.id}`);
      console.log(`  - Grade: ${sampleClass.grade?.name || "NO GRADE"}`);
      console.log(`  - Status: ${sampleClass.status}`);
      console.log(`  - Capacity: ${sampleClass.capacity}`);
      console.log(`  - Current Enrolled: ${sampleClass._count.enrollments}`);
    } else {
      console.log("❌ NO CLASSES FOUND - Database is empty!");
      return;
    }

    // ===========================================
    // TEST 2: Check Repository/Service Layer
    // ===========================================
    console.log("\n📊 TEST 2: Service Layer - API Response Check");
    console.log("-".repeat(70));

    const serviceContext = {
      userId: "test-user",
      role: "ADMIN" as const,
    };

    const serviceResult = await classService.getClasses(
      undefined,
      { page: 1, pageSize: 5 },
      serviceContext
    );

    console.log(`✓ Service returned ${serviceResult.data.length} classes`);
    console.log(`  - Total: ${serviceResult.meta.total}`);
    console.log(`  - Page: ${serviceResult.meta.page}`);
    console.log(`  - Page Size: ${serviceResult.meta.pageSize}`);
    console.log(`  - Total Pages: ${serviceResult.meta.totalPages}`);

    // ===========================================
    // TEST 3: Check Class Detail with Relations
    // ===========================================
    let classWithRelations = null;

    if (dbClasses.length > 0) {
      const testClassId = dbClasses[0].id;

      console.log("\n📊 TEST 3: Class Detail - Relations Check");
      console.log("-".repeat(70));

      classWithRelations = await prisma.class.findUnique({
        where: { id: testClassId },
        include: {
          grade: true,
          enrollments: {
            where: { status: "ACTIVE" },
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  studentNumber: true,
                },
              },
            },
          },
          classTeacherAssignments: {
            include: {
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  staffNumber: true,
                },
              },
            },
          },
          subjectTeacherAssignments: {
            include: {
              subject: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
              teacher: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  staffNumber: true,
                },
              },
            },
          },
        },
      });

      if (classWithRelations) {
        console.log(`\n✓ Class: ${classWithRelations.name}`);
        console.log(`  Grade: ${classWithRelations.grade?.name || "N/A"}`);
        console.log(
          `  Status: ${classWithRelations.status} | Capacity: ${classWithRelations.capacity}`
        );

        // Check Students
        const students = classWithRelations.enrollments.map((e) => e.student);
        console.log(`\n  📚 Students: ${students.length}`);
        if (students.length > 0) {
          students.slice(0, 3).forEach((student) => {
            console.log(
              `    - ${student.firstName} ${student.lastName} (${student.studentNumber})`
            );
          });
          if (students.length > 3) {
            console.log(`    ... and ${students.length - 3} more`);
          }
        } else {
          console.log(`    ⚠️  No students enrolled`);
        }

        // Check Class Teacher
        console.log(`\n  👨‍🏫 Class Teacher:`);
        if (classWithRelations.classTeacherAssignments.length > 0) {
          const teacher =
            classWithRelations.classTeacherAssignments[0].teacher;
          console.log(
            `    ${teacher.firstName} ${teacher.lastName} (${teacher.staffNumber})`
          );
        } else {
          console.log(`    ⚠️  No class teacher assigned`);
        }

        // Check Subject Teachers
        console.log(
          `\n  📖 Subject Assignments: ${classWithRelations.subjectTeacherAssignments.length}`
        );
        if (classWithRelations.subjectTeacherAssignments.length > 0) {
          classWithRelations.subjectTeacherAssignments
            .slice(0, 5)
            .forEach((assignment) => {
              console.log(
                `    - ${assignment.subject.name} (${assignment.subject.code}): ${assignment.teacher.firstName} ${assignment.teacher.lastName}`
              );
            });
          if (classWithRelations.subjectTeacherAssignments.length > 5) {
            console.log(
              `    ... and ${classWithRelations.subjectTeacherAssignments.length - 5} more`
            );
          }
        } else {
          console.log(`    ⚠️  No subject teachers assigned`);
        }
      }
    }

    // ===========================================
    // TEST 4: Check API Endpoint Format
    // ===========================================
    console.log("\n📊 TEST 4: API Response Format Check");
    console.log("-".repeat(70));

    const apiClass = await classService.getClassById(
      dbClasses[0].id,
      serviceContext,
      true
    );

    console.log(`\n✓ API Response Structure:`);
    console.log(`  - Has 'id': ${!!apiClass.id}`);
    console.log(`  - Has 'name': ${!!apiClass.name}`);
    console.log(`  - Has 'status': ${!!apiClass.status}`);
    console.log(`  - Has 'capacity': ${!!apiClass.capacity}`);
    console.log(`  - Has 'grade': ${!!apiClass.grade}`);
    console.log(`  - Has 'students': ${Array.isArray(apiClass.students)}`);
    console.log(
      `  - Has 'classTeacherAssignments': ${Array.isArray(apiClass.classTeacherAssignments)}`
    );
    console.log(
      `  - Has 'subjectTeacherAssignments': ${Array.isArray(apiClass.subjectTeacherAssignments)}`
    );

    // ===========================================
    // TEST 5: Data Completeness Summary
    // ===========================================
    console.log("\n📊 TEST 5: Data Completeness Summary");
    console.log("-".repeat(70));

    const stats = {
      totalClasses: dbClasses.length,
      classesWithGrade: dbClasses.filter((c) => c.grade).length,
      classesWithStudents: dbClasses.filter(
        (c) => c._count.enrollments > 0
      ).length,
      averageEnrollment:
        dbClasses.reduce((sum, c) => sum + c._count.enrollments, 0) /
        dbClasses.length,
    };

    console.log(`\n✓ Overall Statistics:`);
    console.log(`  - Total Classes: ${stats.totalClasses}`);
    console.log(`  - Classes with Grade: ${stats.classesWithGrade}`);
    console.log(`  - Classes with Students: ${stats.classesWithStudents}`);
    console.log(
      `  - Average Enrollment: ${stats.averageEnrollment.toFixed(1)} students/class`
    );

    // Check if critical data is missing
    const issues: string[] = [];

    if (stats.classesWithGrade < stats.totalClasses) {
      issues.push(
        `${stats.totalClasses - stats.classesWithGrade} classes missing grade assignment`
      );
    }

    if (stats.classesWithStudents === 0) {
      issues.push("No classes have enrolled students");
    }

    if (issues.length > 0) {
      console.log(`\n⚠️  Issues Found:`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
    } else {
      console.log(`\n✅ All classes have complete data!`);
    }

    // ===========================================
    // TEST 6: UI Data Requirements Check
    // ===========================================
    console.log("\n📊 TEST 6: UI Component Data Requirements");
    console.log("-".repeat(70));

    console.log(`\n✓ ClassesTable Requirements:`);
    console.log(
      `  - Class name: ${dbClasses.every((c) => c.name) ? "✅" : "❌"}`
    );
    console.log(
      `  - Grade name: ${dbClasses.every((c) => c.grade) ? "✅" : "❌"}`
    );
    console.log(
      `  - Status: ${dbClasses.every((c) => c.status) ? "✅" : "❌"}`
    );
    console.log(
      `  - Capacity: ${dbClasses.every((c) => c.capacity) ? "✅" : "❌"}`
    );

    console.log(`\n✓ ClassSheet Requirements:`);
    console.log(`  - Can fetch with relations: ✅`);
    console.log(
      `  - Students data available: ${classWithRelations?.enrollments ? "✅" : "❌"}`
    );
    console.log(
      `  - Class teacher available: ${classWithRelations?.classTeacherAssignments ? "✅" : "❌"}`
    );
    console.log(
      `  - Subject assignments available: ${classWithRelations?.subjectTeacherAssignments ? "✅" : "❌"}`
    );

    console.log("\n" + "=".repeat(70));
    console.log("✅ DATA FLOW TEST COMPLETED SUCCESSFULLY");
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testClassesDataFlow();
