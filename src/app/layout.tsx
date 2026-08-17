import type { Metadata } from "next";
import ReduxProvider from '../components/ReduxProvider';
import { ToastProvider } from '../components/ui/Toast';
import ScrollToTopButton from '../components/ScrollToTopButton';
import ServerWarmupInit from '../components/ServerWarmupInit';
import { Suspense } from 'react';
import { defaultMetadata, organizationSchema, SITE_URL } from '../lib/seo.config';
import NextTopLoader from 'nextjs-toploader';
import "./globals.css";

export const metadata: Metadata = defaultMetadata;

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-WTJ8BQG5');`,
          }}
        />
        {/* Google Ads */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18214469187"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18214469187');
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,300;1,400;1,600;1,700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,600;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="dns-prefetch" href="//localhost:5000" />
        <link rel="dns-prefetch" href="//jwellerybackend-production.up.railway.app" />
        <link rel="canonical" href={SITE_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className="font-sans antialiased font-smooth bg-[#faf9f6] text-[#18181b]">
        <NextTopLoader color="#be123c" showSpinner={false} height={3} shadow="0 0 10px #be123c,0 0 5px #e11d48" />
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WTJ8BQG5" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        <ReduxProvider>
          <ServerWarmupInit />
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#faf9f6]">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-rose-100 border-t-rose-900"></div>
                  <div className="absolute inset-0 rounded-full h-12 w-12 border-2 border-transparent border-t-amber-400 animate-ping opacity-30"></div>
                </div>
                <p className="text-xs font-bold tracking-widest uppercase text-stone-600">Loading NS Collection...</p>
              </div>
            </div>
          }>
            {children}
          </Suspense>
          <ToastProvider />
          <ScrollToTopButton />
        </ReduxProvider>
      </body>
    </html>
  )
}