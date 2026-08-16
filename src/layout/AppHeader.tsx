"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { MenuIcon } from "@/icons";
import { clearAuthCookie } from "@/utils/auth";

import ProfessionalLogo from "@/components/ui/ProfessionalLogo";

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    clearAuthCookie('admin');
    router.push('/auth/login');
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between w-full px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 sm:p-3 text-teal-700 rounded-xl lg:hidden hover:bg-teal-50 transition-all duration-200 hover:scale-105"
            >
              <MenuIcon />
            </button>
            <button
              onClick={toggleSidebar}
              className="hidden p-3 text-teal-700 rounded-xl lg:block hover:bg-teal-50 transition-all duration-200 hover:scale-105"
            >
              <MenuIcon />
            </button>

            <div className="flex items-center space-x-3">
              <ProfessionalLogo size="sm" />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-luxury-teal font-display">
                  Admin Dashboard
                </h1>
                <p className="text-xs text-gray-500 font-medium">Jewelry Management</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden md:flex items-center space-x-3 bg-teal-50 px-3 sm:px-4 py-2 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-teal-700">Online</span>
            </div>



            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 sm:p-3 text-red-600 hover:text-red-700 rounded-xl hover:bg-red-50 transition-all duration-200"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-card max-w-md w-full p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-heading">Confirm Logout</h3>
                <p className="text-gray-600 text-sm">Are you sure you want to logout?</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">You will be redirected to the login page and will need to sign in again to access the admin panel.</p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppHeader;