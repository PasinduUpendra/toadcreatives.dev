import type { Metadata, Viewport } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';
import { bodyFont, displayFont } from './fonts';
import { projects } from '@/content/projects';
import { BASED_IN, FIRST_YEAR, SITES_SHIPPED } from '@/content/site';

const SITE_URL = 'https://toadcreatives.dev';
const SITE_NAME = 'Toad Creatives';
const SITE_DESCRIPTION = `Pasindu Upendra — freelance web developer based in ${BASED_IN}. Building websites, apps, e-commerce and AI automation since ${FIRST_YEAR}, with ${SITES_SHIPPED} sites shipped.`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Web developer in ${BASED_IN}`,
    template: '%s | Toad Creatives',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: 'Pasindu Upendra', url: SITE_URL }],
  creator: 'Pasindu Upendra',
  publisher: SITE_NAME,
  category: 'technology',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Web developer in ${BASED_IN}`,
    description: SITE_DESCRIPTION,
    locale: 'en_IE',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Web developer in ${BASED_IN}`,
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
  icons: { icon: '/favicon.ico', shortcut: '/favicon.ico' },
  formatDetection: { email: false, address: false, telephone: false },
  // Site-ownership verification for Google Search Console and Bing Webmaster
  // Tools. Set these in Vercel's environment variables and redeploy — the tags
  // only render when a value is present, so nothing is emitted until then.
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { 'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // maximumScale/userScalable were pinned, which blocks pinch-zoom and fails
  // WCAG 1.4.4. Visitors get their zoom back.
  themeColor: '#050505',
  colorScheme: 'dark',
};

/**
 * Emitted into the server-rendered HTML rather than injected by next/script
 * afterInteractive, so it is present on first byte for crawlers that do not
 * execute JavaScript.
 */
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Pasindu Upendra',
      url: SITE_URL,
      jobTitle: 'Web developer',
      description: SITE_DESCRIPTION,
      address: { '@type': 'PostalAddress', addressCountry: BASED_IN },
      knowsAbout: [
        'Web development',
        'Next.js',
        'React',
        'Flutter',
        'Shopify',
        'WooCommerce',
        'WordPress',
        'AI automation',
        'n8n',
      ],
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#business`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      founder: { '@id': `${SITE_URL}/#person` },
      foundingDate: String(FIRST_YEAR),
      areaServed: 'Worldwide',
      address: { '@type': 'PostalAddress', addressCountry: BASED_IN },
      email: 'hello@toadcreatives.dev',
      slogan: 'One person from first sketch to production.',
      availableLanguage: 'en',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { '@id': `${SITE_URL}/#business` },
      inLanguage: 'en',
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE_URL}/#work`,
      name: 'Selected work',
      itemListElement: projects.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'CreativeWork',
          name: `${project.name} — ${project.title}`,
          description: project.summary,
          dateCreated: project.year,
          creator: { '@id': `${SITE_URL}/#person` },
          image: `${SITE_URL}${project.cover}`,
          ...(project.liveUrl ? { url: project.liveUrl } : {}),
        },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          // Server-rendered, so it lands in the initial HTML.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${bodyFont.className} antialiased`}>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
