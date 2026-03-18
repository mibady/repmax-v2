'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Resources', href: '/resources' },
  { label: 'Blog', href: '/blog' },
  { label: 'Camp Series', href: '/repmax-camp-series', gold: true },
  { label: 'Login', href: '/login' },
];

interface PublicNavProps {
  showBack?: boolean;
  cta?: { label: string; href: string; external?: boolean };
}

export default function PublicNav({ showBack = true, cta }: PublicNavProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ctaLabel = cta?.label ?? 'Get Your Free RepMax ID';
  const ctaHref = cta?.href ?? '/signup';
  const ctaExternal = cta?.external ?? false;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background-dark/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="flex items-center justify-center rounded-md p-1.5 text-text-grey hover:text-white transition-colors mr-1"
                aria-label="Go back"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
            )}
            <Link href="/" className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined">sports_football</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">REPMAX</h2>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.gold
                    ? 'text-primary hover:text-primary-hover'
                    : 'text-text-grey hover:text-white'
                }`}
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {ctaExternal ? (
            <a
              href={ctaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105"
            >
              {ctaLabel}
            </a>
          ) : (
            <Link
              href={ctaHref}
              className="hidden md:flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-[#050505] transition-all hover:bg-primary-hover hover:scale-105"
            >
              {ctaLabel}
            </Link>
          )}
          <button
            className="flex md:hidden text-white"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-background-dark/95 backdrop-blur-md md:hidden">
          <div className="flex items-center justify-between px-6 h-20">
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/20 text-primary">
                <span className="material-symbols-outlined">sports_football</span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">REPMAX</h2>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex flex-col items-center gap-8 pt-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                className={`text-lg font-medium ${link.gold ? 'text-primary' : 'text-white'}`}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {ctaExternal ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 rounded-md bg-primary px-8 py-3 text-base font-bold text-[#050505]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={ctaHref}
                className="mt-4 rounded-md bg-primary px-8 py-3 text-base font-bold text-[#050505]"
                onClick={() => setMobileMenuOpen(false)}
              >
                {ctaLabel}
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
