"use client"

import Link from "next/link"
import ProfessionalLogo from "../ui/ProfessionalLogo"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center flex-shrink-0 transition-opacity duration-200 hover:opacity-80">
      <div className="sm:hidden">
        <ProfessionalLogo size="sm" />
      </div>
      <div className="hidden sm:block">
        <ProfessionalLogo size="lg" />
      </div>
    </Link>
  )
}