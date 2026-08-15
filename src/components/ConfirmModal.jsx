"use client"
import Portal from './ui/Portal'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning" // warning, danger, info
}) {
  if (!isOpen) return null

  const typeStyles = {
    warning: {
      gradient: "from-amber-600 via-amber-600 to-amber-700",
      hoverGradient: "hover:from-amber-700 hover:via-amber-700 hover:to-amber-800",
      icon: (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ),
      alertBg: "bg-amber-50",
      alertBorder: "border-amber-200",
      alertIcon: "text-amber-600",
      alertText: "text-amber-900"
    },
    danger: {
      gradient: "from-red-600 via-red-600 to-red-700",
      hoverGradient: "hover:from-red-700 hover:via-red-700 hover:to-red-800",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      alertBg: "bg-red-50",
      alertBorder: "border-red-200",
      alertIcon: "text-red-600",
      alertText: "text-red-900"
    },
    info: {
      gradient: "from-teal-600 via-teal-600 to-teal-700",
      hoverGradient: "hover:from-teal-700 hover:via-teal-700 hover:to-teal-800",
      icon: (
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      alertBg: "bg-teal-50",
      alertBorder: "border-teal-200",
      alertIcon: "text-teal-600",
      alertText: "text-teal-900"
    }
  }

  const style = typeStyles[type] || typeStyles.warning

  return (
    <Portal>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className={`bg-gradient-to-r ${style.gradient} px-6 py-5 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                {style.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <div className={`p-4 ${style.alertBg} border ${style.alertBorder} rounded-xl mb-6`}>
            <p className={`text-sm font-medium ${style.alertText}`}>{message}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-5 py-3.5 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-bold shadow-sm hover:shadow-md"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className={`flex-1 px-5 py-3.5 bg-gradient-to-r ${style.gradient} text-white rounded-xl ${style.hoverGradient} transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
      </div>
    </Portal>
  )
}
