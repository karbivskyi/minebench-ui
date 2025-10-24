'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/public/img/minebench-logo.png';
import { Menu, X, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onRefresh?: () => void;
  lastUpdated?: Date;
  loading?: boolean;
}

export default function Header({ onRefresh, lastUpdated, loading }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', href: '/' },
    { name: 'Downloads', href: '/downloads' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Image src={Logo} alt="Minebench Logo" width={40} height={40} />
            <h1 className="text-xl font-bold text-gray-900">Minebench</h1>
          </div>
          </Link>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-mining-600 transition-colors"
              >
                {link.name}
              </Link>
            ))}

            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-mining-600 hover:bg-mining-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-mining-600"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col space-y-2 pb-4">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block text-gray-700 hover:text-mining-600 px-2 py-1"
              >
                {link.name}
              </Link>
            ))}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center space-x-2 bg-mining-600 hover:bg-mining-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
