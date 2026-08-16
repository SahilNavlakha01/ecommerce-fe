"use client"

import Link from "next/link"
import ProfessionalLogo from "../ui/ProfessionalLogo"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center flex-shrink-0 transition-opacity duration-200 hover:opacity-90">
      <div className="sm:hidden">
        <ProfessionalLogo size="sm" showText />
      </div>
      <div className="hidden sm:block">
        <ProfessionalLogo size="lg" showText />
      </div>
    </Link>
  )
}