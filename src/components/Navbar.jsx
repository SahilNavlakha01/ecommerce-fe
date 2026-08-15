"use client";
import { useState, useEffect } from "react";
import { isCustomerLoggedIn } from "../utils/auth";
import Link from 'next/link';
import { GetAllCategories, GetDeliveryEstimate } from "../Services/GetService.jsx";
import { useCart } from "../hooks/useCart";

import LogoutModal from "./LogoutModal";
import TopBanner from "./navbar/TopBanner";
import Logo from "./navbar/Logo";
import SearchBar from "./navbar/SearchBar";
import UserActions from "./navbar/UserActions";
import CartWishlist from "./navbar/CartWishlist";
import NavigationLinks from "./navbar/NavigationLinks";
import MobileMenu from "./navbar/MobileMenu";

export default function Navbar() {
  const { totalItems } = useCart();
  const wishCount = 0; // Placeholder for wishlist count
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const [showCartSummary, setShowCartSummary] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincode, setPincode] = useState('');
  const [selectedLocation, setSelectedLocation] = useState("Enter Pincode");

  useEffect(() => {
    const savedPincode = localStorage.getItem('userPincode');
    if (savedPincode) {
      setPincode(savedPincode);
      setSelectedLocation(savedPincode);
    }
  }, []);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [openCategoryDropdown, setOpenCategoryDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsLoggedIn(isCustomerLoggedIn());
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await GetAllCategories();
      if (response?.data.data) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const checkDelivery = async () => {
    if (pincode && pincode.length === 6) {
      setLoadingDelivery(true);
      try {
        const response = await GetDeliveryEstimate(pincode, 0.5);
        console.log('Delivery API Response:', response);

        // Check if delivery is available from the response
        const deliveryData = response?.data?.data;

        if (deliveryData && deliveryData.courier_name) {
          // Direct response structure
          const deliveryDays = parseInt(deliveryData.estimated_delivery_days) || 0;
          const estimatedDate = deliveryData.etd || new Date(Date.now() + deliveryDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
          });

          setDeliveryInfo({
            available: true,
            deliveryDays: deliveryData.estimated_delivery_days,
            courierName: deliveryData.courier_name,
            cod: deliveryData.cod_available === true || deliveryData.cod_available === 1,
            estimatedDate: estimatedDate
          });
        } else {
          setDeliveryInfo({ available: false });
        }
      } catch (error) {
        console.error('Delivery check failed:', error);
        setDeliveryInfo({ available: false });
      } finally {
        setLoadingDelivery(false);
      }
    }
  };

  return (
    <>
      <header className={`w-full transition-all duration-300 sticky top-0 z-50 bg-white ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
        <TopBanner />

        <nav className="bg-white border-b border-gray-100">
          {/* Desktop */}
          <div className="hidden lg:block">
            {/* Row 1: Logo + Search + Actions */}
            <div className="max-w-[1400px] mx-auto px-6 py-3">
              <div className="flex items-center justify-between gap-6">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <Logo />
                </div>
                
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl">
                  <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <UserActions
                    isLoggedIn={isLoggedIn}
                    selectedLocation={selectedLocation}
                    onPincodeClick={() => setShowPincodeModal(true)}
                    onLogoutClick={() => setShowLogoutModal(true)}
                  />
                  <div className="w-px h-8 bg-gray-200" />
                  <CartWishlist
                    totalItems={totalItems}
                    wishCount={wishCount}
                    showCartSummary={showCartSummary}
                    setShowCartSummary={setShowCartSummary}
                  />
                </div>
              </div>
            </div>
            
            {/* Row 2: Nav links */}
            <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white">
              <div className="max-w-[1400px] mx-auto px-6">
                <NavigationLinks />
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Layout */}
          <div className="lg:hidden">
            <div className="flex items-center gap-3 px-4 py-2.5">
              <Logo />
              <div className="flex-1">
                <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} isMobile={true} />
              </div>
            </div>
          </div>


          <MobileMenu
            isLoggedIn={isLoggedIn}
            categories={categories}
            onLogoutClick={() => setShowLogoutModal(true)}
          />

          {/* Close dropdown overlay - unused but kept for safety */}
        </nav>
      </header>

      {/* Enhanced Pincode Modal */}
      {showPincodeModal && (
        <>
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => {
              setShowPincodeModal(false);
              setDeliveryInfo(null);
            }}
          />

          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-600 via-teal-600 to-teal-700 px-6 py-5 border-b border-teal-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl">Delivery Location</h3>
                    <p className="text-sm text-teal-100">Check delivery availability</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPincodeModal(false);
                    setDeliveryInfo(null);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700">Enter PIN Code</label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter 6-digit PIN code"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-50 text-sm font-semibold transition-all duration-200 placeholder:text-gray-400 placeholder:font-normal"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={checkDelivery}
                    disabled={pincode.length !== 6 || loadingDelivery}
                    className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-bold text-sm shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
                  >
                    {loadingDelivery ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Checking...</span>
                      </>
                    ) : (
                      'Check'
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Enter your PIN code for accurate delivery info
                </p>
              </div>

              {deliveryInfo && (
                <div className="mt-4 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-gray-200 shadow-sm">
                  {deliveryInfo.available ? (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-green-700 font-bold text-base mb-1">
                            Delivery Available!
                          </p>
                          <p className="text-gray-700 font-semibold text-sm">
                            Expected: <span className="text-teal-600">{deliveryInfo.estimatedDate}</span> ({deliveryInfo.deliveryDays} days)
                          </p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${deliveryInfo.cod
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                              }`}>
                              {deliveryInfo.cod ? '✓ Cash on Delivery' : 'Prepaid Only'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-red-700 font-bold text-base">Delivery not available</p>
                        <p className="text-sm text-gray-600">to pincode <span className="font-semibold">{pincode}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {deliveryInfo && (
                <button
                  onClick={() => {
                    setSelectedLocation(pincode);
                    localStorage.setItem('userPincode', pincode);
                    setShowPincodeModal(false);
                    setDeliveryInfo(null);
                  }}
                  className="w-full px-6 py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all duration-200 font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                  Apply This Location
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={() => setIsLoggedIn(false)}
      />
    </>
  );
}
