const fs = require('fs');
const path = require('path');

const filesToFix = [
  './app/api/academic-years/active/route.ts',
  './app/api/academic-years/route.ts',
  './app/api/academic-years/[id]/activate/route.ts',
  './app/api/academic-years/[id]/close/route.ts',
  './app/api/academic-years/[id]/reopen/route.ts',
  './app/api/academic-years/[id]/route.ts',
  './app/api/academic-years/[id]/stats/route.ts',
  './app/api/assignments/bulk/route.ts',
  './app/api/assignments/route.ts',
  './app/api/assignments/[id]/route.ts',
  './app/api/classes/[id]/assignments/route.ts',
  './app/api/classes/[id]/enrollment-stats/route.ts',
  './app/api/classes/[id]/students/route.ts',
  './app/api/enrollments/bulk/route.ts',
  './app/api/enrollments/route.ts',
  './app/api/enrollments/[id]/route.ts',
  './app/api/students/[id]/enrollments/route.ts',
  './app/api/subjects/[id]/assignments/route.ts',
  './app/api/teachers/[id]/assignments/route.ts',
  './app/api/teachers/[id]/workload/route.ts',
];

let fixedCount = 0;

filesToFix.forEach((file) => {
  try {
    const content = fs.readFileSync(file, 'utf8');

    // Replace imports
    let newContent = content
      .replace(
        /import \{ getServerSession \} from "next-auth";\nimport \{ authOptions \} from "@\/lib\/auth\/authOptions";/g,
        'import { verifyToken } from "@/lib/auth/jwt";'
      )
      .replace(
        /import \{ authOptions \} from "@\/lib\/auth\/authOptions";\nimport \{ getServerSession \} from "next-auth";/g,
        'import { verifyToken } from "@/lib/auth/jwt";'
      );

    // Replace auth logic
    newContent = newContent.replace(
      /    const session = await getServerSession\(authOptions\);\n    if \(!session\?\.user\) \{\n      return NextResponse\.json\(\{ error: "Unauthorized" \}, \{ status: 401 \}\);\n    \}/g,
      `    // Extract and verify JWT token
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }`
    );

    // Replace session.user.id with decoded.userId
    newContent = newContent.replace(/session\.user\.id/g, 'decoded.userId');

    // Replace session.user.role with decoded.role
    newContent = newContent.replace(/session\.user\.role/g, 'decoded.role');

    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      console.log(`✅ Fixed: ${file}`);
      fixedCount++;
    } else {
      console.log(`⏭️  Skipped (no changes): ${file}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log(`\n📊 Fixed ${fixedCount} out of ${filesToFix.length} files`);
