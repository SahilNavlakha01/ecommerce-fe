"use client"

import { useState, useEffect, useCallback } from 'react'
import { AdminTable } from './AdminTable'
import { SearchAndFilter } from './SearchAndFilter'
import { Pagination } from './Pagination'
import { exportToCSV, printTable } from '@/utils/exportUtils'

interface Column {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
}

interface FilterOption {
  value: string
  label: string
}

interface Filter {
  key: string
  label: string
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
}

interface ServerPaginatedTableProps {
  columns: Column[]
  fetchData: (params: any) => Promise<any>
  filters?: Filter[]
  searchPlaceholder?: string
  exportFilename?: string
  printTitle?: string
  initialItemsPerPage?: number
  onExportData?: (data: any[]) => any[]
  onPrintData?: (data: any[]) => any[]
}

export const ServerPaginatedTable = ({
  columns,
  fetchData,
  filters = [],
  searchPlaceholder = "Search...",
  exportFilename = "data",
  printTitle = "Data Report",
  initialItemsPerPage = 10,
  onExportData,
  onPrintData
}: ServerPaginatedTableProps) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm,
        sortBy: sortKey,
        sortOrder: sortDirection,
        // Add filter values
        ...filters.reduce((acc, filter) => {
          if (filter.value !== 'all') {
            acc[filter.key] = filter.value
          }
          return acc
        }, {} as any)
      }

      const response = await fetchData(params)
      
      if (response?.data) {
        setData(response.data.data || response.data.items || [])
        setTotalPages(response.data.totalPages || Math.ceil((response.data.total || 0) / itemsPerPage))
        setTotalItems(response.data.total || response.data.totalItems || 0)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setData([])
      setTotalPages(0)
      setTotalItems(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, itemsPerPage, debouncedSearchTerm, sortKey, sortDirection, filters, fetchData])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Reset to first page when search or filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedSearchTerm, filters])

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const handleExport = async () => {
    try {
      // Fetch all data for export (without pagination)
      const params = {
        page: 1,
        limit: totalItems, // Get all items
        search: debouncedSearchTerm,
        sortBy: sortKey,
        sortOrder: sortDirection,
        ...filters.reduce((acc, filter) => {
          if (filter.value !== 'all') {
            acc[filter.key] = filter.value
          }
          return acc
        }, {} as any)
      }

      const response = await fetchData(params)
      const allData = response?.data?.data || response?.data?.items || []
      
      const exportData = onExportData ? onExportData(allData) : allData
      exportToCSV(exportData, exportFilename)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handlePrint = async () => {
    try {
      // Fetch all data for printing (without pagination)
      const params = {
        page: 1,
        limit: totalItems, // Get all items
        search: debouncedSearchTerm,
        sortBy: sortKey,
        sortOrder: sortDirection,
        ...filters.reduce((acc, filter) => {
          if (filter.value !== 'all') {
            acc[filter.key] = filter.value
          }
          return acc
        }, {} as any)
      }

      const response = await fetchData(params)
      const allData = response?.data?.data || response?.data?.items || []
      
      const printData = onPrintData ? onPrintData(allData) : allData
      printTable(printData, printTitle)
    } catch (error) {
      console.error('Error printing data:', error)
    }
  }

  if (loading && data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="animate-pulse">
            <div className="bg-gray-50 h-12"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-gray-100 h-16 bg-gray-25"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder={searchPlaceholder}
        filters={filters}
        onExport={handleExport}
        onPrint={handlePrint}
      />

      {data.length === 0 && !loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
          <p className="text-gray-600 mb-6">No items match your current search and filter criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('')
              filters.forEach(filter => filter.onChange('all'))
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Results Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Results</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Showing {data.length} of {totalItems} items</span>
                {(debouncedSearchTerm || filters.some(f => f.value !== 'all')) && (
                  <>
                    <span>•</span>
                    <span>Filtered results</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <AdminTable
            columns={columns}
            data={data}
            loading={loading}
            onSort={handleSort}
            sortKey={sortKey}
            sortDirection={sortDirection}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage)
                setCurrentPage(1)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}