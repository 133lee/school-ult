// Before/After Examples - Skeleton Loading Implementation

This document shows real before/after examples of implementing skeleton loading states in your existing pages.

## Example 1: Students Page - Before & After

### BEFORE (No Loading State)

tsx
"use client";

import { useState } from "react";
import { Table } from "@/components/ui/table";

export default function StudentManagementDashboard() {
  const [students, setStudents] = useState([]);
  // Data is hardcoded, no loading state shown

  return (
    <div className="space-y-6">
      <h1>Students Management</h1>
      <Table>
        {students.map(student => (
          <TableRow key={student.id}>
            {/* Student data */}
          </TableRow>
        ))}
      </Table>
    </div>
  );
}


**Problem**: When page loads or data refetches, users see empty screen or stale data.

---

### AFTER (With Loading State)

tsx
"use client";

import { useState, useEffect } from "react";
import { Table } from "@/components/ui/table";
import { StudentTableSkeleton } from "@/components/ui/skeletons";

export default function StudentManagementDashboard() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/students');
        const data = await response.json();
        setStudents(data);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-xl font-bold">Students Management</h1>
            <p className="text-muted-foreground text-sm">
              Manage student information and enrollment
            </p>
          </div>
        </div>
        <Card className="flex flex-col h-[calc(100vh-16rem)]">
          <CardContent className="flex-1 overflow-hidden">
            <StudentTableSkeleton rows={10} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1>Students Management</h1>
      <Table>
        {students.map(student => (
          <TableRow key={student.id}>
            {/* Student data */}
          </TableRow>
        ))}
      </Table>
    </div>
  );
}


**Result**: Users see structured loading skeleton that matches final layout!

---

## Example 2: Attendance Page - Before & After

### BEFORE (No Loading State)

tsx
"use client";

import { useState } from "react";

export default function AttendancePage() {
  const [students, setStudents] = useState([]);

  return (
    <div className="space-y-6">
      <h1>Attendance Management</h1>

      {/* Dashboard Row */}
      <div className="grid grid-cols-3 gap-4">
        <ChartAreaInteractive /> {/* Blank or error while loading */}
        <SummaryStats students={students} /> {/* Shows 0s */}
      </div>

      {/* Student List */}
      <Table>
        {/* Empty table */}
      </Table>
    </div>
  );
}


**Problem**: Chart area is blank, stats show zeros, looks broken during load.

---

### AFTER (With Section-Specific Loading)

tsx
"use client";

import { useState, useEffect } from "react";
import {
  AttendanceStatsSkeleton,
  ChartSkeleton,
  AttendanceTableSkeleton
} from "@/components/ui/skeletons";

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState({
    chart: true,
    stats: true,
    students: true
  });

  useEffect(() => {
    // Load chart data
    fetchChartData().then(data => {
      setChartData(data);
      setLoading(prev => ({ ...prev, chart: false }));
    });

    // Load students
    fetchStudents().then(data => {
      setStudents(data);
      setLoading(prev => ({ ...prev, students: false, stats: false }));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1>Attendance Management</h1>

      {/* Dashboard Row with Individual Loading States */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          {loading.chart ? (
            <ChartSkeleton />
          ) : (
            <ChartAreaInteractive data={chartData} />
          )}
        </div>

        <div className="col-span-1">
          {loading.stats ? (
            <AttendanceStatsSkeleton />
          ) : (
            <SummaryStats students={students} />
          )}
        </div>
      </div>

      {/* Student List */}
      {loading.students ? (
        <Card>
          <CardContent>
            <AttendanceTableSkeleton rows={6} />
          </CardContent>
        </Card>
      ) : (
        <Table>
          {students.map(student => (
            <TableRow key={student.id}>
              {/* Student data */}
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  );
}


**Result**: Each section shows appropriate loading skeleton independently!

---

## Example 3: Using Next.js Loading Files (Easiest!)

### File Structure

```
app/
└── (dashboard)/
    └── admin/
        ├── students/
        │   ├── page.tsx        ← Your main page
        │   └── loading.tsx     ← NEW: Auto-loading state
        └── attendance/
            ├── page.tsx
            └── loading.tsx     ← NEW: Auto-loading state
```

### Create loading.tsx Files

tsx
// app/(dashboard)/admin/students/loading.tsx
import { StudentPageSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return <StudentPageSkeleton />
}


tsx
// app/(dashboard)/admin/attendance/loading.tsx
import { AttendancePageSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return <AttendancePageSkeleton />
}


### That's It! Next.js automatically shows these while your page loads!

**No code changes needed in your page.tsx!**

---

## Example 4: Refresh Button with Loading

### BEFORE

tsx
<Button onClick={fetchData}>
  <RefreshCw className="h-4 w-4 mr-2" />
  Refresh
</Button>


**Problem**: No feedback when clicked, button clickable multiple times.

---

### AFTER

tsx
<Button
  onClick={handleRefresh}
  disabled={isRefreshing}
>
  <RefreshCw className={cn(
    "h-4 w-4 mr-2",
    isRefreshing && "animate-spin"
  )} />
  {isRefreshing ? 'Refreshing...' : 'Refresh'}
</Button>

{isRefreshing && (
  <StudentTableSkeleton rows={10} />
)}


**Result**: Button shows loading state, table shows skeleton during refresh!

---

## Example 5: Form Submission

### BEFORE

tsx
const handleSubmit = async (data) => {
  await createStudent(data);
  router.push('/admin/students');
};

return (
  <form onSubmit={handleSubmit}>
    <Input name="name" />
    <Input name="email" />
    <Button type="submit">Submit</Button>
  </form>
);


**Problem**: No feedback during submission, form can be submitted multiple times.

---

### AFTER

tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    await createStudent(data);
    router.push('/admin/students');
  } finally {
    setIsSubmitting(false);
  }
};

if (isSubmitting) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submitting...</CardTitle>
      </CardHeader>
      <CardContent>
        <FormSkeleton fields={8} />
      </CardContent>
    </Card>
  );
}

return (
  <form onSubmit={handleSubmit}>
    <Input name="name" />
    <Input name="email" />
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? 'Submitting...' : 'Submit'}
    </Button>
  </form>
);


**Result**: Form shows skeleton during submission, button disabled!

---

## Example 6: Delete Action

### BEFORE

tsx
<DropdownMenuItem
  onClick={() => deleteStudent(student.id)}
>
  <Trash2 className="h-4 w-4 mr-2" />
  Delete
</DropdownMenuItem>


**Problem**: No feedback, row doesn't indicate deletion in progress.

---

### AFTER

tsx
const [deletingId, setDeletingId] = useState(null);

const handleDelete = async (id) => {
  setDeletingId(id);
  try {
    await deleteStudent(id);
    // Remove from list
    setStudents(students.filter(s => s.id !== id));
  } finally {
    setDeletingId(null);
  }
};

// In table row
<TableRow
  className={cn(
    deletingId === student.id && "opacity-50 pointer-events-none"
  )}
>
  {deletingId === student.id ? (
    <TableCell colSpan={5}>
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Deleting...</span>
      </div>
    </TableCell>
  ) : (
    <>
      {/* Normal row content */}
    </>
  )}
</TableRow>


**Result**: Row shows deleting state, prevents double-clicks!

---

## Quick Implementation Checklist

For each page that loads data:

- [ ] Create `loading.tsx` file in page directory
- [ ] Import appropriate skeleton from `/components/ui/skeletons.tsx`
- [ ] Add loading state: `const [isLoading, setIsLoading] = useState(true)`
- [ ] Wrap fetch calls with loading state updates
- [ ] Show skeleton when `isLoading === true`
- [ ] Show actual content when `isLoading === false`
- [ ] Test with slow network (Chrome DevTools → Network → Slow 3G)

---

## Visual Comparison

### Without Skeletons:
```
Loading... [Blank white screen]
↓ (2 seconds)
[Sudden appearance of data]
```

### With Skeletons:
```
[Structured skeleton showing layout]
↓ (2 seconds - feels faster!)
[Smooth transition to actual data]
```

---

## Performance Tips

1. **Don't over-skeleton**: Match skeleton to actual layout
2. **Progressive loading**: Load critical content first
3. **Reasonable delays**: Don't show skeleton for < 200ms loads
4. **Skeleton caching**: Reuse skeleton components
5. **Accessibility**: Ensure screen readers announce loading state

---

## Testing Your Implementation

bash
# Test with slow network
# Chrome DevTools → Network → Throttling → Slow 3G

# Test with React DevTools
# Check for unnecessary re-renders during loading

# Test accessibility
# Screen reader should announce "Loading students"


---

## Common Mistakes to Avoid

❌ **Don't**: Show skeleton forever (missing setIsLoading(false))
✅ **Do**: Always set loading to false in finally block

❌ **Don't**: Different skeleton layout than actual content
✅ **Do**: Match skeleton structure to final content

❌ **Don't**: Too many/too few skeleton rows
✅ **Do**: Show realistic count (10 for tables, 4 for cards)

❌ **Don't**: Show skeleton for instant operations
✅ **Do**: Use button loading states for quick actions

---

**Ready to implement? Start with the `loading.tsx` files - they're the easiest wins!**
