# Class Register System - Implementation Guide

## 🎯 Overview

Based on your decisions, we've implemented a **dual attendance tracking system**:

1. **Class Register** - Taken once daily (morning) by class teacher
2. **Subject/Period Register** - Taken each period by subject teacher

### Key Decision Points ✅
- ✅ Separate tables for class vs subject attendance
- ✅ Class register taken in morning
- ✅ One class teacher per class (no multiple assignments)
- ✅ **Period attendance counts for percentage** (students might dodge after morning)

---

## 📊 Database Schema

### 1. ClassRegister Model
**Purpose**: Official daily attendance by class teacher

```prisma
model ClassRegister {
  id               String           @id
  studentId        String
  classId          String
  termId           String
  date             DateTime         @db.Date
  status           AttendanceStatus
  arrivalTime      DateTime?        // For LATE status
  reason           String?
  remarks          String?
  classTeacherId   String          // Who marked this

  @@unique([studentId, classId, date])
}
```

**Key Features**:
- Taken **once per day** (morning)
- Records `arrivalTime` for late students
- Only class teacher can mark
- Used for **daily overview** and school records

### 2. SubjectAttendance Model
**Purpose**: Period-by-period tracking for actual attendance percentage

```prisma
model SubjectAttendance {
  id         String           @id
  studentId  String
  classId    String
  subjectId  String
  termId     String
  date       DateTime         @db.Date
  period     Int              // 1-6
  status     AttendanceStatus
  reason     String?
  remarks    String?
  teacherId  String           // Subject teacher

  @@unique([studentId, classId, subjectId, date, period])
}
```

**Key Features**:
- Taken **each period** (6 times daily)
- Tracks which subject/period
- Subject teacher marks
- **THIS is used for attendance percentage** (catches students who dodge)

### 3. Attendance (Legacy)
Kept for backward compatibility - will be migrated gradually.

---

## 👥 User Roles & Responsibilities

### Class Teacher
**Special Role**: Assigned to ONE class

**Responsibilities**:
- ✅ Mark **class register** every morning
- ✅ Monitor overall class welfare
- ✅ Access to class register history
- ✅ Can also teach subjects (takes period registers too)

**Database Flag**:
```prisma
TeacherClassAssignment {
  isClassTeacher Boolean @default(false)
}
```

### Subject Teacher
**Regular Role**: Teaches across multiple classes

**Responsibilities**:
- ✅ Mark **period attendance** for each class/subject
- ✅ No class register access
- ✅ Focus on subject delivery

---

## 🔄 Workflow

### Morning Routine (8:00 AM)
```
1. Students arrive at school
2. Go to homeroom/assigned class
3. Class teacher marks CLASS REGISTER
   - Present / Absent / Late (with time)
   - Records reason if known
4. Class register submitted
```

### During Lessons (8:30 AM - 3:00 PM)
```
For each period (1-6):
1. Students go to subject class
2. Subject teacher marks SUBJECT ATTENDANCE
   - Present / Absent / Late
   - Per subject, per period
3. Period register submitted
```

### Late Arrival Example
```
8:00 AM - Class Register:  ABSENT
9:15 AM - Student arrives
         - Class teacher updates: LATE (arrivalTime: 9:15)
9:30 AM - Period 2 Register: PRESENT
10:30 AM - Period 3 Register: PRESENT
...etc
```

---

## 📈 Attendance Percentage Calculation

**IMPORTANT**: Based on **Subject/Period Registers ONLY**

### Why?
> "students might dodge" - Your exact words

Students can:
- Be present for class register (morning)
- Then skip specific periods/subjects

### Formula
```typescript
attendancePercentage = (totalPresent / totalPeriods) * 100

Where:
- totalPresent = COUNT of PRESENT in SubjectAttendance
- totalPeriods = Total possible periods (days * 6 periods)
```

### Example
```
Week 1 (5 days, 6 periods = 30 total periods)
- Present: 28 periods
- Absent: 2 periods
- Attendance: (28/30) * 100 = 93.3%
```

### Class Register Use
Class register is for:
- ✅ School records / compliance
- ✅ Daily overview
- ✅ Emergency situations (who's in school)
- ❌ NOT for attendance percentage

---

## 🎨 UI Implementation Plan

### For Class Teachers

#### 1. My Classes Page Structure
```
MY CLASSES
├── 📌 Class Teacher
│   └── 9A (Your Assigned Class)
│       ├── Class Register ⭐ (New!)
│       ├── Mathematics (if teaching)
│       └── Physics (if teaching)
│
└── 📚 Other Classes
    ├── 10B → Mathematics
    ├── 11A → Mathematics
    └── 12C → Physics
```

#### 2. Class Register Page (New)
**Route**: `/teacher/class-register`

**Features**:
- Date selector (defaults to today)
- Full student list for assigned class
- Mark Present/Absent/Late
- Late arrival time picker
- Reason/remarks field
- Quick stats: Present (X), Absent (Y), Late (Z)
- **Morning only** - disable after 10 AM?

**UI Mockup**:
```
┌─────────────────────────────────────────────────┐
│ Class Register - 9A          📅 Oct 21, 2025  │
├─────────────────────────────────────────────────┤
│ Quick Actions: [Mark All Present ▼]            │
├─────────────────────────────────────────────────┤
│ Student Name     | Status | Time  | Remarks    │
├──────────────────┼────────┼───────┼────────────┤
│ John Doe         | ✅ P   | 8:00  |           │
│ Mary Smith       | 🕐 L   | 8:45  | Traffic   │
│ Peter Jones      | ❌ A   | -     | Sick      │
├─────────────────────────────────────────────────┤
│ Summary: ✅ 28  🕐 1  ❌ 1           [Submit]  │
└─────────────────────────────────────────────────┘
```

### For Subject Teachers

#### Period Attendance (Existing - Enhance)
**Route**: `/teacher/attendance`

**Current**: Mark attendance per class
**Add**:
- Period selector (1-6)
- Subject displayed clearly
- Cross-reference with class register:
  ```
  ⚠️ John Doe marked absent in class register
  ```

---

## 🔧 API Endpoints Needed

### Class Register
```typescript
POST /api/class-register
GET  /api/class-register?classId=X&date=Y
PUT  /api/class-register/:id      // Update late arrival

// Mark entire class
POST /api/class-register/bulk
{
  classId: string
  date: string
  students: [
    {studentId, status, arrivalTime?, reason?}
  ]
}
```

### Subject Attendance
```typescript
POST /api/subject-attendance
GET  /api/subject-attendance?classId=X&date=Y&period=Z

// Compatibility with class register
GET  /api/class-register/:classId/:date/crosscheck
// Returns students marked absent in class register
```

### Attendance Percentage
```typescript
GET /api/students/:id/attendance-percentage
{
  periodAttendance: 93.5%,    // From SubjectAttendance
  classAttendance: 96.2%,     // From ClassRegister
  totalPeriods: 180,
  presentPeriods: 168
}
```

---

## 📱 Teacher Dashboard Changes

### Navigation Update
```typescript
const teacherNavGroups = [
  {
    label: "My Teaching",
    items: [
      { title: "My Classes", url: "/teacher/my-classes", icon: BookOpen },

      // NEW - Only shown if isClassTeacher = true
      {
        title: "Class Register",
        url: "/teacher/class-register",
        icon: ClipboardCheck,
        badge: "Morning" // Visual indicator
      },

      { title: "Schedule", url: "/teacher/schedule", icon: Calendar },
    ],
  },
  {
    label: "Periodic Tracking",
    items: [
      { title: "Period Attendance", url: "/teacher/attendance", icon: CalendarCheck },
      { title: "Grades", url: "/teacher/grades", icon: FileText },
    ],
  }
]
```

### My Classes Hierarchy
```tsx
// Class teacher's assigned class - TOP
{assignedClass && (
  <div className="mb-6">
    <h3 className="text-sm font-semibold mb-2">Class Teacher</h3>
    <ClassCard class={assignedClass} isClassTeacher badge="Your Class">
      <Button href="/teacher/class-register">
        <ClipboardCheck /> Class Register
      </Button>
      {/* Show subjects IF teacher also teaches this class */}
      {assignedClassSubjects.map(subject => ...)}
    </ClassCard>
  </div>
)}

// Other classes
<div>
  <h3 className="text-sm font-semibold mb-2">Other Classes</h3>
  {otherClasses.map(class => ...)}
</div>
```

---

## ✅ Migration Strategy

### Phase 1: Database (NOW)
- ✅ Add ClassRegister and SubjectAttendance models
- ✅ Update relations
- Run migration: `npx prisma migrate dev --name add_dual_attendance_system`

### Phase 2: Backend API
- [ ] Create class-register endpoints
- [ ] Create subject-attendance endpoints
- [ ] Attendance percentage calculator
- [ ] Data migration script (Attendance → SubjectAttendance)

### Phase 3: UI (Teacher)
- [ ] My Classes hierarchy (class teacher on top)
- [ ] Class Register page
- [ ] Period Attendance enhancements
- [ ] Dashboard navigation updates

### Phase 4: UI (Admin)
- [ ] Attendance reports (both registers)
- [ ] Class teacher assignments interface
- [ ] Attendance analysis dashboard

---

## 🚨 Important Notes

### Class Teacher Assignment
```typescript
// ONE class teacher per class - enforced in code
async function assignClassTeacher(teacherId, classId) {
  // Check if class already has class teacher
  const existing = await prisma.teacherClassAssignment.findFirst({
    where: {
      classId,
      isClassTeacher: true,
      isActive: true
    }
  })

  if (existing) {
    throw new Error("Class already has a class teacher")
  }

  // Assign
  return prisma.teacherClassAssignment.create({...})
}
```

### Data Integrity
- Class register can only be marked ONCE per day
- Subject attendance per period (6 max per day)
- Late arrivals update existing class register entry
- Soft deletes for audit trail

### Reporting
Always specify which register when generating reports:
- "Daily Attendance" → Class Register
- "Subject Attendance" → Subject Attendance
- "Attendance Percentage" → Subject Attendance (official)

---

## 🎓 Next Steps

1. **Run Prisma Migration**
   ```bash
   npx prisma migrate dev --name add_dual_attendance_system
   npx prisma generate
   ```

2. **Create Class Register UI**
3. **Update My Classes page with hierarchy**
4. **Implement Period Attendance cross-check**
5. **Update attendance percentage calculations**

All foundations are now in place! 🚀
