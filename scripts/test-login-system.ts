import axios from "axios";
import bcrypt from "bcryptjs";
import prisma from "../lib/db/prisma";
import { authRepository } from "../features/auth/auth.repository";
import { authService } from "../features/auth/auth.service";

const BASE_URL = "http://localhost:3000";

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
  email: "test.login@school.com",
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

  try {
    // Test 1a: Find existing user
    const user = await authRepository.findUserByEmail(testUser.email);
    if (user && user.email === testUser.email) {
      logSuccess("Found user by email");
      logInfo(`  User ID: ${user.id}`);
      logInfo(`  Email: ${user.email}`);
      logInfo(`  Role: ${user.role}`);
    } else {
      logError("Failed to find user by email");
    }

    // Test 1b: Find non-existing user
    const nonExistingUser = await authRepository.findUserByEmail(
      "nonexisting@school.com"
    );
    if (nonExistingUser === null) {
      logSuccess("Correctly returned null for non-existing user");
    } else {
      logError("Should return null for non-existing user");
    }

    // Test 1c: Case insensitivity
    const upperCaseEmail = testUser.email.toUpperCase();
    const userUpperCase = await authRepository.findUserByEmail(upperCaseEmail);
    if (userUpperCase && userUpperCase.email === testUser.email) {
      logSuccess("Email search is case-insensitive");
    } else {
      logError("Email search should be case-insensitive");
    }
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
  }
}

/**
 * Test 2: Repository Layer - findUserById
 */
async function testRepositoryFindById(userId: string) {
  logSection("TEST 2: Repository - findUserById");

  try {
    // Test 2a: Find existing user by ID
    const user = await authRepository.findUserById(userId);
    if (user && user.id === userId) {
      logSuccess("Found user by ID");
      logInfo(`  User Email: ${user.email}`);
    } else {
      logError("Failed to find user by ID");
    }

    // Test 2b: Find non-existing user by ID
    const nonExistingUser = await authRepository.findUserById(
      "non-existing-id"
    );
    if (nonExistingUser === null) {
      logSuccess("Correctly returned null for non-existing ID");
    } else {
      logError("Should return null for non-existing ID");
    }
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
  }
}

/**
 * Test 3: Repository Layer - isUserActive
 */
async function testRepositoryIsUserActive(userId: string) {
  logSection("TEST 3: Repository - isUserActive");

  try {
    // Test 3a: Active user
    const isActive = await authRepository.isUserActive(userId);
    if (isActive === true) {
      logSuccess("Correctly identified active user");
    } else {
      logError("User should be active");
    }

    // Test 3b: Deactivate user and check
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    const isActiveAfterDeactivation = await authRepository.isUserActive(userId);
    if (isActiveAfterDeactivation === false) {
      logSuccess("Correctly identified inactive user");
    } else {
      logError("User should be inactive");
    }

    // Reactivate for other tests
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
    logInfo("Re-activated user for subsequent tests");
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
  }
}

/**
 * Test 4: Repository Layer - updateLastLogin
 */
async function testRepositoryUpdateLastLogin(userId: string) {
  logSection("TEST 4: Repository - updateLastLogin");

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
    } else {
      logError("Failed to update last login");
    }
  } catch (error: any) {
    logError(`Repository test failed: ${error.message}`);
  }
}

/**
 * Test 5: Service Layer - Login Success
 */
async function testServiceLoginSuccess() {
  logSection("TEST 5: Service - Login Success");

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
    } else {
      logError("Login should succeed with correct credentials");
      logInfo(`  Message: ${result.message}`);
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
  }
}

/**
 * Test 6: Service Layer - Login with Wrong Password
 */
async function testServiceLoginWrongPassword() {
  logSection("TEST 6: Service - Login with Wrong Password");

  try {
    const result = await authService.login({
      email: testUser.email,
      password: "WrongPassword123",
    });

    if (!result.success && result.message === "Invalid email or password") {
      logSuccess("Correctly rejected wrong password");
    } else {
      logError("Should reject wrong password");
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
  }
}

/**
 * Test 7: Service Layer - Login with Non-existing Email
 */
async function testServiceLoginNonExistingEmail() {
  logSection("TEST 7: Service - Login with Non-existing Email");

  try {
    const result = await authService.login({
      email: "nonexisting@school.com",
      password: testUser.password,
    });

    if (!result.success && result.message === "Invalid email or password") {
      logSuccess("Correctly rejected non-existing email");
    } else {
      logError("Should reject non-existing email");
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
  }
}

/**
 * Test 8: Service Layer - Login with Inactive Account
 */
async function testServiceLoginInactiveAccount(userId: string) {
  logSection("TEST 8: Service - Login with Inactive Account");

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
    } else {
      logError("Should reject inactive account");
      logInfo(`  Message: ${result.message}`);
    }

    // Reactivate user
    await prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
  }
}

/**
 * Test 9: Service Layer - Token Verification
 */
async function testServiceTokenVerification() {
  logSection("TEST 9: Service - Token Verification");

  try {
    // Login to get token
    const loginResult = await authService.login({
      email: testUser.email,
      password: testUser.password,
    });

    if (!loginResult.token) {
      logError("No token generated");
      return;
    }

    // Test 9a: Valid token
    const validResult = authService.verifyToken(loginResult.token);
    if (validResult.valid && validResult.payload) {
      logSuccess("Valid token verified successfully");
      logInfo(`  User ID: ${validResult.payload.userId}`);
      logInfo(`  Email: ${validResult.payload.email}`);
      logInfo(`  Role: ${validResult.payload.role}`);
    } else {
      logError("Should verify valid token");
    }

    // Test 9b: Invalid token
    const invalidResult = authService.verifyToken("invalid-token");
    if (!invalidResult.valid && invalidResult.error) {
      logSuccess("Invalid token correctly rejected");
      logInfo(`  Error: ${invalidResult.error}`);
    } else {
      logError("Should reject invalid token");
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
  }
}

/**
 * Test 10: Service Layer - Password Validation
 */
async function testServicePasswordValidation() {
  logSection("TEST 10: Service - Password Validation");

  try {
    // Test 10a: Valid password
    const validPassword = authService.validatePasswordStrength("StrongPass123");
    if (validPassword.valid) {
      logSuccess("Valid password accepted");
    } else {
      logError("Should accept valid password");
    }

    // Test 10b: Too short
    const tooShort = authService.validatePasswordStrength("Short1");
    if (!tooShort.valid && tooShort.message?.includes("8 characters")) {
      logSuccess("Rejected password that's too short");
    } else {
      logError("Should reject short password");
    }

    // Test 10c: No uppercase
    const noUppercase = authService.validatePasswordStrength("lowercase123");
    if (!noUppercase.valid && noUppercase.message?.includes("uppercase")) {
      logSuccess("Rejected password without uppercase");
    } else {
      logError("Should reject password without uppercase");
    }

    // Test 10d: No number
    const noNumber = authService.validatePasswordStrength("NoNumberPassword");
    if (!noNumber.valid && noNumber.message?.includes("number")) {
      logSuccess("Rejected password without number");
    } else {
      logError("Should reject password without number");
    }
  } catch (error: any) {
    logError(`Service test failed: ${error.message}`);
  }
}

/**
 * Test 11: API Layer - POST /api/auth/login (Success)
 */
async function testAPILoginSuccess() {
  logSection("TEST 11: API - POST /api/auth/login (Success)");

  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    if (
      response.status === 200 &&
      response.data.success &&
      response.data.data.token
    ) {
      logSuccess("API login successful");
      logInfo(`  Status: ${response.status}`);
      logInfo(`  Token received: ${response.data.data.token.substring(0, 20)}...`);
      logInfo(`  User: ${response.data.data.user.email}`);
    } else {
      logError("API should return success response");
    }
  } catch (error: any) {
    logError(`API test failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Test 12: API Layer - POST /api/auth/login (Invalid Credentials)
 */
async function testAPILoginInvalidCredentials() {
  logSection("TEST 12: API - POST /api/auth/login (Invalid Credentials)");

  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      password: "WrongPassword123",
    });

    logError("API should reject invalid credentials");
  } catch (error: any) {
    if (error.response?.status === 401) {
      logSuccess("API correctly rejected invalid credentials");
      logInfo(`  Status: ${error.response.status}`);
      logInfo(`  Error: ${error.response.data.error}`);
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }
}

/**
 * Test 13: API Layer - POST /api/auth/login (Validation Error)
 */
async function testAPILoginValidationError() {
  logSection("TEST 13: API - POST /api/auth/login (Validation Error)");

  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "invalid-email",
      password: "",
    });

    logError("API should reject invalid input");
  } catch (error: any) {
    if (error.response?.status === 400) {
      logSuccess("API correctly returned validation error");
      logInfo(`  Status: ${error.response.status}`);
      logInfo(`  Error: ${error.response.data.error}`);
      if (error.response.data.details) {
        error.response.data.details.forEach((detail: any) => {
          logInfo(`    - ${detail.field}: ${detail.message}`);
        });
      }
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }
}

/**
 * Test 14: API Layer - POST /api/auth/login (Missing Fields)
 */
async function testAPILoginMissingFields() {
  logSection("TEST 14: API - POST /api/auth/login (Missing Fields)");

  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: testUser.email,
      // Missing password field
    });

    logError("API should reject missing fields");
  } catch (error: any) {
    if (error.response?.status === 400) {
      logSuccess("API correctly rejected missing fields");
      logInfo(`  Status: ${error.response.status}`);
      logInfo(`  Error: ${error.response.data.error}`);
    } else {
      logError(`Unexpected error: ${error.message}`);
    }
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log(`\n${colors.blue}╔${"═".repeat(58)}╗${colors.reset}`);
  console.log(
    `${colors.blue}║${colors.reset}  ${colors.yellow}LOGIN SYSTEM TEST SUITE${colors.reset}                              ${colors.blue}║${colors.reset}`
  );
  console.log(`${colors.blue}╚${"═".repeat(58)}╝${colors.reset}\n`);

  let testUser: any;

  try {
    // Setup
    testUser = await setupTestUser();

    // Repository Tests
    await testRepositoryFindByEmail();
    await testRepositoryFindById(testUser.id);
    await testRepositoryIsUserActive(testUser.id);
    await testRepositoryUpdateLastLogin(testUser.id);

    // Service Tests
    await testServiceLoginSuccess();
    await testServiceLoginWrongPassword();
    await testServiceLoginNonExistingEmail();
    await testServiceLoginInactiveAccount(testUser.id);
    await testServiceTokenVerification();
    await testServicePasswordValidation();

    // API Tests
    await testAPILoginSuccess();
    await testAPILoginInvalidCredentials();
    await testAPILoginValidationError();
    await testAPILoginMissingFields();

    // Summary
    logSection("TEST SUMMARY");
    logSuccess("All tests completed!");
    logInfo("Review the output above for any failures.");
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
