# Tier 1 Remediation - Quick Test Checklist

**Date**: _________
**Tester**: _________
**Environment**: ⬜ Dev ⬜ Staging ⬜ Production

---

## Pre-Flight Setup ✓

- [ ] Database has HOD users with `hasDefaultPassword` = true
- [ ] Database has HOD users with `hasDefaultPassword` = false
- [ ] Database has primary grade classes (1-7)
- [ ] Database has secondary grade classes (8-12)
- [ ] HOD department has subjects assigned
- [ ] HOD department has teachers assigned

---

## Fix 1.1: Profile hasDefaultPassword from API

### Quick Tests (5 min)

- [ ] **T1**: Login as HOD with default password
- [ ] **T1**: Navigate to `/hod/profile`
- [ ] **T1**: Password change prompt appears ✓
- [ ] **T1**: DevTools: API response has `"hasDefaultPassword": true` ✓

- [ ] **T2**: Login as HOD with changed password
- [ ] **T2**: Navigate to `/hod/profile`
- [ ] **T2**: NO password prompt appears ✓
- [ ] **T2**: DevTools: API response has `"hasDefaultPassword": false` ✓

- [ ] **T3**: No console errors on profile page ✓
- [ ] **T3**: Profile info displays correctly ✓

### Pass Criteria

✅ All 3 tests pass → **FIX 1.1 APPROVED**
❌ Any test fails → **ROLLBACK REQUIRED**

---

## Fix 1.2: SECONDARY_GRADES Backend Authority

### Quick Tests (10 min)

**Reports Page:**
- [ ] **T1**: Navigate to `/hod/reports`
- [ ] **T1**: DevTools: `/api/hod/reports/grades` returns ONLY grades 8-12 ✓
- [ ] **T1**: Grade dropdown shows ONLY grades 8-12 ✓
- [ ] **T1**: No primary grades (1-7) visible ✓

**Classes Page:**
- [ ] **T2**: Navigate to `/hod/classes`
- [ ] **T2**: See both primary AND secondary classes ✓
- [ ] **T2**: All classes have "Manage Assignments" button ✓
- [ ] **T2**: No disabled/hidden buttons ✓

**Assignments - Primary Grade (Should Fail):**
- [ ] **T3**: Click "Manage Assignments" on Grade 3A (or any primary)
- [ ] **T3**: Page loads (no crash) ✓
- [ ] **T3**: Error message appears ✓
- [ ] **T3**: Error mentions "secondary grades (8-12)" ✓
- [ ] **T3**: Error comes from backend (check DevTools Network tab) ✓

**Assignments - Secondary Grade (Should Work):**
- [ ] **T4**: Click "Manage Assignments" on Grade 10A (or any secondary)
- [ ] **T4**: Page loads successfully ✓
- [ ] **T4**: Subject dropdown populated ✓
- [ ] **T4**: Teacher dropdown populated ✓
- [ ] **T4**: "Add Assignment" button visible ✓

**Assignment Creation:**
- [ ] **T5**: Click "Add Assignment"
- [ ] **T5**: Select subject from department
- [ ] **T5**: Select teacher from department
- [ ] **T5**: Click "Create Assignment"
- [ ] **T5**: Success toast appears ✓
- [ ] **T5**: Assignment appears in table ✓

### Pass Criteria

✅ All 5 tests pass → **FIX 1.2 APPROVED**
❌ Any test fails → **ROLLBACK REQUIRED**

---

## Code Audit (2 min)

### Frontend - No Hardcoded Constants

- [ ] Search `app/(dashboard)/hod/reports/page.tsx` for `SECONDARY_GRADES` → **NOT FOUND** ✓
- [ ] Search `app/(dashboard)/hod/classes/page.tsx` for `isSecondaryGrade` → **NOT FOUND** ✓
- [ ] Search `app/(dashboard)/hod/classes/[id]/assignments/page.tsx` for `SECONDARY_GRADES` → **NOT FOUND** ✓

### Backend - Validation Intact

- [ ] Check `app/api/hod/reports/grades/route.ts` has WHERE clause with GRADE_8..12 ✓
- [ ] Check `features/subject-teacher-assignments/*.service.ts` still validates grades ✓

### Pass Criteria

✅ All checks pass → **CODE AUDIT APPROVED**
❌ Constants found in frontend → **ROLLBACK REQUIRED**
❌ Backend validation removed → **CRITICAL - ROLLBACK IMMEDIATELY**

---

## Regression Tests (5 min)

### Other HOD Pages Still Work

- [ ] **Dashboard** (`/hod`) loads without errors ✓
- [ ] **Teachers** (`/hod/teachers`) loads, shows department teachers ✓
- [ ] **Subjects** (`/hod/subjects`) loads, shows department subjects ✓
- [ ] **Students** (`/hod/students`) loads, shows enrolled students ✓
- [ ] **Classes** (`/hod/classes`) loads, shows all classes ✓

### Pass Criteria

✅ All pages load → **REGRESSION TESTS PASSED**
❌ Any page crashes → **INVESTIGATE - May need rollback**

---

## Final Sign-Off

### Test Summary

| Fix | Status | Notes |
|-----|--------|-------|
| Fix 1.1: Profile hasDefaultPassword | ⬜ PASS / ⬜ FAIL | |
| Fix 1.2: SECONDARY_GRADES Authority | ⬜ PASS / ⬜ FAIL | |
| Code Audit | ⬜ PASS / ⬜ FAIL | |
| Regression Tests | ⬜ PASS / ⬜ FAIL | |

### Decision

⬜ **APPROVE FOR PRODUCTION** - All tests passed
⬜ **ROLLBACK FIX 1.1** - Profile issues found
⬜ **ROLLBACK FIX 1.2** - Grades issues found
⬜ **ROLLBACK BOTH** - Critical issues found

### Critical Issues Found

_______________________________________
_______________________________________
_______________________________________

### Tester Sign-Off

**Name**: _________________
**Date**: _________________
**Signature**: _________________

---

## Rollback Commands (If Needed)

### Rollback Fix 1.1 Only
```bash
git checkout HEAD -- app/(dashboard)/hod/profile/page.tsx
```

### Rollback Fix 1.2 Only
```bash
git checkout HEAD -- app/api/hod/reports/grades/route.ts
git checkout HEAD -- app/(dashboard)/hod/reports/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/[id]/assignments/page.tsx
```

### Rollback Everything
```bash
git checkout HEAD -- app/api/hod/reports/grades/route.ts
git checkout HEAD -- app/(dashboard)/hod/profile/page.tsx
git checkout HEAD -- app/(dashboard)/hod/reports/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/[id]/assignments/page.tsx
```

---

## Support Contacts

**Developer**: _________________
**QA Lead**: _________________
**On-Call**: _________________

---

**Total Test Time**: ~25 minutes
**Last Updated**: 2026-01-12
