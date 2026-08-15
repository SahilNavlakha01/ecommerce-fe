'use client'

import { useEffect } from 'react'
import { warmupServer } from '@/utils/serverWarmup'

/** Mount once in root layout — starts pinging the backend immediately on any page load */
export default function ServerWarmupInit() {
  useEffect(() => {
    warmupServer()
  }, [])
  return null
}
