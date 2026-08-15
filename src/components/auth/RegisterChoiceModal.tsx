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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl z-10 overflow-hidden">
        <div className="bg-teal-700 px-6 py-5 text-white">
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-teal-600 transition-colors" type="button" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-xl font-bold pr-8">Sign in / Register</h2>
          <p className="text-teal-100 text-sm mt-1">Enter your mobile number to continue</p>
        </div>
        <div className="p-5 space-y-3">
          <button onClick={() => handleChoice('/auth/otp-login')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-200 hover:border-teal-600 hover:bg-teal-50 transition-all">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-900">Continue with Mobile Number</p>
              <p className="text-xs text-gray-500">Works for retail & business accounts</p>
            </div>
          </button>
          <p className="text-xs text-gray-400 text-center">New users can choose Retail or Business after entering their number</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterChoiceModal;
