"use client"

import { useState, useEffect, useRef } from 'react'
import { GetConfig } from '@/Services/GetService'
import { AddConfig, UpdateConfig, DeleteConfig } from '@/Services/PostService'
import { successToast, errorToast } from '@/utils/toast'
import { ChevronDownIcon, PlusIcon, PencilIcon, TrashIcon, ExclamationIcon } from '@/icons'

export default function ConfigMultiSelect({ configName, value = [], onChange, label }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [editMode, setEditMode] = useState(null)
  const [editValue, setEditValue] = useState('')
  const dropdownRef = useRef(null)

  // Lazy load options only when dropdown is opened
  const handleDropdownOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen && options.length === 0) {
      fetchOptions()
    }
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchOptions = async () => {
    try {
      const response = await GetConfig(configName)
      if (response?.data?.data) {
        setOptions(response.data.data)
      }
    } catch (error) {
      console.error(`Error fetching ${configName}:`, error)
    }
  }

  const handleOptionToggle = (option) => {
    const isSelected = value.some(item => item.id === option.id)
    
    if (isSelected) {
      const newValue = value.filter(item => item.id !== option.id)
      onChange(newValue)
    } else {
      const newValue = [...value, { id: option.id, value: option.ConfigValue }]
      onChange(newValue)
    }
  }

  const removeItem = (itemId) => {
    const newValue = value.filter(item => item.id !== itemId)
    onChange(newValue)
  }

  const handleAddNew = () => {
    setEditMode('add')
    setEditValue('')
  }

  const handleEdit = (option, e) => {
    e.stopPropagation()
    setEditMode(option.id)
    setEditValue(option.ConfigValue)
  }

  const cancelEdit = () => {
    setEditMode(null)
    setEditValue('')
  }

  const handleDeleteClick = (option, e) => {
    e.stopPropagation()
    setDeleteItem(option)
    setShowDeleteModal(true)
    setIsOpen(false)
  }

  const confirmDelete = async () => {
    try {
      await DeleteConfig(deleteItem.id)
      successToast('Option deleted successfully!')
      fetchOptions()
      setShowDeleteModal(false)
      setDeleteItem(null)
    } catch (error) {
      errorToast('Error deleting option', error.message)
    }
  }

  const handleSave = async () => {
    if (!editValue.trim()) {
      errorToast('Please enter a value')
      return
    }

    setLoading(true)

    try {
      const params = {
        ConfigName: configName,
        ConfigValue: editValue.trim()
      }

      if (editMode === 'add') {
        const response = await AddConfig(params)
        if (response?.status === 200 || response?.data?.status === 200) {
          successToast('Option added successfully!')
        } else {
          errorToast(response?.data?.message || 'Error adding option')
        }
      } else {
        const response = await UpdateConfig(params, editMode)
        if (response?.status === 200 || response?.data?.status === 200) {
          successToast('Option updated successfully!')
        } else {
          errorToast(response?.data?.message || 'Error updating option')
        }
      }

      setEditMode(null)
      setEditValue('')
      await fetchOptions()
    } catch (error) {
      console.error('Config operation error:', error)
      errorToast(`Error ${editMode === 'add' ? 'adding' : 'updating'} option`, error.response?.data?.message || error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={handleDropdownOpen}
          className="form-select w-full min-h-[42px] cursor-pointer"
        >
          {value.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {value.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {item.value}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeItem(item.id)
                    }}
                    className="ml-1 hover:text-blue-600"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">Select {label}</span>
          )}
          <ChevronDownIcon className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          >
            {options.map((option) => {
              const isSelected = value.some(item => item.id === option.id)
              return (
                <div key={option.id}>
                  {editMode === option.id ? (
                    <div className="px-3 py-2 bg-blue-50">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:border-blue-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleSave()
                          }
                          if (e.key === 'Escape') {
                            e.preventDefault()
                            cancelEdit()
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex items-center justify-between px-3 py-2 cursor-pointer group hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleOptionToggle(option)}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-900">{option.ConfigValue}</span>
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleEdit(option, e)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteClick(option, e)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            
            {editMode === 'add' ? (
              <div className="px-3 py-2 bg-green-50 border-t border-gray-200">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={`Enter new ${label.toLowerCase()}`}
                  className="w-full px-2 py-1 text-sm border border-green-300 rounded focus:outline-none focus:border-green-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSave()
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      cancelEdit()
                    }
                  }}
                />
              </div>
            ) : (
              <div
                className="flex items-center px-3 py-2 hover:bg-blue-50 cursor-pointer border-t border-gray-200 text-blue-600"
                onClick={handleAddNew}
              >
                <PlusIcon />
                <span className="text-sm font-medium truncate">Add New {label}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationIcon />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Option</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete "{deleteItem?.ConfigValue}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteItem(null)
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}