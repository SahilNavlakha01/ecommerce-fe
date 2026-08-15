"use client"

import { useState, useEffect, useRef } from 'react'
import { GetConfig } from '@/Services/GetService'
import { AddConfig, UpdateConfig, DeleteConfig } from '@/Services/PostService'
import { successToast, errorToast } from '@/utils/toast'
import { ChevronDown, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react'

export default function ConfigDropdown({ configName, value, onChange, label }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteItem, setDeleteItem] = useState(null)
  const [editMode, setEditMode] = useState(null) // null, 'add', or option.id
  const [editValue, setEditValue] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchOptions()
  }, [configName])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setEditMode(null)
        setEditValue('')
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

  const handleOptionSelect = (option) => {
    onChange(option.id, option.ConfigValue)
    setIsOpen(false)
    setHighlightedIndex(-1)
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
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              if (!isOpen) {
                setIsOpen(true)
                setHighlightedIndex(0)
              } else {
                setHighlightedIndex(prev => 
                  prev < options.length - 1 ? prev + 1 : prev
                )
              }
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              if (isOpen) {
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : prev)
              }
            }
            if (e.key === 'Enter' && isOpen && highlightedIndex >= 0) {
              e.preventDefault()
              if (highlightedIndex < options.length) {
                handleOptionSelect(options[highlightedIndex])
              }
            }
            if (e.key === 'Escape') {
              e.preventDefault()
              setIsOpen(false)
              setHighlightedIndex(-1)
            }
          }}
          className="form-select w-full text-left flex items-center justify-between"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || `Select ${label}`}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map((option, index) => (
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
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer group ${
                      highlightedIndex === index ? 'bg-blue-100' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleOptionSelect(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="text-sm text-gray-900 truncate">{option.ConfigValue}</span>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => handleEdit(option, e)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(option, e)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
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
                <Plus className="w-4 h-4 mr-2" />
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
                <AlertTriangle className="w-6 h-6 text-red-600" />
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