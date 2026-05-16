// FILE: app/layout.tsx
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { bodyFont } from './fonts';
import { SpeedInsights } from "@vercel/speed-insights/next"

const SITE_URL = 'https://toadcreatives.dev';
const SITE_NAME = 'Toad Creatives';
const SITE_DESCRIPTION =
  'Toad Creatives is Pasindu Upendra: a developer building websites, mobile apps, e-commerce, and AI automation for founders and small teams.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s | Toad Creatives',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  generator: 'Next.js',
  keywords: [
    'Toad Creatives',
    'Pasindu Upendra',
    'web development',
    'mobile app development',
    'e-commerce development',
    'AI automation',
    'Next.js developer',
    'freelance developer',
    'founders',
    'small teams',
  ],
  authors: [{ name: 'Pasindu Upendra', url: SITE_URL }],
  creator: 'Pasindu Upendra',
  publisher: 'Toad Creatives',
  category: 'technology',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
  colorScheme: 'dark',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Pasindu Upendra',
  url: SITE_URL,
  jobTitle: 'Developer',
  description: SITE_DESCRIPTION,
  brand: {
    '@type': 'Brand',
    name: SITE_NAME,
  },
  knowsAbout: [
    'Web Development',
    'Mobile App Development',
    'E-commerce',
    'AI Automation',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bodyFont.className} antialiased`}>
        <Script
          id="ld-json-person"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}

