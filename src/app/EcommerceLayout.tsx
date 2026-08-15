"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load components for better performance
const Navbar = dynamic(() => import("../components/Navbar"), {
  loading: () => (
    <div className="h-20 bg-white border-b border-gray-200 animate-pulse" />
  ),
});

const Footer = dynamic(() => import("./components/Footer"), {
  loading: () => (
    <div className="h-32 bg-gray-100 animate-pulse" />
  ),
});

export default function EcommerceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="ecommerce-theme w-full">
      <div className="sticky top-0 left-0 right-0 z-50">
        <Suspense fallback={<div className="h-20 bg-white border-b border-gray-200 animate-pulse" />}>
          <Navbar />
        </Suspense>
      </div>
      <main className="w-full min-h-screen overflow-x-hidden pb-20 md:pb-0">{children}</main>
      <Suspense fallback={<div className="h-32 bg-gray-100 animate-pulse" />}>
        <Footer />
      </Suspense>
    </div>
  );
}