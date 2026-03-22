import prisma from "../lib/db/prisma";

async function testDepartmentQuery() {
  console.log("=== Testing Department Query ===\n");

  // Simulate the exact query from department.repository.ts findMany
  console.log("1. Running the findMany query:");
  const departments = await prisma.department.findMany({
    skip: 0,
    take: 10,
    where: {},
    orderBy: { name: "asc" },
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
      _count: {
        select: {
          subjects: true,
          teachers: true,
        },
      },
    },
  });

  console.log("\n2. Query Results:");
  departments.forEach((dept) => {
    console.log(`\nDepartment: ${dept.name} (${dept.code})`);
    console.log(`  hodTeacherId: ${dept.hodTeacherId}`);
    console.log(`  hodTeacher object:`, dept.hodTeacher);
    console.log(`  _count:`, dept._count);
  });

  // Check all departments
  console.log("\n3. All departments (simple query):");
  const allDepts = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      code: true,
      hodTeacherId: true,
    },
  });
  console.log(allDepts);

  await prisma.$disconnect();
}

testDepartmentQuery().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
