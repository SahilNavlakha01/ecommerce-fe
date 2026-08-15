"use client"

import { useState, useEffect } from 'react'
import { UpdateProductWithImages } from '@/Services/PostService'
import { GetSingleProduct, GetAllCategories } from '@/Services/GetService'
import { BASE_URL } from '@/Constant/Api'
import { successToast, errorToast } from '@/utils/toast'
import ConfigMultiSelect from '@/components/ConfigMultiSelect'
import SubcategoryMultiSelect from '@/components/SubcategoryMultiSelect'
import { FormLoading } from '@/components/ui/FormLoading'
import Portal from './ui/Portal'

interface EditProductModalProps {
  isOpen: boolean
  productId: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function AdminProductEditModal({ isOpen, productId, onClose, onSuccess }: EditProductModalProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<any[]>([])
  const [images, setImages] = useState<any[]>([])
  const [imagePreviews, setImagePreviews] = useState<any[]>([])
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [deleteImageIds, setDeleteImageIds] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
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
    isActive: 1,
    updatedBy: ''
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

  useEffect(() => {
    if (isOpen && productId) {
      const loadData = async () => {
        setFetchLoading(true)
        // Reset sub-states
        setSelectedSubcategories([])
        setImages([])
        setImagePreviews([])
        setExistingImages([])
        setDeleteImageIds([])
        
        await fetchCategories()
        await fetchProduct()
      }
      loadData()
    }
  }, [isOpen, productId])

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

  const fetchProduct = async () => {
    if (!productId) return
    try {
      const response = await GetSingleProduct(productId)
      if (response?.data) {
        const product = response.data.data

        setFormData({
          name: product.name || '',
          description: product.description || '',
          basePrice: product.basePrice?.toString() || '',
          b2bPrice: product.b2bPrice?.toString() || '',
          stockQuantity: product.stockQuantity?.toString() || '',
          skuCode: product.skuCode || '',
          purity: Array.isArray(product.purity) ? product.purity.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          weight: product.weight?.toString() || '',
          discountPrice: product.discountPrice?.toString() || '',
          isB2b: Boolean(product.isB2b),
          isBoth: Boolean(product.isBoth),
          minQuantity: product.minQuantity?.toString() || '1',
          isActive: product.isActive !== undefined ? product.isActive : 1,
          updatedBy: currentUserId
        })

        if (product.subcategories && Array.isArray(product.subcategories)) {
          const subcats = product.subcategories.map((sub: any) => ({
            id: parseInt(sub.id),
            name: sub.name,
            categoryId: sub.categoryId,
            categoryName: sub.categoryName || '',
            parentId: sub.parentId || null,
            parentSubcategoryName: sub.parentSubcategoryName || null
          }))
          setSelectedSubcategories(subcats)
        }

        setMoreInfoIds({
          purityId: Array.isArray(product.purity) ? product.purity.map((item: any) => parseInt(item.id)) : [],
          metalTypeId: Array.isArray(product.metalType) ? product.metalType.map((item: any) => parseInt(item.id)) : [],
          genderId: Array.isArray(product.gender) ? product.gender.map((item: any) => parseInt(item.id)) : [],
          occasionId: Array.isArray(product.occasion) ? product.occasion.map((item: any) => parseInt(item.id)) : [],
          gemstoneTypeId: Array.isArray(product.gemstoneType) ? product.gemstoneType.map((item: any) => parseInt(item.id)) : [],
          certificationId: Array.isArray(product.certificationType) ? product.certificationType.map((item: any) => parseInt(item.id)) : [],
          collectionId: Array.isArray(product.collectionName) ? product.collectionName.map((item: any) => parseInt(item.id)) : [],
          polishTypeId: Array.isArray(product.polishType) ? product.polishType.map((item: any) => parseInt(item.id)) : [],
          stoneSettingId: Array.isArray(product.stoneSettingType) ? product.stoneSettingType.map((item: any) => parseInt(item.id)) : [],
          originId: Array.isArray(product.origin) ? product.origin.map((item: any) => parseInt(item.id)) : [],
          availabilityId: Array.isArray(product.availabilityStatus) ? product.availabilityStatus.map((item: any) => parseInt(item.id)) : [],
          warrantyId: Array.isArray(product.warranty) ? product.warranty.map((item: any) => parseInt(item.id)) : [],
          saleId: Array.isArray(product.sale) ? product.sale.map((item: any) => parseInt(item.id)) : []
        })

        setMoreInfo({
          metalType: Array.isArray(product.metalType) ? product.metalType.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          gender: Array.isArray(product.gender) ? product.gender.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          occasion: Array.isArray(product.occasion) ? product.occasion.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          gemstoneType: Array.isArray(product.gemstoneType) ? product.gemstoneType.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          certification: Array.isArray(product.certificationType) ? product.certificationType.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          collection: Array.isArray(product.collectionName) ? product.collectionName.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          polishType: Array.isArray(product.polishType) ? product.polishType.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          stoneSetting: Array.isArray(product.stoneSettingType) ? product.stoneSettingType.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          origin: Array.isArray(product.origin) ? product.origin.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          availability: Array.isArray(product.availabilityStatus) ? product.availabilityStatus.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          warranty: Array.isArray(product.warranty) ? product.warranty.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          sale: Array.isArray(product.sale) ? product.sale.map((item: any) => ({ id: parseInt(item.id), value: item.name })) : [],
          size: Array.isArray(product.size) ? product.size.map((item: any) => item.name).join(',') : (product.size || '')
        })

        if (product.images && Array.isArray(product.images)) {
          setExistingImages(product.images.map((img: any) => ({
            id: img.id,
            url: img.imageUrl.startsWith('http') ? img.imageUrl : BASE_URL.replace('/api/', '') + img.imageUrl
          })))
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      errorToast('Error loading product details')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const totalImages = existingImages.length - deleteImageIds.length + images.length + files.length

    if (totalImages > 5) {
      errorToast('Too many images. Maximum 5 images allowed')
      return
    }

    for (const file of files) {
      if ((file as File).size > 5 * 1024 * 1024) {
        errorToast('Image too large. Each image must be less than 5MB')
        return
      }
    }

    const newPreviews = await Promise.all(
      files.map((file: File) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => resolve(e.target?.result)
          reader.readAsDataURL(file)
        })
      })
    )

    setImages(prev => [...prev, ...files])
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (imageId: any) => {
    setDeleteImageIds(prev => [...prev, imageId])
  }

  const restoreExistingImage = (imageId: any) => {
    setDeleteImageIds(prev => prev.filter(id => id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!productId) return
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      Object.keys(formData).forEach(key => {
        if (key === 'updatedBy' && !currentUserId) return
        let value = (formData as any)[key]
        if (key === 'isB2b' || key === 'isBoth') {
          value = value ? 'true' : 'false'
        }
        if (key === 'updatedBy') {
          value = parseInt(String(currentUserId || value))
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

      if (deleteImageIds.length > 0) {
        formDataToSend.append('deleteImageIds', deleteImageIds.join(','))
      }

      images.forEach(image => {
        formDataToSend.append('images', image)
      })

      const response = await UpdateProductWithImages(formDataToSend, productId)

      if (response?.status === 200) {
        successToast('Product updated successfully!')
        onSuccess()
        onClose()
      }
    } catch (error: unknown) {
      console.error('Error updating product:', error)
      errorToast((error as any)?.response?.data?.message || (error as Error)?.message || 'Error updating product')
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
            <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
            <p className="text-xs text-gray-500 mt-0.5">Update jewelry product details and images</p>
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
        <div className="overflow-y-auto flex-1 p-6">
          {fetchLoading ? (
            <div className="min-h-96 flex flex-col items-center justify-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-200 border-t-teal-600"></div>
              <p className="text-sm text-gray-500 font-semibold">Loading product details...</p>
            </div>
          ) : (
            <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
              
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
                      placeholder="e.g. 200"
                    />
                  </div>
                </div>
              </div>

              {/* Inventory & Category */}
              <div className="bg-slate-50/30 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Inventory & Status</h3>
                
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
                  <div className="space-y-1.5">
                    <label className="form-label">Product Status</label>
                    <select
                      value={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: parseInt(e.target.value) })}
                      className="form-select"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-slate-50/30 border border-slate-100 p-4 sm:p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-teal-800 uppercase tracking-wider">Product Images</h3>
                
                <div className="space-y-5">
                  {existingImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500">Existing Images:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {existingImages.map((image) => (
                          <div key={image.id} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50 flex items-center justify-center">
                            <img
                              src={image.url}
                              alt={`Existing ${image.id}`}
                              className={`w-full h-full object-cover transition duration-200 ${deleteImageIds.includes(image.id) ? 'opacity-30 filter grayscale' : ''}`}
                            />
                            {deleteImageIds.includes(image.id) ? (
                              <button
                                type="button"
                                onClick={() => restoreExistingImage(image.id)}
                                className="absolute inset-0 m-auto w-10 h-10 bg-teal-600/90 text-white rounded-full flex items-center justify-center shadow hover:bg-teal-700 transition text-lg"
                                title="Restore image"
                              >
                                ↶
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeExistingImage(image.id)}
                                className="absolute top-1.5 right-1.5 bg-red-600/90 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700 transition"
                                title="Delete image"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500">Upload New Images:</p>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-xs text-gray-500">Click to add more images</p>
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

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50 flex items-center justify-center">
                            <img
                              src={preview}
                              alt={`New Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
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
          )}
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
            form="edit-product-form"
            disabled={loading || fetchLoading}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-xl font-semibold transition duration-200 flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
      </div>
    </Portal>
  )
}
