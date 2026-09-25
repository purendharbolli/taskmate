import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { BottomNav } from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'TaskMate — Hyperlocal Campus Student Marketplace',
  description:
    'Students helping students. Earn from your free time. Find legitimate campus assistance, handwriting, lab records, diagrams, PPTs, and errands.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-taskOffWhite text-taskBlack flex flex-col font-sans selection:bg-taskYellow selection:text-black">
        {/* Global Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-12">
          {children}
        </main>

        {/* Mobile Sticky Bottom Navigation */}
        <BottomNav />
      </body>
    </html>
  );
}
