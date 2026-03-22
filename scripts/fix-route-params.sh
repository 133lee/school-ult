#!/bin/bash

# Script to fix Next.js 15+ params in route files
# Changes { params }: { params: { id: string } } to { params }: { params: Promise<{ id: string }> }
# and adds await for params

echo "Fixing route files for Next.js 15+ params..."

files=$(grep -r "{ params }: { params: { id: string }" app/api --include="route.ts" -l)

for file in $files; do
  echo "Processing: $file"

  # Create backup
  cp "$file" "$file.bak"

  # Use sed to replace the pattern
  sed -i 's/{ params }: { params: { id: string }/{ params }: { params: Promise<{ id: string }>/g' "$file"

  echo "✓ Updated $file"
done

echo "Done! Fixed $(echo "$files" | wc -l) files"
echo "Note: You'll need to manually add 'const { id } = await params;' in each function"
