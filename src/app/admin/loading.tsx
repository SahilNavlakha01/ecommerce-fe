"use client";

import React from "react";

export default function AdminLoadingFallback() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-6 animate-pulse">
        {/* Skeleton Header */}
        <div className="h-20 bg-gray-200/60 rounded-2xl w-full border border-gray-100"></div>

        {/* Skeleton Controls */}
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200/60 rounded-xl w-64"></div>
          <div className="h-10 bg-gray-200/60 rounded-xl w-32 ml-auto"></div>
          <div className="h-10 bg-gray-200/60 rounded-xl w-32"></div>
        </div>

        {/* Skeleton Table */}
        <div className="bg-white border border-gray-200/60 rounded-2xl overflow-hidden shadow-sm">
          <div className="h-12 bg-gray-100/80 border-b border-gray-200/60"></div>
          <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 flex items-center px-6 gap-4">
                <div className="h-10 w-10 bg-gray-200/60 rounded-lg flex-shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200/60 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200/60 rounded w-1/4"></div>
                </div>
                <div className="h-6 bg-gray-200/60 rounded-full w-20"></div>
                <div className="h-6 bg-gray-200/60 rounded w-16"></div>
                <div className="h-8 bg-gray-200/60 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
