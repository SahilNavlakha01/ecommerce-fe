import { useState, useCallback } from 'react'

interface UseTableStateProps {
  initialItemsPerPage?: number
  initialSortKey?: string
  initialSortDirection?: 'asc' | 'desc'
}

export const useTableState = ({
  initialItemsPerPage = 10,
  initialSortKey = '',
  initialSortDirection = 'asc'
}: UseTableStateProps = {}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortKey, setSortKey] = useState<string>(initialSortKey)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage)

  const handleSort = useCallback((key: string, direction: 'asc' | 'desc') => {
    setSortKey(key)
    setSortDirection(direction)
    setCurrentPage(1) // Reset to first page when sorting
  }, [])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1) // Reset to first page when changing items per page
  }, [])

  const resetFilters = useCallback(() => {
    setSearchTerm('')
    setSortKey(initialSortKey)
    setSortDirection(initialSortDirection)
    setCurrentPage(1)
  }, [initialSortKey, initialSortDirection])

  return {
    // State
    searchTerm,
    sortKey,
    sortDirection,
    currentPage,
    itemsPerPage,
    
    // Setters
    setSearchTerm: handleSearch,
    setSortKey,
    setSortDirection,
    setCurrentPage: handlePageChange,
    setItemsPerPage: handleItemsPerPageChange,
    
    // Handlers
    handleSort,
    handleSearch,
    handlePageChange,
    handleItemsPerPageChange,
    resetFilters
  }
}

export default useTableState