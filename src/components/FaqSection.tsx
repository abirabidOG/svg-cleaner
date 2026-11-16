'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from '../data/faqs';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mt-20 border-t border-[#E5E1D6] pt-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#1F8C7F] font-semibold mb-2">
            Frequently Asked Questions
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0B0D]">
            Got questions? We have answers.
          </h2>
          <p className="mt-2 text-sm text-[#4F4E55]">
            Everything you need to know about SVG optimization, cleaning options, and privacy.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-[#E5E1D6] bg-white transition-all overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition-colors hover:bg-[#F4F2EC]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F8C7F]"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-base sm:text-lg font-bold text-[#0B0B0D] pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#4F4E55] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#1F8C7F]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm sm:text-base leading-relaxed text-[#4F4E55] border-t border-[#E5E1D6]/60 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
