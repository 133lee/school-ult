const fs = require('fs');

const filesToFix = [
  './app/api/attendance/[id]/route.ts',
  './app/api/attendance/class/[classId]/route.ts',
  './app/api/attendance/student/[studentId]/route.ts',
  './app/api/attendance/student/[studentId]/stats/route.ts',
];

let fixedCount = 0;

filesToFix.forEach((file) => {
  try {
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;

    // Fix params type from { id: string } to Promise<{ id: string }>
    content = content.replace(
      /\{ params \}: \{ params: \{ id: string \} \}/g,
      '{ params }: { params: Promise<{ id: string }> }'
    );

    // Fix params type from { classId: string } to Promise<{ classId: string }>
    content = content.replace(
      /\{ params \}: \{ params: \{ classId: string \} \}/g,
      '{ params }: { params: Promise<{ classId: string }> }'
    );

    // Fix params type from { studentId: string } to Promise<{ studentId: string }>
    content = content.replace(
      /\{ params \}: \{ params: \{ studentId: string \} \}/g,
      '{ params }: { params: Promise<{ studentId: string }> }'
    );

    // Add await params for id
    content = content.replace(
      /(const decoded = verifyToken\(token\);[\s\S]*?}\n\n)([ ]+)(const (?:attendance|results|stats) = await )/g,
      (match, p1, p2, p3) => {
        if (match.includes('const { id } = await params;')) {
          return match;
        }
        return `${p1}${p2}const { id } = await params;\n\n${p2}${p3}`;
      }
    );

    // Add await params for classId
    content = content.replace(
      /(const decoded = verifyToken\(token\);[\s\S]*?}\n\n)([ ]+)(const (?:attendance|classAttendance) = await )/g,
      (match, p1, p2, p3) => {
        if (match.includes('const { classId } = await params;')) {
          return match;
        }
        return `${p1}${p2}const { classId } = await params;\n\n${p2}${p3}`;
      }
    );

    // Add await params for studentId
    content = content.replace(
      /(const decoded = verifyToken\(token\);[\s\S]*?}\n\n)([ ]+)(const (?:attendance|records|stats) = await )/g,
      (match, p1, p2, p3) => {
        if (match.includes('const { studentId } = await params;')) {
          return match;
        }
        return `${p1}${p2}const { studentId } = await params;\n\n${p2}${p3}`;
      }
    );

    // Replace params.id with id
    content = content.replace(/params\.id/g, 'id');

    // Replace params.classId with classId
    content = content.replace(/params\.classId/g, 'classId');

    // Replace params.studentId with studentId
    content = content.replace(/params\.studentId/g, 'studentId');

    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
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
