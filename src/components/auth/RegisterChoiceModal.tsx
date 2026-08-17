"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface RegisterChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterChoiceModal: React.FC<RegisterChoiceModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleChoice = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl z-10 overflow-hidden border border-stone-200">
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-700 to-rose-950" />
        
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            type="button"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="mb-5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/60 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-700"></span>
              <span className="text-[10px] font-bold text-rose-900 uppercase tracking-widest">
                NS Collection
              </span>
            </div>
            <h2 className="text-xl font-serif font-bold text-stone-900">Sign in or Register</h2>
            <p className="text-xs text-stone-500 mt-1">Enter your mobile number to access exclusive fashion collections</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleChoice('/auth/otp-login')}
              className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-stone-200 hover:border-rose-700 hover:bg-rose-50/50 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5 text-rose-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-stone-900">Continue with Mobile Number</p>
                <p className="text-[11px] text-stone-500">Retail & Wholesale B2B accounts</p>
              </div>
            </button>
          </div>

          <p className="text-[10px] text-stone-400 text-center mt-5">
            🔒 Fast 1-Click OTP Verification • 256-Bit Encrypted
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterChoiceModal;
