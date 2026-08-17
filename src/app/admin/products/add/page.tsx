"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/products?openAddModal=true");
  }, [router]);

  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-100 border-t-rose-800"></div>
        <p className="text-sm text-gray-500 font-semibold">Redirecting to product list...</p>
      </div>
    </div>
  );
}
