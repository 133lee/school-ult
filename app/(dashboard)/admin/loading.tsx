/**
 * Loading State for Dashboard Page
 *
 * This component is automatically shown by Next.js
 * while the dashboard page is loading.
 *
 * It provides a skeleton UI that matches the actual page layout.
 */

import { DashboardStatsSkeleton, ChartSkeleton, CardSkeleton } from '@/components/ui/skeletons'

export default function Loading() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Right side - Stats Cards */}
        <div className="md:col-span-1">
          <DashboardStatsSkeleton />
        </div>

        {/* Left side - Chart */}
        <div className="md:col-span-2">
          <ChartSkeleton />
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3">
          <CardSkeleton />
        </div>
        <div className="md:col-span-1"></div>
      </div>
    </main>
  )
}
