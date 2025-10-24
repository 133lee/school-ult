# Class Teacher Assignment Rules

## Overview

This document outlines the **one class teacher per teacher** business rule implemented in the school management system.

## Business Rule

**A teacher can only be assigned as a class teacher (homeroom teacher) to ONE class at a time within a given academic year and term.**

## Rationale

### 1. **Clear Responsibility and Accountability**
- Each class has one primary point of contact
- Students and parents know exactly who to approach
- Reduces confusion about which teacher is responsible for overall class management

### 2. **Manageable Workload**
- Class teachers have significant administrative responsibilities:
  - Taking morning register (official daily attendance)
  - Tracking overall student performance and behavior
  - Parent-teacher communications
  - Class-level administrative tasks
  - Pastoral care for all students in the class
- Managing multiple classes would be overwhelming

### 3. **Direct Line of Communication**
- Parents have a single, consistent point of contact
- School administration can easily identify who to notify about class-level issues
- Simplifies emergency protocols

### 4. **Simplified Morning Register**
- Class teachers take the official morning register once per day
- Having multiple classes would require the teacher to be in multiple places simultaneously
- Ensures accurate and timely attendance records

## Implementation

### Database Schema

**File:** `prisma/schema.prisma`

```prisma
model TeacherClassAssignment {
  id             String    @id @default(cuid())
  teacherId      String
  classId        String
  academicYearId String
  termId         String
  isClassTeacher Boolean   @default(false)
  isActive       Boolean   @default(true)
  // ... other fields

  // IMPORTANT: A teacher can only be a class teacher for ONE class per academic year/term
  // This is enforced by creating a unique partial index where isClassTeacher=true
  // Note: Prisma doesn't support conditional unique constraints directly in schema
  // This must be enforced at the application level with a check before creating/updating
  @@index([teacherId, academicYearId, termId, isClassTeacher])
  @@map("teacher_class_assignments")
}
```

### Validation Helper

**File:** `lib/validation/class-teacher-rules.ts`

The validation helper provides functions to:
- Check if a teacher is already assigned as a class teacher
- Validate new assignments before saving
- Generate user-friendly error messages
- Provide Prisma query templates

### UI Implementation

#### Teacher View
**File:** `app/(dashboard)/teacher/my-classes/page.tsx`

- Shows only ONE class in the "Class I Manage" section
- Displays multiple classes in "Classes I Teach" section (as subject teacher)
- Mock data demonstrates the constraint

#### Admin View
**File:** `app/(dashboard)/admin/classes/new/page.tsx`

- Shows warning alert when assigning class teacher
- Prevents assignment of teachers who are already class teachers elsewhere
- Clear messaging about the constraint

## Scope of the Constraint

The constraint applies **per academic year and term**. This means:

- ✅ A teacher can be class teacher for Class 9A in Term 1, 2024-2025
- ✅ The same teacher can be class teacher for Class 10A in Term 1, 2025-2026 (different year)
- ❌ The same teacher CANNOT be class teacher for both Class 9A AND Class 9B in Term 1, 2024-2025

## Important Notes

### Teachers Can Still Teach Multiple Classes
This rule only applies to **class teacher** (homeroom) assignments. A teacher can:
- Be class teacher for ONE class
- Teach subjects in MULTIPLE classes (including their own)
- Have unlimited subject teacher assignments

### Example Scenario
Ms. Sarah Johnson:
- **Class Teacher:** Class 9A (ONE class)
- **Subject Teacher:** Mathematics in Classes 9A, 9B, 10A, 10B (MULTIPLE classes)

## Enforcement Points

### 1. Application Level (Primary)
- **Before Creating Assignment:** Check if teacher already has a class teacher assignment
- **Before Updating Assignment:** Validate the constraint isn't violated
- **UI Validation:** Prevent selection of conflicting teachers

### 2. Database Level (Secondary)
- Composite index on `[teacherId, academicYearId, termId, isClassTeacher]`
- Helps with query performance and partial enforcement

### 3. API Level
- Validation in API routes before database operations
- Return clear error messages with details of existing assignment

## Code Examples

### Checking Before Assignment (Prisma)

```typescript
import { PrismaClient } from '@prisma/client';
import { getClassTeacherConflictMessage } from '@/lib/validation/class-teacher-rules';

const prisma = new PrismaClient();

async function assignClassTeacher(
  teacherId: string,
  classId: string,
  academicYearId: string,
  termId: string
) {
  // Check for existing assignment
  const existingAssignment = await prisma.teacherClassAssignment.findFirst({
    where: {
      teacherId: teacherId,
      academicYearId: academicYearId,
      termId: termId,
      isClassTeacher: true,
      isActive: true,
    },
    include: {
      class: true,
      teacher: true,
    },
  });

  // Reject if already assigned
  if (existingAssignment) {
    const teacherName = `${existingAssignment.teacher.firstName} ${existingAssignment.teacher.lastName}`;
    const className = existingAssignment.class.name;

    throw new Error(
      getClassTeacherConflictMessage(teacherName, className)
    );
  }

  // Proceed with assignment
  return await prisma.teacherClassAssignment.create({
    data: {
      teacherId,
      classId,
      academicYearId,
      termId,
      isClassTeacher: true,
      isActive: true,
    },
  });
}
```

### UI Validation Example

```typescript
import { validateClassTeacherAssignment } from '@/lib/validation/class-teacher-rules';

function handleClassTeacherSelect(teacherId: string) {
  const validation = validateClassTeacherAssignment(
    teacherId,
    currentAcademicYear,
    currentTerm,
    existingAssignments
  );

  if (!validation.isValid) {
    // Show error to user
    toast.error(validation.message);
    return;
  }

  // Proceed with assignment
  assignTeacher(teacherId);
}
```

## Migration Notes

If you have existing data where teachers are assigned to multiple classes:

1. **Audit Existing Assignments**
   ```sql
   SELECT teacherId, COUNT(*) as class_count
   FROM teacher_class_assignments
   WHERE isClassTeacher = true AND isActive = true
   GROUP BY teacherId, academicYearId, termId
   HAVING COUNT(*) > 1;
   ```

2. **Resolve Conflicts**
   - Identify the primary class for each teacher
   - Mark other assignments as subject teacher only (`isClassTeacher = false`)
   - Document changes and notify affected teachers

3. **Apply Constraint**
   - Implement application-level validation
   - Update UI to reflect the new rule
   - Train admin staff on the constraint

## Testing Checklist

- [ ] Cannot assign teacher as class teacher to multiple classes in same term
- [ ] Can assign same teacher as class teacher in different academic years
- [ ] Can assign same teacher as class teacher in different terms
- [ ] Can assign teacher as subject teacher to unlimited classes
- [ ] Can assign teacher as class teacher to one class AND subject teacher to multiple classes
- [ ] UI shows appropriate warning messages
- [ ] API returns proper error messages with details
- [ ] Database queries include the constraint check

## Support and Questions

For questions about this constraint or to request changes, please:
1. Review the rationale section above
2. Discuss with the academic administration team
3. Document any proposed changes to the business rule
4. Update this documentation if the rule changes

---

**Last Updated:** 2025-10-24
**Rule Version:** 1.0
**Status:** Active and Enforced
