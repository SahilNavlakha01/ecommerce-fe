import React from 'react'

interface AdminLoadingProps {
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AdminLoading({ 
  title = "Loading", 
  subtitle = "Please wait...", 
  size = 'md' 
}: AdminLoadingProps) {
  const sizeClasses = {
    sm: {
      container: 'p-6',
      spinner: 'h-8 w-8',
      title: 'text-base',
      subtitle: 'text-sm'
    },
    md: {
      container: 'p-8',
      spinner: 'h-12 w-12',
      title: 'text-lg',
      subtitle: 'text-sm'
    },
    lg: {
      container: 'p-12',
      spinner: 'h-16 w-16',
      title: 'text-xl',
      subtitle: 'text-base'
    }
  }

  const classes = sizeClasses[size]

  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${classes.container} text-center max-w-sm mx-auto`}>
        <div className="flex flex-col items-center space-y-3">
          <div className={`animate-spin rounded-full ${classes.spinner} border-2 border-teal-200 border-t-teal-600`}></div>
          <div className="space-y-1">
            <h3 className={`${classes.title} font-semibold text-gray-900`}>{title}</h3>
            <p className={`text-gray-600 ${classes.subtitle}`}>{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Specialized loading components for different admin sections
export function DashboardLoading() {
  return (
    <AdminLoading 
      title="Loading Dashboard" 
      subtitle="Fetching latest data from your jewelry store..." 
      size="lg" 
    />
  )
}

export function CategoriesLoading() {
  return (
    <AdminLoading 
      title="Loading Categories" 
      subtitle="Fetching category data..." 
      size="md" 
    />
  )
}

export function ProductsLoading() {
  return (
    <AdminLoading 
      title="Loading Products" 
      subtitle="Fetching product inventory..." 
      size="md" 
    />
  )
}

export function UsersLoading() {
  return (
    <AdminLoading 
      title="Loading Users" 
      subtitle="Fetching user data..." 
      size="md" 
    />
  )
}

export function OrdersLoading() {
  return (
    <AdminLoading 
      title="Loading Orders" 
      subtitle="Fetching order data..." 
      size="md" 
    />
  )
}