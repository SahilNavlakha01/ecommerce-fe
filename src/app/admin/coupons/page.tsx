"use client";

import { useEffect, useMemo, useState } from "react";
import { AddCoupon, UpdateCoupon, DeleteCoupon } from "@/Services/PostService";
import { GetAllCoupons } from "@/Services/GetService";
import { successToast, errorToast } from "@/utils/toast";
import { FormLoading } from "@/components/ui/FormLoading";
import Modal from "@/components/ui/Modal";
import { CalendarIcon, CheckCircleIcon, PencilIcon, PlusIcon, TrashIcon } from "@/icons";

type CouponType = "percentage" | "fixed";
type CouponTarget = "all" | "new_user" | "retail" | "b2b" | "personal";

interface Coupon {
  id: number;
  code: string;
  discountType: CouponType;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  isActive: number;
  targetAudience: CouponTarget;
  expiresAt: string | null;
  createdAt: string;
}

const EMPTY_FORM = {
  code: "",
  discountType: "percentage" as CouponType,
  discountValue: "",
  minOrderAmount: "",
  maxUses: "",
  isActive: true,
  targetAudience: "retail" as CouponTarget,
  expiresAt: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await GetAllCoupons();
      if (res?.data?.data) setCoupons(res.data.data);
    } catch {
      errorToast("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => { setForm(EMPTY_FORM); setEditing(null); };

  const startEdit = (c: Coupon) => {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discountType,
      discountValue: String(c.discountValue),
      minOrderAmount: c.minOrderAmount != null ? String(c.minOrderAmount) : "",
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      isActive: Boolean(Number(c.isActive)),
      targetAudience: c.targetAudience || "all",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
    });
    setIsModalOpen(true);
  };

  const startCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) return errorToast("Coupon code is required");
    if (!form.discountValue || Number(form.discountValue) <= 0) return errorToast("Discount value must be > 0");
    if (form.discountType === "percentage" && Number(form.discountValue) > 100) return errorToast("Percentage cannot exceed 100");

    const payload = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      isActive: form.isActive,
      targetAudience: form.targetAudience,
      expiresAt: form.expiresAt || null,
    };

    try {
      setSaving(true);
      const res = editing
        ? await UpdateCoupon(payload, editing.id)
        : await AddCoupon(payload);

      if (res?.status === 200 || res?.status === 201) {
        successToast(editing ? "Coupon updated" : "Coupon created");
        resetForm();
        setIsModalOpen(false);
        await fetchCoupons();
      } else {
        errorToast(res?.data?.message || "Failed to save coupon");
      }
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "Failed to save coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Delete coupon "${c.code}"?`)) return;
    try {
      setSaving(true);
      const res = await DeleteCoupon(c.id);
      if (res?.status === 200) {
        successToast("Coupon deleted");
        await fetchCoupons();
      } else {
        errorToast(res?.data?.message || "Failed to delete");
      }
    } catch (err: any) {
      errorToast(err?.response?.data?.message || "Failed to delete");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (c: Coupon) => {
    const next = !Boolean(Number(c.isActive));
    setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: next ? 1 : 0 } : x));
    try {
      const res = await UpdateCoupon({ isActive: next }, c.id);
      if (res?.status === 200) {
        successToast(`Coupon ${next ? "activated" : "deactivated"}`);
      } else {
        setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: c.isActive } : x));
        errorToast("Failed to update status");
      }
    } catch {
      setCoupons(prev => prev.map(x => x.id === c.id ? { ...x, isActive: c.isActive } : x));
      errorToast("Failed to update status");
    }
  };

  const stats = useMemo(() => ({
    total: coupons.length,
    active: coupons.filter(c => Number(c.isActive) === 1).length,
    personal: coupons.filter(c => c.targetAudience === "personal").length,
  }), [coupons]);

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return coupons;
    return coupons.filter((coupon) => {
      return [
        coupon.code,
        coupon.targetAudience,
        coupon.discountType,
        String(coupon.discountValue),
      ].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [coupons, search]);

  return (
    <>
      <FormLoading show={saving} message="Saving coupon..." />
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[2rem] border border-teal-100/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <div className="relative overflow-hidden border-b border-teal-100/80 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.18),_transparent_28%),linear-gradient(135deg,_#ffffff_0%,_#f8fafc_42%,_#ecfeff_100%)] px-6 py-7 sm:px-8 sm:py-8">
            <div className="absolute right-0 top-0 h-56 w-56 translate-x-1/3 -translate-y-1/3 rounded-full bg-teal-200/30 blur-3xl" />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-3 py-1 text-xs font-semibold tracking-wide text-teal-700 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-teal-500" />
                  COUPON CENTER
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl font-heading">
                  Coupons
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 sm:text-base">
                  Create, edit, and monitor discount codes. New-user coupons can also power the homepage banner automatically.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={fetchCoupons} className="btn btn-secondary">
                  Refresh
                </button>
                <button onClick={startCreate} className="btn btn-primary inline-flex items-center gap-2">
                  <PlusIcon />
                  New Coupon
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3 lg:px-6">
            <div className="group rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Total Coupons</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
                  <p className="mt-2 text-sm text-gray-500">All discount codes in the system</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
                  <PlusIcon />
                </div>
              </div>
            </div>

            <div className="group rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Active Coupons</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-emerald-800">{stats.active}</p>
                  <p className="mt-2 text-sm text-emerald-900/70">Currently redeemable</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
                  <CheckCircleIcon />
                </div>
              </div>
            </div>

            <div className="group rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-5 shadow-sm transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-700">Personal Coupons</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-4xl font-bold text-purple-800">{stats.personal}</p>
                  <p className="mt-2 text-sm text-purple-900/70">Shared privately, one-time use</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500 text-white shadow-sm">
                  <span className="text-sm font-bold">P</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 px-5 pb-6 pt-5 sm:px-6">
            <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Coupon List</h2>
                <p className="text-sm text-gray-500">Find, edit, activate, or remove codes from one place.</p>
              </div>
              <div className="w-full max-w-md">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Search
                </label>
                <div className="relative">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search code, discount type, or target..."
                    className="form-input pl-10 pr-4 py-3"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 px-5 py-16 text-center text-gray-500">
                Loading coupons...
              </div>
            ) : filteredCoupons.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 bg-gradient-to-br from-white to-gray-50 px-5 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <PlusIcon />
                </div>
                <p className="font-semibold text-gray-900">{search ? "No matching coupons" : "No coupons yet"}</p>
                <p className="mt-2 text-sm text-gray-500">
                  {search ? "Try a different search term." : "Create your first coupon using the New Coupon button."}
                </p>
                {!search && (
                  <button onClick={startCreate} className="btn btn-primary mt-6 inline-flex items-center gap-2">
                    <PlusIcon />
                    Create Coupon
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50/90">
                      <tr>
                        {["Code", "Discount", "Target", "Uses", "Expires", "Status", "Actions"].map(h => (
                          <th
                            key={h}
                            className="whitespace-nowrap px-4 py-4 text-left text-xs font-bold uppercase tracking-[0.18em] text-gray-500"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredCoupons.map(c => (
                        <tr key={c.id} className="transition-colors hover:bg-teal-50/30">
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-3">
                              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-xs font-bold text-white shadow-sm">
                                {c.code.slice(0, 2)}
                              </span>
                              <div>
                                <p className="font-mono text-sm font-bold tracking-wide text-gray-900">{c.code}</p>
                                <p className="text-xs text-gray-500">
                                  Created {new Date(c.createdAt).toLocaleDateString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                            <div className="text-sm font-semibold text-gray-900">
                              {c.discountType === "percentage" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                            </div>
                            <p className="text-xs text-gray-500">
                              {c.discountType === "percentage" ? "Percent discount" : "Flat discount"}
                              {c.minOrderAmount ? ` • Min ₹${c.minOrderAmount}` : ""}
                            </p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                c.targetAudience === "new_user"
                                  ? "bg-purple-100 text-purple-700"
                                  : c.targetAudience === "retail"
                                  ? "bg-blue-100 text-blue-700"
                                  : c.targetAudience === "b2b"
                                  ? "bg-amber-100 text-amber-700"
                                  : c.targetAudience === "personal"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {c.targetAudience === "new_user" ? "New User"
                                : c.targetAudience === "retail" ? "Retail"
                                : c.targetAudience === "b2b" ? "B2B"
                                : c.targetAudience === "personal" ? "Personal"
                                : "All Users"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                            <div className="text-sm font-medium text-gray-900">
                              {c.usedCount ?? 0}{c.maxUses ? ` / ${c.maxUses}` : ""}
                            </div>
                            <p className="text-xs text-gray-500">Redemptions used</p>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-gray-600">
                            <div className="inline-flex items-center gap-2 text-sm">
                              <span className="text-teal-600">
                                <CalendarIcon />
                              </span>
                              {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "Never"}
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <button
                              onClick={() => handleToggleActive(c)}
                              aria-label={`Toggle ${c.code} status`}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                                Number(c.isActive) === 1 ? "bg-emerald-500" : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                                  Number(c.isActive) === 1 ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => startEdit(c)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-600 transition-all hover:border-teal-300 hover:text-teal-700 hover:shadow-sm"
                                title="Edit"
                              >
                                <PencilIcon />
                              </button>
                              <button
                                onClick={() => handleDelete(c)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 transition-all hover:bg-red-100 hover:shadow-sm"
                                title="Delete"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editing ? "Edit Coupon" : "Create Coupon"}
        size="lg"
        footer={(
          <>
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" form="coupon-form" className="btn btn-primary">
              {editing ? "Update Coupon" : "Create Coupon"}
            </button>
          </>
        )}
      >
        <div className="mb-5 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white px-4 py-4 text-sm text-teal-900 shadow-sm">
          <p className="font-semibold text-teal-900">Coupon details</p>
          <p className="mt-1 text-teal-900/80">
            Set up a discount code quickly. New-user codes show on the homepage banner.
          </p>
        </div>

        <form id="coupon-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Coupon Code *</label>
            <input
              className="form-input mt-1 uppercase"
              placeholder="e.g. WELCOME15"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Discount Type *</label>
              <select
                className="form-input mt-1"
                value={form.discountType}
                onChange={e => setForm(f => ({ ...f, discountType: e.target.value as CouponType }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed (₹)</option>
              </select>
            </div>
            <div>
              <label className="form-label">Value *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                className="form-input mt-1"
                placeholder={form.discountType === "percentage" ? "15" : "100"}
                value={form.discountValue}
                onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Min Order (₹)</label>
              <input
                type="number"
                min="0"
                className="form-input mt-1"
                placeholder="Optional"
                value={form.minOrderAmount}
                onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Max Uses</label>
              <input
                type="number"
                min="1"
                className="form-input mt-1"
                placeholder="Unlimited"
                value={form.maxUses}
                onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="form-label">Target Audience</label>
              <select
                className="form-input mt-1"
                value={form.targetAudience}
                onChange={e => setForm(f => ({ ...f, targetAudience: e.target.value as CouponTarget }))}
              >
                <option value="retail">Retail Users</option>
                <option value="b2b">B2B Users</option>
                <option value="personal">Personal (shared privately, not shown in UI)</option>
                <option value="all">All Users</option>
                <option value="new_user">New Users Only</option>
              </select>
            </div>
            <div>
              <label className="form-label">Expires At</label>
              <input
                type="date"
                className="form-input mt-1"
                value={form.expiresAt}
                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              <span className="block font-medium text-gray-900">Active</span>
              <span className="block text-xs text-gray-500">Live and redeemable right away</span>
            </span>
          </label>
        </form>
      </Modal>
    </>
  );
}
