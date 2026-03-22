# Tier 1 Remediation Test Suite

Comprehensive testing documentation for Tier 1 fixes:
- **Fix 1.1**: Profile `hasDefaultPassword` from API
- **Fix 1.2**: SECONDARY_GRADES backend authority

---

## Test Files Overview

| File | Type | Time | Purpose |
|------|------|------|---------|
| `tier1-quick-checklist.md` | Manual | 25 min | Quick acceptance test for QA |
| `tier1-fix-1.1-profile-test.md` | Manual | 20 min | Detailed profile fix validation |
| `tier1-fix-1.2-grades-test.md` | Manual | 30 min | Detailed grades fix validation |
| `tier1-automated-api-test.ts` | Automated | 2 min | Backend validation script |

---

## Quick Start

### 1. Run Automated Tests (2 minutes)

```bash
# Install dependencies if needed
npm install

# Run automated backend validation
npx ts-node tests/tier1-automated-api-test.ts
```

**What it checks:**
- ✅ Database schema has `hasDefaultPassword` field
- ✅ Test users exist with both `true` and `false` values
- ✅ Secondary grades (8-12) exist in database
- ✅ Primary grades (1-7) exist for testing rejection
- ✅ Test classes exist for both grade levels
- ✅ HOD department has subjects and teachers

**Expected output:**
```
✅ PASS - Fix 1.1 - User.hasDefaultPassword field exists
✅ PASS - Fix 1.1 - Test data coverage
✅ PASS - Fix 1.2 - Secondary grades exist
✅ PASS - Fix 1.2 - Primary grades exist (for testing)
✅ PASS - Fix 1.2 - Test classes exist
✅ PASS - Fix 1.2 - HOD department has resources

Total Tests: 6
Passed: 6
Failed: 0

✅ ALL TESTS PASSED
✅ Ready for manual UI testing
```

### 2. Quick Manual Test (25 minutes)

Follow: `tier1-quick-checklist.md`

**Critical tests:**
1. Login with default password → Prompt appears
2. Login with changed password → No prompt
3. Reports shows only grades 8-12
4. Classes shows all grades
5. Primary grade assignment → Blocked with error
6. Secondary grade assignment → Works

### 3. Full Manual Test (50 minutes)

For comprehensive validation before production:
- `tier1-fix-1.1-profile-test.md` (20 min)
- `tier1-fix-1.2-grades-test.md` (30 min)

---

## Test Strategy

### Phase 1: Automated Validation (2 min)
Run `tier1-automated-api-test.ts` to verify:
- Database schema correct
- Test data exists
- Backend queries work

### Phase 2: Quick Manual Test (25 min)
Run `tier1-quick-checklist.md` to verify:
- UI behavior correct
- API contracts working
- User workflows functional

### Phase 3: Full Validation (50 min) - OPTIONAL
Run detailed test scripts if:
- Deploying to production
- Critical system
- First time running fixes
- Issues found in Phase 2

---

## Pre-Test Requirements

### Database Setup

**Required test data:**

1. **HOD Users**
   ```sql
   -- User with default password
   INSERT INTO users (email, role, hasDefaultPassword, ...)
   VALUES ('hod.math@school.com', 'TEACHER', true, ...);

   -- User with changed password
   INSERT INTO users (email, role, hasDefaultPassword, ...)
   VALUES ('hod.science@school.com', 'TEACHER', false, ...);
   ```

2. **Grades**
   - Primary: GRADE_1 through GRADE_7
   - Secondary: GRADE_8 through GRADE_12

3. **Classes**
   - At least 1 primary grade class
   - At least 2 secondary grade classes

4. **HOD Department**
   - Has `hodTeacherId` set
   - Has subjects assigned
   - Has teachers assigned

### Environment

- **Browser**: Chrome/Firefox with DevTools
- **Auth**: Valid HOD login credentials
- **Network**: Access to backend API
- **Permissions**: Can view Network tab, Console

---

## Test Data Creation Script

```sql
-- Verify HOD users exist
SELECT
  u.id,
  u.email,
  u.role,
  u.hasDefaultPassword,
  d.name as department
FROM users u
LEFT JOIN teacher_profiles tp ON tp.userId = u.id
LEFT JOIN departments d ON d.hodTeacherId = tp.id
WHERE d.hodTeacherId IS NOT NULL;

-- Expected: At least 2 rows, one with hasDefaultPassword=true, one false

-- Verify grades exist
SELECT level, name
FROM grades
ORDER BY sequence;

-- Expected: 12 rows (GRADE_1 through GRADE_12)

-- Verify classes exist
SELECT
  c.name,
  g.level,
  g.name as grade_name
FROM classes c
JOIN grades g ON c.gradeId = g.id
ORDER BY g.sequence;

-- Expected: Multiple classes across different grades

-- Verify HOD department has resources
SELECT
  d.name,
  COUNT(DISTINCT s.id) as subject_count,
  COUNT(DISTINCT td.teacherId) as teacher_count
FROM departments d
LEFT JOIN subjects s ON s.departmentId = d.id AND s.deletedAt IS NULL
LEFT JOIN teacher_departments td ON td.departmentId = d.id
WHERE d.hodTeacherId IS NOT NULL
GROUP BY d.id, d.name;

-- Expected: At least 1 row with subject_count > 0 and teacher_count > 0
```

---

## Pass/Fail Criteria

### Fix 1.1: Profile hasDefaultPassword

✅ **PASS** if:
- API response includes `hasDefaultPassword` field
- UI shows prompt when `true`
- UI hides prompt when `false`
- No localStorage usage
- No console errors

❌ **FAIL** if:
- Prompt behavior incorrect
- localStorage still used
- API missing field
- Console errors

### Fix 1.2: SECONDARY_GRADES Authority

✅ **PASS** if:
- API `/hod/reports/grades` returns only grades 8-12
- Frontend shows all classes (no pre-filtering)
- Backend rejects primary grade assignments with clear error
- Backend allows secondary grade assignments
- No hardcoded constants in frontend

❌ **FAIL** if:
- API returns all grades
- Frontend filters grades client-side
- Primary grade assignments allowed
- Secondary grade assignments blocked
- Hardcoded constants still present

---

## Common Issues & Solutions

### Issue: Automated tests fail with "hasDefaultPassword field not found"

**Solution:**
```bash
# Run Prisma migration
npx prisma migrate dev

# Or generate Prisma client
npx prisma generate
```

### Issue: No HOD users found

**Solution:**
```sql
-- Update existing user to be HOD
UPDATE teacher_profiles
SET departmentAsHOD = (SELECT id FROM departments WHERE code = 'MATH' LIMIT 1)
WHERE staffNumber = 'T001';
```

### Issue: Manual test shows password prompt for changed password user

**Solution:**
- Check API response in Network tab
- Verify database has `hasDefaultPassword: false`
- Clear browser cache and localStorage
- Restart browser

### Issue: All grades visible in reports dropdown

**Solution:**
- Verify backend change deployed: `app/api/hod/reports/grades/route.ts`
- Check API response in Network tab
- Should have WHERE clause for GRADE_8..12

---

## Rollback Procedures

### If Fix 1.1 Fails

```bash
git checkout HEAD -- app/(dashboard)/hod/profile/page.tsx
git push origin main
```

### If Fix 1.2 Fails

```bash
git checkout HEAD -- app/api/hod/reports/grades/route.ts
git checkout HEAD -- app/(dashboard)/hod/reports/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/page.tsx
git checkout HEAD -- app/(dashboard)/hod/classes/[id]/assignments/page.tsx
git push origin main
```

### If Both Fail

```bash
git revert <commit-hash>
git push origin main
```

---

## Test Report Template

```markdown
# Tier 1 Remediation Test Report

**Date**: __________
**Tester**: __________
**Environment**: ☐ Dev ☐ Staging ☐ Production

## Automated Tests

☐ PASS / ☐ FAIL - tier1-automated-api-test.ts

Output:
```
[Paste output here]
```

## Manual Tests

### Fix 1.1: Profile hasDefaultPassword
☐ PASS / ☐ FAIL - tier1-fix-1.1-profile-test.md

Issues:
_________________________

### Fix 1.2: SECONDARY_GRADES Authority
☐ PASS / ☐ FAIL - tier1-fix-1.2-grades-test.md

Issues:
_________________________

## Regression Tests

☐ PASS / ☐ FAIL - All HOD pages load correctly

Issues:
_________________________

## Final Decision

☐ **APPROVED FOR PRODUCTION**
☐ **NEEDS FIXES** - See issues above
☐ **ROLLBACK REQUIRED** - Critical issues found

**Signature**: __________
**Date**: __________
```

---

## Contact & Support

**Questions?** Contact the development team
**Issues?** Check rollback procedures above
**CI/CD?** Add `tier1-automated-api-test.ts` to your pipeline

---

## Next Steps

After Tier 1 passes:
1. ✅ Deploy to production
2. ✅ Monitor error logs for 24 hours
3. ✅ Proceed to Tier 2 fixes (see remediation plan)

**Total Test Time**:
- Automated: 2 minutes
- Quick Manual: 25 minutes
- Full Manual: 50 minutes
- **Recommended minimum**: 27 minutes (Automated + Quick Manual)
