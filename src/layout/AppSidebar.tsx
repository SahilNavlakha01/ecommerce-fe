"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import ProfessionalLogo from "@/components/ui/ProfessionalLogo";
import {
  CategoryIcon,
  ChevronDownIcon,
  DashboardIcon,
  HorizontaLDots,
  GridIcon,
  OrderIcon,
  ProductIcon,
  UsersIcon,
  CouponIcon,
  DocumentIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string }[];
};

const navItems: NavItem[] = [
  {
    icon: <DashboardIcon />,
    name: "Dashboard",
    path: "/admin",
  },
  {
    icon: <UsersIcon />,
    name: "Users",
    path: "/admin/users",
  },
  {
    icon: <CategoryIcon />,
    name: "Categories",
    path: "/admin/categories",
  },
  {
    icon: <GridIcon />,
    name: "Banners",
    path: "/admin/banners",
  },
  {
    icon: <ProductIcon />,
    name: "Products",
    path: "/admin/products",
  },
  {
    icon: <GridIcon />,
    name: "Top Products",
    path: "/admin/top-products",
  },
  {
    icon: <OrderIcon />,
    name: "Orders",
    path: "/admin/orders",
  },
  {
    icon: <DocumentIcon />,
    name: "Invoices",
    path: "/admin/invoices",
  },
  {
    icon: <CouponIcon />,
    name: "Coupons",
    path: "/admin/coupons",
  },
];

const currentYear = new Date().getFullYear();

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-gradient-to-b from-white via-gray-50/50 to-white backdrop-blur-md border-r border-gray-200 text-teal-800 h-screen transition-all duration-300 ease-in-out z-40 shadow-xl
        ${isExpanded || isMobileOpen
          ? "w-[280px]"
          : isHovered
            ? "w-[280px]"
            : "w-[80px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div
        className={`py-6 px-4 flex border-b border-gray-200 bg-white/80 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/admin" className="group">
          {isExpanded || isHovered || isMobileOpen ? (
            <ProfessionalLogo size="md" showText />
          ) : (
            <ProfessionalLogo size="md" />
          )}
        </Link>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 flex flex-col overflow-y-auto px-3 py-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <nav className="flex-1">
          <div className="flex flex-col gap-1">
            <div>
              <h2
                className={`mb-4 px-3 text-[10px] uppercase flex leading-[20px] text-gray-500 font-bold tracking-widest ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Main Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>

              <ul className="flex flex-col gap-1.5">
                {navItems.map((nav, index) => (
                  <li key={nav.name}>
                    <Link
                      href={nav.path!}
                      className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${isActive(nav.path!)
                          ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-600/30"
                          : "text-gray-700 hover:bg-gray-100 hover:text-teal-700"
                        } ${!isExpanded && !isHovered
                          ? "lg:justify-center"
                          : "lg:justify-start"
                        }`}
                    >
                      <span className={`flex-shrink-0 transition-transform duration-200 ${isActive(nav.path!) ? 'scale-110' : 'group-hover:scale-110'
                        }`}>{nav.icon}</span>
                      {(isExpanded || isHovered || isMobileOpen) && (
                        <span className="font-semibold text-sm">{nav.name}</span>
                      )}
                      {isActive(nav.path!) && (isExpanded || isHovered || isMobileOpen) && (
                        <div className="ml-auto">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        {/* Footer Section */}
        {(isExpanded || isHovered || isMobileOpen) && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="px-3 py-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-100 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900">System Status</div>
                  <div className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    All Systems Online
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 px-3 text-center">
              <p className="text-[10px] text-gray-500 font-medium">© {currentYear} NS Collection</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
