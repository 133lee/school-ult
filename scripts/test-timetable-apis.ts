import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Test credentials
const ADMIN_EMAIL = "admin@school.zm";
const TEACHER_EMAIL = "teacher@school.zm";
const PASSWORD = "password123";

let adminToken = "";
let teacherToken = "";
let academicYearId = "";
let roomId = "";
let configId = "";

async function login(email: string, password: string) {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password,
    });
    return response.data.token;
  } catch (error: any) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
}

async function testRoomAPIs() {
  console.log("\n🧪 Testing Room APIs...\n");

  // Create Room
  console.log("1. Creating a new room...");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/rooms`,
      {
        name: "Science Lab 1",
        code: "SL1",
        type: "SCIENCE_LAB",
        capacity: 30,
        building: "Main Block",
        floor: "Ground Floor",
        description: "Main science laboratory",
        isActive: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    roomId = response.data.room.id;
    console.log("   ✅ Room created:", response.data.room.name);
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }

  // Get All Rooms
  console.log("\n2. Fetching all rooms...");
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/rooms`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`   ✅ Found ${response.data.rooms.length} rooms`);
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }

  // Get Single Room
  console.log("\n3. Fetching single room...");
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/rooms/${roomId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("   ✅ Room fetched:", response.data.room.name);
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }

  // Update Room
  console.log("\n4. Updating room...");
  try {
    const response = await axios.put(
      `${BASE_URL}/api/admin/rooms/${roomId}`,
      {
        capacity: 35,
        description: "Updated science laboratory",
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log("   ✅ Room updated:", response.data.room.name);
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }

  // Create more rooms
  console.log("\n5. Creating additional rooms...");
  const roomsToCreate = [
    { name: "Computer Lab 1", code: "CL1", type: "COMPUTER_LAB" },
    { name: "Room 101", code: "R101", type: "REGULAR_CLASSROOM" },
    { name: "Room 102", code: "R102", type: "REGULAR_CLASSROOM" },
    { name: "Room 103", code: "R103", type: "REGULAR_CLASSROOM" },
  ];

  for (const room of roomsToCreate) {
    try {
      await axios.post(
        `${BASE_URL}/api/admin/rooms`,
        { ...room, isActive: true },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      console.log(`   ✅ Created room: ${room.name}`);
    } catch (error: any) {
      console.error(`   ❌ Error creating ${room.name}:`, error.response?.data?.error || error.message);
    }
  }
}

async function testConfigurationAPI() {
  console.log("\n🧪 Testing Timetable Configuration API...\n");

  // Get Active Academic Year
  console.log("1. Getting active academic year...");
  try {
    const response = await axios.get(`${BASE_URL}/api/academic-years`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const activeYear = response.data.academicYears.find((y: any) => y.isActive);
    if (activeYear) {
      academicYearId = activeYear.id;
      console.log("   ✅ Active academic year:", activeYear.year);
    } else {
      console.log("   ⚠️  No active academic year found");
    }
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }

  // Create/Update Configuration
  console.log("\n2. Creating timetable configuration...");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/timetable/configuration`,
      {
        academicYearId,
        schoolStartTime: "07:00",
        periodDuration: 40,
        breakStartPeriod: 4,
        breakDuration: 15,
        periodsBeforeBreak: 4,
        periodsAfterBreak: 4,
        totalPeriods: 8,
        allowSubjectPreferences: false,
        allowTeacherPreferences: false,
        autoAssignRooms: true,
      },
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    configId = response.data.configuration.id;
    console.log("   ✅ Configuration created/updated");
    console.log("   - School starts:", response.data.configuration.schoolStartTime);
    console.log("   - Period duration:", response.data.configuration.periodDuration, "minutes");
    console.log("   - Total periods:", response.data.configuration.totalPeriods);
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }

  // Get Configuration
  console.log("\n3. Fetching configuration...");
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/timetable/configuration`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("   ✅ Configuration fetched");
    console.log("   - Total periods:", response.data.configuration?.totalPeriods || "Not configured");
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }
}

async function testTimetableGeneration() {
  console.log("\n🧪 Testing Timetable Generation...\n");

  console.log("1. Generating timetable...");
  try {
    const response = await axios.post(
      `${BASE_URL}/api/admin/timetable/generate`,
      {},
      {
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    console.log("   ✅ Timetable generated successfully!");
    console.log("   - Total assignments:", response.data.stats.totalAssignments);
    console.log("   - Slots generated:", response.data.stats.slotsGenerated);
    console.log("   - Conflicts:", response.data.stats.conflicts);

    if (response.data.conflicts && response.data.conflicts.length > 0) {
      console.log("\n   ⚠️  Conflicts detected:");
      response.data.conflicts.slice(0, 5).forEach((conflict: any) => {
        console.log(`      - ${conflict.className}: ${conflict.subjectName} (${conflict.teacherName})`);
        console.log(`        Reason: ${conflict.reason}`);
      });
      if (response.data.conflicts.length > 5) {
        console.log(`      ... and ${response.data.conflicts.length - 5} more`);
      }
    }
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }
}

async function testViewTimetable() {
  console.log("\n🧪 Testing Timetable View APIs...\n");

  // Admin View
  console.log("1. Fetching complete timetable (admin view)...");
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/timetable/view`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("   ✅ Timetable fetched");
    console.log("   - Total slots:", response.data.stats.totalSlots);
    console.log("   - Unique teachers:", response.data.stats.uniqueTeachers);
    console.log("   - Unique classes:", response.data.stats.uniqueClasses);
    console.log("   - Unique rooms:", response.data.stats.uniqueRooms);

    console.log("\n   Slots by day:");
    Object.entries(response.data.timetable).forEach(([day, slots]: [string, any]) => {
      console.log(`   - ${day}: ${slots.length} slots`);
    });
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }

  // Teacher View
  console.log("\n2. Fetching teacher's personal timetable...");
  try {
    const response = await axios.get(`${BASE_URL}/api/teacher/timetable`, {
      headers: { Authorization: `Bearer ${teacherToken}` },
    });
    console.log("   ✅ Teacher timetable fetched");

    let totalSlots = 0;
    Object.entries(response.data.timetable).forEach(([day, slots]: [string, any]) => {
      totalSlots += slots.length;
      if (slots.length > 0) {
        console.log(`\n   ${day}:`);
        slots.forEach((slot: any) => {
          console.log(
            `      Period ${slot.periodNumber}: ${slot.subject.name} - ${slot.class.grade.name} ${slot.class.name} (${slot.startTime}-${slot.endTime})`
          );
          if (slot.room) {
            console.log(`         Room: ${slot.room.name}`);
          }
        });
      }
    });
    console.log(`\n   Total slots for this teacher: ${totalSlots}`);
  } catch (error: any) {
    console.error("   ❌ Error:", error.response?.data?.error || error.message);
  }
}

async function runTests() {
  console.log("=".repeat(60));
  console.log("🚀 Timetable System API Tests");
  console.log("=".repeat(60));

  try {
    // Login
    console.log("\n📝 Logging in...");
    adminToken = await login(ADMIN_EMAIL, PASSWORD);
    console.log("   ✅ Admin logged in");

    teacherToken = await login(TEACHER_EMAIL, PASSWORD);
    console.log("   ✅ Teacher logged in");

    // Run tests
    await testRoomAPIs();
    await testConfigurationAPI();
    await testTimetableGeneration();
    await testViewTimetable();

    console.log("\n" + "=".repeat(60));
    console.log("✅ All tests completed!");
    console.log("=".repeat(60) + "\n");
  } catch (error) {
    console.error("\n❌ Test suite failed:", error);
    process.exit(1);
  }
}

runTests();
