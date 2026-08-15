"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BadgeIndianRupee, Building2, Check, Eye, EyeOff, Lock, Phone, User } from "lucide-react";

import { successToast, errorToast } from "../../utils/toast";
import { RegisterB2BUser, SendOtp, VerifyOtp } from "../../Services/PostService";
import { GetConfig } from "../../Services/GetService";
import { setAuthCookie } from "../../utils/auth";

const STEPS = [
  { id: 1, label: "Phone" },
  { id: 2, label: "Verify" },
  { id: 3, label: "Email Optional" },
  { id: 4, label: "Password" },
];

export default function B2BRegistrationPage() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [roles, setRoles] = useState<{ b2b: any }>({ b2b: null });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const STORAGE_KEY = "b2b_reg_draft";
  const isBrowser = () => typeof window !== "undefined";
  const getDraft = () => {
    if (!isBrowser()) return null;
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  };
  const setDraft = (value: string) => {
    if (!isBrowser()) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, value);
    } catch {}
  };
  const clearDraft = () => {
    if (!isBrowser()) return;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  };

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    emailOtp: "",
    companyName: "",
    gstNumber: "",
    phoneOtp: "",
    password: "",
    confirmPassword: "",
    isEmailVerified: false,
  });

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await GetConfig("Role");
        if (res.data?.status === 200) {
          const b2bRole = res.data.data.find((r: any) => r.ConfigValue === "B2b Customer");
          setRoles({ b2b: b2bRole?.id || null });
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err);
      }
    };
    fetchRoles();

    const raw = getDraft();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.formData) {
        setFormData((prev) => ({
          ...prev,
          name: parsed.formData.name ?? "",
          phone: parsed.formData.phone ?? "",
          email: parsed.formData.email ?? "",
          companyName: parsed.formData.companyName ?? "",
          gstNumber: parsed.formData.gstNumber ?? "",
          isEmailVerified: !!parsed.formData.isEmailVerified,
        }));
      }
      if (typeof parsed?.step === "number" && parsed.step >= 1 && parsed.step <= 4) {
        setStep(parsed.step);
      }
    } catch {
      clearDraft();
    }
  }, []);

  useEffect(() => {
    if (!isBrowser()) return;
    const shouldPersist = step < 4 || !!formData.name || !!formData.phone || !!formData.email || !!formData.companyName || !!formData.gstNumber;
    if (!shouldPersist) {
      clearDraft();
      return;
    }

    const draft = {
      step,
      formData: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        isEmailVerified: formData.isEmailVerified,
      },
    };
    setDraft(JSON.stringify(draft));
  }, [formData, step]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      errorToast("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await SendOtp({
        contactType: "mobile",
        contactValue: formData.phone,
        isLoginAuth: true,
        isRegistration: true,
        allowExistingAccount: true,
        requestSource: "registration",
        accountType: "b2b",
      });

      if (res.data?.status === 200) {
        successToast("OTP sent to your mobile number");
        setStep(2);
        setTimer(60);
      } else if (res.data?.status === 400 && res.data?.statusMessage?.includes("already in use")) {
        errorToast(res.data.statusMessage);
      } else {
        errorToast(res.data?.statusMessage || "Failed to send OTP");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err.response?.data?.statusMessage || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneOtp) {
      errorToast("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await VerifyOtp({
        contactType: "mobile",
        contactValue: formData.phone,
        otpCode: formData.phoneOtp,
        isLoginAuth: true,
      });

      if (res.data?.status === 200) {
        successToast("Mobile number verified successfully");
        setStep(3);
      } else {
        errorToast(res.data?.statusMessage || "Invalid OTP");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err.response?.data?.statusMessage || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent, skip = false) => {
    e.preventDefault();
    if (skip || !formData.email.trim()) {
      setStep(4);
      return;
    }

    setLoading(true);
    try {
      const res = await SendOtp({
        contactType: "email",
        contactValue: formData.email,
        isLoginAuth: true,
        isRegistration: true,
        allowExistingAccount: true,
        requestSource: "registration",
        accountType: "b2b",
      });
      if (res.data?.status === 200) {
        successToast("OTP sent to your email");
        setStep(3.5);
        setTimer(60);
      } else {
        errorToast(res.data?.statusMessage || "Failed to send OTP");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err.response?.data?.statusMessage || "Failed to send email OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.emailOtp) {
      errorToast("Please enter the OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await VerifyOtp({
        contactType: "email",
        contactValue: formData.email,
        otpCode: formData.emailOtp,
        isLoginAuth: true,
      });
      if (res.data?.status === 200) {
        successToast("Email verified successfully");
        setFormData((p) => ({ ...p, isEmailVerified: true }));
        setStep(4);
      } else {
        errorToast(res.data?.statusMessage || "Invalid OTP");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err.response?.data?.statusMessage || "Email verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setLoading(true);
    try {
      const res = await SendOtp({
        contactType: "mobile",
        contactValue: formData.phone,
        isLoginAuth: true,
        isRegistration: true,
        allowExistingAccount: true,
        requestSource: "registration",
        accountType: "b2b",
      });
      if (res.data?.status === 200) {
        successToast("OTP resent to your mobile number");
        setTimer(60);
      } else {
        errorToast(res.data?.statusMessage || "Failed to resend OTP");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err.response?.data?.statusMessage || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      errorToast("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("phone", formData.phone);
      if (formData.email.trim()) submitData.append("email", formData.email.trim());
      submitData.append("passwordHash", formData.password);
      submitData.append("userRole", String(roles.b2b));
      if (formData.companyName.trim()) submitData.append("companyName", formData.companyName.trim());
      if (formData.gstNumber.trim()) submitData.append("gstNumber", formData.gstNumber.trim().toUpperCase());
      submitData.append("isEmailVerified", String(formData.isEmailVerified));

      const res = await RegisterB2BUser(submitData);
      if (res.data?.status === 200 || res.data?.status === 201) {
        successToast("B2B registration successful");
        const { token, user } = res.data.data;
        setAuthCookie(token, user, "user");
        clearDraft();
        router.push("/");
      } else {
        errorToast(res.data?.statusMessage || "Registration failed");
      }
    } catch (err: any) {
      console.error(err);
      errorToast(err.response?.data?.statusMessage || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  const currentStepIndex = Math.min(Math.floor(step), 3);

  return (
    <div className="min-h-dvh flex bg-white">
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-teal-700 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/30 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-teal-900/40 to-transparent" />
        <Link href="/" className="relative z-10">
          <img src="/images/LogoNew.png" alt="Ethnic Sparkles" width={160} className="object-contain brightness-0 invert" />
        </Link>
        <div className="relative z-10 space-y-6">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-white leading-tight">Grow your business with us</h2>
            <p className="text-teal-200 text-lg">Join our B2B network and get exclusive wholesale pricing.</p>
          </div>
        </div>
        <p className="relative z-10 text-teal-300 text-xs">© {currentYear} Ethnic Sparkles · Presented by EEAS Lifestyle</p>
      </div>

      <div className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 py-6 sm:py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-md pb-8 sm:pb-0">
          <div className="lg:hidden flex justify-center mb-5">
            <Link href="/">
              <img src="/images/LogoNew.png" alt="Ethnic Sparkles" width={130} className="object-contain" />
            </Link>
          </div>

          <div className="lg:hidden mb-5 rounded-2xl border border-teal-100 bg-teal-50/70 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Business registration</p>
            <p className="mt-1 text-sm text-teal-900/80">
              Register your wholesale account for boutiques, resellers, and repeat business orders.
            </p>
          </div>

          <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">B2B Registration</h1>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                {step === 1 && "Enter your basic details"}
                {step === 2 && "Verify your mobile number"}
                {(step === 3 || step === 3.5) && "Add your email address if you'd like OTP verification"}
                {step === 4 && "Set a secure password"}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-full">
              Step {currentStepIndex} / 4
            </span>
          </div>

          <div className="flex gap-1.5 mb-6 sm:mb-7">
            {STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  Math.floor(step) >= s.id ? "bg-teal-600" : "bg-gray-100"
                }`}
              />
            ))}
          </div>

          <div className="flex mb-6 sm:mb-7">
            {STEPS.map((s) => {
              const done = Math.floor(step) > s.id;
              const active = Math.floor(step) === s.id;
              return (
                <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border-2 ${
                      done ? "bg-teal-600 border-teal-600 text-white"
                      : active ? "bg-white border-teal-600 text-teal-600"
                      : "bg-white border-gray-200 text-gray-400"
                    }`}
                  >
                        {done ? <Check size={13} strokeWidth={3} /> : s.id}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide ${
                      active || done ? "text-teal-600" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div>
            {step === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                      autoComplete="name"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 border-r border-gray-300 pr-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-600">+91</span>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="10-digit number"
                      required
                      pattern="[0-9]{10}"
                      inputMode="numeric" autoComplete="tel"
                      className="w-full pl-20 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Company Name <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your company or shop name"
                      autoComplete="organization"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    GST Number <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <BadgeIndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleInputChange}
                      placeholder="24AAAAA0000A1Z5"
                      autoComplete="off"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all uppercase"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Sending OTP..." : <><span>Continue</span><ArrowRight size={16} /></>}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleStep2Submit} className="space-y-4">
                <div className="bg-teal-50 border border-teal-100 rounded-lg px-4 py-3 text-sm text-teal-800">
                  OTP sent to <span className="font-semibold">+91 {formData.phone}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                  <input
                    type="text"
                    name="phoneOtp"
                    value={formData.phoneOtp}
                    onChange={handleInputChange}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                    inputMode="numeric" autoComplete="one-time-code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="text-center text-sm">
                  {timer > 0 ? (
                    <span className="text-gray-500">
                      Resend in <span className="font-semibold text-teal-700">{timer}s</span>
                    </span>
                  ) : (
                    <button type="button" onClick={handleResendOtp} className="text-teal-700 font-semibold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : <><span>Verify & Continue</span><ArrowRight size={16} /></>}
                </button>
                <button
                  type="button"
                  onClick={() => { setFormData(p => ({ ...p, phoneOtp: '' })); setStep(1); }}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft size={14} /> Change number
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={(e) => handleStep3Submit(e)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">Optional. Add an email to verify with OTP and get order updates.</p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                {loading ? "Sending OTP..." : <><span>{formData.email.trim() ? "Verify Email" : "Skip Email"}</span><ArrowRight size={16} /></>}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleStep3Submit(e as any, true)}
                  className="w-full py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                >
                  Skip for now
                </button>
              </form>
            )}

            {step === 3.5 && (
              <form onSubmit={handleEmailOtpVerify} className="space-y-4">
                <div className="bg-teal-50 border border-teal-100 rounded-lg px-4 py-3 text-sm text-teal-800">
                  OTP sent to <span className="font-semibold">{formData.email}</span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter Email OTP</label>
                  <input
                    type="text"
                    name="emailOtp"
                    value={formData.emailOtp}
                    onChange={handleInputChange}
                    placeholder="6-digit code"
                    maxLength={6}
                    required
                    inputMode="numeric" autoComplete="one-time-code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="text-center text-sm">
                  {timer > 0 ? (
                    <span className="text-gray-500">
                      Resend in <span className="font-semibold text-teal-700">{timer}s</span>
                    </span>
                  ) : (
                    <button type="button" onClick={(e) => handleStep3Submit(e as any)} className="text-teal-700 font-semibold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? "Verifying..." : <><span>Confirm & Continue</span><ArrowRight size={16} /></>}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft size={14} /> Change email
                </button>
              </form>
            )}

            {step === 4 && (
              <form onSubmit={handleFinalSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Min. 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Re-enter password"
                      required
                      autoComplete="new-password"
                      className="w-full pl-9 pr-10 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
