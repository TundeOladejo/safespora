import type { Metadata } from "next";
import { Geist, Geist_Mono, Figtree } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const figtree = Figtree({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://safespora.com'),
  title: {
    default: 'SafeSpora - Real-Time Community Safety Alerts in Nigeria',
    template: '%s | SafeSpora'
  },
  description: 'SafeSpora helps Nigerians stay informed about security incidents near their neighborhoods, daily routes, and places they care about — in real time. Join the waitlist for early access.',
  keywords: [
    'Nigeria safety', 
    'security alerts', 
    'community safety', 
    'neighborhood watch', 
    'Lagos security', 
    'Abuja safety', 
    'real-time alerts', 
    'Nigeria security information',
    'safety awareness',
    'community reporting'
  ],
  authors: [{ name: 'SafeSpora Team', url: 'https://safespora.com/' }],
  creator: 'SafeSpora',
  publisher: 'SafeSpora',
  formatDetection: {
    email: false,
    address: true,
    telephone: false,
  },
  
  // Open Graph for social sharing
  openGraph: {
    title: 'SafeSpora - Real-Time Community Safety Alerts in Nigeria',
    description: 'Know what\'s happening before you get there. Real-time safety alerts for Nigerian neighborhoods, routes, and communities.',
    url: 'https://safespora.com',
    siteName: 'SafeSpora',
    images: [
      {
        url: '/og-image.jpg', // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'SafeSpora - Community Safety Alerts',
      },
    ],
    locale: 'en_NG',
    type: 'website',
  },
  
  // Twitter card
  twitter: {
    card: 'summary_large_image',
    title: 'SafeSpora - Real-Time Community Safety Alerts in Nigeria',
    description: 'Know what\'s happening before you get there. Real-time safety alerts for Nigerian neighborhoods.',
    images: ['/twitter-image.jpg'], // Add this image to your public folder
    creator: '@safespora',
    site: '@safespora',
  },
  
  // Robots directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Icons and manifest
  icons: {
    icon: [
      { url: '/safespora-white.png' },
      { url: '/safespora-white.png', sizes: '16x16', type: 'image/png' },
      { url: '/safespora-white.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/safespora-white.png' },
      { url: '/safespora-white.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#ef4444',
      },
    ],
  },
  
  // Canonical URL
  alternates: {
    canonical: 'https://safespora.com',
    languages: {
      'en-NG': 'https://safespora.com',
    },
  },
  
  // Category and classification
  category: 'safety',
  
  // Other useful meta tags
  other: {
    'geo.region': 'NG',
    'geo.placename': 'Nigeria',
    'geo.position': '9.081999;8.675277', // Nigeria's approximate center
    'ICBM': '9.081999, 8.675277',
    'og:country-name': 'Nigeria',
    'fb:app_id': 'your-facebook-app-id', // Optional: for Facebook insights
    'twitter:site:region': 'NG',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Organization schema for rich snippets
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SafeSpora',
    url: 'https://safespora.com',
    logo: 'https://safespora.com/logo.png',
    description: 'Real-time community safety alerts for Nigerian neighborhoods and routes.',
    areaServed: {
      '@type': 'Country',
      name: 'Nigeria',
    },
    sameAs: [
      'https://twitter.com/safespora',
      'https://facebook.com/safespora',
      'https://instagram.com/safespora',
      'https://linkedin.com/company/safespora',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'founders@safespora.com',
      contactType: 'customer support',
      availableLanguage: ['English'],
    },
  }

  // WebSite schema for search results
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SafeSpora',
    url: 'https://safespora.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://safespora.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html 
      lang="en-NG" 
      className={figtree.variable}
      dir="ltr"
    >
      <head>
        {/* Preconnect to important domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS Prefetch for faster resolution */}
        <link rel="dns-prefetch" href="https://api.safespora.com" />
        <link rel="dns-prefetch" href="https://images.safespora.com" />
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        
        {/* Website Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        
        {/* Theme color for browser UI */}
        <meta name="theme-color" content="#ef4444" />
        <meta name="msapplication-TileColor" content="#ef4444" />
        
        {/* Mobile viewport optimization */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="SafeSpora" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans min-h-screen flex flex-col`}
      >
        {/* Skip to main content link for accessibility */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-600 text-white px-4 py-2 rounded-md z-50">
          Skip to main content
        </a>
        
        {/* Main content */}
        <main id="main-content" className="flex-grow">
          {children}
        </main>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right" 
          richColors 
          closeButton
          theme="light"
        />
      </body>
    </html>
  );
}