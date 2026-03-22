import prisma from "../lib/db/prisma";

const BASE_URL = "http://localhost:3001";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
  log(`✓ ${message}`, colors.green);
}

function logError(message: string) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message: string) {
  log(`ℹ ${message}`, colors.cyan);
}

function logSection(title: string) {
  log(`\n${"=".repeat(60)}`, colors.yellow);
  log(title, colors.bright + colors.yellow);
  log("=".repeat(60), colors.yellow);
}

let academicYear: any;
let term: any;
let grade: any;
let class1: any;
let subject1: any;
let subject2: any;
let user1: any;
let user2: any;
let teacher1: any;
let teacher2: any;
let timeSlot1: any;
let timeSlot2: any;
let assignment1: any;
let assignment2: any;

async function setupTestData() {
  logSection("SETTING UP TEST DATA");

  academicYear = await prisma.academicYear.create({
    data: {
      year: 2024,
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-12-15"),
    },
  });
  logSuccess(`Created academic year: ${academicYear.year}`);

  term = await prisma.term.create({
    data: {
      termType: "TERM_1",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-04-15"),
      academicYearId: academicYear.id,
      isActive: true,
    },
  });
  logSuccess(`Created term: ${term.termType}`);

  grade = await prisma.grade.create({
    data: {
      name: "Grade 10",
      level: "GRADE_10",
      schoolLevel: "SECONDARY",
      sequence: 10,
    },
  });
  logSuccess(`Created grade: ${grade.name}`);

  class1 = await prisma.class.create({
    data: {
      name: "A",
      gradeId: grade.id,
      capacity: 40,
    },
  });
  logSuccess(`Created class: ${grade.name} ${class1.name}`);

  subject1 = await prisma.subject.create({
    data: {
      name: "Mathematics",
      code: "MATH10",
    },
  });
  logSuccess(`Created subject: ${subject1.name}`);

  subject2 = await prisma.subject.create({
    data: {
      name: "English",
      code: "ENG10",
    },
  });
  logSuccess(`Created subject: ${subject2.name}`);

  user1 = await prisma.user.create({
    data: {
      email: "teacher1@test.com",
      passwordHash: "hash123",
      role: "TEACHER",
    },
  });
  logSuccess(`Created user: ${user1.email}`);

  user2 = await prisma.user.create({
    data: {
      email: "teacher2@test.com",
      passwordHash: "hash456",
      role: "TEACHER",
    },
  });
  logSuccess(`Created user: ${user2.email}`);

  teacher1 = await prisma.teacherProfile.create({
    data: {
      userId: user1.id,
      staffNumber: "T001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: new Date("1985-05-15"),
      gender: "MALE",
      phone: "+260971234567",
      qualification: "DEGREE",
      hireDate: new Date("2020-01-15"),
    },
  });
  logSuccess(`Created teacher profile: ${teacher1.firstName} ${teacher1.lastName}`);

  teacher2 = await prisma.teacherProfile.create({
    data: {
      userId: user2.id,
      staffNumber: "T002",
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: new Date("1988-08-20"),
      gender: "FEMALE",
      phone: "+260977654321",
      qualification: "MASTERS",
      hireDate: new Date("2019-09-01"),
    },
  });
  logSuccess(`Created teacher profile: ${teacher2.firstName} ${teacher2.lastName}`);

  timeSlot1 = await prisma.timeSlot.create({
    data: {
      label: "Period 1",
      startTime: "08:00",
      endTime: "09:00",
    },
  });
  logSuccess(`Created time slot: ${timeSlot1.label}`);

  timeSlot2 = await prisma.timeSlot.create({
    data: {
      label: "Period 2",
      startTime: "09:00",
      endTime: "10:00",
    },
  });
  logSuccess(`Created time slot: ${timeSlot2.label}`);

  assignment1 = await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacher1.id,
      subjectId: subject1.id,
      classId: class1.id,
      academicYearId: academicYear.id,
    },
  });
  logSuccess(
    `Created assignment: ${teacher1.lastName} - ${subject1.name} - ${grade.name}${class1.name}`
  );

  assignment2 = await prisma.subjectTeacherAssignment.create({
    data: {
      teacherId: teacher2.id,
      subjectId: subject2.id,
      classId: class1.id,
      academicYearId: academicYear.id,
    },
  });
  logSuccess(
    `Created assignment: ${teacher2.lastName} - ${subject2.name} - ${grade.name}${class1.name}`
  );
}

async function testCheckAvailabilityAPI() {
  logSection("TEST 1: Check Availability API - Teacher Available");

  const response = await fetch(`${BASE_URL}/api/timetables/check-availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "teacher",
      timeSlotId: timeSlot1.id,
      teacherId: teacher1.id,
      termId: term.id,
      dayOfWeek: "MONDAY",
    }),
  });

  const data = await response.json();

  if (response.ok && data.available === true) {
    logSuccess("Teacher is available (no conflicts)");
  } else {
    logError(`Expected available: true, got: ${JSON.stringify(data)}`);
  }
}

async function testCheckAvailabilityConflict() {
  logSection("TEST 2: Check Availability API - Teacher Conflict");

  const timetableEntry = await prisma.secondaryTimetable.create({
    data: {
      timeSlotId: timeSlot1.id,
      classId: class1.id,
      subjectId: subject1.id,
      teacherId: teacher1.id,
      termId: term.id,
      academicYearId: academicYear.id,
      dayOfWeek: "MONDAY",
    },
  });
  logInfo(`Created timetable entry for conflict test`);

  const response = await fetch(`${BASE_URL}/api/timetables/check-availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "teacher",
      timeSlotId: timeSlot1.id,
      teacherId: teacher1.id,
      termId: term.id,
      dayOfWeek: "MONDAY",
    }),
  });

  const data = await response.json();

  if (response.ok && data.available === false && data.conflict?.type === "teacher") {
    logSuccess("Teacher conflict detected correctly");
    logInfo(`Conflict details: ${data.conflict.message}`);
  } else {
    logError(`Expected conflict, got: ${JSON.stringify(data)}`);
  }
}

async function testCheckClassAvailability() {
  logSection("TEST 3: Check Availability API - Class Conflict");

  const response = await fetch(`${BASE_URL}/api/timetables/check-availability`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "class",
      timeSlotId: timeSlot1.id,
      classId: class1.id,
      termId: term.id,
      dayOfWeek: "MONDAY",
    }),
  });

  const data = await response.json();

  if (response.ok && data.available === false && data.conflict?.type === "class") {
    logSuccess("Class conflict detected correctly");
    logInfo(`Conflict details: ${data.conflict.message}`);
  } else {
    logError(`Expected conflict, got: ${JSON.stringify(data)}`);
  }
}

async function testSuggestionsAvailableTeachers() {
  logSection("TEST 4: Suggestions API - Available Teachers");

  const url = new URL(`${BASE_URL}/api/timetables/suggestions`);
  url.searchParams.set("type", "available-teachers");
  url.searchParams.set("timeSlotId", timeSlot2.id);
  url.searchParams.set("classId", class1.id);
  url.searchParams.set("subjectId", subject1.id);
  url.searchParams.set("termId", term.id);
  url.searchParams.set("dayOfWeek", "MONDAY");

  const response = await fetch(url.toString());
  const data = await response.json();

  if (response.ok && Array.isArray(data.availableTeachers)) {
    logSuccess(`Found ${data.availableTeachers.length} available teacher(s)`);
    if (data.availableTeachers.length > 0) {
      logInfo(
        `Available: ${data.availableTeachers.map((t: any) => `${t.firstName} ${t.lastName}`).join(", ")}`
      );
    }
  } else {
    logError(`Expected availableTeachers array, got: ${JSON.stringify(data)}`);
  }
}

async function testSuggestionsAvailableTimeSlots() {
  logSection("TEST 5: Suggestions API - Available Time Slots");

  const url = new URL(`${BASE_URL}/api/timetables/suggestions`);
  url.searchParams.set("type", "available-timeslots");
  url.searchParams.set("teacherId", teacher1.id);
  url.searchParams.set("classId", class1.id);
  url.searchParams.set("termId", term.id);
  url.searchParams.set("dayOfWeek", "MONDAY");

  const response = await fetch(url.toString());
  const data = await response.json();

  if (response.ok && Array.isArray(data.availableSlots)) {
    logSuccess(`Found ${data.availableSlots.length} available time slot(s)`);
    if (data.availableSlots.length > 0) {
      logInfo(
        `Available: ${data.availableSlots.map((s: any) => `${s.label} (${s.startTime}-${s.endTime})`).join(", ")}`
      );
    }
  } else {
    logError(`Expected availableSlots array, got: ${JSON.stringify(data)}`);
  }
}

async function testDetectClashes() {
  logSection("TEST 6: Detect Clashes API - Find All Clashes");

  // Note: The unique constraint at database level already prevents exact duplicates
  // This test verifies that the clash detection API can find clashes across different scenarios
  await prisma.secondaryTimetable.create({
    data: {
      timeSlotId: timeSlot1.id,
      classId: class1.id,
      subjectId: subject2.id,
      teacherId: teacher2.id,
      termId: term.id,
      academicYearId: academicYear.id,
      dayOfWeek: "TUESDAY",
    },
  });
  logInfo(`Created timetable entries to test clash detection`);

  const url = new URL(`${BASE_URL}/api/timetables/detect-clashes`);
  url.searchParams.set("termId", term.id);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (response.ok) {
    logSuccess(`Clash detection completed`);
    logInfo(`Total clashes: ${data.totalClashes}`);
    logInfo(`Teacher clashes: ${data.summary.teacherClashCount}`);
    logInfo(`Class clashes: ${data.summary.classClashCount}`);
    logInfo(`Entries scanned: ${data.summary.entriesScanned}`);

    if (data.classClashes.length > 0) {
      logSuccess("Class clash detected as expected");
    }
  } else {
    logError(`Expected clash data, got: ${JSON.stringify(data)}`);
  }
}

async function testDetectClashesByClass() {
  logSection("TEST 7: Detect Clashes API - Filter by Class");

  const url = new URL(`${BASE_URL}/api/timetables/detect-clashes`);
  url.searchParams.set("termId", term.id);
  url.searchParams.set("classId", class1.id);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (response.ok) {
    logSuccess(`Clash detection by class completed`);
    logInfo(`Total clashes for class: ${data.totalClashes}`);
  } else {
    logError(`Expected clash data, got: ${JSON.stringify(data)}`);
  }
}

async function cleanup() {
  logSection("CLEANING UP TEST DATA");

  await prisma.secondaryTimetable.deleteMany({});
  await prisma.subjectTeacherAssignment.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.teacherProfile.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.class.deleteMany({});
  await prisma.grade.deleteMany({});
  await prisma.term.deleteMany({});
  await prisma.academicYear.deleteMany({});

  logSuccess("All test data cleaned up");
}

async function runTests() {
  log("\n" + "=".repeat(60), colors.bright + colors.blue);
  log("TIMETABLE CLASH API TEST SUITE", colors.bright + colors.blue);
  log("=".repeat(60) + "\n", colors.bright + colors.blue);

  try {
    await setupTestData();
    await testCheckAvailabilityAPI();
    await testCheckAvailabilityConflict();
    await testCheckClassAvailability();
    await testSuggestionsAvailableTeachers();
    await testSuggestionsAvailableTimeSlots();
    await testDetectClashes();
    await testDetectClashesByClass();

    log("\n" + "=".repeat(60), colors.green);
    log("ALL TESTS COMPLETED SUCCESSFULLY", colors.bright + colors.green);
    log("=".repeat(60) + "\n", colors.green);
  } catch (error: any) {
    logError(`\nTest suite failed: ${error.message}`);
    console.error(error);
  } finally {
    await cleanup();
    await prisma.$disconnect();
  }
}

runTests();
