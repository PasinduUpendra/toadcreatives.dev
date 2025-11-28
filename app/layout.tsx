// FILE: app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { bodyFont } from './fonts';


export const metadata: Metadata = {
  title: 'Toad Creatives',
  description: 'Hybrid nature × tech motion',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${bodyFont.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
