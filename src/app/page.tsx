import SvgOptimizerTool from '../components/SvgOptimizerTool';
import SeoSection from '../components/SeoSection';
import FaqSection from '../components/FaqSection';
import { FAQS } from '../data/faqs';
import { Sparkles } from 'lucide-react';

export default function Home() {
  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const jsonLdApp = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SVG Optimizer & Cleaner — Clean and Shrink SVG Files Free',
    url: 'https://tools.abidmahmud.cv/svg-cleaner',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'All (Browser-based)',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Get a smaller, cleaner SVG in seconds. Free, no upload, your file never leaves your browser. Safe XML cleaning, Illustrator/Inkscape/Figma bloat removal, coordinate rounding, and batch ZIP export.',
    browserRequirements:
      'Requires modern browser with DOMParser support (Chrome, Safari, Firefox, Edge).',
    author: {
      '@type': 'Person',
      name: 'Abid Mahmud',
      url: 'https://www.abidmahmud.cv',
      jobTitle: 'Brand Identity Designer',
    },
  };

  return (
    <div className="space-y-12">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdApp) }}
      />

      {/* Hero Header */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF7F5] border border-[#B6E2DC] text-xs font-mono font-medium text-[#1F8C7F]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100% Client-Side • In-Browser DOMParser</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B0B0D]">
            SVG Optimizer &amp; Cleaner
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#4F4E55] leading-relaxed">
            Get a smaller, cleaner SVG in seconds. Free, no upload, your file never leaves your browser.
          </p>
        </div>

        {/* Main Interactive Tool */}
        <SvgOptimizerTool />
      </div>

      {/* SEO Content: Platform Guides & Common Uses */}
      <SeoSection />

      {/* FAQ Accordion */}
      <FaqSection />
    </div>
  );
}
