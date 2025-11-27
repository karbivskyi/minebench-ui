import type { Metadata } from 'next';
import LandingPageClient from './LandingPageClient';

export const metadata: Metadata = {
  title: 'Minebench - Hardware Benchmarking Platform with Blockchain Rewards',
  description: 'Comprehensive benchmarking platform for cryptocurrency mining hardware. Compare GPU and CPU performance with transparent results and earn blockchain-based rewards on Solana.',
  openGraph: {
    title: 'Minebench - Hardware Benchmarking Platform',
    description: 'Comprehensive benchmarking platform for cryptocurrency mining hardware. Compare GPU and CPU performance with transparent results and earn blockchain-based rewards on Solana.',
    url: 'https://minebench.cloud',
    siteName: 'Minebench',
    images: [
      {
        url: 'https://minebench.cloud/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Minebench - Hardware Benchmarking Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Minebench - Hardware Benchmarking Platform',
    description: 'Comprehensive benchmarking platform for cryptocurrency mining hardware. Compare GPU and CPU performance with transparent results.',
    images: ['https://minebench.cloud/og-home.png'],
    creator: '@MineBenchdapp',
  },
};

export default function LandingPage() {
  return <LandingPageClient />;
}
