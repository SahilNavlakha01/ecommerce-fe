'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#ffffff',
          color: '#026670',
          border: '1px solid #9fedd7',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontFamily: 'Nunito Sans, sans-serif',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
          maxWidth: '400px'
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff'
          },
          style: {
            border: '1px solid #10b981'
          }
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff'
          },
          style: {
            border: '1px solid #ef4444'
          }
        },
        loading: {
          iconTheme: {
            primary: '#026670',
            secondary: '#ffffff'
          }
        }
      }}
    />
  )
}