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
  (file.includes('components') || file.includes('app') || file.includes('features') || file.includes('hooks'))
);

let updatedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;

  // Replace @prisma/client imports with @/types/prisma-enums
  content = content.replace(
    /import\s+{([^}]+)}\s+from\s+["']@prisma\/client["'];?/g,
    'import {$1} from "@/types/prisma-enums";'
  );

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated: ${file}`);
    updatedCount++;
  }
});

console.log(`\nTotal files updated: ${updatedCount}`);
