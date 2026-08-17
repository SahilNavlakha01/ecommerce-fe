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
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#881337] via-[#9f1239] to-[#4c0519] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-amber-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-300/30 shadow-inner">
                  <MapPin className="w-7 h-7 text-amber-200" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">Delivery Addresses</h1>
                  <p className="text-rose-200/90 text-xs sm:text-sm mt-0.5">Manage your shipping and billing destinations</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddressForm(true)}
                className="bg-white text-rose-950 px-4 sm:px-5 py-2.5 rounded-xl hover:bg-rose-50 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>
          </div>
          
          {/* Address Form Card */}
          {showAddressForm && (
            <div className="bg-white rounded-3xl shadow-xs border border-stone-200/90 overflow-hidden animate-fade-up">
              <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50/50">
                <div>
                  <h3 className="font-serif font-bold text-lg text-stone-900">{editingAddress ? 'Edit Delivery Address' : 'Add New Address'}</h3>
                  <p className="text-xs text-stone-400 mt-0.5">Please ensure accurate address & postal code for prompt delivery</p>
                </div>
                <button
                  onClick={() => {
                    setShowAddressForm(false);
                    setEditingAddress(null);
                    setAddressForm({ Addtype: '1', line1: '', line2: '', cityName: '', stateId: '1', postal_code: '' });
                    setFormErrors({});
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Address Line 1 <span className="text-rose-600">*</span></label>
                  <input
                    type="text"
                    name="line1"
                    value={addressForm.line1}
                    onChange={handleInputChange}
                    placeholder="House / Flat no., Apartment, Street address"
                    className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-800 transition-all ${
                      formErrors.line1 ? 'border-rose-300 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50 focus:bg-white'
                    }`}
                  />
                  {formErrors.line1 && <p className="text-rose-600 text-xs mt-1">⚠ {formErrors.line1}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">Address Line 2 <span className="font-normal text-stone-400 normal-case">(Optional landmark)</span></label>
                  <input
                    type="text"
                    name="line2"
                    value={addressForm.line2}
                    onChange={handleInputChange}
                    placeholder="Nearby landmark, Floor, Colony"
                    className="w-full px-4 py-3 text-sm border border-stone-200 bg-stone-50/50 focus:bg-white rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">City <span className="text-rose-600">*</span></label>
                    <input
                      type="text"
                      name="cityName"
                      value={addressForm.cityName}
                      onChange={handleInputChange}
                      placeholder="e.g. Mumbai, Ahmedabad"
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-800 transition-all ${
                        formErrors.cityName ? 'border-rose-300 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50 focus:bg-white'
                      }`}
                    />
                    {formErrors.cityName && <p className="text-rose-600 text-xs mt-1">⚠ {formErrors.cityName}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">6-Digit PIN Code <span className="text-rose-600">*</span></label>
                    <input
                      type="text"
                      name="postal_code"
                      value={addressForm.postal_code}
                      onChange={handleInputChange}
                      placeholder="e.g. 380015"
                      maxLength={6}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-800 transition-all ${
                        formErrors.postal_code ? 'border-rose-300 bg-rose-50/50' : 'border-stone-200 bg-stone-50/50 focus:bg-white'
                      }`}
                    />
                    {formErrors.postal_code && <p className="text-rose-600 text-xs mt-1">⚠ {formErrors.postal_code}</p>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-stone-100">
                  <button
                    onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                    disabled={addressLoading}
                    className="flex-1 h-12 rounded-xl text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {addressLoading ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddress(null);
                      setAddressForm({ Addtype: '1', line1: '', line2: '', cityName: '', stateId: '1', postal_code: '' });
                      setFormErrors({});
                    }}
                    className="sm:w-32 h-12 border border-stone-300 text-stone-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Addresses Grid */}
          {addressLoading && !showAddressForm ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.from({ length: 2 }).map((_, i) => (
                <AddressCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Array.isArray(addresses) && addresses.map((address) => (
                <div key={address.id} className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 hover:border-rose-300/80 hover:shadow-md transition-all group relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-200/60">
                        <MapPin className="w-4 h-4 text-rose-900" />
                      </div>
                      <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
                        {address.AddType || 'Shipping'}
                      </span>
                    </div>
                    {address.isActive === 1 && (
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-5">
                    <p className="font-bold text-stone-900 text-sm leading-snug">{address.line1}</p>
                    {address.line2 && <p className="text-stone-500 text-xs">{address.line2}</p>}
                    <p className="text-stone-600 text-xs font-medium">{address.cityName} — {address.postal_code}</p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => startEditAddress(address)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              
              {(!Array.isArray(addresses) || addresses.length === 0) && (
                <div className="md:col-span-2 bg-white rounded-3xl shadow-xs border border-stone-200/90 p-12 text-center">
                  <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                    <MapPin className="w-8 h-8 text-rose-900" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No addresses saved</h3>
                  <p className="text-stone-500 text-xs sm:text-sm mb-6 max-w-sm mx-auto">Add your delivery location for fast 1-click checkout on your next fashion order.</p>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Address
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
