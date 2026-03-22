# Test Script: Fix 1.1 - Profile hasDefaultPassword from API

**Fix**: Profile page now gets `hasDefaultPassword` from API, not localStorage

**Files Changed**:
- `app/api/hod/profile/route.ts` (no change - already correct)
- `app/(dashboard)/hod/profile/page.tsx` (removed localStorage read)

---

## Pre-Test Setup

### Required Test Users

1. **HOD User with Default Password**
   - Email: `hod.math@school.com`
   - Password: Default password (e.g., `Password123!`)
   - Department: Mathematics
   - `hasDefaultPassword: true` in database

2. **HOD User with Changed Password**
   - Email: `hod.science@school.com`
   - Password: User-changed password
   - Department: Science
   - `hasDefaultPassword: false` in database

### Database Verification

```sql
-- Check user's hasDefaultPassword status
SELECT
  u.email,
  u.role,
  u.hasDefaultPassword,
  tp.firstName,
  tp.lastName,
  d.name as department
FROM users u
LEFT JOIN teacher_profiles tp ON tp.userId = u.id
LEFT JOIN departments d ON d.hodTeacherId = tp.id
WHERE d.hodTeacherId IS NOT NULL;
```

**Expected**: At least 2 HOD users, one with `hasDefaultPassword: true`, one with `false`

---

## Test Case 1: User with Default Password - Prompt Shows

**Objective**: Verify password change prompt appears when API returns `hasDefaultPassword: true`

### Steps

1. **Clear browser storage** (important!)
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

2. **Login as HOD with default password**
   - Navigate to `/login`
   - Enter credentials: `hod.math@school.com` / `Password123!`
   - Click "Login"

3. **Navigate to profile page**
   - Click on user menu (top right)
   - Click "My Profile" or navigate to `/hod/profile`

4. **Open DevTools**
   - Press F12
   - Go to Network tab
   - Find request to `/api/hod/profile`
   - Click on the request

### Verification Checklist

- [ ] **Network Request**
  - Request URL: `/api/hod/profile`
  - Method: `GET`
  - Status: `200 OK`
  - Authorization header present

- [ ] **Response Body** (Preview tab)
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "email": "hod.math@school.com",
      "role": "TEACHER",
      "hasDefaultPassword": true,  // ← MUST BE TRUE
      "lastLogin": "...",
      "createdAt": "...",
      "department": {
        "id": "...",
        "name": "Mathematics Department",
        ...
      }
    }
  }
  ```

- [ ] **UI Behavior**
  - Password change prompt dialog appears
  - Dialog has title "Change Your Password"
  - Dialog shows warning about default password
  - Dialog cannot be dismissed without changing password

- [ ] **Console Verification**
  - No errors in console
  - No warnings about localStorage
  - No "Cannot read property of undefined" errors

### Expected Result

✅ **PASS** if:
- API response includes `"hasDefaultPassword": true`
- Password change prompt appears automatically
- No console errors

❌ **FAIL** if:
- No password prompt appears
- Console errors present
- API response missing `hasDefaultPassword` field

---

## Test Case 2: User with Changed Password - No Prompt

**Objective**: Verify NO password prompt when API returns `hasDefaultPassword: false`

### Steps

1. **Logout** from previous test
   - Click user menu
   - Click "Logout"

2. **Clear browser storage** (important!)
   ```javascript
   // In browser console
   localStorage.clear();
   sessionStorage.clear();
   ```

3. **Login as HOD with changed password**
   - Navigate to `/login`
   - Enter credentials: `hod.science@school.com` / `UserChangedPassword123!`
   - Click "Login"

4. **Navigate to profile page**
   - Click on user menu
   - Click "My Profile" or navigate to `/hod/profile`

5. **Open DevTools**
   - Press F12
   - Go to Network tab
   - Find request to `/api/hod/profile`

### Verification Checklist

- [ ] **Network Request**
  - Request URL: `/api/hod/profile`
  - Method: `GET`
  - Status: `200 OK`

- [ ] **Response Body**
  ```json
  {
    "success": true,
    "data": {
      "id": "...",
      "email": "hod.science@school.com",
      "role": "TEACHER",
      "hasDefaultPassword": false,  // ← MUST BE FALSE
      "lastLogin": "...",
      "createdAt": "...",
      "department": {
        "id": "...",
        "name": "Science Department",
        ...
      }
    }
  }
  ```

- [ ] **UI Behavior**
  - NO password change prompt appears
  - Profile page loads normally
  - Can see account info, department info
  - "Change Password" card visible in right column (but no forced dialog)

- [ ] **Console Verification**
  - No errors in console
  - No localStorage reads for `hasDefaultPassword`

### Expected Result

✅ **PASS** if:
- API response includes `"hasDefaultPassword": false`
- No password change prompt appears
- Profile page displays normally
- No console errors

❌ **FAIL** if:
- Password prompt appears (shouldn't!)
- Console errors present
- API response missing `hasDefaultPassword` field

---

## Test Case 3: localStorage Independence

**Objective**: Verify localStorage has NO effect on password prompt behavior

### Steps

1. **Login as HOD with default password** (`hod.math@school.com`)

2. **Manually set localStorage to false** (simulate old cached data)
   ```javascript
   // In browser console
   const fakeUser = {
     hasDefaultPassword: false  // WRONG VALUE
   };
   localStorage.setItem("user", JSON.stringify(fakeUser));
   ```

3. **Refresh the page** (F5)

4. **Check behavior**

### Verification Checklist

- [ ] **UI Behavior**
  - Password change prompt STILL appears
  - Prompt shows despite localStorage saying `false`
  - UI trusts API, ignores localStorage

- [ ] **DevTools Console**
  - Check console logs
  - Should NOT see any localStorage reads for `hasDefaultPassword`
  - Verify no code like `localStorage.getItem("user")`

### Expected Result

✅ **PASS** if:
- Password prompt appears (API says `true`, localStorage says `false` → API wins)
- No localStorage reads in code execution
- UI behavior matches API response, not localStorage

❌ **FAIL** if:
- No password prompt (means localStorage is being used)
- Console shows localStorage reads

---

## Test Case 4: API Error Handling

**Objective**: Verify graceful handling when API fails

### Steps

1. **Login as any HOD user**

2. **Block the API request**
   - Open DevTools → Network tab
   - Right-click on `/api/hod/profile` request
   - Select "Block request URL"
   - OR use browser extension to block

3. **Refresh the page**

### Verification Checklist

- [ ] **UI Behavior**
  - Error message appears
  - Message says "Failed to load profile" or similar
  - Does NOT crash with white screen
  - Does NOT show incorrect password prompt state

- [ ] **Console**
  - Error logged (expected)
  - No "Cannot read property hasDefaultPassword of undefined"

### Expected Result

✅ **PASS** if:
- Error message shown
- No crash
- No undefined errors

❌ **FAIL** if:
- White screen / crash
- TypeError about undefined

---

## Test Case 5: Code Audit - No localStorage Usage

**Objective**: Verify code doesn't read from localStorage for hasDefaultPassword

### Manual Code Check

Open file: `app/(dashboard)/hod/profile/page.tsx`

**Search for these patterns** (should NOT exist):

```typescript
// ❌ THESE SHOULD NOT EXIST
localStorage.getItem("user")
JSON.parse(userData)
user.hasDefaultPassword
```

**Search for this pattern** (SHOULD exist):

```typescript
// ✅ THIS SHOULD EXIST
result.data.hasDefaultPassword
setHasDefaultPassword(result.data.hasDefaultPassword || false);
```

### Verification Checklist

- [ ] **Lines 49-51**: useEffect ONLY calls `fetchProfile()`, no localStorage
- [ ] **Line 85**: Sets `hasDefaultPassword` from `result.data.hasDefaultPassword`
- [ ] **No localStorage reads** for user data in entire file

### Expected Result

✅ **PASS** if:
- No localStorage reads in useEffect
- hasDefaultPassword set from API response only
- Code matches expected pattern

❌ **FAIL** if:
- localStorage.getItem("user") found anywhere
- hasDefaultPassword set from cached data

---

## Regression Tests

### Test: Existing Features Still Work

- [ ] **Profile Display**
  - Email shows correctly
  - Role shows "Head of Department"
  - Last login shows (or "Never")
  - Account created date shows

- [ ] **Department Info**
  - Department name shows
  - Department code shows
  - Status shows (Active/Inactive)
  - Subject count shows
  - Teacher count shows

- [ ] **Change Password Card**
  - "Change Password" card visible in right column
  - Manual password change still works
  - After changing password, `hasDefaultPassword` becomes `false`

---

## Test Summary Report Template

```
# Fix 1.1 Test Results

Date: ___________
Tester: ___________

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Default Password - Prompt Shows | ⬜ PASS / ⬜ FAIL | |
| TC2: Changed Password - No Prompt | ⬜ PASS / ⬜ FAIL | |
| TC3: localStorage Independence | ⬜ PASS / ⬜ FAIL | |
| TC4: API Error Handling | ⬜ PASS / ⬜ FAIL | |
| TC5: Code Audit | ⬜ PASS / ⬜ FAIL | |
| Regression: Profile Display | ⬜ PASS / ⬜ FAIL | |
| Regression: Change Password | ⬜ PASS / ⬜ FAIL | |

## Issues Found

[List any issues here]

## Sign-off

⬜ All tests passed
⬜ Fix approved for production
⬜ Issues require resolution

Signature: ___________
```

---

## Rollback Criteria

**Rollback Fix 1.1 if:**

1. Password prompt doesn't appear for users with default passwords
2. Console errors about undefined `hasDefaultPassword`
3. White screen crash on profile page
4. Password prompt shows for users who changed passwords

**Rollback Command:**
```bash
git checkout HEAD -- app/(dashboard)/hod/profile/page.tsx
```
