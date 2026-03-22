# Test Script: Fix 1.2 - SECONDARY_GRADES Backend Authority

**Fix**: Removed hardcoded SECONDARY_GRADES constants, backend now validates

**Files Changed**:
- `app/api/hod/reports/grades/route.ts` (added WHERE filter)
- `app/(dashboard)/hod/reports/page.tsx` (removed client filter)
- `app/(dashboard)/hod/classes/page.tsx` (removed isSecondaryGrade)
- `app/(dashboard)/hod/classes/[id]/assignments/page.tsx` (removed validation)

---

## Pre-Test Setup

### Required Data

1. **Grades in Database**
   - Primary grades: 1, 2, 3, 4, 5, 6, 7
   - Secondary grades: 8, 9, 10, 11, 12
   - Verify with:
   ```sql
   SELECT id, name, level, sequence
   FROM grades
   ORDER BY sequence;
   ```

2. **Classes**
   - At least 1 primary grade class (e.g., Grade 3A)
   - At least 2 secondary grade classes (e.g., Grade 10A, Grade 11B)

3. **HOD User**
   - Department: Mathematics
   - Department has subjects assigned
   - Department has teachers assigned

### Database Verification

```sql
-- Verify classes exist across grade levels
SELECT
  c.id,
  c.name,
  g.name as grade_name,
  g.level as grade_level,
  c.capacity,
  c.status
FROM classes c
JOIN grades g ON g.id = c.gradeId
ORDER BY g.sequence, c.name;
```

**Expected**: Mix of primary (1-7) and secondary (8-12) classes

---

## Test Case 1: Reports Page - Backend Filters Grades

**Objective**: Verify `/api/hod/reports/grades` returns ONLY secondary grades (8-12)

### Steps

1. **Login as HOD user**
   - Navigate to `/login`
   - Enter HOD credentials
   - Login successfully

2. **Navigate to Reports page**
   - Click "Reports" in sidebar
   - OR navigate to `/hod/reports`

3. **Open DevTools**
   - Press F12
   - Go to Network tab
   - Clear existing requests

4. **Reload the page**
   - Press F5
   - Find request to `/api/hod/reports/grades`

### Verification Checklist

- [ ] **Network Request**
  - URL: `/api/hod/reports/grades`
  - Method: `GET`
  - Status: `200 OK`
  - Authorization header present

- [ ] **Response Body** (Preview tab)
  ```json
  {
    "success": true,
    "grades": [
      {
        "id": "...",
        "name": "Grade 8",
        "level": "GRADE_8",
        "sequence": 8
      },
      {
        "id": "...",
        "name": "Grade 9",
        "level": "GRADE_9",
        "sequence": 9
      },
      // ... up to GRADE_12
    ]
  }
  ```

- [ ] **Data Validation**
  - ONLY grades 8, 9, 10, 11, 12 present
  - NO grades 1-7 in response
  - All `level` fields are `GRADE_8` through `GRADE_12`
  - Count should be 5 grades exactly (if all exist in DB)

- [ ] **UI Dropdown**
  - Open "Grade" dropdown on reports page
  - Should show ONLY Grade 8, 9, 10, 11, 12
  - Should NOT show Grade 1, 2, 3, 4, 5, 6, 7

### Expected Result

✅ **PASS** if:
- API returns ONLY secondary grades (8-12)
- UI dropdown shows ONLY secondary grades
- No client-side filtering code executed

❌ **FAIL** if:
- Primary grades (1-7) appear in API response
- Primary grades appear in UI dropdown
- More or fewer than 5 grades returned

---

## Test Case 2: Classes Page - All Classes Visible

**Objective**: Verify HOD can see ALL classes (including primary grades)

### Steps

1. **Navigate to Classes page**
   - Click "Classes" in sidebar
   - OR navigate to `/hod/classes`

2. **Observe class list**

### Verification Checklist

- [ ] **UI Display**
  - All classes visible (primary AND secondary)
  - Each class row shows:
    - Class name
    - Grade name
    - Capacity
    - Current enrollment
    - Status

- [ ] **"Manage Assignments" Button**
  - Every class has "Manage Assignments" button
  - Button is NOT disabled for any class
  - Button appears even for primary grades (1-7)

- [ ] **No Frontend Filtering**
  - Open browser console
  - Check for any filtering logic
  - Should see NO `SECONDARY_GRADES` constant
  - Should see NO `isSecondaryGrade()` function calls

### Expected Result

✅ **PASS** if:
- All classes visible (primary + secondary)
- "Manage Assignments" button on every class
- No disabled buttons

❌ **FAIL** if:
- Some classes missing
- "Manage Assignments" button disabled/hidden for primary grades

---

## Test Case 3: Assignments - Primary Grade BLOCKED by Backend

**Objective**: Verify backend rejects assignment management for primary grades

### Prerequisites

- At least one primary grade class exists (e.g., Grade 3A)

### Steps

1. **Navigate to Classes page** (`/hod/classes`)

2. **Find a primary grade class** (e.g., Grade 3A)

3. **Click "Manage Assignments"** for that class

4. **Observe behavior**

### Verification Checklist

- [ ] **Navigation**
  - URL changes to `/hod/classes/[classId]/assignments`
  - Page attempts to load

- [ ] **Backend Validation**
  - API calls are made
  - Backend returns error (check Network tab)
  - Error response visible in DevTools

- [ ] **Error Display**
  - Error message appears on page
  - Message mentions "secondary grades (8-12)" or similar
  - Error is clear and user-friendly
  - Page doesn't crash / white screen

- [ ] **Network Request** (DevTools)
  - Request to `/api/classes/[classId]` succeeds
  - Class data returned includes `grade.level` (e.g., `GRADE_3`)
  - Other assignment-related API calls may fail with 403/400

### Expected Error Message

Should see one of:
- "HOD can only manage assignments for secondary grades (8-12)"
- "Invalid grade level for HOD assignment management"
- Similar backend-generated error

### Expected Result

✅ **PASS** if:
- Page loads (no crash)
- Error message appears
- Error comes from backend (API response), not hardcoded frontend
- User understands they can't manage this class

❌ **FAIL** if:
- White screen / crash
- No error message
- Assignment form appears (should be blocked!)
- Error is hardcoded frontend check (should be from API)

---

## Test Case 4: Assignments - Secondary Grade ALLOWED

**Objective**: Verify backend allows assignment management for secondary grades

### Prerequisites

- At least one secondary grade class exists (e.g., Grade 10A)
- HOD's department has subjects
- HOD's department has teachers

### Steps

1. **Navigate to Classes page** (`/hod/classes`)

2. **Find a secondary grade class** (e.g., Grade 10A)

3. **Click "Manage Assignments"** for that class

4. **Verify page loads successfully**

### Verification Checklist

- [ ] **Page Load**
  - URL: `/hod/classes/[classId]/assignments`
  - Page loads without errors
  - No error messages displayed

- [ ] **Page Content**
  - Class header shows: "Grade 10 - 10A"
  - Academic year dropdown visible
  - "Add Assignment" button visible
  - Assignments table visible (may be empty)

- [ ] **Dropdowns Populated**
  - Subject dropdown shows department subjects
  - Teacher dropdown shows department teachers
  - Academic year dropdown shows available years

- [ ] **Network Requests** (DevTools)
  - Request to `/api/classes/[classId]` → 200 OK
  - Request to `/api/hod/teachers` → 200 OK
  - Request to `/api/hod/subjects` → 200 OK
  - Request to `/api/academic-years` → 200 OK
  - Request to `/api/hod/assignments/by-class/[classId]` → 200 OK

### Expected Result

✅ **PASS** if:
- Page loads successfully
- All dropdowns populated
- Can create assignment (test in next case)
- No errors in console

❌ **FAIL** if:
- Page blocked with error
- Dropdowns empty
- Console errors
- API returns 403/400

---

## Test Case 5: Assignment Creation - Full Workflow

**Objective**: Verify complete assignment creation for secondary grade

### Steps

1. **On Grade 10A assignments page** (from TC4)

2. **Click "Add Assignment" button**

3. **Fill form**
   - Select a subject from department (e.g., "Algebra")
   - Select a teacher from department (e.g., "John Doe")

4. **Submit**
   - Click "Create Assignment"

5. **Verify success**

### Verification Checklist

- [ ] **Before Submit**
  - Dialog opens
  - Subject dropdown populated
  - Teacher dropdown populated
  - Both are required fields

- [ ] **Submit**
  - Loading spinner appears
  - Request to `/api/hod/assignments` (POST)
  - Status: 201 Created or 200 OK

- [ ] **Request Body** (DevTools Payload tab)
  ```json
  {
    "teacherId": "...",
    "subjectId": "...",
    "classId": "...",
    "academicYearId": "..."
  }
  ```

- [ ] **After Submit**
  - Success toast: "Assignment created successfully"
  - Dialog closes
  - Table refreshes
  - New assignment appears in list

- [ ] **Validation** (Backend)
  - Backend validates:
    - Subject belongs to HOD's department ✓
    - Teacher is member of HOD's department ✓
    - Class is secondary grade (8-12) ✓
    - Academic year is active ✓

### Expected Result

✅ **PASS** if:
- Assignment created successfully
- Success toast appears
- Assignment appears in table
- Backend performed all validations

❌ **FAIL** if:
- Creation fails with error
- No validation performed
- Assignment created for wrong department
- Toast doesn't appear

---

## Test Case 6: Code Audit - No SECONDARY_GRADES Constants

**Objective**: Verify hardcoded constants removed from frontend

### Manual Code Check

**File 1**: `app/(dashboard)/hod/reports/page.tsx`

Search for:
```typescript
// ❌ SHOULD NOT EXIST
["GRADE_8", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"]
SECONDARY_GRADES
.filter((g: any) => ...includes(g.level))
```

Expected at line 66:
```typescript
// ✅ SHOULD EXIST
// Fetch grades (backend returns secondary grades only)
const gradesData = await api.get("/hod/reports/grades");
setGrades(gradesData.grades);  // No filter
```

**File 2**: `app/(dashboard)/hod/classes/page.tsx`

Search for:
```typescript
// ❌ SHOULD NOT EXIST
const SECONDARY_GRADES = [...]
const isSecondaryGrade = (classItem: any) => {...}
if (isSecondaryGrade(classItem)) {...}
```

Expected at line 82-85:
```typescript
// ✅ SHOULD EXIST
const handleManageAssignments = (classItem: any) => {
  router.push(`/hod/classes/${classItem.id}/assignments`);
};
```

**File 3**: `app/(dashboard)/hod/classes/[id]/assignments/page.tsx`

Search for:
```typescript
// ❌ SHOULD NOT EXIST
const SECONDARY_GRADES = [...]
if (!SECONDARY_GRADES.includes(classDataResult.grade.level)) {...}
setError("HOD can only manage assignments for secondary grades (8-12)");
```

Expected at line 154-156:
```typescript
// ✅ SHOULD EXIST
const classDataResult = classResult.data;

setClassData(classDataResult);
// No validation here - backend handles it
```

### Verification Checklist

- [ ] **Reports Page**
  - No hardcoded grade array
  - No client-side filter
  - Uses API response directly

- [ ] **Classes Page**
  - No `SECONDARY_GRADES` constant
  - No `isSecondaryGrade()` function
  - All classes get "Manage Assignments" button

- [ ] **Assignments Page**
  - No frontend grade validation
  - No hardcoded error message
  - Loads class data without pre-validation

### Expected Result

✅ **PASS** if:
- No hardcoded grade constants found
- No client-side validation found
- Code matches expected patterns

❌ **FAIL** if:
- `SECONDARY_GRADES` constant still exists
- Client-side filtering still present
- Hardcoded validation found

---

## Test Case 7: Backend Validation Audit

**Objective**: Verify backend still validates grades correctly

### Backend Code Check

**File**: `app/api/hod/reports/grades/route.ts`

Expected at lines 19-24:
```typescript
// ✅ SHOULD EXIST
const grades = await prisma.grade.findMany({
  where: {
    level: {
      in: ["GRADE_8", "GRADE_9", "GRADE_10", "GRADE_11", "GRADE_12"],
    },
  },
  // ...
});
```

**File**: `features/subject-teacher-assignments/subjectTeacherAssignment.service.ts`

Search for validation function:
```typescript
// ✅ SHOULD EXIST (unchanged)
private async validateSecondaryGrade(classId: string) {
  const SECONDARY_GRADES = [...];
  if (!SECONDARY_GRADES.includes(classEntity.grade.level)) {
    throw new ValidationError(...);
  }
}
```

### Verification Checklist

- [ ] **Reports API**
  - WHERE clause filters to secondary grades
  - Query returns only GRADE_8 through GRADE_12

- [ ] **Assignment Service**
  - `validateSecondaryGrade()` method still exists
  - Still uses SECONDARY_GRADES constant (OK in backend!)
  - Throws error for primary grades

- [ ] **Backend is Single Source of Truth**
  - All grade validation in backend
  - Frontend trusts backend
  - No duplication between frontend/backend

### Expected Result

✅ **PASS** if:
- Backend validation intact
- Service layer unchanged
- API endpoint filters grades

❌ **FAIL** if:
- Backend validation removed (CRITICAL!)
- API returns all grades
- No validation in service layer

---

## Integration Test: Full User Journey

**Objective**: Test realistic HOD workflow

### Scenario

HOD wants to view performance reports and manage assignments.

### Steps

1. **Login as HOD** → Dashboard
2. **Navigate to Reports** → `/hod/reports`
3. **Select filters**:
   - Grade: 10 (from dropdown - should only see 8-12)
   - Class: 10A
   - Subject: Mathematics (from HOD's department)
   - Term: Term 1
4. **View report** → Should load successfully
5. **Navigate to Classes** → `/hod/classes`
6. **Try to manage Grade 3A** (primary) → Should show error
7. **Manage Grade 10A** (secondary) → Should load successfully
8. **Create assignment**:
   - Teacher: John Doe
   - Subject: Algebra
9. **Submit** → Success toast
10. **Verify assignment appears** in table

### Verification Checklist

- [ ] Grade dropdown shows only 8-12
- [ ] Report loads for Grade 10
- [ ] Grade 3A management blocked with clear error
- [ ] Grade 10A management works
- [ ] Assignment creation succeeds
- [ ] No console errors throughout
- [ ] All API calls return expected responses

### Expected Result

✅ **PASS** if:
- Entire workflow completes
- Errors appear only for invalid actions
- Valid actions succeed

❌ **FAIL** if:
- Any step fails unexpectedly
- Console errors
- White screens

---

## Regression Tests

### Test: Existing HOD Features Still Work

- [ ] **Dashboard**
  - Loads without errors
  - Shows department stats
  - Performance metrics display

- [ ] **Teachers Page**
  - Lists department teachers
  - Filters work
  - Pagination works

- [ ] **Subjects Page**
  - Lists department subjects
  - Search works
  - View subject details

- [ ] **Students Page**
  - Lists enrolled students
  - Filters work
  - View student details

- [ ] **Profile Page**
  - Displays correctly
  - Shows department info
  - Change password works

---

## Test Summary Report Template

```
# Fix 1.2 Test Results

Date: ___________
Tester: ___________

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Reports - Backend Filters Grades | ⬜ PASS / ⬜ FAIL | |
| TC2: Classes - All Visible | ⬜ PASS / ⬜ FAIL | |
| TC3: Assignments - Primary Blocked | ⬜ PASS / ⬜ FAIL | |
| TC4: Assignments - Secondary Allowed | ⬜ PASS / ⬜ FAIL | |
| TC5: Assignment Creation | ⬜ PASS / ⬜ FAIL | |
| TC6: Code Audit - No Constants | ⬜ PASS / ⬜ FAIL | |
| TC7: Backend Validation Audit | ⬜ PASS / ⬜ FAIL | |
| Integration: Full User Journey | ⬜ PASS / ⬜ FAIL | |
| Regression: Dashboard | ⬜ PASS / ⬜ FAIL | |
| Regression: Teachers/Subjects/Students | ⬜ PASS / ⬜ FAIL | |

## Issues Found

[List any issues here]

## Backend Validation Verified

⬜ `/api/hod/reports/grades` returns only secondary grades
⬜ Assignment service validates grade level
⬜ Frontend trusts backend errors

## Sign-off

⬜ All tests passed
⬜ Backend authority confirmed
⬜ Fix approved for production

Signature: ___________
```

---

## Rollback Criteria

**Rollback Fix 1.2 if:**

1. Backend allows primary grade assignment creation (validation broken)
2. Reports page crashes on load
3. Assignments page crashes for secondary grades
4. API returns all grades instead of secondary only
5. Frontend validation is still present (constants not removed)

**Rollback Commands:**
```bash
# Revert all changes
git checkout HEAD -- app/api/hod/reports/grades/route.ts
git checkout HEAD -- app/(dashboard)/hod/reports/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/[id]/assignments/page.tsx
```

---

## Performance Notes

### Expected Behavior Changes

**Before Fix:**
- Frontend filtered grades client-side
- Frontend blocked primary grade navigation
- Hardcoded validation prevented API calls

**After Fix:**
- Backend filters grades at query level
- Frontend allows all navigation
- Backend rejects invalid requests with clear errors

**UX Impact:**
- Slightly slower (frontend makes API call for invalid grades)
- Better error messages (from backend, not hardcoded)
- More maintainable (one source of truth)

**Acceptable Trade-off:** Slightly slower for invalid actions, but:
- More reliable (backend authority)
- Easier to change business rules
- No frontend/backend drift
