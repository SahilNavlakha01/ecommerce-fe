"use client"

import { useState, useEffect } from 'react'
import { AddProductWithImages } from '@/Services/PostService'
import { GetAllCategories } from '@/Services/GetService'
import { successToast, errorToast } from '@/utils/toast'
import ConfigMultiSelect from '@/components/ConfigMultiSelect'
import SubcategoryMultiSelect from '@/components/SubcategoryMultiSelect'
import { FormLoading } from '@/components/ui/FormLoading'
import { XMarkIcon, PhotoIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import Portal from './ui/Portal'

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AdminProductAddModal({ isOpen, onClose, onSuccess }: AddProductModalProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState('2')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    b2bPrice: '',
    stockQuantity: '',
    skuCode: '',
    purity: [],
    weight: '',
    discountPrice: '',
    isB2b: false,
    isBoth: false,
    minQuantity: '1',
    createdBy: '2'
  })

  const [moreInfo, setMoreInfo] = useState({
    metalType: [],
    gender: [],
    occasion: [],
    gemstoneType: [],
    certification: [],
    collection: [],
    polishType: [],
    stoneSetting: [],
    origin: [],
    availability: [],
    warranty: [],
    sale: [],
    size: ''
  })

  const [moreInfoIds, setMoreInfoIds] = useState({
    purityId: [],
    metalTypeId: [],
    genderId: [],
    occasionId: [],
    gemstoneTypeId: [],
    certificationId: [],
    collectionId: [],
    polishTypeId: [],
    stoneSettingId: [],
    originId: [],
    availabilityId: [],
    warrantyId: [],
    saleId: []
  })

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      // Reset form states
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        b2bPrice: '',
        stockQuantity: '',
        skuCode: '',
        purity: [],
        weight: '',
        discountPrice: '',
        isB2b: false,
        isBoth: false,
        minQuantity: '1',
        createdBy: currentUserId
      })
      setMoreInfo({
        metalType: [],
        gender: [],
        occasion: [],
        gemstoneType: [],
        certification: [],
        collection: [],
        polishType: [],
        stoneSetting: [],
        origin: [],
        availability: [],
        warranty: [],
        sale: [],
        size: ''
      })
      setMoreInfoIds({
        purityId: [],
        metalTypeId: [],
        genderId: [],
        occasionId: [],
        gemstoneTypeId: [],
        certificationId: [],
        collectionId: [],
        polishTypeId: [],
        stoneSettingId: [],
        originId: [],
        availabilityId: [],
        warrantyId: [],
        saleId: []
      })
      setSelectedSubcategories([])
      setImages([])
    }
  }, [isOpen])

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1]

    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData))
        setCurrentUserId(parsedData.id || '2')
        setFormData(prev => ({ ...prev, createdBy: parsedData.id || '2' }))
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
    }
  }

  const handleImageChange = (e: any) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) {
      errorToast('Too many images. Maximum 5 images allowed')
      return
    }

    files.forEach((file: any) => {
      if (file.size > 5 * 1024 * 1024) {
        errorToast('Image too large. Each image must be less than 5MB')
        return
      }
    })

    setImages(prev => [...prev, ...files])
  }

  const removeImage = (index: any) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      Object.keys(formData).forEach(key => {
        if (key === 'purity') return
        if (key === 'createdBy' && !currentUserId) return
        let value = (formData as any)[key]
        if (key === 'createdBy') {
          value = parseInt(String(currentUserId || value))
        }
        if (key === 'isB2b' || key === 'isBoth') {
          value = value ? 'true' : 'false'
        }
        formDataToSend.append(key, value)
      })

      if (selectedSubcategories.length > 0) {
        const subcategoryIds = selectedSubcategories.map(s => s.id)
        formDataToSend.append('subcategoryId', JSON.stringify(subcategoryIds))
      }

      if (moreInfoIds.purityId.length > 0) formDataToSend.append('purity', JSON.stringify(moreInfoIds.purityId.map(id => String(id))))
      if (moreInfoIds.metalTypeId.length > 0) formDataToSend.append('metalType', JSON.stringify(moreInfoIds.metalTypeId.map(id => String(id))))
      if (moreInfoIds.genderId.length > 0) formDataToSend.append('gender', JSON.stringify(moreInfoIds.genderId.map(id => String(id))))
      if (moreInfoIds.occasionId.length > 0) formDataToSend.append('occasion', JSON.stringify(moreInfoIds.occasionId.map(id => String(id))))
      if (moreInfoIds.gemstoneTypeId.length > 0) formDataToSend.append('gemstoneType', JSON.stringify(moreInfoIds.gemstoneTypeId.map(id => String(id))))
      if (moreInfoIds.certificationId.length > 0) formDataToSend.append('certificationType', JSON.stringify(moreInfoIds.certificationId.map(id => String(id))))
      if (moreInfoIds.collectionId.length > 0) formDataToSend.append('collectionName', JSON.stringify(moreInfoIds.collectionId.map(id => String(id))))
      if (moreInfoIds.polishTypeId.length > 0) formDataToSend.append('polishType', JSON.stringify(moreInfoIds.polishTypeId.map(id => String(id))))
      if (moreInfoIds.stoneSettingId.length > 0) formDataToSend.append('stoneSettingType', JSON.stringify(moreInfoIds.stoneSettingId.map(id => String(id))))
      if (moreInfoIds.originId.length > 0) formDataToSend.append('origin', JSON.stringify(moreInfoIds.originId.map(id => String(id))))
      if (moreInfoIds.availabilityId.length > 0) formDataToSend.append('availabilityStatus', JSON.stringify(moreInfoIds.availabilityId.map(id => String(id))))
      if (moreInfoIds.warrantyId.length > 0) formDataToSend.append('warranty', JSON.stringify(moreInfoIds.warrantyId.map(id => String(id))))
      if (moreInfoIds.saleId.length > 0) formDataToSend.append('sale', JSON.stringify(moreInfoIds.saleId.map(id => String(id))))
      if (moreInfo.size?.trim()) formDataToSend.append('size', moreInfo.size.trim())

      images.forEach(image => {
        formDataToSend.append('images', image)
      })

      const response = await AddProductWithImages(formDataToSend)

      if (response?.status === 201) {
        successToast('Product added successfully!')
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error('Error adding product:', error)
      errorToast((error as any).response?.data?.message || (error as any).message || 'Error adding product')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Portal>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col max-h-[92vh] border border-gray-100 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
            <p className="text-xs text-gray-500 mt-0.5">Create a new jewelry item in your store inventory</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info */}
            <div className="bg-slate-50/30 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="form-label flex items-center space-x-1.5">
                    <span>Product Name *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label flex items-center space-x-1.5">
                    <span>SKU Code *</span>
                  </label>
                  <input
                    type="text"
                    value={formData.skuCode}
                    onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
                    className="form-input"
                    placeholder="Enter SKU code"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
            </div>

            {/* Type & Pricing */}
            <div className="bg-slate-50/30 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Product Type & Pricing</h3>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pb-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isB2b}
                    onChange={(e) => setFormData({ ...formData, isB2b: e.target.checked })}
                    className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">B2B Product</span>
                    <span className="text-xs text-gray-400">Available to wholesale buyers</span>
                  </div>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.isBoth}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setFormData({
                        ...formData,
                        isBoth: checked,
                        isB2b: checked ? true : formData.isB2b
                      })
                    }}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">Available for Both</span>
                    <span className="text-xs text-gray-400">Sell to both Retail & B2B markets</span>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="form-label">Base Price (₹) *</label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 5000"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">B2B Price (₹) {(formData.isB2b || formData.isBoth) ? '*' : ''}</label>
                  <input
                    type="number"
                    value={formData.b2bPrice}
                    onChange={(e) => setFormData({ ...formData, b2bPrice: e.target.value })}
                    className={`form-input ${(!formData.isB2b && !formData.isBoth) ? 'bg-gray-50 text-gray-400 border-gray-200' : ''}`}
                    placeholder={(formData.isB2b || formData.isBoth) ? "e.g. 4500" : "Enable B2B to set"}
                    disabled={!formData.isB2b && !formData.isBoth}
                    required={formData.isB2b || formData.isBoth}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Discount Price (₹)</label>
                  <input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 200 (discount amount)"
                  />
                </div>
              </div>
            </div>

            {/* Inventory & Category */}
            <div className="bg-slate-50/30 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Inventory & Categories</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-1.5 sm:col-span-2">
                  <SubcategoryMultiSelect
                    categories={categories}
                    value={selectedSubcategories}
                    onChange={setSelectedSubcategories}
                    label="Subcategories"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="form-input"
                    placeholder="e.g. 10"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-1.5">
                  <label className="form-label text-teal-700 font-semibold">B2B Minimum Buy Quantity *</label>
                  <input
                    type="number"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className={`form-input ${(formData.isB2b || formData.isBoth) ? 'border-teal-200 focus:border-teal-500' : 'bg-gray-50'}`}
                    disabled={!formData.isB2b && !formData.isBoth}
                    required={formData.isB2b || formData.isBoth}
                    min="1"
                  />
                  <p className="text-[11px] text-gray-500">Minimum items a B2B user must buy on first add</p>
                </div>
              </div>
            </div>

            {/* Images Upload */}
            <div className="bg-slate-50/30 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Product Images (Max 5, 5MB each)</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-500 font-medium">Click to upload product images</p>
                      <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or WEBP up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50 flex items-center justify-center">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 bg-red-600/90 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700 transition"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* More Info */}
            <div className="bg-slate-50/30 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Specifications (More Info)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <ConfigMultiSelect
                  configName="Metal Type"
                  value={moreInfo.metalType}
                  onChange={(selectedItems: any) => {
                    setMoreInfo({ ...moreInfo, metalType: selectedItems })
                    setMoreInfoIds({ ...moreInfoIds, metalTypeId: selectedItems.map((item: any) => item.id) })
                  }}
                  label="Metal Type"
                />
                <ConfigMultiSelect
                  configName="Gender"
                  value={moreInfo.gender}
                  onChange={(selectedItems: any) => {
                    setMoreInfo({ ...moreInfo, gender: selectedItems })
                    setMoreInfoIds({ ...moreInfoIds, genderId: selectedItems.map((item: any) => item.id) })
                  }}
                  label="Gender"
                />
                <ConfigMultiSelect
                  configName="Occasion"
                  value={moreInfo.occasion}
                  onChange={(selectedItems: any) => {
                    setMoreInfo({ ...moreInfo, occasion: selectedItems })
                    setMoreInfoIds({ ...moreInfoIds, occasionId: selectedItems.map((item: any) => item.id) })
                  }}
                  label="Occasion"
                />
                <ConfigMultiSelect
                  configName="Availability"
                  value={moreInfo.availability}
                  onChange={(selectedItems: any) => {
                    setMoreInfo({ ...moreInfo, availability: selectedItems })
                    setMoreInfoIds({ ...moreInfoIds, availabilityId: selectedItems.map((item: any) => item.id) })
                  }}
                  label="Availability"
                />
                <ConfigMultiSelect
                  configName="Sale"
                  value={moreInfo.sale}
                  onChange={(selectedItems: any) => {
                    setMoreInfo({ ...moreInfo, sale: selectedItems })
                    setMoreInfoIds({ ...moreInfoIds, saleId: selectedItems.map((item: any) => item.id) })
                  }}
                  label="Sale"
                />
                <div className="space-y-1.5">
                  <label className="form-label">Sizes</label>
                  <input
                    type="text"
                    value={moreInfo.size}
                    onChange={(e) => setMoreInfo({ ...moreInfo, size: e.target.value })}
                    className="form-input"
                    placeholder="Separated by commas (e.g. 16,18,20)"
                  />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-slate-50/50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-200 font-semibold text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-product-form"
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Adding Product...</span>
              </>
            ) : (
              <span>Add Product</span>
            )}
          </button>
        </div>
      </div>
      </div>
    </Portal>
  )
}
