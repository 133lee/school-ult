# Comprehensive Architectural Analysis: School Management System

**Date:** 2026-01-05
**Scope:** Full system architecture review and production hardening plan
**Status:** Phase 1 Complete - System Comprehension

---

## Executive Summary

This Next.js 16 school management system demonstrates **excellent architectural design in 70% of the codebase** (admin CRUD, student management, assessment handling) but has **critical violations in the teacher-specific module** that bypass all established patterns.

### Key Findings

✅ **Strengths:**
- Well-designed layered architecture (Service → Repository → Prisma)
- Comprehensive Prisma schema (28 models, 916 lines)
- Strong business logic layer with RBAC
- Centralized domain logic (ECZ grading system)
- Consistent patterns in admin modules

🔴 **Critical Issues:**
- Teacher routes (`/api/teacher/*`) bypass service/repository layers entirely
- Empty infrastructure files (`api-response.ts`, `errors.ts`, `logger.ts`)
- JWT stored in localStorage (XSS vulnerability)
- No logging infrastructure
- Code duplication (`apiRequest()` in 14 hooks)
- Missing input validation (Zod schemas empty)

---

## 1. Overall System Architecture

### 1.1 Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js | 16.1.1 |
| UI Library | React | 19.2.3 |
| Database | PostgreSQL | - |
| ORM | Prisma | 7.2.0 |
| Auth | JWT | - |
| UI Components | Radix UI + Tailwind | 4.x |
| Notifications | Sonner | - |

### 1.2 Directory Structure

```
school-app-2/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public auth routes
│   ├── (dashboard)/       # Protected routes by role
│   │   ├── admin/
│   │   ├── teacher/
│   │   └── hod/
│   └── api/               # API endpoints
│       ├── students/      ✅ Service-based
│       ├── teachers/      ✅ Service-based
│       ├── teacher/       ⚠️ Direct Prisma (VIOLATION)
│       └── ...
│
├── features/              # Domain modules (clean architecture)
│   ├── auth/
│   │   ├── auth.service.ts       ✅ Business logic
│   │   ├── auth.repository.ts    ✅ Data access
│   │   ├── auth.types.ts         ✅ Type definitions
│   │   └── auth.validation.ts    ⚠️ EMPTY (1 line)
│   ├── students/
│   ├── teachers/
│   └── ...                # 20+ domain modules
│
├── lib/                   # Shared utilities
│   ├── auth/              ✅ JWT, middleware
│   ├── db/                ✅ Prisma singleton
│   ├── grading/           ✅ ECZ grading system
│   ├── http/
│   │   ├── api-response.ts  ⚠️ EMPTY (should have response wrappers)
│   │   └── errors.ts        ⚠️ EMPTY (should have error classes)
│   ├── logger/
│   │   └── logger.ts        ⚠️ EMPTY (no logging infrastructure)
│   └── api-client.ts      ✅ Frontend API wrapper
│
├── hooks/                 # React custom hooks
│   ├── useStudents.ts     ✅ (but duplicates apiRequest)
│   ├── useTeachers.ts     ✅ (but duplicates apiRequest)
│   └── ...                # 14 hooks with duplicated code
│
├── components/            # UI components
│   ├── ui/                # Base components (Radix)
│   ├── students/          # Domain-specific
│   └── ...
│
└── prisma/
    └── schema.prisma      ✅ Comprehensive (916 lines, 28 models)
```

### 1.3 Architectural Layers

**Intended Architecture (Clean Layered):**

```
┌──────────────────────────────────┐
│  Presentation Layer              │  Next.js Pages + Components
│  - Server Components             │
│  - Client Components             │
│  - Custom Hooks                  │
└──────────────────────────────────┘
              ↓ HTTP
┌──────────────────────────────────┐
│  API Layer                       │  Route Handlers
│  - Authentication                │
│  - Request parsing               │
│  - Response formatting           │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  Business Logic Layer            │  Services
│  - Authorization (RBAC)          │
│  - Validation                    │
│  - Business rules                │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  Data Access Layer               │  Repositories
│  - Prisma abstraction            │
│  - Query building                │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  Database Layer                  │  PostgreSQL
└──────────────────────────────────┘
```

**Actual Architecture (Inconsistent):**

- ✅ **Admin/Student modules:** Follow clean architecture
- ⚠️ **Teacher module:** Skips service + repository layers entirely

---

## 2. Existing Shared Abstractions

### 2.1 Service Layer Pattern ✅

**Location:** `features/*/[domain].service.ts`

**Purpose:** Centralized business logic, authorization, validation

**Example Structure:**
```typescript
export class StudentService {
  constructor(
    private studentRepository: StudentRepository,
    private performanceCalculator: PerformanceCalculatorService
  ) {}

  // Permission checks
  private canCreate(context: ServiceContext): boolean {
    return hasPermission(context, Permission.CREATE_STUDENT);
  }

  // Validation
  private validateAge(dateOfBirth: Date): void {
    const age = calculateAge(dateOfBirth);
    if (age < 5 || age > 25) {
      throw new ValidationError(`Invalid age: ${age}`);
    }
  }

  // Public API
  async createStudent(input: CreateStudentInput, context: ServiceContext) {
    if (!this.canCreate(context)) {
      throw new UnauthorizedError("Cannot create students");
    }
    this.validateAge(input.dateOfBirth);
    return this.studentRepository.create(input);
  }
}
```

**Usage:** 15+ service classes following this pattern

### 2.2 Repository Pattern ✅

**Location:** `features/*/[domain].repository.ts`

**Purpose:** Thin Prisma abstraction, no business logic

**Standard Methods:**
- `create(data)` - Create entity
- `findById(id)` - Get by ID
- `findAll()` - Get all
- `findMany(filters)` - Get with filters
- `update(id, data)` - Update entity
- `delete(id)` - Delete entity
- `count(where)` - Count records
- `existsBy[Field](value)` - Existence checks

**Usage:** 20+ repository classes

### 2.3 Authentication System ✅

**Components:**
- `lib/auth/jwt.ts` - JWT verification wrapper
- `lib/auth/middleware.ts` - Token extraction, permission checking
- `features/auth/auth.service.ts` - Login, token generation
- `lib/api-client.ts` - Auto-inject JWT in frontend requests

**Flow:**
1. User logs in → `/api/auth/login`
2. `AuthService.login()` validates credentials (bcrypt)
3. Generate JWT: `{ userId, email, role, permissions }`
4. Client stores in localStorage
5. All requests include: `Authorization: Bearer <token>`
6. API routes verify via `verifyToken()`

**Security Issues:**
- ⚠️ JWT in localStorage (XSS risk) - should use httpOnly cookies
- ⚠️ Fallback secret in code: `"fallback-secret-key-change-in-production"`
- ⚠️ No token refresh mechanism
- ⚠️ No rate limiting on login

### 2.4 Authorization System (RBAC) ✅

**Roles:**
- ADMIN
- HEAD_TEACHER
- DEPUTY_HEAD
- HOD
- TEACHER
- CLERK

**Permissions (28 total):**
- Student management: CREATE_STUDENT, READ_STUDENT, UPDATE_STUDENT, DELETE_STUDENT
- Teacher management: CREATE_TEACHER, READ_TEACHER, UPDATE_TEACHER, DELETE_TEACHER
- Assessment: ENTER_RESULTS, VIEW_RESULTS, EDIT_RESULTS, APPROVE_RESULTS
- Reports: GENERATE_REPORTS, VIEW_REPORTS
- etc.

**Permission Storage:**
```prisma
model RolePermission {
  role       Role
  permission Permission
  @@unique([role, permission])
}

model UserPermission {
  userId     String
  permission Permission
  expiresAt  DateTime?
  reason     String?
}
```

**Enforcement:**
- ✅ Service layer: `canCreate()`, `canUpdate()`, etc.
- ⚠️ Teacher routes: Missing (only JWT verification)

### 2.5 ECZ Grading System ✅

**Location:** `lib/grading/ecz-grading-system.ts` (336 lines)

**Features:**
- Grade boundaries (GRADE_1: 90-100, GRADE_2: 80-89, etc.)
- Grade point calculations
- Quantity pass (≥5 credits, any grade)
- Quality pass (≥5 credits, minimum GRADE_6)
- Mean grade calculation
- Performance analysis (pass rates, distributions)

**Usage:** Centralized, used across assessment and report card modules

### 2.6 Custom Hooks Pattern ✅ (with issues)

**Location:** `hooks/use[Domain].ts`

**Structure:**
```typescript
export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ⚠️ DUPLICATED in every hook (should use lib/api-client.ts)
  async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = getAuthToken();
    const headers = { "Authorization": `Bearer ${token}` };
    const response = await fetch(`/api${endpoint}`, { ...options, headers });
    return response.json();
  }

  async function createStudent(data: CreateStudentInput) {
    setLoading(true);
    try {
      const result = await apiRequest<Student>("/students", {
        method: "POST",
        body: JSON.stringify(data),
      });
      setStudents([...students, result]);
      toast.success("Student created");
    } catch (err) {
      setError(err.message);
      toast.error("Failed to create student");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, error, createStudent, updateStudent, deleteStudent };
}
```

**Issues:**
- `apiRequest()` duplicated in 14 hooks (~400 lines of duplication)
- Should use centralized `lib/api-client.ts`

### 2.7 Toast Notification System ✅

**Implementation:** Sonner

**Setup:**
```typescript
// app/layout.tsx
<Toaster position="top-right" richColors />

// hooks/use-toast.ts
export function useToast() {
  const toast = ({ title, description, variant }) => {
    switch (variant) {
      case "destructive": sonnerToast.error(title, { description });
      case "success": sonnerToast.success(title, { description });
      default: sonnerToast(title, { description });
    }
  };
  return { toast };
}
```

**Usage:** Consistent across all modules, good UX

---

## 3. Data Flow Patterns

### 3.1 Admin Module Data Flow (CORRECT) ✅

**Example: Create Student**

```
1. UI Component
   └─ useStudents.createStudent({ firstName, lastName, ... })

2. Custom Hook
   └─ apiRequest("/students", { method: "POST", body })

3. API Route (/api/students/route.ts)
   └─ Extract JWT → verifyToken()
   └─ Build context: { userId, role }
   └─ Call studentService.createStudent(input, context)

4. Service Layer (StudentService)
   └─ Check permission: canCreate(context)
   └─ Validate age, admission date, student number
   └─ Check uniqueness
   └─ Call studentRepository.create(data)

5. Repository Layer (StudentRepository)
   └─ prisma.student.create({ data })

6. Database
   └─ INSERT INTO students (...)
```

**Result:** Clean separation of concerns ✅

### 3.2 Teacher Module Data Flow (VIOLATION) ⚠️

**Example: Get Teacher's Students**

```
1. UI Component
   └─ useTeacherStudents.fetchStudents()

2. Custom Hook
   └─ apiRequest("/teacher/students?view=class-teacher")

3. API Route (/api/teacher/students/route.ts)
   └─ Extract JWT → verifyToken()
   └─ DIRECTLY query Prisma (skip service & repository!)
      └─ prisma.teacherProfile.findUnique({ where: { userId } })
      └─ prisma.academicYear.findFirst({ where: { isActive: true } })
      └─ prisma.classTeacherAssignment.findFirst({
           include: { class: { include: { enrollments: {...} } } }
         })
   └─ Inline data transformation (80 lines of logic)
   └─ Return ad-hoc JSON structure

4. Database
   └─ Complex JOIN queries
```

**Problems:**
- ⚠️ No service layer (business logic in route handler)
- ⚠️ No repository layer (direct Prisma queries)
- ⚠️ No authorization checks (only JWT verification)
- ⚠️ No validation
- ⚠️ 218-line route handler (should be <50 lines)
- ⚠️ Cannot unit test logic

---

## 4. Cross-Cutting Concerns Analysis

### 4.1 Authentication ✅ (with security issues)

**Current Implementation:**
- JWT-based (HS256)
- 7-day expiry
- Stored in localStorage
- Bearer token in Authorization header

**Issues:**
1. ⚠️ localStorage (XSS vulnerability) - should use httpOnly cookies
2. ⚠️ Fallback secret in code
3. ⚠️ No token refresh
4. ⚠️ No rate limiting

### 4.2 Authorization ⚠️ (inconsistent)

**Service Layer:** ✅ Proper RBAC with permission checks

**Teacher Routes:** ⚠️ Only JWT verification, no permission checks

**Example Gap:**
```typescript
// /api/teacher/students/route.ts
export async function GET(request: NextRequest) {
  const decoded = verifyToken(token); // ✅ Verifies JWT exists
  // ⚠️ No check if this teacher can access this class!
  // ⚠️ No check if user has READ_STUDENT permission!
  const students = await prisma.teacherProfile.findUnique(...);
}
```

**Should be:**
```typescript
export async function GET(request: NextRequest) {
  const decoded = verifyToken(token);
  const context = { userId: decoded.userId, role: decoded.role };

  // ✅ Service layer handles authorization
  const students = await teacherStudentService.getStudents(classId, context);
}
```

### 4.3 Validation ⚠️ (incomplete)

**Service Layer:** ✅ Business rule validation
- Age limits (students: 5-25, teachers: 21-70)
- Date validation (no future dates)
- Format validation (student numbers, phone numbers)
- Status transition rules

**API Layer:** ⚠️ No input validation
- No Zod/Yup schemas
- `*.validation.ts` files exist but are EMPTY (1 line each)
- API routes accept any input

**Example Gap:**
```typescript
// Current: No validation at API boundary
export async function POST(request: NextRequest) {
  const body = await request.json(); // ⚠️ No validation!
  const result = await studentService.createStudent(body, context);
}

// Should be:
const StudentCreateSchema = z.object({
  firstName: z.string().min(1).max(100),
  dateOfBirth: z.string().datetime(),
  // ...
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = StudentCreateSchema.safeParse(body);
  if (!validated.success) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }
  const result = await studentService.createStudent(validated.data, context);
}
```

### 4.4 Error Handling ⚠️ (inconsistent)

**Service Layer:** ✅ Typed errors
```typescript
export class UnauthorizedError extends Error { ... }
export class NotFoundError extends Error { ... }
export class ValidationError extends Error { ... }
export class ConflictError extends Error { ... }
```

**API Routes (Admin):** ✅ Proper error mapping
```typescript
try {
  // ...
} catch (error) {
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
```

**API Routes (Teacher):** ⚠️ Generic errors
```typescript
try {
  // ...
} catch (error) {
  console.error("Error:", error); // ⚠️ Only console.error
  return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
}
```

**Missing:**
- No error logging infrastructure (`lib/logger/logger.ts` is empty)
- No error tracking (Sentry, etc.)
- No error boundaries in UI
- No standardized error response format

### 4.5 Logging ⚠️ (missing entirely)

**Current State:**
- `lib/logger/logger.ts` exists but is **EMPTY (1 line)**
- Only `console.error()` used sporadically
- No structured logging
- No log levels (debug, info, warn, error)
- No log aggregation
- No production monitoring

**Impact:**
- Cannot debug production issues
- No audit trail
- No performance monitoring
- No security event tracking

### 4.6 Notifications ✅

**Implementation:** Sonner (toast library)

**Pattern:**
- Every CRUD operation shows toast (success/error)
- Consistent across all modules
- Clean UX

**No issues identified.**

---

## 5. Architectural Issues & Violations

### 5.1 Critical Violations

| Issue | Location | Impact | Severity |
|-------|----------|--------|----------|
| **Direct Prisma in API routes** | `/api/teacher/*` (8 routes) | Bypasses business logic, validation, authorization | 🔴 CRITICAL |
| **Empty infrastructure files** | `lib/http/`, `lib/logger/` | No standardized responses, errors, logging | 🔴 CRITICAL |
| **JWT in localStorage** | `lib/api-client.ts`, all hooks | XSS vulnerability | 🔴 CRITICAL |
| **Code duplication (`apiRequest`)** | 14 custom hooks | 400 lines of duplication, inconsistent behavior | 🟡 HIGH |
| **Empty validation schemas** | 20+ `*.validation.ts` files | No input validation, Zod unused | 🟡 HIGH |
| **No permission checks** | `/api/teacher/*` routes | Authorization bypass risk | 🟡 HIGH |
| **No error logging** | All API routes | Cannot debug production | 🟡 HIGH |
| **No transactions** | Assessment, report card operations | Data corruption risk | 🟡 HIGH |
| **No global state** | Frontend | Props drilling, localStorage reads on every call | 🟢 MEDIUM |
| **No error boundaries** | UI components | Poor UX on errors | 🟢 MEDIUM |

### 5.2 God Components/Functions

**Identified:**

1. `/api/teacher/students/route.ts` - **218 lines** (should be <50)
   - Contains complex business logic
   - Multiple view modes (class-teacher, subject-teacher)
   - Data transformation logic
   - Should be extracted to service layer

2. `/api/teacher/classes/route.ts` - **150+ lines**
   - Deduplication logic (recent fix)
   - Should be in service layer

3. `/api/teacher/profile/route.ts` - **120+ lines**
   - Profile aggregation logic
   - Should be in service layer

### 5.3 Code Duplication

**Critical Duplication:**

1. **`apiRequest()` helper** - Duplicated in 14 hooks
   ```typescript
   // Duplicated ~400 lines total
   async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
     const token = getAuthToken();
     const headers = { "Authorization": `Bearer ${token}` };
     const response = await fetch(`/api${endpoint}`, { ...options, headers });
     if (!response.ok) throw new Error("Request failed");
     return response.json();
   }
   ```
   **Should use:** `lib/api-client.ts` (already exists!)

2. **Token verification** - Repeated in 50+ API routes
   ```typescript
   const authHeader = request.headers.get("authorization");
   if (!authHeader?.startsWith("Bearer ")) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   const token = authHeader.substring(7);
   const decoded = verifyToken(token);
   ```
   **Should use:** Middleware or decorator

3. **Error handling boilerplate** - Repeated in all routes
   **Should use:** Centralized error handler

### 5.4 Missing Abstractions

1. **API Response Wrapper** (`lib/http/api-response.ts` is empty)
   ```typescript
   // Should exist:
   export class ApiResponse {
     static success<T>(data: T, meta?: any) {
       return NextResponse.json({ success: true, data, meta });
     }
     static error(message: string, status: number) {
       return NextResponse.json({ success: false, error: message }, { status });
     }
   }
   ```

2. **Error Classes** (`lib/http/errors.ts` is empty)
   ```typescript
   // Should exist:
   export class ApiError extends Error {
     constructor(public message: string, public status: number) { ... }
   }
   export class BadRequestError extends ApiError { ... }
   export class UnauthorizedError extends ApiError { ... }
   ```

3. **Logger** (`lib/logger/logger.ts` is empty)
   ```typescript
   // Should exist:
   export const logger = {
     info: (message, context) => { ... },
     error: (message, error, context) => { ... },
     debug: (message, context) => { ... }
   };
   ```

4. **Auth Middleware**
   ```typescript
   // Should exist:
   export function withAuth(handler: RouteHandler) {
     return async (request: NextRequest) => {
       const user = await verifyAuthToken(request);
       if (!user) return ApiResponse.error("Unauthorized", 401);
       return handler(request, user);
     };
   }
   ```

5. **Validation Schemas (Zod)**
   - All `*.validation.ts` files are empty
   - Should implement input validation

6. **Generic CRUD Components**
   - No DataTable component (table code duplicated)
   - No FormDialog component (form patterns duplicated)

### 5.5 Inconsistent Patterns

| Pattern | Admin/Student Routes | Teacher Routes |
|---------|---------------------|----------------|
| Service layer | ✅ Always used | ⚠️ Never used |
| Repository layer | ✅ Always used | ⚠️ Never used |
| Authorization | ✅ Service-level RBAC | ⚠️ JWT only |
| Validation | ✅ Service-level | ⚠️ None |
| Error handling | ✅ Typed errors | ⚠️ Generic 500s |
| Response format | ✅ Standardized | ⚠️ Ad-hoc |

---

## 6. Comparison: Teacher Module vs Other Modules

### 6.1 Teacher Admin Module (GOOD) ✅

**Routes:** `/api/teachers/*`

**Pattern:**
```
GET    /api/teachers     → teacherService.getTeachers()
POST   /api/teachers     → teacherService.createTeacher()
PATCH  /api/teachers/:id → teacherService.updateTeacher()
DELETE /api/teachers/:id → teacherService.deleteTeacher()
```

**Characteristics:**
- ✅ Uses service layer
- ✅ Uses repository layer
- ✅ Authorization via context
- ✅ Validation in service
- ✅ Typed errors
- ✅ Standardized responses

### 6.2 Teacher App Module (BAD) ⚠️

**Routes:** `/api/teacher/*`

**Pattern:**
```
GET /api/teacher/profile    → Direct Prisma
GET /api/teacher/students   → Direct Prisma
GET /api/teacher/classes    → Direct Prisma
GET /api/teacher/subjects   → Direct Prisma
GET /api/teacher/timetable  → Direct Prisma
GET /api/teacher/reports    → Direct Prisma
```

**Characteristics:**
- ⚠️ No service layer
- ⚠️ No repository layer
- ⚠️ No authorization (JWT only)
- ⚠️ No validation
- ⚠️ Generic errors
- ⚠️ Ad-hoc responses
- ⚠️ Business logic in routes

### 6.3 Side-by-Side Comparison

**Admin Route (CORRECT):**
```typescript
// /api/teachers/route.ts (45 lines)
export async function GET(request: NextRequest) {
  try {
    const token = extractToken(request);
    const decoded = verifyToken(token);
    const context = { userId: decoded.userId, role: decoded.role };

    const filters = parseFilters(request);
    const pagination = parsePagination(request);

    const result = await teacherService.getTeachers(filters, pagination, context);

    return NextResponse.json({ success: true, data: result.data, meta: result.meta });
  } catch (error) {
    return handleError(error);
  }
}
```

**Teacher Route (VIOLATION):**
```typescript
// /api/teacher/students/route.ts (218 lines!)
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    // ⚠️ Direct Prisma queries
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: decoded.userId },
    });

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    const view = request.nextUrl.searchParams.get("view") || "class-teacher";

    // ⚠️ 80+ lines of business logic
    if (view === "class-teacher") {
      const assignment = await prisma.classTeacherAssignment.findFirst({
        where: { teacherId: teacherProfile.id, academicYearId: academicYear.id },
        include: { class: { include: { grade: true, enrollments: { /* ... */ } } } }
      });

      // ⚠️ Manual data transformation
      const students = assignment.class.enrollments.map(e => ({
        id: e.student.id,
        fullName: `${e.student.firstName} ${e.student.middleName || ""} ${e.student.lastName}`.trim(),
        // ... 20 more lines
      }));

      return NextResponse.json({ view: "class-teacher", students });
    } else {
      // ⚠️ Another 80 lines for subject-teacher view
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
```

---

## 7. Recommendations

### 7.1 What Should Be Reused

**Definitely Reuse (Existing Patterns):**

1. ✅ **Service Layer Pattern**
   - Location: `features/*/[domain].service.ts`
   - Use for: All business logic, authorization, validation
   - Example: `StudentService`, `TeacherService`, `AssessmentService`

2. ✅ **Repository Pattern**
   - Location: `features/*/[domain].repository.ts`
   - Use for: All database access
   - Keep thin (no business logic)

3. ✅ **ECZ Grading System**
   - Location: `lib/grading/ecz-grading-system.ts`
   - Centralized grading logic
   - Well-tested, comprehensive

4. ✅ **Custom Hooks Pattern**
   - Location: `hooks/use[Domain].ts`
   - Consistent CRUD interface
   - State management
   - (But remove `apiRequest()` duplication)

5. ✅ **Toast Notification System**
   - Sonner implementation
   - Consistent UX

6. ✅ **Prisma Schema Design**
   - Comprehensive, well-normalized
   - Proper enums and constraints
   - Audit fields

### 7.2 What Should Be Created

**Critical Missing Infrastructure:**

1. 🔴 **API Response Wrapper** (`lib/http/api-response.ts`)
   ```typescript
   export class ApiResponse {
     static success<T>(data: T, meta?: any) {
       return NextResponse.json({ success: true, data, meta });
     }
     static error(message: string, status: number) {
       return NextResponse.json({ success: false, error: message }, { status });
     }
     static created<T>(data: T) {
       return NextResponse.json({ success: true, data }, { status: 201 });
     }
     static noContent() {
       return new NextResponse(null, { status: 204 });
     }
   }
   ```

2. 🔴 **Error Classes** (`lib/http/errors.ts`)
   ```typescript
   export class ApiError extends Error {
     constructor(public message: string, public status: number) {
       super(message);
     }
   }
   export class BadRequestError extends ApiError {
     constructor(message: string = "Bad request") {
       super(message, 400);
     }
   }
   export class UnauthorizedError extends ApiError {
     constructor(message: string = "Unauthorized") {
       super(message, 401);
     }
   }
   export class ForbiddenError extends ApiError {
     constructor(message: string = "Forbidden") {
       super(message, 403);
     }
   }
   export class NotFoundError extends ApiError {
     constructor(message: string = "Not found") {
       super(message, 404);
     }
   }
   ```

3. 🔴 **Logger Infrastructure** (`lib/logger/logger.ts`)
   ```typescript
   export const logger = {
     info: (message: string, context?: any) => {
       console.log(`[INFO] ${message}`, context);
     },
     error: (message: string, error: Error, context?: any) => {
       console.error(`[ERROR] ${message}`, error, context);
     },
     debug: (message: string, context?: any) => {
       console.debug(`[DEBUG] ${message}`, context);
     },
     warn: (message: string, context?: any) => {
       console.warn(`[WARN] ${message}`, context);
     }
   };
   ```

4. 🔴 **Auth Middleware**
   ```typescript
   // lib/http/with-auth.ts
   export function withAuth(
     handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
   ) {
     return async (request: NextRequest) => {
       try {
         const token = extractToken(request);
         const decoded = verifyToken(token);
         const user = { userId: decoded.userId, role: decoded.role };
         return await handler(request, user);
       } catch (error) {
         return ApiResponse.error("Unauthorized", 401);
       }
     };
   }
   ```

5. 🔴 **Teacher Service Layer**
   - `TeacherStudentService` - Student operations for teachers
   - `TeacherClassService` - Class operations for teachers
   - `TeacherProfileService` - Profile management
   - `TeacherReportService` - Report generation

6. 🟡 **Validation Schemas (Zod)**
   - Implement all empty `*.validation.ts` files
   - Validate at API boundary

7. 🟡 **Centralized API Client Usage**
   - Remove `apiRequest()` from all hooks
   - Use `lib/api-client.ts` exclusively

8. 🟡 **Error Handler Middleware**
   ```typescript
   // lib/http/error-handler.ts
   export function handleApiError(error: unknown): NextResponse {
     if (error instanceof ApiError) {
       return ApiResponse.error(error.message, error.status);
     }
     logger.error("Unhandled error", error as Error);
     return ApiResponse.error("Internal server error", 500);
   }
   ```

### 7.3 Refactoring Priorities

**Phase 1: Critical (Security & Architecture) - Week 1**

1. 🔴 Implement `lib/http/api-response.ts`
2. 🔴 Implement `lib/http/errors.ts`
3. 🔴 Implement `lib/logger/logger.ts`
4. 🔴 Create teacher service layer:
   - `TeacherStudentService`
   - `TeacherClassService`
   - `TeacherProfileService`
5. 🔴 Refactor `/api/teacher/students` to use service
6. 🔴 Refactor `/api/teacher/classes` to use service
7. 🔴 Refactor `/api/teacher/profile` to use service
8. 🔴 Add authorization checks to all teacher routes

**Phase 2: High (Code Quality) - Week 2**

9. 🟡 Consolidate `apiRequest()` helper (remove duplication)
10. 🟡 Implement Zod validation schemas
11. 🟡 Add input validation to all API routes
12. 🟡 Create auth middleware (`withAuth`)
13. 🟡 Create error handler middleware
14. 🟡 Move JWT from localStorage to httpOnly cookies
15. 🟡 Add rate limiting to login endpoint

**Phase 3: Medium (Production Hardening) - Week 3**

16. 🟢 Add transaction support (assessment, report card operations)
17. 🟢 Add error boundaries to UI
18. 🟢 Implement request/response logging
19. 🟢 Add health check endpoint
20. 🟢 Add API versioning
21. 🟢 Implement pagination for large result sets
22. 🟢 Add caching (React Query/SWR)

**Phase 4: Low (Developer Experience) - Week 4**

23. ⚪ Create generic CRUD components (DataTable, FormDialog)
24. ⚪ Add global state management for auth (Zustand/Jotai)
25. ⚪ Implement comprehensive error tracking (Sentry)
26. ⚪ Add performance monitoring
27. ⚪ Create API documentation (OpenAPI/Swagger)

---

## 8. Conclusion

### 8.1 Summary

This codebase demonstrates **excellent architectural design in 70% of the system** but has **critical violations in the teacher-specific module** that must be addressed before production deployment.

**Strengths:**
- ✅ Well-designed layered architecture
- ✅ Comprehensive Prisma schema
- ✅ Strong service/repository pattern in admin modules
- ✅ Centralized domain logic (ECZ grading)
- ✅ Consistent UI patterns

**Critical Gaps:**
- 🔴 Teacher routes bypass architecture entirely
- 🔴 Missing infrastructure (api-response, errors, logger)
- 🔴 Security issues (JWT in localStorage)
- 🔴 Code duplication (apiRequest in 14 hooks)
- 🔴 No input validation (Zod schemas empty)

### 8.2 Immediate Actions Required

**Before any new features:**

1. Implement missing infrastructure (`api-response`, `errors`, `logger`)
2. Create teacher service layer
3. Refactor teacher routes to use services
4. Add authorization checks
5. Implement input validation
6. Move JWT to httpOnly cookies

### 8.3 Production Readiness

**Current Status:** 🔴 NOT PRODUCTION READY

**Estimated Time to Production:** 3-4 weeks

**Blocking Issues:**
1. Teacher module architecture violations
2. Missing security controls (authorization)
3. No logging infrastructure
4. XSS vulnerability (JWT in localStorage)
5. No input validation
6. No transaction support

---

## Appendix: File Inventory

### Empty/Incomplete Files (Require Implementation)

| File | Status | Priority |
|------|--------|----------|
| `lib/http/api-response.ts` | Empty (1 line) | 🔴 CRITICAL |
| `lib/http/errors.ts` | Empty (1 line) | 🔴 CRITICAL |
| `lib/logger/logger.ts` | Empty (1 line) | 🔴 CRITICAL |
| `lib/auth/session.ts` | Empty (1 line) | 🟡 HIGH |
| `features/*/[domain].validation.ts` (20+ files) | Empty (1 line each) | 🟡 HIGH |

### Teacher Module Files (Require Refactoring)

| File | Lines | Issue |
|------|-------|-------|
| `app/api/teacher/students/route.ts` | 218 | Direct Prisma, no service layer |
| `app/api/teacher/classes/route.ts` | 150+ | Direct Prisma, no service layer |
| `app/api/teacher/profile/route.ts` | 120+ | Direct Prisma, no service layer |
| `app/api/teacher/subjects/route.ts` | 100+ | Direct Prisma, no service layer |
| `app/api/teacher/timetable/route.ts` | 100+ | Direct Prisma, no service layer |
| `app/api/teacher/reports/route.ts` | 80+ | Direct Prisma, no service layer |

---

**Document End**
