const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    if (fs.statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

const rootDir = path.join(__dirname, '..');
const files = getAllFiles(rootDir).filter(file =>
  !file.includes('node_modules') &&
  !file.includes('.next') &&
  !file.includes('scripts') &&
  (file.includes('features') || file.includes('lib'))
);

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Replace imports that include Prisma namespace
  // Match: import { ..., Prisma, ... } from "@/types/prisma-enums"
  // Replace with: import from generated prisma for Prisma, keep enums from types

  const importRegex = /import\s+{([^}]+)}\s+from\s+["']@\/types\/prisma-enums["'];?/g;
  const matches = content.matchAll(importRegex);

  for (const match of Array.from(content.matchAll(importRegex))) {
    const imports = match[1];
    const importList = imports.split(',').map(i => i.trim());

    // Check if Prisma is in the imports
    if (importList.some(i => i.includes('Prisma'))) {
      // Split into Prisma and non-Prisma imports
      const prismaImports = importList.filter(i => i.includes('Prisma'));
      const enumImports = importList.filter(i => !i.includes('Prisma') && !i.includes('PrismaClient'));

      let replacement = '';

      // Add Prisma namespace import
      if (prismaImports.length > 0) {
        replacement += `import { ${prismaImports.join(', ')} } from "@/generated/prisma";\n`;
      }

      // Add enum imports if any
      if (enumImports.length > 0) {
        replacement += `import { ${enumImports.join(', ')} } from "@/types/prisma-enums";`;
      }

      content = content.replace(match[0], replacement.trim());
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    updatedCount++;
  }
});

console.log(`\nTotal files updated: ${updatedCount}`);
