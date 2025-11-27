import type { Metadata } from 'next';
import DownloadsPageClient from './DownloadsPageClient';

export const metadata: Metadata = {
  title: 'Downloads - Minebench | Get CPU & GPU Benchmark Clients',
  description: 'Download the latest MineBench clients for CPU and GPU benchmarking. Optimized for Windows with support for Zephyr and Ravencoin algorithms.',
  openGraph: {
    title: 'Downloads - Minebench',
    description: 'Get the latest MineBench clients for CPU and GPU benchmarking. Optimized for Windows.',
    url: 'https://minebench.cloud/downloads',
    siteName: 'Minebench',
    images: [
      {
        url: 'https://minebench.cloud/og-downloads.png',
        width: 1200,
        height: 630,
        alt: 'Minebench Downloads - CPU & GPU Clients',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Downloads - Minebench',
    description: 'Get the latest MineBench clients for CPU and GPU benchmarking. Optimized for Windows.',
    images: ['https://minebench.cloud/og-downloads.png'],
    creator: '@MineBenchdapp',
  },
};

export default function DownloadsPage() {
  return <DownloadsPageClient />;
}
