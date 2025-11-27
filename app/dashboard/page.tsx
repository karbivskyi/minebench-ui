import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard - Minebench | Real-time Mining Hardware Analytics',
  description: 'View real-time mining hardware performance analytics. Track hashrate, efficiency, and benchmark results from thousands of devices worldwide.',
  openGraph: {
    title: 'Dashboard - Minebench',
    description: 'Real-time mining hardware performance analytics. Track hashrate, efficiency, and benchmark results.',
    url: 'https://minebench.cloud/dashboard',
    siteName: 'Minebench',
    images: [
      {
        url: 'https://minebench.cloud/og-dashboard.png',
        width: 1200,
        height: 630,
        alt: 'Minebench Dashboard - Real-time Analytics',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dashboard - Minebench',
    description: 'Real-time mining hardware performance analytics. Track hashrate, efficiency, and benchmark results.',
    images: ['https://minebench.cloud/og-dashboard.png'],
    creator: '@MineBenchdapp',
  },
};

export default function Dashboard() {
  return <DashboardClient />;
}
