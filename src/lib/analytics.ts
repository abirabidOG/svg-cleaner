// Google Analytics 4 Integration & Event Tracker for SVG Optimizer & Cleaner

export const GA_MEASUREMENT_ID =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GA_ID) ||
  'G-ZF1FSM8N07';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Track an SVG optimization event
 */
export function trackSvgOptimized(params: {
  original_bytes: number;
  cleaned_bytes: number;
  savings_percent: number;
  preset: 'safe' | 'maximum' | 'custom';
}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', 'svg_optimized', {
      original_bytes: params.original_bytes,
      cleaned_bytes: params.cleaned_bytes,
      savings_percent: params.savings_percent,
      preset: params.preset,
      tool: 'svg-cleaner',
    });
  } catch (err) {
    console.debug('[Analytics] Failed to track svg_optimized', err);
  }
}

/**
 * Track an SVG or ZIP download event.
 * Easily marked as a key conversion event in Google Analytics 4.
 */
export function trackDownloadSvgClean(params: {
  format: 'svg' | 'zip';
  files_count: number;
  total_savings_bytes?: number;
}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  try {
    window.gtag('event', 'download_svg_clean', {
      format: params.format,
      files_count: params.files_count,
      total_savings_bytes: params.total_savings_bytes,
      tool: 'svg-cleaner',
      value: 1, // Conversion value
    });
  } catch (err) {
    console.debug('[Analytics] Failed to track download_svg_clean', err);
  }
}

/**
 * Phase 2 Events
 */
export function trackCodePasted(codeLength: number) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', 'code_pasted', {
      code_length: codeLength,
      tool: 'svg-cleaner',
    });
  } catch (err) {
    console.debug('[Analytics] Failed to track code_pasted', err);
  }
}

export function trackSvgToPng(size: number, background: 'transparent' | 'white') {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', 'svg_to_png', {
      raster_size: size,
      background,
      tool: 'svg-cleaner',
    });
  } catch (err) {
    console.debug('[Analytics] Failed to track svg_to_png', err);
  }
}

export function trackPresetChanged(presetName: string) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  try {
    window.gtag('event', 'preset_changed', {
      preset: presetName,
      tool: 'svg-cleaner',
    });
  } catch (err) {
    console.debug('[Analytics] Failed to track preset_changed', err);
  }
}
