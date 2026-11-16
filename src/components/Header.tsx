'use client';

import React, { useState, useEffect } from 'react';

export function AbidMahmudLogo({
  className = '',
  height = 28,
}: {
  className?: string;
  height?: number | string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight text-[#0B0B0D] ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height, width: 'auto' }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0B0B0D] p-1 text-white shadow-sm"
        aria-hidden="true"
      >
        <svg viewBox="0 0 100 100" width="20" height="20" role="img" aria-hidden="true">
          <rect width="100" height="100" rx="28" fill="currentColor" opacity="0.1" />
          <path d="M26 72L50 24L74 72H60L50 48L40 72H26Z" fill="currentColor" />
          <circle cx="50" cy="62" r="5" fill="#5846f6" />
        </svg>
      </span>
      <span className="tracking-tight text-[#0B0B0D]">
        Abid<span className="text-[#5846f6]">Mahmud</span>
      </span>
    </div>
  );
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      {/* Floating Translucent Navigation Bar matching abidmahmud.cv */}
      <header
        className={`fixed top-3 md:top-4 left-3 right-3 md:left-0 md:right-0 md:mx-auto z-50 flex h-16 md:w-[min(1400px,calc(100%-2rem))] max-w-[1400px] items-center justify-between rounded-full border border-[#0B0B0D]/10 px-4 sm:px-6 md:px-8 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300 motion-reduce:transition-none ${
          isScrolled
            ? 'bg-white/75 backdrop-blur-md shadow-md'
            : 'bg-white/90 backdrop-blur-md shadow-sm'
        }`}
      >
        <a
          aria-label="Abid Mahmud Home"
          className="text-[#0B0B0D] transition-opacity hover:opacity-85 shrink-0"
          href="https://www.abidmahmud.cv/"
        >
          <AbidMahmudLogo height={28} />
        </a>

        {/* Center Pill Menu for Desktop */}
        <ul className="hidden items-center gap-1 rounded-full border border-[#0B0B0D]/10 bg-[#0B0B0D]/[0.03] p-1 md:flex">
          <li>
            <a
              className="flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-[#0B0B0D]/75 transition-colors hover:bg-[#0B0B0D]/[0.06] hover:text-[#0B0B0D]"
              href="https://www.abidmahmud.cv/#work"
            >
              Work
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-[#0B0B0D]/75 transition-colors hover:bg-[#0B0B0D]/[0.06] hover:text-[#0B0B0D]"
              href="https://www.abidmahmud.cv/services"
            >
              Services
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-[#0B0B0D]/75 transition-colors hover:bg-[#0B0B0D]/[0.06] hover:text-[#0B0B0D]"
              href="https://www.abidmahmud.cv/#process"
            >
              Process
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-[#0B0B0D]/75 transition-colors hover:bg-[#0B0B0D]/[0.06] hover:text-[#0B0B0D]"
              href="https://www.abidmahmud.cv/about"
            >
              About
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-[#0B0B0D]/75 transition-colors hover:bg-[#0B0B0D]/[0.06] hover:text-[#0B0B0D]"
              href="https://www.abidmahmud.cv/blog"
            >
              Blog
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-semibold text-[#5846f6] bg-[#0B0B0D]/[0.06] transition-colors hover:text-[#0B0B0D]"
              href="https://tools.abidmahmud.cv/"
            >
              Tools
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center rounded-full px-3.5 py-1.5 text-sm font-medium text-[#0B0B0D]/75 transition-colors hover:bg-[#0B0B0D]/[0.06] hover:text-[#0B0B0D]"
              href="https://www.abidmahmud.cv/#reviews"
            >
              Reviews
            </a>
          </li>
        </ul>

        {/* Right CTA and Mobile Hamburger */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a
            className="hidden rounded-full border border-[#0B0B0D]/15 px-3.5 py-1.5 text-xs font-mono font-medium text-[#0B0B0D] transition-colors hover:border-[#0B0B0D]/40 sm:inline-flex items-center gap-1.5 min-h-[44px]"
            href="https://www.upwork.com/freelancers/~0196a016d6dd8f59af"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Upwork Top Rated
          </a>
          <a
            className="hidden rounded-full bg-[#0B0B0D] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 sm:inline-flex items-center min-h-[44px]"
            href="https://www.abidmahmud.cv/#contact"
          >
            Start a project
          </a>
          <button
            type="button"
            className="relative flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-[#0B0B0D]/20 text-[#0B0B0D] md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5846f6]"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span
              className={`absolute h-0.5 w-5 bg-[#0B0B0D] transition-transform duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-1.5'
              }`}
            ></span>
            <span
              className={`absolute h-0.5 w-5 bg-[#0B0B0D] transition-transform duration-300 ${
                isMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-1.5'
              }`}
            ></span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu - Solid white panel matching abidmahmud.cv */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-label="Mobile navigation"
        aria-hidden={!isMenuOpen}
        className={`fixed inset-x-3 top-[76px] z-40 flex h-[calc(100dvh-5.5rem)] flex-col justify-between overflow-y-auto overscroll-contain rounded-3xl border border-[#0B0B0D]/10 bg-white px-6 py-8 shadow-2xl transition-[opacity,visibility] duration-300 md:hidden ${
          isMenuOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
        }`}
      >
        <ul className="space-y-2">
          <li>
            <a
              className="flex min-h-[44px] items-center font-display text-2xl font-bold text-[#0B0B0D] hover:text-[#5846f6]"
              href="https://www.abidmahmud.cv/#work"
              onClick={closeMenu}
            >
              Work
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center font-display text-2xl font-bold text-[#0B0B0D] hover:text-[#5846f6]"
              href="https://www.abidmahmud.cv/services"
              onClick={closeMenu}
            >
              Services &amp; Pricing
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center font-display text-2xl font-bold text-[#0B0B0D] hover:text-[#5846f6]"
              href="https://www.abidmahmud.cv/#process"
              onClick={closeMenu}
            >
              Process
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center font-display text-2xl font-bold text-[#0B0B0D] hover:text-[#5846f6]"
              href="https://www.abidmahmud.cv/about"
              onClick={closeMenu}
            >
              About
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center font-display text-2xl font-bold text-[#0B0B0D] hover:text-[#5846f6]"
              href="https://www.abidmahmud.cv/blog"
              onClick={closeMenu}
            >
              Insights &amp; Guides
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center font-display text-2xl font-bold text-[#5846f6]"
              href="https://tools.abidmahmud.cv/"
              onClick={closeMenu}
            >
              Free Tools
            </a>
          </li>
          <li>
            <a
              className="flex min-h-[44px] items-center font-display text-2xl font-bold text-[#0B0B0D] hover:text-[#5846f6]"
              href="https://www.abidmahmud.cv/#reviews"
              onClick={closeMenu}
            >
              Client Reviews
            </a>
          </li>
        </ul>

        <div className="space-y-3 pt-6 border-t border-[#0B0B0D]/10">
          <a
            className="flex min-h-[48px] items-center justify-center gap-2 rounded-full border border-[#0B0B0D]/15 py-3 font-mono text-sm text-[#0B0B0D] hover:border-[#0B0B0D]"
            href="https://www.upwork.com/freelancers/~0196a016d6dd8f59af"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Upwork Profile (Top Rated · 100% Success)
          </a>
          <a
            className="flex min-h-[48px] items-center justify-center rounded-full bg-[#0B0B0D] py-3.5 font-semibold text-white hover:bg-[#5846f6] transition-colors"
            href="https://www.abidmahmud.cv/#contact"
            onClick={closeMenu}
          >
            Start a project
          </a>
        </div>
      </div>
    </>
  );
}
