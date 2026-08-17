"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPageRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params.id) {
      router.replace(`/admin/products?openEditModalId=${params.id}`);
    } else {
      router.replace("/admin/products");
    }
  }, [router, params.id]);

  return (
    <div className="min-h-96 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-rose-100 border-t-rose-800"></div>
        <p className="text-sm text-gray-500 font-semibold">Redirecting to product list...</p>
      </div>
    </div>
  );
}
