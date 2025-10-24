/**
 * Reusable Skeleton Components for School Management System
 *
 * Usage:
 * 1. Import the skeleton that matches your component
 * 2. Show skeleton while data is loading
 * 3. Replace with actual data when loaded
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// =============================================
// STUDENT LIST SKELETON
// =============================================
export function StudentListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full" />

          <div className="flex-1 space-y-2">
            {/* Name */}
            <Skeleton className="h-4 w-[180px]" />
            {/* Student ID */}
            <Skeleton className="h-3 w-[120px]" />
          </div>

          <div className="space-y-2">
            {/* Email */}
            <Skeleton className="h-3 w-[150px]" />
            {/* Phone */}
            <Skeleton className="h-3 w-[120px]" />
          </div>

          <div className="space-y-2">
            {/* Grade */}
            <Skeleton className="h-4 w-[80px]" />
            {/* Class */}
            <Skeleton className="h-3 w-[60px]" />
          </div>

          {/* Status Badge */}
          <Skeleton className="h-6 w-16 rounded-full" />

          {/* Actions Button */}
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      ))}
    </div>
  )
}

// =============================================
// STUDENT TABLE SKELETON
// =============================================
export function StudentTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Contact Information</TableHead>
          <TableHead>Academic Info</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <Skeleton className="h-3 w-[180px]" />
                <Skeleton className="h-3 w-[120px]" />
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-2">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-3 w-[60px]" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[70px] rounded-full" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-8 w-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// =============================================
// ATTENDANCE TABLE SKELETON
// =============================================
export function AttendanceTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Student ID</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-6" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[140px]" />
                  <Skeleton className="h-3 w-[180px]" />
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-[80px]" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-6 w-[90px] rounded-full" />
            </TableCell>
            <TableCell>
              <div className="flex gap-2 justify-end">
                <Skeleton className="h-8 w-[70px]" />
                <Skeleton className="h-8 w-[70px]" />
                <Skeleton className="h-8 w-[70px]" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// =============================================
// STATS CARD SKELETON
// =============================================
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-5 w-5 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[60px] mb-2" />
        <Skeleton className="h-3 w-[120px]" />
      </CardContent>
    </Card>
  )
}

// =============================================
// DASHBOARD STATS SKELETON (4 cards)
// =============================================
export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </div>
  )
}

// =============================================
// ATTENDANCE STATS SKELETON (2x2 grid)
// =============================================
export function AttendanceStatsSkeleton() {
  return (
    <section className="grid grid-cols-2 gap-3">
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
      <StatsCardSkeleton />
    </section>
  )
}

// =============================================
// CARD WITH CONTENT SKELETON
// =============================================
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[150px] mb-2" />
        <Skeleton className="h-4 w-[250px]" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================
// CHART SKELETON
// =============================================
export function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[180px] mb-2" />
        <Skeleton className="h-4 w-[220px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart area */}
          <Skeleton className="h-[300px] w-full rounded-lg" />
          {/* Legend */}
          <div className="flex justify-center gap-6">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// =============================================
// FORM SKELETON
// =============================================
export function FormSkeleton({ fields = 6 }: { fields?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  )
}

// =============================================
// STUDENT DETAILS SHEET SKELETON
// =============================================
export function StudentDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>

      {/* Sections */}
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-[120px]" />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-[80px]" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================
// PAGE HEADER SKELETON
// =============================================
export function PageHeaderSkeleton() {
  return (
    <div className="flex items-start justify-between mt-2">
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-7 w-[250px]" />
        <Skeleton className="h-4 w-[350px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-[100px]" />
        <Skeleton className="h-9 w-[120px]" />
      </div>
    </div>
  )
}

// =============================================
// FILTER BAR SKELETON
// =============================================
export function FilterBarSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex gap-3">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </CardHeader>
    </Card>
  )
}

// =============================================
// FULL PAGE SKELETON (Complete Loading State)
// =============================================
export function StudentPageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FilterBarSkeleton />
      <Card className="flex flex-col h-[calc(100vh-16rem)]">
        <CardHeader>
          <div className="flex items-center justify-between mb-3">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-5 w-[200px]" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <StudentTableSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}

export function AttendancePageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <FilterBarSkeleton />

      {/* Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="md:col-span-1">
          <AttendanceStatsSkeleton />
        </div>
      </div>

      {/* Take Attendance Section */}
      <Card className="border-2 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6">
          <Skeleton className="h-6 w-[250px] mb-4" />
          <Skeleton className="h-4 w-[400px] mb-6" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
