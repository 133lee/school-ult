import { ParentRepository } from "../features/parents/parent.repository";
import { ParentStatus } from "@prisma/client";

async function testParentRepository() {
  console.log("🧪 Testing Parent Repository\n");

  const repo = new ParentRepository();

  try {
    console.log("1️⃣  Testing create...");

    const guardian = await repo.create({
      firstName: "John",
      lastName: "Mwansa",
      phone: "+260977123456",
      email: "john.mwansa@email.com",
      address: "123 Lusaka Road, Ndola",
      occupation: "Teacher",
      status: ParentStatus.ACTIVE,
    });

    console.log("✅ Created guardian:", guardian.id);

    console.log("\n2️⃣  Testing findById...");
    const found = await repo.findById(guardian.id);
    if (!found) throw new Error("Guardian not found");
    console.log("✅ Found guardian by ID");

    console.log("\n3️⃣  Testing findByPhone...");
    const foundByPhone = await repo.findByPhone(guardian.phone);
    if (!foundByPhone) throw new Error("Guardian not found by phone");
    console.log("✅ Found guardian by phone");

    console.log("\n4️⃣  Testing update...");
    const updated = await repo.update(guardian.id, {
      occupation: "Civil Servant",
    });
    console.log("✅ Updated guardian occupation:", updated.occupation);

    console.log("\n5️⃣  Testing delete...");
    await repo.delete(guardian.id);
    console.log("✅ Deleted guardian");

    console.log("\n🎉 All ParentRepository tests passed!");
  } catch (error) {
    console.error("\n❌ Test failed:");
    console.error(error);
    process.exit(1);
  }
}

testParentRepository();
