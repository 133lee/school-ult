/**
 * SKELETON LOADING EXAMPLES
 *
 * This file contains practical examples of how to use skeleton loading states
 * in different scenarios. Copy and adapt these patterns to your components.
 */

"use client"

import { useState, useEffect } from 'react'
import {
  StudentTableSkeleton,
  AttendanceTableSkeleton,
  ChartSkeleton,
  AttendanceStatsSkeleton,
  FormSkeleton,
  CardSkeleton
} from '@/components/ui/skeletons'

// =============================================
// EXAMPLE 1: Simple Loading State
// =============================================
export function SimpleLoadingExample() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setData({ name: "John Doe" })
      setIsLoading(false)
    }, 2000)
  }, [])

  if (isLoading) {
    return <StudentTableSkeleton rows={5} />
  }

  return <div>Actual content: {data?.name}</div>
}

// =============================================
// EXAMPLE 2: Multiple Loading States
// =============================================
export function MultipleLoadingExample() {
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState(null)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    // Load students
    setTimeout(() => {
      setStudents([/* data */])
      setLoadingStudents(false)
    }, 1500)

    // Load stats (different timing)
    setTimeout(() => {
      setStats({ total: 100 })
      setLoadingStats(false)
    }, 2500)
  }, [])

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        {loadingStudents ? (
          <StudentTableSkeleton rows={10} />
        ) : (
          <div>Students: {students.length}</div>
        )}
      </div>
      <div className="col-span-1">
        {loadingStats ? (
          <AttendanceStatsSkeleton />
        ) : (
          <div>Total: {stats?.total}</div>
        )}
      </div>
    </div>
  )
}

// =============================================
// EXAMPLE 3: With Error Handling
// =============================================
export function LoadingWithErrorExample() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <p className="text-red-700">Error: {error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return <StudentTableSkeleton rows={10} />
  }

  return <div>Data loaded!</div>
}

// =============================================
// EXAMPLE 4: Refetch/Refresh Pattern
// =============================================
export function RefetchExample() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/students')
      const result = await response.json()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="space-y-4">
      <button
        onClick={fetchData}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Loading...' : 'Refresh'}
      </button>

      {isLoading ? (
        <StudentTableSkeleton rows={10} />
      ) : (
        <div>Data: {JSON.stringify(data)}</div>
      )}
    </div>
  )
}

// =============================================
// EXAMPLE 5: Pagination with Loading
// =============================================
export function PaginationLoadingExample() {
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)

  const fetchPage = async (pageNum: number) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/students?page=${pageNum}`)
      const result = await response.json()
      setData(result)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(page)
  }, [page])

  return (
    <div className="space-y-4">
      {isLoading ? (
        <StudentTableSkeleton rows={10} />
      ) : (
        <div>
          {/* Your table here */}
          <p>Showing page {page}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 1 || isLoading}
        >
          Previous
        </button>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={isLoading}
        >
          Next
        </button>
      </div>
    </div>
  )
}

// =============================================
// EXAMPLE 6: Form Submission Loading
// =============================================
export function FormSubmissionExample() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await fetch('/api/students', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      alert('Submitted!')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitting) {
    return (
      <div className="p-6 border rounded-lg">
        <p className="mb-4 text-sm text-muted-foreground">Submitting...</p>
        <FormSkeleton fields={4} />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={formData.name}
        onChange={e => setFormData({ ...formData, name: e.target.value })}
        placeholder="Name"
        className="w-full p-2 border rounded"
      />
      <input
        type="email"
        value={formData.email}
        onChange={e => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Submit
      </button>
    </form>
  )
}

// =============================================
// EXAMPLE 7: Dashboard with Multiple Sections
// =============================================
export function DashboardLoadingExample() {
  const [chartData, setChartData] = useState(null)
  const [statsData, setStatsData] = useState(null)
  const [studentsData, setStudentsData] = useState(null)
  const [loadingChart, setLoadingChart] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)

  useEffect(() => {
    // Load each section independently
    fetch('/api/chart').then(r => r.json()).then(setChartData).finally(() => setLoadingChart(false))
    fetch('/api/stats').then(r => r.json()).then(setStatsData).finally(() => setLoadingStats(false))
    fetch('/api/students').then(r => r.json()).then(setStudentsData).finally(() => setLoadingStudents(false))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header - always shown */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your school</p>
      </div>

      {/* Stats Row */}
      <div>
        {loadingStats ? (
          <AttendanceStatsSkeleton />
        ) : (
          <div>Stats: {JSON.stringify(statsData)}</div>
        )}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          {loadingChart ? (
            <ChartSkeleton />
          ) : (
            <div>Chart Data</div>
          )}
        </div>
        <div>
          {loadingStudents ? (
            <CardSkeleton />
          ) : (
            <div>Recent Students</div>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================
// EXAMPLE 8: Search with Debounce
// =============================================
export function SearchLoadingExample() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }

    setIsSearching(true)

    // Debounce search
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${query}`)
        .then(r => r.json())
        .then(setResults)
        .finally(() => setIsSearching(false))
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search students..."
        className="w-full p-3 border rounded-lg"
      />

      {isSearching ? (
        <StudentTableSkeleton rows={5} />
      ) : results.length > 0 ? (
        <div>
          {results.map((result: any) => (
            <div key={result.id}>{result.name}</div>
          ))}
        </div>
      ) : query ? (
        <p className="text-muted-foreground text-center py-8">
          No results found for "{query}"
        </p>
      ) : null}
    </div>
  )
}

// =============================================
// EXAMPLE 9: Infinite Scroll Loading
// =============================================
export function InfiniteScrollExample() {
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/students?page=${page}`)
      const newItems = await response.json()

      if (newItems.length === 0) {
        setHasMore(false)
      } else {
        setItems(prev => [...prev, ...newItems])
        setPage(p => p + 1)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg mb-2">
            {item.name}
          </div>
        ))}
      </div>

      {isLoading && (
        <StudentTableSkeleton rows={3} />
      )}

      {hasMore && !isLoading && (
        <button
          onClick={loadMore}
          className="w-full py-2 border rounded-lg hover:bg-gray-50"
        >
          Load More
        </button>
      )}

      {!hasMore && (
        <p className="text-center text-muted-foreground py-4">
          No more items to load
        </p>
      )}
    </div>
  )
}
