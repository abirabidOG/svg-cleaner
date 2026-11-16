export interface FaqItem {
  question: string;
  answer: string;
}

export const FAQS: FaqItem[] = [
  {
    question: 'What is an SVG optimizer?',
    answer:
      'An SVG optimizer is a tool that removes unnecessary metadata, editor comments, empty groups, unreferenced definitions, and bloated coordinate precision from SVG files. It shrinks the file payload so vector graphics load significantly faster on websites, web apps, and mobile screens without altering visual appearance.',
  },
  {
    question: 'Will cleaning change how my SVG looks?',
    answer:
      'No. In Safe mode (the default), our optimizer only removes invisible bloat—such as Illustrator/Inkscape XML metadata, comments, empty groups, and hidden layers. The rendered visual geometry, gradients, colors, and viewBox remain identical. In Aggressive mode, coordinates are rounded to 2 decimal places, which is imperceptible on screens but provides maximum file reduction.',
  },
  {
    question: 'Is SVG Optimizer free?',
    answer:
      'Yes, SVG Optimizer & Cleaner is 100% free with no account creation, no subscriptions, no ads, no paywalls, and zero watermarks added to your files.',
  },
  {
    question: 'Can I use it for logos?',
    answer:
      'Absolutely! Brand logos exported from Adobe Illustrator, Figma, or Inkscape frequently contain hundreds of lines of editor bloat and unneeded namespace declarations. Cleaning your logo ensures crisp rendering, fast Core Web Vitals, and lightweight embed code.',
  },
  {
    question: 'Is my SVG uploaded anywhere?',
    answer:
      'No. Your SVG files never leave your computer or phone. All parsing, XML sanitization, and optimization happen strictly inside your browser using the client-side DOMParser API. Zero data is transmitted to any server.',
  },
];
