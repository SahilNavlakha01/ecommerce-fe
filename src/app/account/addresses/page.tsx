"use client"

import { useState, useEffect } from 'react'
import AccountLayout from '../AccountLayout'
import { toast } from 'sonner'
import { FetchAddresses, AddAddress, UpdateAddress, DeleteAddress } from '../../../Services/PostService'
import { MapPin, Plus, X, Edit2, Trash2 } from 'lucide-react'
import { AddressCardSkeleton } from '../../../components/ui/Skeleton'
import PageTransition from '../../../components/PageTransition'

export default function AddressesPage() {
  const [user, setUser] = useState({ id: '' })
  const [addresses, setAddresses] = useState<any[]>([])
  const [addressLoading, setAddressLoading] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<any>(null)
  const [addressForm, setAddressForm] = useState({
    Addtype: '1',
    line1: '',
    line2: '',
    cityName: '',
    stateId: '1',
    postal_code: ''
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [states, setStates] = useState<any[]>([])
  const [addressTypes, setAddressTypes] = useState<any[]>([])

  useEffect(() => {
    const userData = document.cookie
      .split('; ')
      .find(row => row.startsWith('userData='))
      ?.split('=')[1];
    
    if (userData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(userData));
        setUser({ id: parsedData.id });
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, [])

  useEffect(() => {
    if (user.id) {
      fetchAddresses();
    }
  }, [user.id])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!addressForm.line1.trim()) errors.line1 = "Address line 1 is required"
    if (!addressForm.cityName.trim()) errors.cityName = "City is required"
    if (!addressForm.postal_code.trim()) errors.postal_code = "PIN code is required"
    else if (!/^\d{6}$/.test(addressForm.postal_code)) errors.postal_code = "Please enter a valid 6-digit PIN code"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAddressForm({ ...addressForm, [name]: value })
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' })
    }
  }

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const response = await FetchAddresses(user.id);
      setAddresses(Array.isArray(response?.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  }

  const handleAddAddress = async () => {
    if (!user.id) return;
    
    if (!validateForm()) return;
    
    setAddressLoading(true);
    try {
      await AddAddress({
        userId: user.id,
        ...addressForm,
        countryId: 1,
        createdBy: user.id
      });
      toast.success('Address added successfully!');
      setShowAddressForm(false);
      setAddressForm({ Addtype: '1', line1: '', line2: '', cityName: '', stateId: '1', postal_code: '' });
      setFormErrors({});
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    } finally {
      setAddressLoading(false);
    }
  }

  const handleUpdateAddress = async () => {
    if (!editingAddress) return;
    
    if (!validateForm()) return;
    
    setAddressLoading(true);
    try {
      await UpdateAddress({
        ...addressForm,
        countryId: 1,
        updatedBy: user.id
      }, editingAddress.id);
      toast.success('Address updated successfully!');
      setEditingAddress(null);
      setShowAddressForm(false);
      setAddressForm({ Addtype: '1', line1: '', line2: '', cityName: '', stateId: '1', postal_code: '' });
      setFormErrors({});
      fetchAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      toast.error('Failed to update address');
    } finally {
      setAddressLoading(false);
    }
  }

  const handleDeleteAddress = async (id: any) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    setAddressLoading(true);
    try {
      await DeleteAddress(id, user.id);
      toast.success('Address deleted successfully!');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    } finally {
      setAddressLoading(false);
    }
  }

  const startEditAddress = (address: any) => {
    setEditingAddress(address);
    setAddressForm({
      Addtype: String(address.AddTypeId ?? address.Addtype ?? '1'),
      line1: address.line1 || '',
      line2: address.line2 || '',
      cityName: address.cityName || '',
      stateId: String(address.stateId ?? '1'),
      postal_code: address.postal_code || ''
    });
    setFormErrors({});
    setShowAddressForm(true);
  }

  return (
    <AccountLayout>
      <PageTransition>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-200/20 rounded-full blur-2xl"></div>
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold mb-0.5 sm:mb-1">Addresses</h1>
                  <p className="text-teal-100 text-xs sm:text-sm">Manage addresses</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddressForm(true)}
                className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl hover:bg-white/30 transition-all flex items-center gap-1.5 sm:gap-2 border border-white/30 font-medium text-xs sm:text-sm"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Add</span>
              </button>
            </div>
          </div>
          
          {/* Address Form */}
          {showAddressForm && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900">{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Fill in the delivery details below</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                    setAddressForm({ Addtype: '1', line1: '', line2: '', cityName: '', stateId: '1', postal_code: '' });
                    setFormErrors({});
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address Line 1 <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    name="line1"
                    value={addressForm.line1}
                    onChange={handleInputChange}
                    placeholder="House no., Street, Area"
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                      formErrors.line1 ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                    }`}
                  />
                  {formErrors.line1 && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">⚠ {formErrors.line1}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Address Line 2 <span className="font-normal text-gray-400 normal-case">(Optional)</span></label>
                  <input
                    type="text"
                    name="line2"
                    value={addressForm.line2}
                    onChange={handleInputChange}
                    placeholder="Landmark, Apartment, Floor"
                    className="w-full px-4 py-3 text-sm border border-gray-200 bg-gray-50 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">City <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      name="cityName"
                      value={addressForm.cityName}
                      onChange={handleInputChange}
                      placeholder="City"
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                        formErrors.cityName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                    />
                    {formErrors.cityName && <p className="text-red-500 text-xs mt-1.5">⚠ {formErrors.cityName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">PIN Code <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      name="postal_code"
                      value={addressForm.postal_code}
                      onChange={handleInputChange}
                      placeholder="6-digit PIN"
                      maxLength={6}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
                        formErrors.postal_code ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                      }`}
                    />
                    {formErrors.postal_code && <p className="text-red-500 text-xs mt-1.5">⚠ {formErrors.postal_code}</p>}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                    disabled={addressLoading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-sm"
                  >
                    {addressLoading ? 'Saving…' : editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      setAddressForm({ Addtype: '1', line1: '', line2: '', cityName: '', stateId: '1', postal_code: '' });
                      setFormErrors({});
                    }}
                    className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Addresses Grid */}
          {addressLoading && !showAddressForm ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <AddressCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.isArray(addresses) && addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-teal-50 rounded-xl flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-semibold border border-teal-100">
                        {address.AddType}
                      </span>
                    </div>
                    {address.isActive === 1 && (
                      <span className="bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-4 ml-0.5">
                    <p className="font-semibold text-gray-900 text-sm">{address.line1}</p>
                    {address.line2 && <p className="text-gray-500 text-sm">{address.line2}</p>}
                    <p className="text-gray-500 text-sm">{address.cityName} — {address.postal_code}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditAddress(address)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {(!Array.isArray(addresses) || addresses.length === 0) && (
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MapPin className="w-12 h-12 text-teal-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">No addresses saved</h3>
                  <p className="text-gray-600 mb-8">Add your first delivery address for faster checkout.</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-4 rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all font-medium shadow-lg inline-flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Address
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </PageTransition>
    </AccountLayout>
  )
}
