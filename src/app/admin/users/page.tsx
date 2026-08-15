"use client"

import { useState, useEffect, useMemo } from 'react'
import { GetAllUsers, GetSingleUser } from '@/Services/GetService'
import { UpdateUser, ClearUserCart, RemoveUserCartItems } from '@/Services/PostService'
import { errorToast, successToast } from '@/utils/toast'
import { formatDate } from '@/utils/dateFormat'
import { UsersLoading } from '@/components/ui/AdminLoading'
import { AdminStatsCard } from '@/components/ui/AdminStatsCard'
import { SearchAndFilter } from '@/components/ui/SearchAndFilter'
import { AdminTable } from '@/components/ui/AdminTable'
import { Pagination } from '@/components/ui/Pagination'
import { exportToCSV, exportToExcel, printTable, filterData, sortData, paginateData } from '@/utils/exportUtils'
import Modal from '@/components/ui/Modal'
import { BASE_URL } from '@/Constant/Api'
import { deleteRequest } from '@/Services/ApiMethod'

interface User {
  userId: string
  name: string
  email: string
  userRole: string
  userRoleId?: number
  isActive: number
  totalOrders?: number
  totalSpent?: string
  createdAt: string
  phone?: string
  companyName?: string
  gstNumber?: string
  cartItems?: any[]
  addresses?: any[]
  orderHistory?: any[]
  id?: string
  status?: string
  city?: string
  state?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [selectedUserAddresses, setSelectedUserAddresses] = useState<User | null>(null)
  const [showCartModal, setShowCartModal] = useState(false)
  const [selectedUserCart, setSelectedUserCart] = useState<User | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    userRoleId: 1,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isClearingCart, setIsClearingCart] = useState(false)
  const [selectedCartItems, setSelectedCartItems] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('Customer')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)


  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await GetAllUsers()
      if (response?.data) {
        setUsers(response.data.data)
      }
    } catch (error: unknown) {
      console.error('Error fetching users:', error)
      errorToast((error as any)?.response?.data?.statusMessage || (error as Error)?.message || 'Error loading users')
    } finally {
      setLoading(false)
    }
  }

  // Filter out Admin users and filter by active tab
  const nonAdminUsers = users.filter(user => user.userRole !== 'Admin')
  const customerUsers = nonAdminUsers.filter(user => user.userRole === 'Customer')
  const b2bUsers = nonAdminUsers.filter(user => user.userRole !== 'Customer')
  const baseFilteredUsers = activeTab === 'Customer' ? customerUsers : b2bUsers

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = baseFilteredUsers

    // Apply search filter
    if (searchTerm) {
      filtered = filterData(filtered, searchTerm, ['name', 'email', 'phone', 'companyName'])
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => {
        if (statusFilter === 'active') return user.isActive === 1
        if (statusFilter === 'inactive') return user.isActive === 0
        return true
      })
    }

    // Apply sorting
    if (sortKey) {
      if (sortKey === 'actions') {
        filtered = [...filtered].sort((a: User, b: User) => {
          const aHasCart = (a.cartItems?.length || 0) > 0
          const bHasCart = (b.cartItems?.length || 0) > 0

          if (aHasCart !== bHasCart) {
            return sortDirection === 'asc'
              ? Number(bHasCart) - Number(aHasCart)
              : Number(aHasCart) - Number(bHasCart)
          }

          const aName = String(a.name || '').toLowerCase()
          const bName = String(b.name || '').toLowerCase()
          return sortDirection === 'asc'
            ? aName.localeCompare(bName)
            : bName.localeCompare(aName)
        })
      } else {
        filtered = sortData(filtered, sortKey, sortDirection)
      }
    }

    return filtered
  }, [baseFilteredUsers, searchTerm, statusFilter, sortKey, sortDirection])

  // Paginate users
  const paginatedUsers = useMemo(() => {
    return paginateData(filteredAndSortedUsers, currentPage, itemsPerPage)
  }, [filteredAndSortedUsers, currentPage, itemsPerPage])

  const viewUserDetails = async (user: User) => {
    try {
      const response = await GetSingleUser(user.userId)
      if (response?.data) {
        setSelectedUser(response.data.data)
        setShowModal(true)
      }
    } catch (error: unknown) {
      console.error('Error fetching user details:', error)
      errorToast((error as any)?.response?.data?.statusMessage || (error as Error)?.message || 'Error loading user details')
    }
  }

  const viewUserAddresses = (user: User) => {
    setSelectedUserAddresses({
      ...user,
      addresses: user.addresses && user.addresses.length > 0 ? user.addresses : []
    })
    setShowAddressModal(true)
  }

  const viewUserCart = (user: User) => {
    setSelectedUserCart(user)
    setSelectedCartItems([])
    setShowCartModal(true)
  }

  const getRoleIdFromName = (role: string) => {
    const normalized = String(role || '').toLowerCase()
    if (normalized.includes('admin')) return 3
    if (normalized.includes('b2b') || normalized.includes('business')) return 2
    return 1
  }

  const getRoleLabel = (roleId?: number) => {
    if (roleId === 2) return 'B2B Customer'
    if (roleId === 3) return 'Admin'
    return 'Customer'
  }

  const openEditUser = (user: User) => {
    setEditTarget(user)
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      userRoleId: Number(user.userRoleId || getRoleIdFromName(user.userRole)),
    })
    setShowEditModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'inactive': return 'bg-red-100 text-red-700'
      case 'suspended': return 'bg-yellow-100 text-yellow-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRoleColor = (role: string) => {
    const normalized = String(role || '').toLowerCase()
    switch (true) {
      case normalized.includes('admin'): return 'bg-purple-100 text-purple-700'
      case normalized.includes('customer'): return 'bg-blue-100 text-blue-700'
      case normalized.includes('b2b'):
      case normalized.includes('business'): return 'bg-teal-100 text-teal-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setSortKey(key)
    setSortDirection(direction)
    setCurrentPage(1)
  }

  const refreshUserInState = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(user => (user.userId === userId ? { ...user, ...updates } : user)))
    setSelectedUser(prev => (prev && prev.userId === userId ? { ...prev, ...updates } : prev))
    setSelectedUserAddresses(prev => (prev && prev.userId === userId ? { ...prev, ...updates } : prev))
    setSelectedUserCart(prev => (prev && prev.userId === userId ? { ...prev, ...updates } : prev))
  }

  const clearUserCart = async (user: User) => {
    const cartCount = user.cartItems?.length || 0
    if (cartCount === 0) return

    const confirmed = window.confirm(`Clear ${user.name || 'this user'}'s entire cart? This will remove all ${cartCount} item${cartCount > 1 ? 's' : ''}.`)
    if (!confirmed) return

    setIsClearingCart(true)
    try {
      await ClearUserCart(user.userId)
      refreshUserInState(user.userId, {
        cartItems: []
      })
      setSelectedUser(prev => prev && prev.userId === user.userId ? { ...prev, cartItems: [] } : prev)
      setSelectedCartItems([])
      successToast('User cart cleared successfully')
    } catch (error: unknown) {
      console.error('Error clearing user cart:', error)
      errorToast((error as any)?.response?.data?.statusMessage || (error as Error)?.message || 'Error clearing user cart')
    } finally {
      setIsClearingCart(false)
    }
  }

  const removeSelectedCartItems = async () => {
    if (!selectedUserCart || selectedCartItems.length === 0) return

    const confirmed = window.confirm(`Remove ${selectedCartItems.length} selected item${selectedCartItems.length > 1 ? 's' : ''} from ${selectedUserCart.name}'s cart?`)
    if (!confirmed) return

    setIsClearingCart(true)
    try {
      await RemoveUserCartItems(selectedUserCart.userId, selectedCartItems)
      
      const updatedCartItems = selectedUserCart.cartItems?.filter(
        (item: any, index: number) => !selectedCartItems.includes(getCartItemId(item, index))
      ) || []
      
      refreshUserInState(selectedUserCart.userId, {
        cartItems: updatedCartItems
      })
      
      setSelectedCartItems([])
      successToast('Selected items removed successfully')
    } catch (error: unknown) {
      console.error('Error removing cart items:', error)
      errorToast((error as any)?.response?.data?.statusMessage || (error as Error)?.message || 'Error removing cart items')
    } finally {
      setIsClearingCart(false)
    }
  }

  const toggleCartItemSelection = (itemId: string) => {
    setSelectedCartItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const getCartItemId = (item: any, fallbackIndex?: number) => {
    const rawId = item?.id ?? item?.cartItemId ?? item?._id ?? fallbackIndex
    return String(rawId)
  }

  const selectAllCartItems = () => {
    if (!selectedUserCart?.cartItems) return
    const allIds = selectedUserCart.cartItems.map((item: any, index: number) => getCartItemId(item, index))
    setSelectedCartItems(allIds)
  }

  const deselectAllCartItems = () => {
    setSelectedCartItems([])
  }

  const getDisplayName = (name?: string | null) => {
    const trimmedName = String(name || '').trim()
    return trimmedName || 'NA'
  }

  const handleSaveUser = async () => {
    if (!editTarget) return

    setIsSaving(true)
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim() || null,
        phone: editForm.phone.trim(),
        userRole: Number(editForm.userRoleId),
      }

      await UpdateUser(payload, editTarget.userId)

      refreshUserInState(editTarget.userId, {
        name: payload.name,
        email: payload.email || '',
        phone: payload.phone,
        userRoleId: payload.userRole,
        userRole: getRoleLabel(payload.userRole),
      })

      successToast('User updated successfully')
      setShowEditModal(false)
      setEditTarget(null)
    } catch (error: unknown) {
      console.error('Error updating user:', error)
      errorToast((error as any)?.response?.data?.statusMessage || (error as Error)?.message || 'Error updating user')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    const confirmed = window.confirm(`Delete ${user.name}? This will deactivate the user account.`)
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteRequest(`${BASE_URL}users/${user.userId}`)

      setUsers(prev => prev.filter(item => item.userId !== user.userId))
      successToast('User deleted successfully')
    } catch (error: unknown) {
      console.error('Error deleting user:', error)
      errorToast((error as Error)?.message || 'Error deleting user')
    } finally {
      setIsDeleting(false)
    }
  }

  const prepareExportData = () => {
    return filteredAndSortedUsers.map(user => ({
      'User ID': user.userId,
      'Name': getDisplayName(user.name),
      'Email': user.email,
      'Phone': user.phone || 'N/A',
      'User Role': user.userRole,
      'Company Name': user.companyName || 'N/A',
      'GST Number': user.gstNumber || 'N/A',
      'Total Orders': user.totalOrders || 0,
      'Total Spent': user.totalSpent || '0',
      'Cart Items': user.cartItems?.length || 0,
      'Addresses Count': user.addresses?.length || 0,
      'Status': user.isActive === 1 ? 'Active' : 'Inactive',
      'Joined Date': formatDate(user.createdAt)
    }))
  }

  const handleExport = () => {
    const exportData = prepareExportData()
    exportToCSV(exportData, `${activeTab.toLowerCase()}_users`)
  }

  const handleExportExcel = () => {
    const exportData = prepareExportData()
    exportToExcel(exportData, `${activeTab.toLowerCase()}_users`)
  }

  const handlePrint = () => {
    const printData = filteredAndSortedUsers.map(user => ({
      name: getDisplayName(user.name),
      email: user.email,
      role: user.userRole,
      orders: user.totalOrders || 0,
      spent: `₹${(parseFloat(user.totalSpent || '0') || 0).toLocaleString('en-IN')}`,
      status: user.isActive === 1 ? 'Active' : 'Inactive',
      joined: formatDate(user.createdAt)
    }))

    printTable(printData, `${activeTab} Users Report`)
  }

  // Table columns configuration
  const columns = useMemo(() => {
    const baseCols = [
      {
        key: 'name',
        label: 'User',
        sortable: true,
        render: (value: any, row: User) => {
          const displayName = getDisplayName(row.name)

          return (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm mr-3">
                {displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">{displayName}</div>
                <div className="text-xs text-gray-500 truncate">{row.email}</div>
              </div>
            </div>
          )
        }
      },
      {
        key: 'userRole',
        label: 'Role',
        sortable: true,
        render: (value: any, row: User) => (
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getRoleColor(row.userRole)}`}>
            {row.userRole}
          </span>
        )
      }
    ]

    baseCols.push(
      {
        key: 'isActive',
        label: 'Status',
        sortable: true,
        render: (value: any, row: User) => (
          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${row.isActive === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
            {row.isActive === 1 ? 'Active' : 'Inactive'}
          </span>
        )
      },
      {
        key: 'totalOrders',
        label: 'Orders',
        sortable: true,
        render: (value: any, row: User) => (
          <span className="text-sm text-gray-900">
            {row.totalOrders || 0}
          </span>
        )
      },
      {
        key: 'totalSpent',
        label: 'Spent',
        sortable: true,
        render: (value: any, row: User) => (
          <span className="text-sm text-gray-900">
            ₹{(parseFloat(row.totalSpent || '0') || 0).toLocaleString('en-IN')}
          </span>
        )
      },
      {
        key: 'createdAt',
        label: 'Joined',
        sortable: true,
        render: (value: any, row: User) => (
          <span className="text-sm text-gray-500">
            {formatDate(row.createdAt)}
          </span>
        )
      },
      {
        key: 'actions',
        label: 'Actions',
        sortable: true,
        render: (value: any, row: User) => (
          <div className="flex space-x-1">
            <button
              onClick={() => viewUserDetails(row)}
              className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-1.5 rounded transition-colors"
              title="View Details"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => viewUserAddresses(row)}
              className="text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 p-1.5 rounded transition-colors"
              title="Address"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <button
              onClick={() => viewUserCart(row)}
              className={`p-1.5 rounded transition-colors ${
                row.cartItems && row.cartItems.length > 0
                  ? 'text-orange-500 hover:text-orange-700 bg-orange-50 hover:bg-orange-100'
                  : 'text-teal-600 hover:text-teal-900 bg-teal-50 hover:bg-teal-100'
              }`}
              title={row.cartItems && row.cartItems.length > 0 ? `Cart (${row.cartItems.length} items)` : 'Cart (empty)'}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 2.25h1.386c.51 0 .955.343 1.087.835l.383 1.437M6 6h14l-3 9H7.5L6 6zm5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm8 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </button>
            <button
              onClick={() => openEditUser(row)}
              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 p-1.5 rounded transition-colors"
              title="Edit User"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.586a2 2 0 112.828 2.828L11 17H8v-3l7.586-7.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteUser(row)}
              disabled={isDeleting}
              className="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 p-1.5 rounded transition-colors disabled:opacity-50"
              title="Delete User"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-4 0h14" />
              </svg>
            </button>
          </div>
        )
      }
    )

    return baseCols
  }, [activeTab])

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Enhanced Professional Header */}
      <div className="bg-gradient-to-r from-white to-teal-50/30 rounded-2xl p-6 border border-teal-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center shadow-md text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-heading">Users Management</h1>
              <p className="text-gray-600 mt-1">Manage customer accounts and user permissions</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <div className="flex bg-teal-50/50 rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('Customer')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'Customer'
                  ? 'bg-white text-teal-600 shadow-sm border border-teal-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Customers</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('B2B')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${activeTab === 'B2B'
                  ? 'bg-white text-teal-600 shadow-sm border border-teal-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>B2B Users</span>
                </div>
              </button>
            </div>

          </div>
        </div>
      </div>

      {loading ? (
        <UsersLoading />
      ) : (
        <>
          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
            <AdminStatsCard
              title={`Total ${activeTab} Users`}
              value={baseFilteredUsers.length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Total Orders"
              value={baseFilteredUsers.reduce((sum, u) => sum + (u.totalOrders || 0), 0)}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Total Revenue"
              value={`₹${baseFilteredUsers.reduce((sum, u) => sum + (parseFloat(u.totalSpent || '0') || 0), 0).toLocaleString('en-IN')}`}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <AdminStatsCard
              title="Active Carts"
              value={baseFilteredUsers.filter(u => u.cartItems && u.cartItems.length > 0).length}
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 2.25h1.386c.51 0 .955.343 1.087.835l.383 1.437M6 6h14l-3 9H7.5L6 6zm5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm8 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              }
            />
          </div>

          {/* Search and Filter */}
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search users by name, email, phone, or company..."
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

          {baseFilteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} Users Found</h3>
              <p className="text-gray-600">There are no {activeTab.toLowerCase()} users in the system yet.</p>
            </div>
          ) : filteredAndSortedUsers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600 mb-6">No users match your current search and filter criteria.</p>
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
                  <h2 className="text-lg font-semibold text-gray-900">{activeTab} Users</h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Showing {paginatedUsers.data.length} of {filteredAndSortedUsers.length} users</span>
                    <span>•</span>
                    <span>Total: {baseFilteredUsers.length} users</span>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <AdminTable
                columns={columns}
                data={paginatedUsers.data}
                loading={loading}
                onSort={handleSort}
                sortKey={sortKey}
                sortDirection={sortDirection}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={paginatedUsers.totalPages}
                totalItems={paginatedUsers.totalItems}
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

      {/* User Details Modal */}
      <Modal
        isOpen={showModal && !!selectedUser}
        onClose={() => setShowModal(false)}
        title={`User Details — ${selectedUser?.name}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm">
              Close
            </button>
            <button
              onClick={() => selectedUser && openEditUser(selectedUser)}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
            >
              Edit User
            </button>
          </>
        }
      >
        {selectedUser && (
        <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getRoleColor(selectedUser.userRole)}`}>
                      {selectedUser.userRole}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${selectedUser.isActive === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                      {selectedUser.isActive === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedUser.phone || 'Not provided'}</p>
                    <p><span className="font-medium">Company:</span> {selectedUser.companyName || 'Not provided'}</p>
                    <p><span className="font-medium">GST Number:</span> {selectedUser.gstNumber || 'Not provided'}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Account Statistics
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Total Orders:</span> {selectedUser.totalOrders || 0}</p>
                    <p><span className="font-medium">Total Spent:</span> ₹{(parseFloat(selectedUser.totalSpent || '0') || 0).toLocaleString('en-IN')}</p>
                    <p><span className="font-medium">Member Since:</span> {formatDate(selectedUser.createdAt)}</p>
                    <p><span className="font-medium">Cart Items:</span> {selectedUser.cartItems?.length || 0}</p>
                  </div>
                </div>
              </div>



              {selectedUser.orderHistory && selectedUser.orderHistory.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Recent Orders
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.orderHistory.slice(0, 3).map((order, index) => (
                      <div key={order.orderId || index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                        <div>
                          <p className="font-medium text-gray-900">#{order.invoiceNumber}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.orderDate)}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₹{(parseFloat(order.finalAmount) || 0).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.addresses && selectedUser.addresses.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Addresses ({selectedUser.addresses.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedUser.addresses.slice(0, 2).map((address, index) => (
                      <div key={address.addressId || index} className="p-3 bg-white rounded-lg border border-gray-100">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs font-semibold">
                            {address.Addtype}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{address.line1}</p>
                        {address.line2 && <p className="text-sm text-gray-600">{address.line2}</p>}
                        <p className="text-xs text-gray-500 mt-1">Postal: {address.postal_code}</p>
                      </div>
                    ))}
                    {selectedUser.addresses.length > 2 && (
                      <p className="text-sm text-gray-500 text-center">+{selectedUser.addresses.length - 2} more addresses</p>
                    )}
                  </div>
                </div>
              )}
        </div>
        )}
      </Modal>

      <Modal
        isOpen={showEditModal && !!editTarget}
        onClose={() => setShowEditModal(false)}
        title={`Edit User — ${editTarget?.name || ''}`}
        size="md"
        footer={
          <>
            <button
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveUser}
              disabled={isSaving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {editTarget && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                value={editForm.name}
                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={editForm.userRoleId}
                onChange={(e) => setEditForm(prev => ({ ...prev, userRoleId: Number(e.target.value) }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white"
              >
                <option value={1}>Retail Customer</option>
                <option value={2}>B2B Customer</option>
                <option value={3}>Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Switch between retail and B2B here. Use Admin only when you intend to grant admin access.
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Address Modal */}
      <Modal
        isOpen={showAddressModal && !!selectedUserAddresses}
        onClose={() => setShowAddressModal(false)}
        title={`Addresses — ${selectedUserAddresses?.name}`}
        size="lg"
        footer={
          <button onClick={() => setShowAddressModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm">
            Close
          </button>
        }
      >
        {selectedUserAddresses && (
        <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUserAddresses.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedUserAddresses.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUserAddresses.email}</p>
                </div>
              </div>

              {(selectedUserAddresses.addresses || []).length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Addresses Found</h4>
                  <p className="text-gray-600">This user hasn't added any addresses yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(selectedUserAddresses.addresses || []).map((address, index) => (
                    <div key={address.addressId || index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-semibold">
                              {address.Addtype || 'Address'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-900">
                            <p className="font-medium">{address.line1}</p>
                            {address.line2 && <p>{address.line2}</p>}
                            <p className="text-gray-600 mt-1">
                              City ID: {address.cityId}, State ID: {address.stateId}, Country ID: {address.countryId}
                            </p>
                            <p className="text-gray-600">Postal Code: {address.postal_code}</p>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
        </div>
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal
        isOpen={showCartModal && !!selectedUserCart}
        onClose={() => {
          setShowCartModal(false)
          setSelectedCartItems([])
        }}
        title={`Active Cart — ${selectedUserCart?.name}`}
        size="lg"
        footer={
          <>
            {selectedUserCart?.cartItems && selectedUserCart.cartItems.length > 0 && (
              <>
                {selectedCartItems.length > 0 ? (
                  <button
                    onClick={removeSelectedCartItems}
                    disabled={isClearingCart}
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    {isClearingCart ? 'Removing...' : `Remove Selected (${selectedCartItems.length})`}
                  </button>
                ) : null}
                <button
                  onClick={() => selectedUserCart && clearUserCart(selectedUserCart)}
                  disabled={isClearingCart}
                  className="px-4 py-2 border border-rose-200 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClearingCart ? 'Clearing...' : 'Clear Entire Cart'}
                </button>
              </>
            )}
            <button onClick={() => {
              setShowCartModal(false)
              setSelectedCartItems([])
            }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors text-sm">
              Close
            </button>
          </>
        }
      >
        {selectedUserCart && (
        <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUserCart.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedUserCart.name}</h3>
                  <p className="text-sm text-gray-600">{selectedUserCart.email}</p>
                </div>
              </div>

              {!selectedUserCart.cartItems || selectedUserCart.cartItems.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m4 0V9a2 2 0 10-4 0v4.01" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Cart is Empty</h4>
                  <p className="text-gray-600">This user doesn't have any items in their cart.</p>
                </div>
              ) : (
                <>
                  <div className="bg-teal-50 rounded-lg p-3 mb-4 border border-teal-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-teal-900">{selectedUserCart.cartItems.length} item{selectedUserCart.cartItems.length > 1 ? 's' : ''} in cart</span>
                      <span className="text-lg font-bold text-teal-900">
                        Total: ₹{selectedUserCart.cartItems.reduce((sum: number, item: any) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Selection Controls */}
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedCartItems.length === selectedUserCart.cartItems.length && selectedUserCart.cartItems.length > 0}
                        onChange={(e) => e.target.checked ? selectAllCartItems() : deselectAllCartItems()}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Select All</span>
                    </div>
                    {selectedCartItems.length > 0 && (
                      <span className="text-sm text-teal-600 font-medium">
                        {selectedCartItems.length} item{selectedCartItems.length > 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                    {selectedUserCart.cartItems.map((item: any, index: number) => (
                      <div key={`${getCartItemId(item, index)}-${index}`} className={`bg-white rounded-lg border overflow-hidden transition-all ${
                        selectedCartItems.includes(getCartItemId(item, index)) 
                          ? 'border-teal-500 shadow-md' 
                          : 'border-gray-200'
                      }`}>
                        <div className="flex gap-3 p-3">
                          <div className="flex items-start pt-1">
                            <input
                              type="checkbox"
                              checked={selectedCartItems.includes(getCartItemId(item, index))}
                              onChange={() => toggleCartItemSelection(getCartItemId(item, index))}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                          </div>
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0 border border-gray-100"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">{item.productName}</h4>
                                <p className="text-xs text-gray-500 mt-0.5">SKU: {item.productSku}</p>
                              </div>
                              <p className="text-base font-bold text-teal-700 whitespace-nowrap">
                                ₹{(parseFloat(item.price) * parseInt(item.quantity)).toLocaleString('en-IN')}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                              <span className="text-xs text-gray-600">Qty: <span className="font-medium text-gray-800">{item.quantity}</span></span>
                              <span className="text-xs text-gray-600">Weight: <span className="font-medium text-gray-800">{item.weight}g</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
        </div>
        )}
      </Modal>

    </div>
  )
}
