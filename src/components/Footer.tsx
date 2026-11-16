import React from 'react';
import { AbidMahmudLogo } from './Header';

export default function Footer() {
  const CURRENT_YEAR = new Date().getFullYear();

  return (
    <footer className="border-t border-[#0B0B0D]/10 bg-white mt-20">
      <div className="mx-auto max-w-[1400px] px-5 pt-16 md:px-10">
        {/* Brand Banner / CTA Bar */}
        <div className="mb-12 rounded-2xl border border-[#E5E1D6] bg-[#F4F2EC] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-bold text-[#0B0B0D]">
              Need a full brand identity? See Abid Mahmud&apos;s work
            </h4>
            <p className="text-xs sm:text-sm text-[#4F4E55]">
              Logos, vector systems, packaging, and digital identities crafted with mathematical grid restraint.
            </p>
          </div>
          <a
            href="https://www.abidmahmud.cv"
            className="inline-flex items-center justify-center rounded-xl bg-[#0B0B0D] hover:bg-[#1F8C7F] text-white px-5 py-3 text-xs sm:text-sm font-bold transition-all shadow-sm shrink-0"
          >
            Explore Portfolio &rarr;
          </a>
        </div>

        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <a href="https://www.abidmahmud.cv/" aria-label="Abid Mahmud Home">
              <AbidMahmudLogo height={28} className="text-[#0B0B0D]" />
            </a>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-[#0B0B0D]/75">
              SVG Optimizer &amp; Cleaner — Free image tools by{' '}
              <a
                href="https://www.abidmahmud.cv"
                className="text-[#1F8C7F] hover:underline font-medium"
              >
                Abid Mahmud, Brand Identity Designer — abidmahmud.cv
              </a>
            </p>
            <p className="mt-2 text-xs text-[#4F4E55]">
              8+ years of design discipline, 450+ delivered projects, and 100% Job Success on Upwork.
            </p>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0B0B0D] font-semibold">
              Navigation
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                  href="https://www.abidmahmud.cv/#work"
                >
                  Selected Work
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                  href="https://www.abidmahmud.cv/services"
                >
                  Services &amp; Pricing
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                  href="https://www.abidmahmud.cv/#process"
                >
                  Design Process
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                  href="https://www.abidmahmud.cv/about"
                >
                  About Me
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                  href="https://www.abidmahmud.cv/blog"
                >
                  Insights &amp; Guides
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#1F8C7F] inline-block py-0.5 font-medium text-[#1F8C7F]"
                  href="https://tools.abidmahmud.cv/"
                >
                  Free Tools Suite
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                  href="https://www.abidmahmud.cv/#reviews"
                >
                  Client Reviews
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                  href="https://www.abidmahmud.cv/#contact"
                >
                  Start a Project
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0B0B0D] font-semibold">
              Free Web Tools
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#1F8C7F] inline-block py-0.5 font-semibold text-[#1F8C7F]"
                  href="https://tools.abidmahmud.cv/svg-cleaner"
                >
                  SVG Optimizer &amp; Cleaner
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#1F8C7F] inline-block py-0.5"
                  href="https://tools.abidmahmud.cv/palette-extractor"
                >
                  Color Palette Extractor
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#1F8C7F] inline-block py-0.5"
                  href="https://tools.abidmahmud.cv/image-resizer"
                >
                  Image Resizer
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#1F8C7F] inline-block py-0.5"
                  href="https://tools.abidmahmud.cv/logo-kit"
                >
                  Logo File Kit
                </a>
              </li>
              <li>
                <a
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#1F8C7F] inline-block py-0.5"
                  href="https://tools.abidmahmud.cv/webptools"
                >
                  WEBPTools Converter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[#0B0B0D] font-semibold">
              Direct Links
            </p>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://www.upwork.com/freelancers/~0196a016d6dd8f59af"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] font-medium py-0.5"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Upwork Profile (Top Rated)
                </a>
              </li>
              <li>
                <a
                  href="https://calendly.com/abidmahmud/consultation-on-graphic-design-or-brand-development"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  Calendly Booking
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/8801521320097"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  WhatsApp: +880 1521 320097
                </a>
              </li>
              <li>
                <a
                  href="mailto:abir.abid.43@gmail.com"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  abir.abid.43@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/abidmahmudpro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://www.behance.net/abidmahmud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0B0B0D]/80 transition-colors hover:text-[#5846f6] inline-block py-0.5"
                >
                  Behance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-[#0B0B0D]/10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#0B0B0D]/70">
          <span>&copy; {CURRENT_YEAR} Abid Mahmud. All rights reserved.</span>
          <span>Crafted with mathematical vector precision · Dhaka, Bangladesh</span>
        </div>
      </div>
    </footer>
  );
}
