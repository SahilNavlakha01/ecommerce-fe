"use client"

import { useState, useEffect, useRef } from 'react'
import { GetSubcategoriesByCategory, GetSubcategoriesByParent } from '@/Services/GetService'

interface SubcatItem {
  id: number
  name: string
  categoryId: number
  parentId?: number | null
  parentSubcategoryName?: string | null
}

interface SelectedSubcategory extends SubcatItem {
  categoryName: string
}

interface SubcategoryMultiSelectProps {
  categories: any[]
  value: SelectedSubcategory[]
  onChange: (selected: SelectedSubcategory[]) => void
  label?: string
  required?: boolean
}

export default function SubcategoryMultiSelect({
  categories,
  value,
  onChange,
  label = "Subcategories",
  required = false
}: SubcategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({})
  const [expandedSubcats, setExpandedSubcats] = useState<Record<number, boolean>>({})
  const [subcatsByCategory, setSubcatsByCategory] = useState<Record<number, SubcatItem[]>>({})
  const [subsubcatsByParent, setSubsubcatsByParent] = useState<Record<number, SubcatItem[]>>({})
  const [loadingCat, setLoadingCat] = useState<Record<number, boolean>>({})
  const [loadingParent, setLoadingParent] = useState<Record<number, boolean>>({})
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const fetchSubcats = async (categoryId: number) => {
    if (subcatsByCategory[categoryId] || loadingCat[categoryId]) return
    setLoadingCat(prev => ({ ...prev, [categoryId]: true }))
    try {
      const res = await GetSubcategoriesByCategory(categoryId.toString())
      if (res?.data?.data) {
        setSubcatsByCategory(prev => ({ ...prev, [categoryId]: res.data.data }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCat(prev => ({ ...prev, [categoryId]: false }))
    }
  }

  const fetchSubsubcats = async (parentId: number) => {
    if (subsubcatsByParent[parentId] !== undefined || loadingParent[parentId]) return
    setLoadingParent(prev => ({ ...prev, [parentId]: true }))
    try {
      const res = await GetSubcategoriesByParent(parentId.toString())
      setSubsubcatsByParent(prev => ({ ...prev, [parentId]: res?.data?.data || [] }))
    } catch (e) {
      setSubsubcatsByParent(prev => ({ ...prev, [parentId]: [] }))
    } finally {
      setLoadingParent(prev => ({ ...prev, [parentId]: false }))
    }
  }

  const handleCategoryExpand = (categoryId: number) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))
    if (!expandedCategories[categoryId]) fetchSubcats(categoryId)
  }

  const handleSubcatExpand = (subcatId: number) => {
    setExpandedSubcats(prev => ({ ...prev, [subcatId]: !prev[subcatId] }))
    if (!expandedSubcats[subcatId]) fetchSubsubcats(subcatId)
  }

  const isSelected = (id: number) => value.some(s => s.id === id)

  const toggle = (item: SubcatItem, categoryName: string) => {
    if (isSelected(item.id)) {
      onChange(value.filter(s => s.id !== item.id))
    } else {
      onChange([...value, { ...item, categoryName }])
    }
  }

  const remove = (id: number) => onChange(value.filter(s => s.id !== id))

  const getLabel = (s: SelectedSubcategory) => {
    if (s.parentSubcategoryName) return `${s.categoryName} > ${s.parentSubcategoryName} > ${s.name}`
    return `${s.categoryName} > ${s.name}`
  }

  return (
    <div className="space-y-2" ref={dropdownRef}>
      <label className="form-label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(subcat => (
            <span key={subcat.id} className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
              {getLabel(subcat)}
              <button type="button" onClick={() => remove(subcat.id)} className="ml-1 hover:text-teal-900">×</button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="form-select w-full text-left flex items-center justify-between"
        >
          <span className="text-gray-500">
            {value.length === 0 ? 'Select subcategories...' : `${value.length} selected`}
          </span>
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No categories available</div>
            ) : (
              categories.map(category => (
                <div key={category.id} className="border-b last:border-b-0">
                  {/* Level 1: Category */}
                  <button
                    type="button"
                    onClick={() => handleCategoryExpand(category.id)}
                    className="w-full px-4 py-2 text-left font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <svg className={`w-4 h-4 transition-transform ${expandedCategories[category.id] ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                      {category.name}
                    </span>
                    {value.filter(s => s.categoryId === category.id).length > 0 && (
                      <span className="text-xs text-teal-600">({value.filter(s => s.categoryId === category.id).length})</span>
                    )}
                  </button>

                  {expandedCategories[category.id] && (
                    <div>
                      {loadingCat[category.id] && <div className="px-8 py-2 text-sm text-gray-500">Loading...</div>}
                      {subcatsByCategory[category.id]?.map(subcat => {
                        const children = subsubcatsByParent[subcat.id]
                        const hasChildren = children && children.length > 0
                        const childrenLoaded = subsubcatsByParent[subcat.id] !== undefined
                        const isExpanded = expandedSubcats[subcat.id]

                        return (
                          <div key={subcat.id} className="bg-gray-50">
                            {/* Level 2: Subcategory */}
                            <div className="flex items-center px-8 py-2 hover:bg-gray-100">
                              <button
                                type="button"
                                onClick={() => handleSubcatExpand(subcat.id)}
                                className="mr-2 text-gray-400 hover:text-gray-600"
                              >
                                <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                              <label className="flex items-center gap-2 cursor-pointer flex-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected(subcat.id)}
                                  onChange={() => toggle(subcat, category.name)}
                                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">{subcat.name}</span>
                              </label>
                              {loadingParent[subcat.id] && <span className="text-xs text-gray-400 ml-1">...</span>}
                            </div>

                            {/* Level 3: Sub-subcategory */}
                            {isExpanded && childrenLoaded && (
                              <div>
                                {hasChildren ? (
                                  children.map(child => (
                                    <label key={child.id} className="flex items-center px-14 py-2 hover:bg-gray-200 cursor-pointer bg-gray-100">
                                      <input
                                        type="checkbox"
                                        checked={isSelected(child.id)}
                                        onChange={() => toggle({ ...child, parentSubcategoryName: subcat.name }, category.name)}
                                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                      />
                                      <span className="ml-2 text-sm text-gray-600">{child.name}</span>
                                    </label>
                                  ))
                                ) : (
                                  <div className="px-14 py-1 text-xs text-gray-400 bg-gray-100">No sub-subcategories</div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {required && <input type="hidden" value={value.length > 0 ? 'valid' : ''} required={required} />}
    </div>
  )
}
