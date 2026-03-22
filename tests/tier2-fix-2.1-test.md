# Test Script: Fix 2.1 - Standardize API Response Shapes

**Fix**: API endpoints now return `{ success, data, meta }` with correct structure
**Scope**: HOD teachers and subjects endpoints only

---

## Quick Test (5 minutes)

### Prerequisites
- HOD user logged in
- At least one secondary grade class exists
- HOD department has teachers and subjects

---

## Test Case 1: Teachers Endpoint Structure

**Objective**: Verify `/api/hod/teachers` returns correct response shape

### Steps

1. **Login as HOD user**
2. **Navigate to any secondary grade class assignments**
   - Go to `/hod/classes`
   - Click "Manage Assignments" on Grade 10A (or any secondary grade)

3. **Open DevTools**
   - Press F12
   - Go to Network tab
   - Find request to `/api/hod/teachers`

4. **Verify Response Structure**

### Expected Response

```json
{
  "success": true,
  "data": [                    // ← Array at top level (NOT data.data)
    {
      "id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "staffNumber": "T001",
      "user": {
        "email": "john@school.com",
        "isActive": true
      },
      "departments": [...]
    }
  ],
  "meta": {                    // ← Sibling to data (NOT inside data)
    "page": 1,
    "pageSize": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### Verification Checklist

- [ ] **Response Status**: 200 OK
- [ ] **Response has** `success: true`
- [ ] **Response has** `data` array at top level
- [ ] **Response has** `meta` object at top level
- [ ] **NOT nested**: `data` is NOT `{ data: [...], meta: {...} }`
- [ ] **Teachers array**: Contains teacher objects
- [ ] **Meta object**: Has `page`, `pageSize`, `total`, `totalPages`

### UI Verification

- [ ] Teacher dropdown populates correctly
- [ ] Can select a teacher from dropdown
- [ ] No console errors
- [ ] No "undefined" in dropdown

---

## Test Case 2: Subjects Endpoint Structure

**Objective**: Verify `/api/hod/subjects` returns correct response shape

### Steps

1. **Same page as Test Case 1**
2. **DevTools → Network tab**
3. **Find request to `/api/hod/subjects`**

### Expected Response

```json
{
  "success": true,
  "data": [                    // ← Array at top level
    {
      "id": "...",
      "name": "Algebra",
      "code": "MATH101",
      "departmentId": "..."
    }
  ],
  "meta": {                    // ← Sibling to data
    "page": 1,
    "pageSize": 10,
    "total": 3,
    "totalPages": 1
  }
}
```

### Verification Checklist

- [ ] **Response Status**: 200 OK
- [ ] **Response has** `success: true`
- [ ] **Response has** `data` array at top level
- [ ] **Response has** `meta` object at top level
- [ ] **NOT nested**: `data` is NOT `{ data: [...], meta: {...} }`
- [ ] **Subjects array**: Contains subject objects
- [ ] **Meta object**: Has pagination fields

### UI Verification

- [ ] Subject dropdown populates correctly
- [ ] Can select a subject from dropdown
- [ ] No console errors
- [ ] No "undefined" in dropdown

---

## Test Case 3: Assignment Creation (Integration)

**Objective**: Verify entire workflow works with new contract

### Steps

1. **On assignments page** (from Test Case 1)
2. **Click "Add Assignment"**
3. **Select teacher** from dropdown
4. **Select subject** from dropdown
5. **Click "Create Assignment"**

### Verification Checklist

- [ ] Teacher dropdown shows teachers (from `/api/hod/teachers`)
- [ ] Subject dropdown shows subjects (from `/api/hod/subjects`)
- [ ] Can select both teacher and subject
- [ ] Assignment creation succeeds
- [ ] Success toast appears
- [ ] Assignment appears in table
- [ ] No console errors throughout

---

## Test Case 4: Error Handling

**Objective**: Verify errors are handled explicitly (not silently)

### Steps

1. **Navigate to assignments page**
2. **Open DevTools → Network tab**
3. **Block `/api/hod/teachers`**
   - Right-click on request → "Block request URL"
4. **Refresh page**

### Verification Checklist

- [ ] Page shows error message (not silent failure)
- [ ] Error message mentions "Failed to load teachers"
- [ ] Error state visible to user
- [ ] Console shows error (not suppressed)
- [ ] Page doesn't crash (white screen)

### Cleanup

- [ ] Unblock `/api/hod/teachers` in DevTools
- [ ] Refresh to verify normal operation resumes

---

## Test Case 5: Pagination (Meta Object)

**Objective**: Verify pagination metadata is accessible

### Steps

1. **Navigate to `/hod/teachers`** (teachers page, not assignments)
2. **Open DevTools → Network tab**
3. **Find request to `/api/hod/teachers`**
4. **Check response**

### Verification Checklist

- [ ] **Meta object present** at top level
- [ ] **Has fields**: `page`, `pageSize`, `total`, `totalPages`
- [ ] **Page number**: Matches current page (default 1)
- [ ] **Total count**: Accurate teacher count
- [ ] **Total pages**: Calculated correctly (total / pageSize)

### UI Verification

- [ ] Pagination component displays
- [ ] Shows "Page X of Y"
- [ ] Shows correct total count
- [ ] Can navigate to next page
- [ ] Meta updates when page changes

---

## Test Case 6: Regression - Other Endpoints

**Objective**: Verify other HOD endpoints unaffected

### Steps

1. **Navigate to `/hod/dashboard`**
   - Verify loads without errors

2. **Navigate to `/hod/profile`**
   - Verify loads without errors

3. **Navigate to `/hod/reports`**
   - Verify loads without errors

4. **Navigate to `/hod/classes`**
   - Verify loads without errors

### Verification Checklist

- [ ] Dashboard loads
- [ ] Profile loads
- [ ] Reports loads
- [ ] Classes loads
- [ ] No console errors on any page
- [ ] All data displays correctly

---

## Code Audit

### Backend Verification

**File 1**: `app/api/hod/teachers/route.ts`

**Check line 44**:
```typescript
// ✅ SHOULD BE:
return ApiResponse.success(result.data, result.meta);

// ❌ SHOULD NOT BE:
return ApiResponse.success(result);
```

**File 2**: `app/api/hod/subjects/route.ts`

**Check line 29**:
```typescript
// ✅ SHOULD BE:
return ApiResponse.success(result.data, result.meta);

// ❌ SHOULD NOT BE:
return ApiResponse.success(result);
```

### Frontend Verification

**File**: `app/(dashboard)/hod/classes/[id]/assignments/page.tsx`

**Check lines 172-186**:
```typescript
// ✅ SHOULD BE:
if (teachersRes.ok) {
  const teachersResult = await teachersRes.json();
  if (!teachersResult.success) {
    throw new Error(teachersResult.error || "Failed to load teachers");
  }
  setTeachers(teachersResult.data || []);
}

// ❌ SHOULD NOT BE (defensive code):
const teachersData = teachersResult.success
  ? teachersResult.data
  : teachersResult;
setTeachers(Array.isArray(teachersData) ? teachersData : []);
```

---

## Test Summary Report

```
# Fix 2.1 Test Results

Date: ___________
Tester: ___________

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Teachers Endpoint Structure | ⬜ PASS / ⬜ FAIL | |
| TC2: Subjects Endpoint Structure | ⬜ PASS / ⬜ FAIL | |
| TC3: Assignment Creation | ⬜ PASS / ⬜ FAIL | |
| TC4: Error Handling | ⬜ PASS / ⬜ FAIL | |
| TC5: Pagination Meta | ⬜ PASS / ⬜ FAIL | |
| TC6: Regression Tests | ⬜ PASS / ⬜ FAIL | |
| Code Audit | ⬜ PASS / ⬜ FAIL | |

## API Response Validation

⬜ `/api/hod/teachers` returns `{ success, data, meta }`
⬜ `/api/hod/subjects` returns `{ success, data, meta }`
⬜ `data` is array at top level (NOT nested)
⬜ `meta` is sibling to `data`

## Frontend Validation

⬜ Defensive code removed
⬜ Explicit error handling added
⬜ Trusts API contract

## Issues Found

[List any issues here]

## Sign-off

⬜ All tests passed
⬜ Fix approved for production

Signature: ___________
```

---

## Rollback Criteria

**Rollback if**:
- ❌ Teachers dropdown empty on assignments page
- ❌ Subjects dropdown empty on assignments page
- ❌ Console errors: "Cannot read property of undefined"
- ❌ API response has nested `data.data`
- ❌ Assignment creation fails
- ❌ Other HOD pages break

**Don't rollback if**:
- ✅ Single test fails due to test data issue → Fix test data
- ✅ Error messages need improvement → Update messages only
- ✅ UI rendering different but functional → Document change

---

## Rollback Command

```bash
git checkout HEAD -- app/api/hod/teachers/route.ts
git checkout HEAD -- app/api/hod/subjects/route.ts
git checkout HEAD -- app/(dashboard)/hod/classes/[id]/assignments/page.tsx
```

---

**Total Test Time**: ~5 minutes
**Critical Tests**: TC1, TC2, TC3 (must pass)
**Optional Tests**: TC4, TC5, TC6 (nice to have)
