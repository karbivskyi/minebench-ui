import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Minebench - Mining Benchmark Dashboard',
  description: 'Comprehensive mining benchmark results dashboard with performance analytics',
  keywords: 'mining, benchmark, cryptocurrency, GPU, performance, analytics',
  authors: [{ name: 'Minebench Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
