# Grade Repository Validation Script

## Purpose

This script validates the Grade repository's CRUD operations against the real database using Prisma.

**Architecture Level**: Repository Layer Only
- ✅ Tests direct database access
- ❌ No services
- ❌ No API routes
- ❌ No business logic validation
- ❌ No mocks

## Prerequisites

1. **Database must be seeded** with at least:
   - 1 active student
   - 1 published assessment
   - 1 subject

2. **Prisma must be migrated**:
   ```bash
   npx prisma migrate dev
   ```

## How to Run

### Using `tsx` (Recommended):
```bash
npx tsx scripts/test-grade-repository.ts
```

### Using `ts-node`:
```bash
npx ts-node --project tsconfig.json scripts/test-grade-repository.ts
```

## What It Tests

The script performs the following operations in sequence:

1. **Fetch Dependencies** - Retrieves existing student, assessment, and subject from database
2. **Create** - Creates a new grade record
3. **Read All** - Fetches all grades
4. **Read by ID** - Fetches the created grade by ID
5. **Update** - Updates the grade's score and remarks
6. **Read by Student** - Fetches all grades for a specific student
7. **Read by Assessment** - Fetches all grades for a specific assessment
8. **Delete** - Removes the test grade record
9. **Cleanup** - Closes Prisma connection

## Expected Output

```
✓ Starting Grade Repository Validation

✓ Fetching test data (Student, Assessment, Subject)
  Found student: Thandiwe Mwanza (2024001)
  Found assessment: CAT 1 - Mathematics (CAT)
  Found subject: Mathematics (MATH)

✓ Creating new grade record
  Created Grade: {
    "id": "clx...",
    "student": "Thandiwe Mwanza",
    "subject": "Mathematics",
    "assessment": "CAT 1 - Mathematics",
    "marksObtained": 87.5,
    "grade": "GRADE_2"
  }

✓ Fetching all grades
  Total grades in database: 5

✓ Fetching grade by ID: clx...
  Retrieved Grade: {
    "id": "clx...",
    "marks": 87.5,
    "grade": "GRADE_2",
    "remarks": "Excellent performance on test validation script"
  }

✓ Updating grade (score and remarks)
  Updated Grade: {
    "id": "clx...",
    "previousMarks": 87.5,
    "newMarks": 92,
    "previousGrade": "GRADE_2",
    "newGrade": "GRADE_1"
  }

✓ Fetching all grades for student: clx...
  Total grades for this student: 3

✓ Fetching all grades for assessment: clx...
  Total grades for this assessment: 15

✓ Deleting test grade record
  Successfully deleted grade with ID: clx...
  Verified: Grade no longer exists in database

✅ ✓ All repository operations validated successfully

Summary:
  - Create: ✓
  - Read All: ✓
  - Read by ID: ✓
  - Read by Student: ✓
  - Read by Assessment: ✓
  - Update: ✓
  - Delete: ✓

→ Prisma connection closed
```

## Error Handling

The script will exit with code 1 and display error messages if:
- Database is not seeded with required test data
- Prisma connection fails
- Any CRUD operation fails
- Grade deletion verification fails

## Clean Architecture Notes

This script:
- ✅ Uses real database (no mocks)
- ✅ Tests repository only
- ✅ Self-cleans test data
- ✅ Exits cleanly
- ✅ Production-quality code

**Next Steps After Validation**:
1. Build service layer on top of repository
2. Create API routes that use services
3. Build React hooks for API consumption
4. Connect UI components to hooks

## File Locations

- **Repository**: `features/grades/grade.repository.ts`
- **Prisma Client**: `lib/db/prisma.ts`
- **Test Script**: `scripts/test-grade-repository.ts`
