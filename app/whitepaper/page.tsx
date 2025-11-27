import type { Metadata } from 'next';
import WhitepaperClient from './WhitepaperClient';

export const metadata: Metadata = {
    title: 'Whitepaper - Minebench | Decentralized Hardware Benchmarking on Solana',
    description: 'The decentralized standard for hardware benchmarking on Solana. Learn about Minebench architecture, tokenomics, and our vision for transparent mining hardware performance testing.',
    openGraph: {
        title: 'Whitepaper - Minebench',
        description: 'The decentralized standard for hardware benchmarking on Solana. Learn about our architecture, tokenomics, and vision.',
        url: 'https://minebench.cloud/whitepaper',
        siteName: 'Minebench',
        images: [
            {
                url: 'https://minebench.cloud/og-whitepaper.png',
                width: 1200,
                height: 630,
                alt: 'Minebench Whitepaper - Decentralized Benchmarking',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Whitepaper - Minebench',
        description: 'The decentralized standard for hardware benchmarking on Solana. Learn about our architecture, tokenomics, and vision.',
        images: ['https://minebench.cloud/og-whitepaper.png'],
        creator: '@MineBenchdapp',
    },
};

export default function Whitepaper() {
    return <WhitepaperClient />;
}
