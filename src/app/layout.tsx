import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aurora - Your Career Co-Pilot',
  description: 'AI-powered career coaching and learning assistant for developers',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  themeColor: '#6366f1',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
