import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SkipLink } from '@/frontend/components/layout/SkipLink';
import { Header } from '@/frontend/components/layout/Header';
import { Footer } from '@/frontend/components/layout/Footer';

export const metadata: Metadata = {
  title: 'PlanCraft AI - Production GenAI Event Planning Assistant',
  description:
    'Organize weddings, birthdays, and community events with AI-powered budgets, milestones, vendor checklists, and personalized ideas.',
  authors: [{ name: 'PlanCraft AI Team' }]
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#4361ee'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased">
        <SkipLink />
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
