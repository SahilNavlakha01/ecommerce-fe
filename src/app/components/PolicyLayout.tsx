import EcommerceLayout from '../EcommerceLayout'

interface Section {
  title: string
  content: React.ReactNode
}

interface PolicyLayoutProps {
  title: string
  effectiveDate?: string
  intro?: string
  sections: Section[]
}

export default function PolicyLayout({ title, effectiveDate, intro, sections }: PolicyLayoutProps) {
  return (
    <EcommerceLayout>
      <div className="min-h-screen bg-white">

        {/* Header */}
        <div className="relative bg-[#026670] overflow-hidden">
          {/* subtle decorative rings */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full border border-white/10" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full border border-white/10" />

          <div className="relative w-full max-w-2xl mx-auto px-4 py-25 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
            {effectiveDate && (
              <p className="mt-2 text-sm text-white/60 ">Effective Date: {effectiveDate}</p>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          {intro && (
            <p className="text-gray-500 leading-relaxed mb-10 text-sm border-l-2 border-[#026670] pl-4">{intro}</p>
          )}

          <div className="space-y-8">
            {sections.map((section, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#026670] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">{section.title}</h2>
                </div>
                <div className="pl-9 text-sm text-gray-600 leading-relaxed space-y-2">
                  {section.content}
                </div>
                {i < sections.length - 1 && <hr className="mt-8 border-gray-100" />}
              </div>
            ))}
          </div>

          {/* Contact footer */}
          <div className="mt-12 rounded-xl border border-[#026670]/20 bg-[#026670]/5 p-5 text-sm text-gray-600">
            <p className="font-semibold text-[#026670] mb-2">Need help?</p>
            <p>
              Email:{' '}
              <a href="mailto:support@nscollection.com" className="text-[#026670] hover:underline font-medium">
                support@nscollection.com
              </a>
            </p>
            <p className="mt-1">
              WhatsApp:{' '}
              <a href="https://wa.me/916356701295" className="text-[#026670] hover:underline font-medium">
                +91 6356701295
              </a>
            </p>
          </div>
        </div>
      </div>
    </EcommerceLayout>
  )
}
