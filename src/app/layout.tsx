import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export const metadata: Metadata = {
  title: 'Vel PTA Management System',
  description: 'Parent-Teacher Association Management System for Vel Elementary School',
  keywords: ['PTA', 'school management', 'payments', 'education'],
  authors: [{ name: 'Vel Elementary School' }],
  robots: 'noindex, nofollow', // Private school system
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        <ErrorBoundary>
          <div id="root" className="h-full">
            {children}
          </div>
        </ErrorBoundary>
        <div id="modal-root" />
        <div id="toast-root" />
      </body>
    </html>
  );
}