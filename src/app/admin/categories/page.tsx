"use client"

import { useState, useEffect, useMemo } from 'react'
import { GetAllCategories, GetSingleCategory, GetAllSubcategories, GetSingleSubcategory, GetSubcategoriesByCategory } from '@/Services/GetService'
import { AddCategory, UpdateCategory, DeleteCategory, AddSubcategory, UpdateSubcategory, DeleteSubcategory } from '@/Services/PostService'
import { successToast, errorToast } from '@/utils/toast'
import { formatDate } from '@/utils/dateFormat'
import { CategoriesLoading } from '@/components/ui/AdminLoading'
import { AdminStatsCard } from '@/components/ui/AdminStatsCard'
import { SearchAndFilter } from '@/components/ui/SearchAndFilter'
import { AdminTable } from '@/components/ui/AdminTable'
import { Pagination } from '@/components/ui/Pagination'
import { exportToCSV, exportToExcel, printTable, filterData, sortData, paginateData } from '@/utils/exportUtils'
import Modal from '@/components/ui/Modal'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [showModal, setShowModal] = useState(false)
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [categorySubcategories, setCategorySubcategories] = useState<any[]>([])
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: ''
  })
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    categoryId: '',
    parentId: ''
  })
  const [subcatParentOptions, setSubcatParentOptions] = useState<any[]>([])
  const [loadingParentOptions, setLoadingParentOptions] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('2')

  useEffect(() => {
    fetchCategories()
    fetchSubcategories()
  }, [])

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1]

    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData))
        setCurrentUserId(parsedData.id || '2')
      } catch (error) {
        console.error('Error parsing user data:', error)
      }
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await GetAllCategories()
      if (response?.data) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async () => {
    try {
      const response = await GetAllSubcategories()
      if (response?.data) {
        setSubcategories(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const fetchCategorySubcategories = async (categoryId: any) => {
    try {
      const response = await GetSubcategoriesByCategory(String(categoryId))
      if (response?.data) {
        setCategorySubcategories(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    }
  }

  const fetchParentOptions = async (categoryId: string) => {
    if (!categoryId) { setSubcatParentOptions([]); return }
    setLoadingParentOptions(true)
    try {
      const res = await GetSubcategoriesByCategory(categoryId)
      setSubcatParentOptions(res?.data?.data || [])
    } catch (e) {
      setSubcatParentOptions([])
    } finally {
      setLoadingParentOptions(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const payload = {
        name: formData.name,
        ...(editingCategory ? { updatedBy: currentUserId } : { createdBy: currentUserId })
      }
      
      if (editingCategory) {
        await UpdateCategory(payload, editingCategory.id)
        successToast('Category updated successfully!')
      } else {
        await AddCategory(payload)
        successToast('Category added successfully!')
      }
      
      setShowModal(false)
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Error:', error)
      errorToast((error as any).response?.data?.message || (error as any).message || 'Error saving category')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)

    try {
      const catId = subcategoryFormData.categoryId || selectedCategory?.id
      const payload: any = {
        name: subcategoryFormData.name,
        categoryId: catId,
        ...(subcategoryFormData.parentId ? { parentId: parseInt(subcategoryFormData.parentId) } : {}),
        ...(editingSubcategory ? { updatedBy: currentUserId } : { createdBy: currentUserId })
      }
      
      if (editingSubcategory) {
        await UpdateSubcategory(payload, editingSubcategory.id)
        successToast('Subcategory updated successfully!')
      } else {
        await AddSubcategory(payload)
        successToast('Subcategory added successfully!')
      }
      
      resetSubcategoryForm()
      fetchCategorySubcategories(catId)
      fetchSubcategories()
    } catch (error) {
      console.error('Error:', error)
      errorToast((error as any).response?.data?.message || (error as any).message || 'Error saving subcategory')
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({ name: '' })
    setEditingCategory(null)
  }

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({ name: '', categoryId: '', parentId: '' })
    setSubcatParentOptions([])
    setEditingSubcategory(null)
  }

  const handleEdit = async (category: any) => {
    try {
      const response = await GetSingleCategory(category.id)
      if (response?.data) {
        const categoryData = response.data.data
        setEditingCategory(categoryData)
        setFormData({
          name: categoryData.name || ''
        })
        setShowModal(true)
      }
    } catch (error) {
      console.error('Error fetching category:', error)
      errorToast((error as any).response?.data?.message || (error as any).message || 'Error loading category details')
    }
  }

  const handleEditSubcategory = async (subcategory: any) => {
    try {
      const response = await GetSingleSubcategory(subcategory.id)
      if (response?.data) {
        const subcategoryData = response.data.data
        setEditingSubcategory(subcategoryData)
        const catId = String(subcategoryData.categoryId || selectedCategory?.id || '')
        setSubcategoryFormData({
          name: subcategoryData.name || '',
          categoryId: catId,
          parentId: subcategoryData.parentId ? String(subcategoryData.parentId) : ''
        })
        if (catId) fetchParentOptions(catId)
      }
    } catch (error) {
      console.error('Error fetching subcategory:', error)
      errorToast((error as any).response?.data?.message || (error as any).message || 'Error loading subcategory details')
    }
  }

  const handleDelete = async (id: any) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await DeleteCategory(id)
        setCategories(categories.filter(cat => cat.id !== id))
        successToast('Category deleted successfully!')
      } catch (error) {
        console.error('Error deleting category:', error)
        errorToast((error as any).response?.data?.message || (error as any).message || 'Error deleting category')
      }
    }
  }

  const handleDeleteSubcategory = async (id: any) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await DeleteSubcategory(id)
        successToast('Subcategory deleted successfully!')
        fetchCategorySubcategories(selectedCategory?.id)
        fetchSubcategories()
      } catch (error) {
        console.error('Error deleting subcategory:', error)
        errorToast((error as any).response?.data?.message || (error as any).message || 'Error deleting subcategory')
      }
    }
  }

  const handleSubcategoriesClick = (category: any) => {
    setSelectedCategory(category)
    setShowSubcategoryModal(true)
    fetchCategorySubcategories(category.id)
    setSubcategoryFormData({ name: '', categoryId: String(category.id), parentId: '' })
    fetchParentOptions(String(category.id))
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
  }

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'Inactive'
  }

  // Filter and sort categories
  const filteredAndSortedCategories = useMemo(() => {
    let filtered = categories

    // Apply search filter
    if (searchTerm) {
      filtered = filterData(filtered, searchTerm, ['name'])
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(category => {
        if (statusFilter === 'active') return category.isActive
        if (statusFilter === 'inactive') return !category.isActive
        return true
      })
    }

    // Apply sorting
    if (sortKey) {
      filtered = sortData(filtered, sortKey, sortDirection)
    }

    return filtered
  }, [categories, searchTerm, statusFilter, sortKey, sortDirection])

  // Paginate categories
  const paginatedCategories = useMemo(() => {
    return paginateData(filteredAndSortedCategories, currentPage, itemsPerPage)
  }, [filteredAndSortedCategories, currentPage, itemsPerPage])

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const prepareExportData = () => {
    return filteredAndSortedCategories.map(category => {
      const categorySubcategories = subcategories.filter(sub => sub.categoryId === category.id)
      return {
        'Category ID': category.id,
        'Category Name': category.name,
        'Subcategories Count': categorySubcategories.length,
        'Subcategories': categorySubcategories.map(sub => sub.name).join(', ') || 'None',
        'Status': category.isActive ? 'Active' : 'Inactive',
        'Created Date': formatDate(category.createdAt),
        'Created By': category.createdBy || 'N/A',
        'Updated Date': category.updatedAt ? formatDate(category.updatedAt) : 'N/A'
      }
    })
  }

  const handleExport = () => {
    const exportData = prepareExportData()
    exportToCSV(exportData, 'categories')
  }

  const handleExportExcel = () => {
    const exportData = prepareExportData()
    exportToExcel(exportData, 'categories')
  }

  const handlePrint = () => {
    const printData = filteredAndSortedCategories.map(category => ({
      name: category.name,
      subcategories: subcategories.filter(sub => sub.categoryId === category.id).length,
      status: category.isActive ? 'Active' : 'Inactive',
      created: formatDate(category.createdAt)
    }))
    
    printTable(printData, 'Categories Report')
  }

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <span className="text-teal-600 font-semibold text-lg">
                {row.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'subcategories',
      label: 'Subcategories',
      sortable: true,
      render: (value: any, row: any) => (
        <div className="flex items-center">
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
            {subcategories.filter(sub => sub.categoryId === row.id).length} subcategories
          </span>
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value: any, row: any) => (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(row.isActive)}`}>
          {getStatusText(row.isActive)}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: any, row: any) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors"
            title="Edit Category"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => handleSubcategoriesClick(row)}
            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
            title="Manage Subcategories"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
            title="Delete Category"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Enhanced Professional Header */}
      <div className="bg-gradient-to-r from-white to-teal-50/30 rounded-2xl p-6 border border-teal-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">Categories Management</h1>
              <p className="text-gray-600 mt-1">Organize and manage your product categories and subcategories</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Category</span>
            </button>

          </div>
        </div>
      </div>

      {loading ? (
        <CategoriesLoading />
      ) : (
        <>
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <AdminStatsCard
              title="Total Categories"
              value={categories.length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Total Subcategories"
              value={subcategories.length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10m0 0l-2 2m2-2l-2-2M7 7l2 2m-2-2l2-2" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Active Categories"
              value={categories.filter(cat => cat.isActive).length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Inactive Categories"
              value={categories.filter(cat => !cat.isActive).length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Search and Filter */}
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search categories by name..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]
              }
            ]}
            onExport={handleExport}
            onExportExcel={handleExportExcel}
            onPrint={handlePrint}
          />

          {categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-6">You haven't added any categories yet. Start by creating your first category.</p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Add Your First Category
              </button>
            </div>
          ) : filteredAndSortedCategories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Categories Found</h3>
              <p className="text-gray-600 mb-6">No categories match your current search and filter criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 mb-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Showing {paginatedCategories.data.length} of {filteredAndSortedCategories.length} categories</span>
                    <span>•</span>
                    <span>Total: {categories.length} categories</span>
                  </div>
                </div>
              </div>

              {/* Categories Table */}
              <AdminTable
                columns={columns}
                data={paginatedCategories.data}
                loading={loading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginatedCategories.totalPages}
                totalItems={paginatedCategories.totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={(newItemsPerPage) => {
                  setItemsPerPage(newItemsPerPage)
                  setCurrentPage(1)
                }}
              />
            </>
          )}
        </>
      )}

      {/* Category Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm() }}
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setShowModal(false); resetForm() }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="category-form"
              disabled={formLoading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {formLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')}
            </button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
              placeholder="Enter category name"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        isOpen={showSubcategoryModal}
        onClose={() => { setShowSubcategoryModal(false); resetSubcategoryForm() }}
        title={`Subcategories — ${selectedCategory?.name}`}
        size="lg"
      >
        <div className="space-y-5">
              {/* Add/Edit Subcategory Form */}
              <form onSubmit={handleSubcategorySubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Category *</label>
                      <select
                        value={subcategoryFormData.categoryId}
                        onChange={(e) => {
                          setSubcategoryFormData({ ...subcategoryFormData, categoryId: e.target.value, parentId: '' })
                          fetchParentOptions(e.target.value)
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Parent Subcategory <span className="text-gray-400">(optional)</span>
                      </label>
                      <select
                        value={subcategoryFormData.parentId}
                        onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, parentId: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                        disabled={!subcategoryFormData.categoryId || loadingParentOptions}
                      >
                        <option value="">{loadingParentOptions ? 'Loading...' : 'None (top-level)'}</option>
                        {subcatParentOptions.filter((s: any) => !s.parentId).map((s: any) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={subcategoryFormData.name}
                      onChange={(e) => setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder={subcategoryFormData.parentId ? 'Sub-subcategory name (e.g. Rose Gold)' : 'Subcategory name (e.g. Anti-Tarnish)'}
                      required
                    />
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {formLoading ? 'Saving...' : (editingSubcategory ? 'Update' : 'Add')}
                    </button>
                    {editingSubcategory && (
                      <button
                        type="button"
                        onClick={resetSubcategoryForm}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>

              {/* Subcategories List */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h10m0 0l-2 2m2-2l-2-2M7 7l2 2m-2-2l2-2" />
                  </svg>
                  Existing Subcategories
                </h3>
                {categorySubcategories.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Subcategories Found</h4>
                    <p className="text-gray-600">This category doesn't have any subcategories yet.</p>
                  </div>
                ) : (
                  // Build tree: top-level subcategories with their children indented
                  (() => {
                    const topLevel = categorySubcategories.filter((s: any) => !s.parentId)
                    const childrenOf = (parentId: number) => categorySubcategories.filter((s: any) => s.parentId === parentId)
                    const SubcatRow = ({ subcategory, isChild }: { subcategory: any, isChild?: boolean }) => (
                      <div
                        key={subcategory.id}
                        className={`flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 transition-colors ${
                          isChild ? 'ml-8 border-l-4 border-l-purple-200' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isChild && (
                            <span className="text-purple-300 text-lg leading-none">└</span>
                          )}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isChild ? 'bg-purple-100' : 'bg-teal-100'
                          }`}>
                            <span className={`font-semibold text-sm ${
                              isChild ? 'text-purple-600' : 'text-teal-600'
                            }`}>
                              {subcategory.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{subcategory.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                isChild ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                              }`}>
                                {isChild ? 'Sub-subcategory' : 'Subcategory'}
                              </span>
                            </div>
                            {isChild && subcategory.parentSubcategoryName && (
                              <p className="text-xs text-gray-400">{selectedCategory?.name} › {subcategory.parentSubcategoryName} › {subcategory.name}</p>
                            )}
                            {!isChild && (
                              <p className="text-xs text-gray-400">{selectedCategory?.name} › {subcategory.name}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSubcategory(subcategory)}
                            className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-2 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(subcategory.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                    return (
                      <div className="space-y-2">
                        {topLevel.map((subcat: any) => (
                          <div key={subcat.id} className="space-y-1">
                            <SubcatRow subcategory={subcat} />
                            {childrenOf(subcat.id).map((child: any) => (
                              <SubcatRow key={child.id} subcategory={child} isChild />
                            ))}
                          </div>
                        ))}
                      </div>
                    )
                  })()
                )}
              </div>
        </div>
      </Modal>
    </div>
  )
}
