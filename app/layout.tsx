import type { Metadata } from 'next';
import { plexSans, plexMono } from './fonts';
import './globals.css';

import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { CommandPaletteKeyboardListener, Providers } from './providers';
import { CommandPalette } from '@/components/command-palette';
import Script from 'next/script';

export const metadata: Metadata = { title: 'DevBoard', description: 'A calm, fast task tracker.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans">
        <NuqsAdapter>
          <Providers>
            <CommandPaletteKeyboardListener />
            <CommandPalette />
            {children}
          </Providers>
        </NuqsAdapter>

        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}