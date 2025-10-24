# Skeleton Loading States - Implementation Guide

This guide shows you how to implement skeleton loading states in your School Management System for a better user experience.

## Why Use Skeletons?

Skeleton screens provide:
- **Better UX**: Users see immediate feedback while data loads
- **Perceived Performance**: Page feels faster
- **Professional Look**: Modern, polished interface
- **Reduced Bounce Rate**: Users wait longer when they see loading progress

## Available Skeleton Components

All skeleton components are in [`components/ui/skeletons.tsx`](components/ui/skeletons.tsx)

### Component List

| Component | Use Case | Props |
|-----------|----------|-------|
| `StudentTableSkeleton` | Student list tables | `rows?: number` (default: 10) |
| `AttendanceTableSkeleton` | Attendance tables | `rows?: number` (default: 6) |
| `StatsCardSkeleton` | Single stat card | - |
| `DashboardStatsSkeleton` | 4 stat cards in grid | - |
| `AttendanceStatsSkeleton` | 2x2 stat grid | - |
| `ChartSkeleton` | Chart placeholders | - |
| `FormSkeleton` | Form loading | `fields?: number` (default: 6) |
| `StudentDetailsSkeleton` | Student details sheet | - |
| `PageHeaderSkeleton` | Page headers | - |
| `FilterBarSkeleton` | Filter bars | - |
| `StudentPageSkeleton` | Full student page | - |
| `AttendancePageSkeleton` | Full attendance page | - |

## Implementation Methods

### Method 1: Using React Suspense (Recommended)

Create a `loading.tsx` file in the same directory as your `page.tsx`:

```tsx
// app/(dashboard)/admin/students/loading.tsx
import { StudentPageSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return <StudentPageSkeleton />
}
```

Next.js automatically shows this while the page loads!

### Method 2: Conditional Rendering with State

For client components with data fetching:

```tsx
"use client"

import { useState, useEffect } from 'react'
import { StudentTableSkeleton } from '@/components/ui/skeletons'

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStudents() {
      setIsLoading(true)
      try {
        const response = await fetch('/api/students')
        const data = await response.json()
        setStudents(data)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStudents()
  }, [])

  if (isLoading) {
    return <StudentTableSkeleton rows={10} />
  }

  return (
    // Your actual table component
    <StudentTable students={students} />
  )
}
```

### Method 3: Inline Loading States

For specific sections:

```tsx
import { ChartSkeleton, AttendanceStatsSkeleton } from '@/components/ui/skeletons'

export default function Dashboard() {
  const { data: chartData, isLoading: chartLoading } = useChartData()
  const { data: stats, isLoading: statsLoading } = useStats()

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        {chartLoading ? <ChartSkeleton /> : <Chart data={chartData} />}
      </div>
      <div className="col-span-1">
        {statsLoading ? <AttendanceStatsSkeleton /> : <Stats data={stats} />}
      </div>
    </div>
  )
}
```

## Practical Examples

### Example 1: Students Page

```tsx
// app/(dashboard)/admin/students/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { StudentTableSkeleton } from '@/components/ui/skeletons'
import { getStudents } from '@/lib/api'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudents()
      .then(setStudents)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold">Students Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage student information and enrollment
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <StudentTableSkeleton rows={10} />
          ) : (
            <Table>
              {/* Your actual table */}
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Example 2: Attendance Page

```tsx
// app/(dashboard)/admin/attendance/page.tsx
"use client"

import { useState, useEffect } from 'react'
import {
  AttendanceStatsSkeleton,
  ChartSkeleton,
  AttendanceTableSkeleton
} from '@/components/ui/skeletons'

export default function AttendancePage() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchChartData(),
      fetchStudents()
    ]).then(([statsData, chartData, studentsData]) => {
      setStats(statsData)
      setChartData(chartData)
      setStudents(studentsData)
      setLoading(false)
    })
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Attendance Management</h1>

      {/* Stats + Chart Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartAreaInteractive data={chartData} />
          )}
        </div>
        <div className="md:col-span-1">
          {loading ? (
            <AttendanceStatsSkeleton />
          ) : (
            <SummaryStats students={students} />
          )}
        </div>
      </div>

      {/* Student List */}
      <Card>
        <CardContent>
          {loading ? (
            <AttendanceTableSkeleton rows={6} />
          ) : (
            <Table>
              {/* Your attendance table */}
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Example 3: Using with React Query / SWR

```tsx
"use client"

import { useQuery } from '@tanstack/react-query'
import { StudentTableSkeleton } from '@/components/ui/skeletons'
import { getStudents } from '@/lib/api'

export default function StudentsPage() {
  const { data: students, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: getStudents
  })

  if (error) return <ErrorMessage error={error} />

  if (isLoading) return <StudentTableSkeleton rows={10} />

  return <StudentTable students={students} />
}
```

### Example 4: Optimistic Loading (Show skeleton during mutations)

```tsx
"use client"

import { useState } from 'react'
import { StudentTableSkeleton } from '@/components/ui/skeletons'
import { deleteStudent } from '@/lib/api'

export default function StudentList({ initialStudents }) {
  const [students, setStudents] = useState(initialStudents)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete(id) {
    setIsDeleting(true)
    try {
      await deleteStudent(id)
      setStudents(students.filter(s => s.id !== id))
    } finally {
      setIsDeleting(false)
    }
  }

  if (isDeleting) {
    return <StudentTableSkeleton rows={students.length} />
  }

  return (
    <Table>
      {/* Your table with delete buttons */}
    </Table>
  )
}
```

## Using with Prisma & Server Components

### Create loading.tsx for automatic loading states

```tsx
// app/(dashboard)/admin/students/loading.tsx
import { StudentPageSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return <StudentPageSkeleton />
}
```

### Your page.tsx with server-side data fetching

```tsx
// app/(dashboard)/admin/students/page.tsx
import { prisma } from '@/lib/prisma'
import { StudentTable } from '@/components/student-table'

// This is a server component - Next.js will show loading.tsx while this loads
export default async function StudentsPage() {
  const students = await prisma.student.findMany({
    include: {
      gradeLevel: true
    },
    where: {
      isActive: true,
      deletedAt: null
    }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Students Management</h1>
      <StudentTable students={students} />
    </div>
  )
}
```

## Best Practices

### 1. Match Skeleton to Content Layout

Your skeleton should look like the actual content:

```tsx
// ❌ Bad - doesn't match actual layout
<Skeleton className="h-20 w-full" />

// ✅ Good - matches student row layout
<div className="flex items-center gap-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="flex-1 space-y-2">
    <Skeleton className="h-4 w-[180px]" />
    <Skeleton className="h-3 w-[120px]" />
  </div>
</div>
```

### 2. Use Appropriate Row Counts

```tsx
// Show realistic number of items
<StudentTableSkeleton rows={10} />  // ✅ Good - typical page size
<StudentTableSkeleton rows={100} /> // ❌ Bad - too many
```

### 3. Don't Show Skeleton for Instant Actions

```tsx
// ❌ Bad - button click shouldn't show full skeleton
<Button onClick={() => {
  setLoading(true)
  quickAction().finally(() => setLoading(false))
}}>
  Quick Action
</Button>

// ✅ Good - use button loading state
<Button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Quick Action'}
</Button>
```

### 4. Combine Skeletons for Complex Layouts

```tsx
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <DashboardStatsSkeleton />
      <div className="grid grid-cols-2 gap-6">
        <ChartSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
```

### 5. Add Transitions (Optional)

```tsx
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence mode="wait">
  {loading ? (
    <motion.div
      key="skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <StudentTableSkeleton />
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <StudentTable students={students} />
    </motion.div>
  )}
</AnimatePresence>
```

## Quick Reference

### For Your Current Pages

| Page | Component to Use | Example |
|------|-----------------|---------|
| [Students Page](app/(dashboard)/admin/students/page.tsx) | `StudentPageSkeleton` or `StudentTableSkeleton` | See Example 1 above |
| [Attendance Page](app/(dashboard)/admin/attendance/page.tsx) | `AttendancePageSkeleton` or combine individual skeletons | See Example 2 above |
| Teachers Page | `StudentTableSkeleton` (same layout) | Similar to students |
| Dashboard | Combine `DashboardStatsSkeleton` + `ChartSkeleton` | See Example 4 |

## Common Patterns

### Pattern 1: Full Page Loading

```tsx
if (isLoading) return <StudentPageSkeleton />
return <ActualPage />
```

### Pattern 2: Section Loading

```tsx
<div>
  <Header /> {/* Always show */}
  {isLoading ? <TableSkeleton /> : <Table />}
</div>
```

### Pattern 3: Parallel Loading

```tsx
<div className="grid grid-cols-2 gap-4">
  <div>{loading1 ? <Skeleton /> : <Content1 />}</div>
  <div>{loading2 ? <Skeleton /> : <Content2 />}</div>
</div>
```

### Pattern 4: Sequential Loading

```tsx
if (initialLoading) return <PageSkeleton />
if (dataLoading) return <TableSkeleton />
return <Table />
```

## Testing Skeleton States

Add a delay to see your skeletons in action:

```tsx
useEffect(() => {
  async function loadData() {
    setLoading(true)

    // Add artificial delay for testing
    if (process.env.NODE_ENV === 'development') {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    const data = await fetchData()
    setData(data)
    setLoading(false)
  }
  loadData()
}, [])
```

## Next Steps

1. ✅ Create `loading.tsx` files in your page directories
2. ✅ Replace hardcoded data with actual API/Prisma calls
3. ✅ Add loading states to client components
4. ✅ Test with slow network (Chrome DevTools → Network → Slow 3G)
5. ✅ Adjust skeleton row counts to match typical data

## Need Custom Skeletons?

Create new ones based on the base `Skeleton` component:

```tsx
export function CustomSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-[200px]" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-[90%]" />
    </div>
  )
}
```

---

**Pro Tip**: Start with `loading.tsx` files (Method 1) - it's the easiest and most Next.js-native approach!
