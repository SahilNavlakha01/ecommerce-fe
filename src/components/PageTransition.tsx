"use client"

import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={`account-page-transition ${className}`}>
      {children}
    </div>
  )
}
