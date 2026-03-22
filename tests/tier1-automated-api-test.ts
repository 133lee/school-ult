/**
 * Automated API Tests for Tier 1 Remediation
 *
 * Run with: npx ts-node tests/tier1-automated-api-test.ts
 * Or add to package.json scripts: "test:tier1": "ts-node tests/tier1-automated-api-test.ts"
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

/**
 * Test Suite: Fix 1.1 - Profile hasDefaultPassword
 */
async function testProfileHasDefaultPassword() {
  console.log('\n=== Fix 1.1: Profile hasDefaultPassword ===\n');

  // Test 1: Verify backend includes hasDefaultPassword field
  try {
    const hodUser = await prisma.user.findFirst({
      where: {
        role: 'TEACHER',
        hasDefaultPassword: true,
        profile: {
          departmentAsHOD: {
            isNot: null,
          },
        },
      },
      select: {
        id: true,
        email: true,
        hasDefaultPassword: true,
        profile: {
          select: {
            id: true,
            departmentAsHOD: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (hodUser && hodUser.hasDefaultPassword !== undefined) {
      results.push({
        test: 'Fix 1.1 - User.hasDefaultPassword field exists',
        passed: true,
        message: 'hasDefaultPassword field is queryable from database',
        details: {
          userId: hodUser.id,
          email: hodUser.email,
          hasDefaultPassword: hodUser.hasDefaultPassword,
        },
      });
    } else {
      results.push({
        test: 'Fix 1.1 - User.hasDefaultPassword field exists',
        passed: false,
        message: 'No HOD user found with hasDefaultPassword field',
      });
    }
  } catch (error: any) {
    results.push({
      test: 'Fix 1.1 - User.hasDefaultPassword field exists',
      passed: false,
      message: `Database query failed: ${error.message}`,
    });
  }

  // Test 2: Verify both true and false cases exist
  try {
    const usersWithDefault = await prisma.user.count({
      where: {
        hasDefaultPassword: true,
        profile: {
          departmentAsHOD: { isNot: null },
        },
      },
    });

    const usersWithoutDefault = await prisma.user.count({
      where: {
        hasDefaultPassword: false,
        profile: {
          departmentAsHOD: { isNot: null },
        },
      },
    });

    if (usersWithDefault > 0 && usersWithoutDefault > 0) {
      results.push({
        test: 'Fix 1.1 - Test data coverage',
        passed: true,
        message: 'Both hasDefaultPassword states exist for testing',
        details: {
          withDefault: usersWithDefault,
          withoutDefault: usersWithoutDefault,
        },
      });
    } else {
      results.push({
        test: 'Fix 1.1 - Test data coverage',
        passed: false,
        message: 'Missing test data: Need HOD users with both hasDefaultPassword=true and false',
        details: {
          withDefault: usersWithDefault,
          withoutDefault: usersWithoutDefault,
        },
      });
    }
  } catch (error: any) {
    results.push({
      test: 'Fix 1.1 - Test data coverage',
      passed: false,
      message: `Test data check failed: ${error.message}`,
    });
  }
}

/**
 * Test Suite: Fix 1.2 - SECONDARY_GRADES Backend Authority
 */
async function testSecondaryGradesAuthority() {
  console.log('\n=== Fix 1.2: SECONDARY_GRADES Backend Authority ===\n');

  // Test 1: Verify secondary grades exist in database
  try {
    const secondaryGrades = await prisma.grade.findMany({
      where: {
        level: {
          in: ['GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'],
        },
      },
      select: {
        id: true,
        name: true,
        level: true,
        sequence: true,
      },
      orderBy: {
        sequence: 'asc',
      },
    });

    if (secondaryGrades.length === 5) {
      results.push({
        test: 'Fix 1.2 - Secondary grades exist',
        passed: true,
        message: 'All 5 secondary grades found in database',
        details: {
          count: secondaryGrades.length,
          grades: secondaryGrades.map((g) => g.level),
        },
      });
    } else {
      results.push({
        test: 'Fix 1.2 - Secondary grades exist',
        passed: false,
        message: `Expected 5 secondary grades, found ${secondaryGrades.length}`,
        details: {
          count: secondaryGrades.length,
          grades: secondaryGrades.map((g) => g.level),
        },
      });
    }
  } catch (error: any) {
    results.push({
      test: 'Fix 1.2 - Secondary grades exist',
      passed: false,
      message: `Database query failed: ${error.message}`,
    });
  }

  // Test 2: Verify primary grades exist (for negative testing)
  try {
    const primaryGrades = await prisma.grade.findMany({
      where: {
        level: {
          in: ['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7'],
        },
      },
      select: {
        id: true,
        level: true,
      },
    });

    if (primaryGrades.length > 0) {
      results.push({
        test: 'Fix 1.2 - Primary grades exist (for testing)',
        passed: true,
        message: 'Primary grades found for negative testing',
        details: {
          count: primaryGrades.length,
          grades: primaryGrades.map((g) => g.level),
        },
      });
    } else {
      results.push({
        test: 'Fix 1.2 - Primary grades exist (for testing)',
        passed: false,
        message: 'No primary grades found - cannot test backend rejection',
      });
    }
  } catch (error: any) {
    results.push({
      test: 'Fix 1.2 - Primary grades exist (for testing)',
      passed: false,
      message: `Database query failed: ${error.message}`,
    });
  }

  // Test 3: Verify classes exist for both primary and secondary
  try {
    const secondaryClasses = await prisma.class.findMany({
      where: {
        grade: {
          level: {
            in: ['GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12'],
          },
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        grade: {
          select: {
            name: true,
            level: true,
          },
        },
      },
    });

    const primaryClasses = await prisma.class.findMany({
      where: {
        grade: {
          level: {
            in: ['GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6', 'GRADE_7'],
          },
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        grade: {
          select: {
            name: true,
            level: true,
          },
        },
      },
    });

    if (secondaryClasses.length > 0 && primaryClasses.length > 0) {
      results.push({
        test: 'Fix 1.2 - Test classes exist',
        passed: true,
        message: 'Both primary and secondary classes exist for testing',
        details: {
          secondaryCount: secondaryClasses.length,
          primaryCount: primaryClasses.length,
          exampleSecondary: secondaryClasses[0],
          examplePrimary: primaryClasses[0],
        },
      });
    } else {
      results.push({
        test: 'Fix 1.2 - Test classes exist',
        passed: false,
        message: 'Missing classes for testing',
        details: {
          secondaryCount: secondaryClasses.length,
          primaryCount: primaryClasses.length,
        },
      });
    }
  } catch (error: any) {
    results.push({
      test: 'Fix 1.2 - Test classes exist',
      passed: false,
      message: `Database query failed: ${error.message}`,
    });
  }

  // Test 4: Verify HOD department has subjects and teachers
  try {
    const hodDepartment = await prisma.department.findFirst({
      where: {
        hodTeacherId: { not: null },
        status: 'ACTIVE',
      },
      include: {
        subjects: {
          where: { deletedAt: null },
          take: 5,
        },
        teachers: {
          take: 5,
        },
      },
    });

    if (hodDepartment && hodDepartment.subjects.length > 0 && hodDepartment.teachers.length > 0) {
      results.push({
        test: 'Fix 1.2 - HOD department has resources',
        passed: true,
        message: 'HOD department has subjects and teachers for assignment testing',
        details: {
          departmentName: hodDepartment.name,
          subjectCount: hodDepartment.subjects.length,
          teacherCount: hodDepartment.teachers.length,
        },
      });
    } else {
      results.push({
        test: 'Fix 1.2 - HOD department has resources',
        passed: false,
        message: 'HOD department missing subjects or teachers',
        details: {
          departmentName: hodDepartment?.name,
          subjectCount: hodDepartment?.subjects.length || 0,
          teacherCount: hodDepartment?.teachers.length || 0,
        },
      });
    }
  } catch (error: any) {
    results.push({
      test: 'Fix 1.2 - HOD department has resources',
      passed: false,
      message: `Database query failed: ${error.message}`,
    });
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   Tier 1 Remediation - Automated API Tests           ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  try {
    await testProfileHasDefaultPassword();
    await testSecondaryGradesAuthority();

    // Print results
    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║                    TEST RESULTS                       ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    let passed = 0;
    let failed = 0;

    results.forEach((result, index) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const color = result.passed ? '\x1b[32m' : '\x1b[31m';
      const reset = '\x1b[0m';

      console.log(`${color}${status}${reset} - ${result.test}`);
      console.log(`   ${result.message}`);

      if (result.details) {
        console.log(`   Details: ${JSON.stringify(result.details, null, 2).substring(0, 200)}...`);
      }

      console.log('');

      if (result.passed) {
        passed++;
      } else {
        failed++;
      }
    });

    // Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Total Tests: ${results.length}`);
    console.log(`\x1b[32mPassed: ${passed}\x1b[0m`);
    console.log(`\x1b[31mFailed: ${failed}\x1b[0m`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (failed > 0) {
      console.log('⚠️  SOME TESTS FAILED - Review issues above');
      console.log('⚠️  Manual testing recommended before deployment\n');
      process.exit(1);
    } else {
      console.log('✅ ALL TESTS PASSED');
      console.log('✅ Ready for manual UI testing\n');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('\n❌ Test suite failed to run:');
    console.error(error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
runTests();
