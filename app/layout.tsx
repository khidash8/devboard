// app/layout.tsx
import type { Metadata } from 'next';
import { plexSans, plexMono } from './fonts';
import './globals.css';

export const metadata: Metadata = { title: 'DevBoard', description: 'A calm, fast task tracker.' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}