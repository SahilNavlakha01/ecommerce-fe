"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AddBanner, DeleteBanner, UpdateBanner, UpdateBannerOrder } from "@/Services/PostService";
import { GetAllBanners, GetActiveBanners } from "@/Services/GetService";
import { successToast, errorToast } from "@/utils/toast";
import { FormLoading } from "@/components/ui/FormLoading";
import { Pagination } from "@/components/ui/Pagination";
import Portal from "@/components/ui/Portal";
import { EyeIcon, TrashIcon } from "@/icons";

type BannerItem = {
  id: number;
  imageUrl: string;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<BannerItem | null>(null);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [activeBannersForOrder, setActiveBannersForOrder] = useState<BannerItem[]>([]);
  const [loadingActive, setLoadingActive] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [updatingBannerId, setUpdatingBannerId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const defaultPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false,
  };

  useEffect(() => {
    fetchBanners();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await GetAllBanners({ page: currentPage, limit: itemsPerPage });
      if (res?.data?.data) {
        setBanners(res.data.data.data || []);
        setPagination(res.data.data.pagination || defaultPagination);
      }
    } catch (err) {
      console.error(err);
      errorToast("Failed to load banners");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedBanner(null);
    setImageFile(null);
    setImagePreview("");
    setIsActive(true);
  };

  const handleFileChange = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      errorToast("Only image files are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      errorToast("Image must be less than 5MB");
      return;
    }
    setImageFile(file);
    if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return errorToast("Banner image is required");

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("isActive", String(isActive));
      fd.append("image", imageFile);

      const res = await AddBanner(fd);

      if (res?.status === 200 || res?.status === 201) {
        successToast("Banner created successfully");
        resetForm();
        await fetchBanners();
      } else {
        errorToast(res?.data?.message || "Unable to save banner");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err?.response?.data?.message || "Unable to save banner");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (banner: BannerItem) => {
    if (!confirm("Delete this banner? This will hide it from the site.")) return;
    try {
      setSaving(true);
      const res = await DeleteBanner(banner.id);
      if (res?.status === 200) {
        successToast("Banner deleted");
        await fetchBanners();
      } else {
        errorToast(res?.data?.message || "Unable to delete banner");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err?.response?.data?.message || "Unable to delete banner");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (banner: BannerItem, nextIsActive: boolean) => {
    if (Boolean(Number(banner.isActive)) === nextIsActive) return;

    const previousState = banner.isActive;
    setBanners(prev =>
      prev.map(item =>
        item.id === banner.id ? { ...item, isActive: nextIsActive ? 1 : 0 } : item
      )
    );
    setUpdatingBannerId(banner.id);

    try {
      const fd = new FormData();
      fd.append("isActive", String(nextIsActive));
      const res = await UpdateBanner(fd, banner.id);
      if (res?.status === 200) {
        successToast(`Banner marked as ${nextIsActive ? "active" : "inactive"}`);
      } else {
        setBanners(prev =>
          prev.map(item =>
            item.id === banner.id ? { ...item, isActive: previousState } : item
          )
        );
        errorToast(res?.data?.message || "Unable to update banner status");
      }
    } catch (err: any) {
      console.error(err);
      setBanners(prev =>
        prev.map(item =>
          item.id === banner.id ? { ...item, isActive: previousState } : item
        )
      );
      errorToast(err?.response?.data?.message || "Unable to update banner status");
    } finally {
      setUpdatingBannerId(null);
    }
  };

  const handleOpenReorderModal = async () => {
    setIsReorderModalOpen(true);
    setLoadingActive(true);
    try {
      const res = await GetActiveBanners();
      if (res?.data?.data) {
        setActiveBannersForOrder(res.data.data);
      }
    } catch (err) {
      console.error(err);
      errorToast("Failed to load active banners for ordering");
    } finally {
      setLoadingActive(false);
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...activeBannersForOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    setActiveBannersForOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === activeBannersForOrder.length - 1) return;
    const newOrder = [...activeBannersForOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    setActiveBannersForOrder(newOrder);
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const payload = activeBannersForOrder.map((b, index) => ({
        id: b.id,
        order: index + 1
      }));
      await UpdateBannerOrder(payload);
      successToast("Banners reordered successfully");
      setIsReorderModalOpen(false);
      await fetchBanners(); // Refresh list to reflect correct status if needed
    } catch (error) {
      console.error("Error saving banner order:", error);
      errorToast("Failed to update banner order");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => ({
    total: pagination.totalItems,
    active: banners.filter(b => Number(b.isActive) === 1).length,
    inactive: banners.filter(b => Number(b.isActive) !== 1).length,
  }), [banners, pagination.totalItems]);

  const pageStart = pagination.totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const pageEnd = Math.min(currentPage * itemsPerPage, pagination.totalItems);

  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  return (
    <>
      <FormLoading show={saving} message="Saving banner..." />
      <div className="space-y-5">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-card">
          <div className="border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-teal-50/40 px-5 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
                  Banner Management
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                  Manage banners for the home page.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={handleOpenReorderModal} className="btn btn-secondary bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200">
                  <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>
                  Reorder Active Banners
                </button>
                <button onClick={fetchBanners} className="btn btn-secondary">
                  Refresh
                </button>
                <button onClick={() => router.back()} className="btn btn-primary">
                  Back
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 px-4 py-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:px-6">
            <div className="h-fit rounded-2xl border border-gray-200 bg-white p-4 shadow-sm lg:sticky lg:top-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Add Banner</h2>
                  <p className="mt-1 text-xs text-gray-500">Upload one banner at a time</p>
                </div>
                {/* <button onClick={resetForm} className="text-sm font-semibold text-teal-700 hover:text-teal-800">
                  Reset
                </button> */}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label">Banner Image *</label>
                  <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="form-input border-0 bg-transparent p-0 text-sm shadow-none focus:ring-0"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                    />
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    Recommended: wide landscape image, under 5MB.
                  </p>
                </div>

                {imagePreview && (
                  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                    <img src={imagePreview} alt="Preview" className="h-40 w-full object-cover" />
                  </div>
                )}

                <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    <span className="block font-medium text-gray-900">Active banner</span>
                    <span className="block text-xs text-gray-500">Visible on the live site immediately</span>
                  </span>
                </label>

                <button type="submit" className="btn btn-primary w-full">
                  Create Banner
                </button>
              </form>
            </div>

            <div className="min-w-0 space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Total Banners</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{stats.total}</p>
                </div>
                <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4 shadow-sm">
                  <p className="text-sm text-teal-900/70">Active</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-teal-800">{stats.active}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-sm">
                  <p className="text-sm text-gray-500">Inactive</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-700">{stats.inactive}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Existing Banners</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Showing {pageStart}-{pageEnd} of {pagination.totalItems}
                    </p>
                  </div>
                  <button onClick={fetchBanners} className="text-sm font-semibold text-teal-700 hover:text-teal-800">
                    Refresh list
                  </button>
                </div>

                {loading ? (
                  <div className="px-5 py-14 text-center text-gray-500">Loading banners...</div>
                ) : banners.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <p className="font-medium text-gray-900">No banners created yet</p>
                    <p className="mt-1 text-sm text-gray-500">Add your first homepage banner using the panel on the left.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {banners.map((banner) => (
                      <div key={banner.id} className="p-4 sm:p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                          <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 lg:w-[220px] xl:w-[260px]">
                            <img
                              src={banner.imageUrl}
                              alt="Homepage banner"
                              className="h-40 w-full object-cover lg:h-[150px]"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                              <div className="min-w-0">
                                <h3 className="text-lg font-semibold text-gray-900">Homepage Banner</h3>
                                {/* <p className="mt-1 text-sm text-gray-500">Banner #{banner.id}</p> */}
                              </div>
                              <span
                                className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  Number(banner.isActive) === 1
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {Number(banner.isActive) === 1 ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                                <label className={`flex cursor-pointer items-center gap-2 ${updatingBannerId === banner.id ? "opacity-60" : ""}`}>
                                  <input
                                    type="radio"
                                    name={`banner-status-${banner.id}`}
                                    checked={Number(banner.isActive) === 1}
                                    disabled={updatingBannerId === banner.id}
                                    onChange={() => handleStatusChange(banner, true)}
                                  />
                                  Active
                                </label>
                                <label className={`flex cursor-pointer items-center gap-2 ${updatingBannerId === banner.id ? "opacity-60" : ""}`}>
                                  <input
                                    type="radio"
                                    name={`banner-status-${banner.id}`}
                                    checked={Number(banner.isActive) !== 1}
                                    disabled={updatingBannerId === banner.id}
                                    onChange={() => handleStatusChange(banner, false)}
                                  />
                                  Inactive
                                </label>
                              </div>

                              <div className="flex items-center gap-2 xl:justify-end">
                                <button
                                  type="button"
                                  onClick={() => setSelectedBanner(banner)}
                                  className="group inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:text-teal-700 hover:shadow-md"
                                  aria-label="View banner"
                                  title="View banner"
                                >
                                  <EyeIcon />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(banner)}
                                  className="group inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-100 hover:shadow-md"
                                  aria-label="Delete banner"
                                  title="Delete banner"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!loading && banners.length > 0 && (
                  <div className="border-t border-gray-100 px-4 py-4 sm:px-5">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={setItemsPerPage}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedBanner && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedBanner(null)}>
            <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Homepage Banner</h3>
                <button onClick={() => setSelectedBanner(null)} className="text-gray-500 hover:text-gray-700">Close</button>
              </div>
              <img src={selectedBanner.imageUrl} alt="Homepage banner preview" className="w-full max-h-[420px] object-cover" />
              <div className="p-4" />
            </div>
          </div>
        </Portal>
      )}

      {isReorderModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setIsReorderModalOpen(false)}>
            <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Reorder Active Banners</h3>
                  <p className="text-sm text-gray-500 mt-1">Drag arrows to adjust the order of banners shown on the home page.</p>
                </div>
                <button onClick={() => setIsReorderModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-5 flex-1 overflow-y-auto space-y-3">
                {loadingActive ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : activeBannersForOrder.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    No active banners found.
                  </div>
                ) : (
                  activeBannersForOrder.map((banner, index) => (
                    <div key={banner.id} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl hover:border-teal-300 transition-colors shadow-sm">
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => moveUp(index)} 
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-gray-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                        </button>
                        <button 
                          onClick={() => moveDown(index)} 
                          disabled={index === activeBannersForOrder.length - 1}
                          className="p-1 text-gray-400 hover:text-teal-600 disabled:opacity-30 disabled:hover:text-gray-400"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                      </div>
                      
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-teal-50 text-teal-700 text-sm font-bold border border-teal-100">
                        {index + 1}
                      </span>
                      
                      <div className="flex-1 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
                        <img src={banner.imageUrl} alt="Banner" className="w-full h-24 object-cover" />
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                <button 
                  onClick={() => setIsReorderModalOpen(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveOrder}
                  disabled={loadingActive || saving}
                  className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Save Order
                </button>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
