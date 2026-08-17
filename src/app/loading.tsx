export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f6] font-sans">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-14 h-14 border-3 border-rose-100 border-t-rose-900 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-14 h-14 border-3 border-transparent border-t-amber-400 rounded-full animate-ping mx-auto opacity-40"></div>
        </div>
        <h2 className="text-lg font-serif font-bold text-stone-900 mb-1 tracking-tight">NS Collection</h2>
        <p className="text-xs text-stone-500 tracking-wider uppercase font-medium">Crafting your fashion experience...</p>
      </div>
    </div>
  )
}