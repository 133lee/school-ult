import bcrypt from "bcryptjs";
import prisma from "../lib/db/prisma";
import { authRepository } from "../features/auth/auth.repository";
import { authService } from "../features/auth/auth.service";

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  gray: "\x1b[90m",
};

function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logError(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function logInfo(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function logSection(message: string) {
  console.log(`\n${colors.yellow}${"=".repeat(60)}${colors.reset}`);
  console.log(`${colors.yellow}${message}${colors.reset}`);
  console.log(`${colors.yellow}${"=".repeat(60)}${colors.reset}\n`);
}

// Test data
const testUser = {
  email: "test.login.backend@school.com",
  password: "TestPassword123",
  role: "ADMIN" as const,
};

/**
 * Setup: Create test user in database
 */
async function setupTestUser() {
  logSection("SETUP: Creating Test User");

  try {
    // Delete existing test user if exists
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    logInfo("Cleaned up existing test user");

    // Create test user
    const passwordHash = await bcrypt.hash(testUser.password, 10);
    const user = await prisma.user.create({
      data: {
        email: testUser.email,
        passwordHash,
        role: testUser.role,
        isActive: true,
      },
    });

    logSuccess(`Test user created with ID: ${user.id}`);
    return user;
  } catch (error: any) {
    logError(`Setup failed: ${error.message}`);
    throw error;
  }
}

/**
 * Cleanup: Remove test user from database
 */
async function cleanupTestUser() {
  logSection("CLEANUP: Removing Test User");

  try {
    await prisma.user.deleteMany({
      where: { email: testUser.email },
    });
    logSuccess("Test user removed");
  } catch (error: any) {
    logError(`Cleanup failed: ${error.message}`);
  }
}

/**
 * Test 1: Repository Layer - findUserByEmail
 */
async function testRepositoryFindByEmail() {
  logSection("TEST 1: Repository - findUserByEmail");

  let passed = 0;
  let failed = 0;

  try {
    // Test 1a: Find existing user
    const user = await authRepository.findUserByEmail(testUser.email);
    if (user && user.email === testUser.email) {
      logSuccess("Found user by email");
      logInfo(`  User ID: ${user.id}`);
      logInfo(`  Email: ${user.email}`);
      logInfo(`  Role: ${user.role}`);
      passed++;
    } else {
      logError("Failed to find user by email");
      failed++;
    }

    // Test 1b: Find non-existing user
    const nonExistingUser = await authRepository.findUserByEmail(
      "nonexisting@school.com"
    );
    if (nonExistingUser === null) {
      logSuccess("Correctly returned null for non-existing user");
      passed++;
    } else {
      logError("Should return null for non-existing user");
      failed++;
    }

    // Test 1c: Case insensitivity
    const upperCaseEmail = testUser.email.toUpperCase();
    const userUpperCase = await authRepository.findUserByEmail(upperCaseEmail);
    if (userUpperCase && userUpperCase.email === testUser.email) {
      logSuccess("Email search is case-insensitive");
      passed++;
    } else {
      logError("Email search should be case-insensitive");
      failed++;
    }
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 2: Repository Layer - findUserById
 */
async function testRepositoryFindById(userId: string) {
  logSection("TEST 2: Repository - findUserById");

  let passed = 0;
  let failed = 0;

  try {
    // Test 2a: Find existing user by ID
    const user = await authRepository.findUserById(userId);
    if (user && user.id === userId) {
      logSuccess("Found user by ID");
      logInfo(`  User Email: ${user.email}`);
      passed++;
    } else {
      logError("Failed to find user by ID");
      failed++;
    }

    // Test 2b: Find non-existing user by ID
    const nonExistingUser = await authRepository.findUserById(
      "non-existing-id"
    );
    if (nonExistingUser === null) {
      logSuccess("Correctly returned null for non-existing ID");
      passed++;
    } else {
      logError("Should return null for non-existing ID");
      failed++;
    }
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 3: Repository Layer - isUserActive
 */
async function testRepositoryIsUserActive(userId: string) {
  logSection("TEST 3: Repository - isUserActive");

  let passed = 0;
  let failed = 0;

  try {
    // Test 3a: Active user
    const isActive = await authRepository.isUserActive(userId);
    if (isActive === true) {
      logSuccess("Correctly identified active user");
      passed++;
    } else {
      logError("User should be active");
      failed++;
    }

    // Test 3b: Deactivate user and check
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    const isActiveAfterDeactivation = await authRepository.isUserActive(userId);
    if (isActiveAfterDeactivation === false) {
      logSuccess("Correctly identified inactive user");
      passed++;
    } else {
      logError("User should be inactive");
      failed++;
    }

    // Reactivate for other tests
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
    logInfo("Re-activated user for subsequent tests");
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 4: Repository Layer - updateLastLogin
 */
async function testRepositoryUpdateLastLogin(userId: string) {
  logSection("TEST 4: Repository - updateLastLogin");

  let passed = 0;
  let failed = 0;

  try {
    const beforeUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastLogin: true },
    });

    await authRepository.updateLastLogin(userId);

    const afterUpdate = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastLogin: true },
    });

    if (
      afterUpdate?.lastLogin &&
      (!beforeUpdate?.lastLogin ||
        afterUpdate.lastLogin > beforeUpdate.lastLogin)
    ) {
      logSuccess("Last login timestamp updated");
      logInfo(`  Last Login: ${afterUpdate.lastLogin.toISOString()}`);
      passed++;
    } else {
      logError("Failed to update last login");
      failed++;
    }
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 5: Service Layer - Login Success
 */
async function testServiceLoginSuccess() {
  logSection("TEST 5: Service - Login Success");

  let passed = 0;
  let failed = 0;

  try {
    const result = await authService.login({
      email: testUser.email,
      password: testUser.password,
    });

    if (result.success && result.token && result.user) {
      logSuccess("Login successful");
      logInfo(`  Token: ${result.token.substring(0, 20)}...`);
      logInfo(`  User ID: ${result.user.id}`);
      logInfo(`  Email: ${result.user.email}`);
      logInfo(`  Role: ${result.user.role}`);
      passed++;
    } else {
      logError("Login should succeed with correct credentials");
      logInfo(`  Message: ${result.message}`);
      failed++;
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 6: Service Layer - Login with Wrong Password
 */
async function testServiceLoginWrongPassword() {
  logSection("TEST 6: Service - Login with Wrong Password");

  let passed = 0;
  let failed = 0;

  try {
    const result = await authService.login({
      email: testUser.email,
      password: "WrongPassword123",
    });

    if (!result.success && result.message === "Invalid email or password") {
      logSuccess("Correctly rejected wrong password");
      passed++;
    } else {
      logError("Should reject wrong password");
      failed++;
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 7: Service Layer - Login with Non-existing Email
 */
async function testServiceLoginNonExistingEmail() {
  logSection("TEST 7: Service - Login with Non-existing Email");

  let passed = 0;
  let failed = 0;

  try {
    const result = await authService.login({
      email: "nonexisting@school.com",
      password: testUser.password,
    });

    if (!result.success && result.message === "Invalid email or password") {
      logSuccess("Correctly rejected non-existing email");
      passed++;
    } else {
      logError("Should reject non-existing email");
      failed++;
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 8: Service Layer - Login with Inactive Account
 */
async function testServiceLoginInactiveAccount(userId: string) {
  logSection("TEST 8: Service - Login with Inactive Account");

  let passed = 0;
  let failed = 0;

  try {
    // Deactivate user
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    const result = await authService.login({
      email: testUser.email,
      password: testUser.password,
    });

    if (
      !result.success &&
      result.message?.includes("account has been deactivated")
    ) {
      logSuccess("Correctly rejected inactive account");
      passed++;
    } else {
      logError("Should reject inactive account");
      logInfo(`  Message: ${result.message}`);
      failed++;
    }

    // Reactivate user
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 9: Service Layer - Token Verification
 */
async function testServiceTokenVerification() {
  logSection("TEST 9: Service - Token Verification");

  let passed = 0;
  let failed = 0;

  try {
    // Login to get token
    const loginResult = await authService.login({
      email: testUser.email,
      password: testUser.password,
    });

    if (!loginResult.token) {
      logError("No token generated");
      failed++;
      return { passed, failed };
    }

    // Test 9a: Valid token
    const validResult = authService.verifyToken(loginResult.token);
    if (validResult.valid && validResult.payload) {
      logSuccess("Valid token verified successfully");
      logInfo(`  User ID: ${validResult.payload.userId}`);
      logInfo(`  Email: ${validResult.payload.email}`);
      logInfo(`  Role: ${validResult.payload.role}`);
      passed++;
    } else {
      logError("Should verify valid token");
      failed++;
    }

    // Test 9b: Invalid token
    const invalidResult = authService.verifyToken("invalid-token");
    if (!invalidResult.valid && invalidResult.error) {
      logSuccess("Invalid token correctly rejected");
      logInfo(`  Error: ${invalidResult.error}`);
      passed++;
    } else {
      logError("Should reject invalid token");
      failed++;
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Test 10: Service Layer - Password Validation
 */
async function testServicePasswordValidation() {
  logSection("TEST 10: Service - Password Validation");

  let passed = 0;
  let failed = 0;

  try {
    // Test 10a: Valid password
    const validPassword = authService.validatePasswordStrength("StrongPass123");
    if (validPassword.valid) {
      logSuccess("Valid password accepted");
      passed++;
    } else {
      logError("Should accept valid password");
      failed++;
    }

    // Test 10b: Too short
    const tooShort = authService.validatePasswordStrength("Short1");
    if (!tooShort.valid && tooShort.message?.includes("8 characters")) {
      logSuccess("Rejected password that's too short");
      passed++;
    } else {
      logError("Should reject short password");
      failed++;
    }

    // Test 10c: No uppercase
    const noUppercase = authService.validatePasswordStrength("lowercase123");
    if (!noUppercase.valid && noUppercase.message?.includes("uppercase")) {
      logSuccess("Rejected password without uppercase");
      passed++;
    } else {
      logError("Should reject password without uppercase");
      failed++;
    }

    // Test 10d: No number
    const noNumber = authService.validatePasswordStrength("NoNumberPassword");
    if (!noNumber.valid && noNumber.message?.includes("number")) {
      logSuccess("Rejected password without number");
      passed++;
    } else {
      logError("Should reject password without number");
      failed++;
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
    failed++;
  }

  return { passed, failed };
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.blue}╔${"═".repeat(58)}╗${colors.reset}`);
  console.log(
    `${colors.blue}║${colors.reset}  ${colors.yellow}LOGIN BACKEND TEST SUITE (No API Server Needed)${colors.reset}      ${colors.blue}║${colors.reset}`
  );
  console.log(`${colors.blue}╚${"═".repeat(58)}╝${colors.reset}\n`);

  let testUser: any;
  let totalPassed = 0;
  let totalFailed = 0;

  try {
    // Setup
    testUser = await setupTestUser();

    // Repository Tests
    let result1 = await testRepositoryFindByEmail();
    totalPassed += result1.passed;
    totalFailed += result1.failed;

    let result2 = await testRepositoryFindById(testUser.id);
    totalPassed += result2.passed;
    totalFailed += result2.failed;

    let result3 = await testRepositoryIsUserActive(testUser.id);
    totalPassed += result3.passed;
    totalFailed += result3.failed;

    let result4 = await testRepositoryUpdateLastLogin(testUser.id);
    totalPassed += result4.passed;
    totalFailed += result4.failed;

    // Service Tests
    let result5 = await testServiceLoginSuccess();
    totalPassed += result5.passed;
    totalFailed += result5.failed;

    let result6 = await testServiceLoginWrongPassword();
    totalPassed += result6.passed;
    totalFailed += result6.failed;

    let result7 = await testServiceLoginNonExistingEmail();
    totalPassed += result7.passed;
    totalFailed += result7.failed;

    let result8 = await testServiceLoginInactiveAccount(testUser.id);
    totalPassed += result8.passed;
    totalFailed += result8.failed;

    let result9 = await testServiceTokenVerification();
    totalPassed += result9.passed;
    totalFailed += result9.failed;

    let result10 = await testServicePasswordValidation();
    totalPassed += result10.passed;
    totalFailed += result10.failed;

    // Summary
    logSection("TEST SUMMARY");
    console.log(
      `${colors.green}✓ Passed:${colors.reset} ${totalPassed}/${totalPassed + totalFailed}`
    );
    if (totalFailed > 0) {
      console.log(
        `${colors.red}✗ Failed:${colors.reset} ${totalFailed}/${totalPassed + totalFailed}`
      );
    }
    console.log();

    if (totalFailed === 0) {
      logSuccess("All tests passed! ✨");
    } else {
      logError(`${totalFailed} test(s) failed. Review the output above.`);
    }
  } catch (error: any) {
    logError(`Fatal error during tests: ${error.message}`);
    console.error(error);
  } finally {
    // Cleanup
    await cleanupTestUser();
    await prisma.$disconnect();
  }
}

// Run tests
runTests().catch(console.error);
