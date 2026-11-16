'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  UploadCloud,
  Check,
  Copy,
  Download,
  FileArchive,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  X,
  FileCode,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  type CleaningOptions,
  type OptimizeResult,
  DEFAULT_SAFE_OPTIONS,
  MAXIMUM_OPTIONS,
  optimizeSvgString,
  formatBytes,
} from '../lib/svgOptimizer';
import { SAMPLE_SVG_CONTENT, SAMPLE_SVG_NAME } from '../lib/sampleSvg';
import { trackSvgOptimized, trackDownloadSvgClean } from '../lib/analytics';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_FILES = 20;

interface UploadedSvgFile {
  id: string;
  name: string;
  originalRaw: string;
  result: OptimizeResult;
}

export default function SvgOptimizerTool() {
  const [files, setFiles] = useState<UploadedSvgFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [options, setOptions] = useState<CleaningOptions>(DEFAULT_SAFE_OPTIONS);
  const [preset, setPreset] = useState<'safe' | 'maximum' | 'custom'>('safe');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active file
  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0] || null;
  }, [files, activeFileId]);

  // Clear copied notification after 2 seconds
  useEffect(() => {
    if (!copiedCode) return;
    const timer = setTimeout(() => setCopiedCode(false), 2000);
    return () => clearTimeout(timer);
  }, [copiedCode]);

  // Recalculate optimization on active file or all files when options change
  const reoptimizeFiles = useCallback(
    (targetOptions: CleaningOptions, currentFiles: UploadedSvgFile[]) => {
      return currentFiles.map((f) => {
        try {
          const result = optimizeSvgString(f.originalRaw, targetOptions);
          return { ...f, result };
        } catch {
          return f;
        }
      });
    },
    []
  );

  const handlePresetSelect = (newPreset: 'safe' | 'maximum') => {
    setPreset(newPreset);
    const newOptions = newPreset === 'safe' ? DEFAULT_SAFE_OPTIONS : MAXIMUM_OPTIONS;
    setOptions(newOptions);
    setFiles((prev) => reoptimizeFiles(newOptions, prev));

    if (activeFile) {
      trackSvgOptimized({
        original_bytes: activeFile.result.originalBytes,
        cleaned_bytes: activeFile.result.cleanedBytes,
        savings_percent: activeFile.result.savingsPercent,
        preset: newPreset,
      });
    }
  };

  const handleOptionToggle = (key: keyof CleaningOptions) => {
    setPreset('custom');
    const newOptions: CleaningOptions = {
      ...options,
      [key]: !options[key],
    };
    setOptions(newOptions);
    setFiles((prev) => reoptimizeFiles(newOptions, prev));
  };

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      setErrorMessage(null);
      const incoming = Array.from(fileList);

      if (files.length + incoming.length > MAX_FILES) {
        setErrorMessage(`You can upload a maximum of ${MAX_FILES} SVGs at once.`);
        return;
      }

      const newUploadedFiles: UploadedSvgFile[] = [];

      for (const file of incoming) {
        if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
          setErrorMessage(`"${file.name}" is not an SVG file. Please upload SVG files only.`);
          return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          setErrorMessage(
            `"${file.name}" is over 5 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 5 MB.`
          );
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const rawText = e.target?.result as string;
          try {
            const result = optimizeSvgString(rawText, options);
            const item: UploadedSvgFile = {
              id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              name: file.name,
              originalRaw: rawText,
              result,
            };

            setFiles((prev) => {
              const updated = [...prev, item];
              if (!activeFileId) setActiveFileId(item.id);
              return updated;
            });

            trackSvgOptimized({
              original_bytes: result.originalBytes,
              cleaned_bytes: result.cleanedBytes,
              savings_percent: result.savingsPercent,
              preset,
            });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid SVG content';
            setErrorMessage(`Failed to process "${file.name}": ${msg}`);
          }
        };
        reader.readAsText(file);
      }
    },
    [files.length, activeFileId, options, preset]
  );

  const handleSampleClick = () => {
    setErrorMessage(null);
    try {
      const result = optimizeSvgString(SAMPLE_SVG_CONTENT, options);
      const sampleItem: UploadedSvgFile = {
        id: `sample-${Date.now()}`,
        name: SAMPLE_SVG_NAME,
        originalRaw: SAMPLE_SVG_CONTENT,
        result,
      };

      setFiles([sampleItem]);
      setActiveFileId(sampleItem.id);

      trackSvgOptimized({
        original_bytes: result.originalBytes,
        cleaned_bytes: result.cleanedBytes,
        savings_percent: result.savingsPercent,
        preset,
      });
    } catch {
      setErrorMessage('Could not load sample SVG.');
    }
  };

  const handleDownloadSingle = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.result.cleanedSvg], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanName = activeFile.name.replace(/\.svg$/i, '') + '-cleaned.svg';
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    trackDownloadSvgClean({
      format: 'svg',
      files_count: 1,
      total_savings_bytes: activeFile.result.savingsBytes,
    });
  };

  const handleDownloadAllZip = async () => {
    if (files.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      let totalSavings = 0;

      files.forEach((f) => {
        const cleanName = f.name.replace(/\.svg$/i, '') + '-cleaned.svg';
        zip.file(cleanName, f.result.cleanedSvg);
        totalSavings += f.result.savingsBytes;
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cleaned-svgs-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      trackDownloadSvgClean({
        format: 'zip',
        files_count: files.length,
        total_savings_bytes: totalSavings,
      });
    } catch {
      setErrorMessage('Failed to create ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = () => {
    if (!activeFile) return;
    const code = activeFile.result.cleanedSvg;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedCode(true);
  };

  const handleRemoveFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearAll = () => {
    setFiles([]);
    setActiveFileId(null);
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasAggressiveActive =
    options.roundCoordinates ||
    options.shortenIds ||
    options.removeDimensionsKeepViewBox ||
    options.minifyCode;

  return (
    <div className="w-full">
      {/* Error notification banner */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 flex items-start justify-between rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-900 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="rounded-lg p-1 text-red-600 hover:bg-red-100 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      {files.length === 0 ? (
        /* Empty Upload Zone */
        <div className="rounded-3xl border border-[#E5E1D6] bg-white p-6 sm:p-10 shadow-sm">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-14 text-center transition-all ${
              isDragging
                ? 'border-[#1F8C7F] bg-[#EBF7F5]'
                : 'border-[#E5E1D6] hover:border-[#1F8C7F] hover:bg-[#F4F2EC]/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFiles(e.target.files);
                }
              }}
            />

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F2EC] text-[#1F8C7F] mb-5 shadow-2xs">
              <UploadCloud className="h-8 w-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0B0B0D]">
              Drop your SVG files here
            </h3>
            <p className="mt-2 text-sm text-[#4F4E55] max-w-md mx-auto">
              Accepts <strong className="text-[#0B0B0D]">SVG</strong> up to 5 MB each.
              Upload up to 20 files at once for batch cleaning.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0B0B0D] hover:bg-[#1F8C7F] text-white px-6 py-2.5 text-sm font-semibold transition-all shadow-sm"
              >
                Browse SVG Files
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSampleClick();
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-[#E5E1D6] bg-white hover:bg-[#F4F2EC] px-5 py-2.5 text-sm font-semibold text-[#0B0B0D] transition-all shadow-2xs"
              >
                <Sparkles className="h-4 w-4 text-[#1F8C7F]" />
                Try a sample SVG
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Workspace with Batch Files & Optimization Controls */
        <div className="space-y-8">
          {/* Top Batch Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E5E1D6] bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F4F2EC] text-[#1F8C7F]">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0B0B0D]">
                  {files.length} {files.length === 1 ? 'SVG File' : 'SVG Files'} Loaded
                </p>
                <p className="text-xs text-[#4F4E55]">
                  Select an SVG below to inspect Before and After previews
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {files.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-[#E5E1D6] bg-white hover:bg-[#F4F2EC] px-3.5 py-1.5 text-xs font-semibold text-[#0B0B0D] transition-all shadow-2xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add more</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClearAll}
                className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 px-3 py-1.5 text-xs font-semibold transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear all</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFiles(e.target.files);
                  }
                }}
              />
            </div>
          </div>

          {/* Filmstrip Selector (when multiple files) */}
          {files.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
              {files.map((f) => {
                const isActive = f.id === activeFile?.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setActiveFileId(f.id)}
                    className={`group relative shrink-0 cursor-pointer rounded-2xl border-2 p-2.5 transition-all flex items-center gap-3 ${
                      isActive
                        ? 'border-[#1F8C7F] bg-[#EBF7F5]'
                        : 'border-[#E5E1D6] bg-white hover:border-[#4F4E55]'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-[#E5E1D6] flex items-center justify-center p-1">
                      <div
                        className="h-full w-full flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: f.result.cleanedSvg }}
                      />
                    </div>
                    <div className="text-left pr-2">
                      <p className="text-xs font-bold text-[#0B0B0D] max-w-[130px] truncate">
                        {f.name}
                      </p>
                      <p className="text-[11px] font-mono text-[#1F8C7F] font-semibold">
                        -{f.result.savingsPercent}% saved
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFile(f.id, e)}
                      className="opacity-0 group-hover:opacity-100 rounded-full p-1 text-[#4F4E55] hover:text-red-600 transition-opacity"
                      aria-label={`Remove ${f.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cleaning Options & Presets Panel */}
          <div className="rounded-3xl border border-[#E5E1D6] bg-[#F4F2EC] p-5 sm:p-7 shadow-xs space-y-6">
            {/* Presets Toggle Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E1D6]">
              <div>
                <h4 className="text-base font-bold text-[#0B0B0D]">
                  Cleaning Options &amp; Presets
                </h4>
                <p className="text-xs text-[#4F4E55]">
                  Select a preset or customize individual rules below
                </p>
              </div>

              <div className="inline-flex rounded-xl border border-[#E5E1D6] bg-white p-1 shadow-2xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => handlePresetSelect('safe')}
                  className={`min-h-[36px] rounded-lg px-4 text-xs font-bold transition-all ${
                    preset === 'safe'
                      ? 'bg-[#0B0B0D] text-white shadow-xs'
                      : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                  }`}
                >
                  Safe (Recommended)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect('maximum')}
                  className={`min-h-[36px] rounded-lg px-4 text-xs font-bold transition-all ${
                    preset === 'maximum'
                      ? 'bg-[#1F8C7F] text-white shadow-xs'
                      : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                  }`}
                >
                  Maximum
                </button>
              </div>
            </div>

            {/* Checkbox Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Safe Options Column */}
              <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B0B0D]">
                    Safe Rules (Zero Visual Risk)
                  </p>
                </div>

                {[
                  {
                    key: 'removeComments' as const,
                    label: 'Remove XML comments',
                    desc: 'Strips generator headers & developer remarks',
                  },
                  {
                    key: 'removeMetadata' as const,
                    label: 'Remove XML metadata & doctype',
                    desc: 'Strips <metadata>, <?xml ...?>, and <!DOCTYPE>',
                  },
                  {
                    key: 'removeEditorData' as const,
                    label: 'Remove editor data',
                    desc: 'Illustrator, Inkscape & Figma proprietary tags',
                  },
                  {
                    key: 'removeEmptyGroups' as const,
                    label: 'Remove empty groups',
                    desc: 'Deletes redundant empty <g> containers',
                  },
                  {
                    key: 'removeHiddenElements' as const,
                    label: 'Remove hidden elements',
                    desc: 'Removes display="none" and opacity="0" nodes',
                  },
                  {
                    key: 'removeUnusedDefs' as const,
                    label: 'Remove unused defs',
                    desc: 'Deletes unreferenced gradients, clips & filters',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={options[item.key]}
                      onChange={() => handleOptionToggle(item.key)}
                      className="mt-0.5 h-4 w-4 rounded border-[#E5E1D6] text-[#1F8C7F] focus:ring-[#1F8C7F]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0B0B0D] group-hover:text-[#1F8C7F] transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#4F4E55]">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Aggressive Options Column */}
              <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 space-y-3.5 shadow-2xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-[#0B0B0D]">
                    Aggressive Rules (Maximum Savings)
                  </p>
                </div>

                {[
                  {
                    key: 'roundCoordinates' as const,
                    label: 'Round coordinates to 2 decimal places',
                    desc: 'Rounds bloated 8-digit floating points in paths',
                  },
                  {
                    key: 'shortenIds' as const,
                    label: 'Shorten IDs',
                    desc: 'Replaces long UUIDs with minimal characters',
                  },
                  {
                    key: 'removeDimensionsKeepViewBox' as const,
                    label: 'Remove width/height (keep viewBox)',
                    desc: 'Enables responsive vector fluid scaling',
                  },
                  {
                    key: 'minifyCode' as const,
                    label: 'Minify code',
                    desc: 'Collapses whitespace & line breaks',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={options[item.key]}
                      onChange={() => handleOptionToggle(item.key)}
                      className="mt-0.5 h-4 w-4 rounded border-[#E5E1D6] text-[#1F8C7F] focus:ring-[#1F8C7F]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0B0B0D] group-hover:text-[#1F8C7F] transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-[#4F4E55]">{item.desc}</p>
                    </div>
                  </label>
                ))}

                {/* Aggressive Warning Callout */}
                {hasAggressiveActive && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 text-xs flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Aggressive may change very small details. Check the preview
                      before you download.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active File Optimization Stats Banner */}
          {activeFile && (
            <div className="rounded-3xl border border-[#E5E1D6] bg-white p-5 sm:p-7 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E5E1D6]">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-md bg-[#EBF7F5] px-2.5 py-1 text-xs font-mono font-bold text-[#1F8C7F] mb-1.5">
                    <span>
                      {formatBytes(activeFile.result.originalBytes)} &rarr;{' '}
                      {formatBytes(activeFile.result.cleanedBytes)} ({activeFile.result.savingsPercent}% smaller)
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0B0B0D] truncate">
                    {activeFile.name}
                  </h3>
                  <p className="text-xs text-[#4F4E55]">
                    Reduced code payload by {formatBytes(activeFile.result.savingsBytes)} •{' '}
                    {activeFile.result.elementCountBefore} &rarr;{' '}
                    {activeFile.result.elementCountAfter} elements
                  </p>
                </div>

                {/* Primary Export Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#E5E1D6] bg-white hover:bg-[#F4F2EC] px-4 py-2 text-xs font-semibold text-[#0B0B0D] transition-all shadow-2xs"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Code Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-[#4F4E55]" />
                        <span>Copy Cleaned SVG Code</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSingle}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-[#0B0B0D] hover:bg-[#1F8C7F] text-white px-5 py-2 text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Cleaned SVG</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#E5E1D6] bg-white hover:bg-[#F4F2EC] px-4 py-2 text-xs font-bold text-[#0B0B0D] transition-all shadow-2xs"
                  >
                    <FileArchive className="h-4 w-4 text-[#1F8C7F]" />
                    <span>{isZipping ? 'Zipping...' : files.length > 1 ? `Download All (${files.length}) as ZIP` : 'Download All as ZIP'}</span>
                  </button>
                </div>
              </div>

              {/* Side-by-Side Synchronized Visual Comparison */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3 px-1">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#4F4E55] font-semibold">
                    Visual Diff: Before vs. After
                  </p>
                  <p className="text-xs text-[#4F4E55]">
                    Checkerboard confirms transparent background &amp; zero visual shift
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Before Preview */}
                  <div className="rounded-2xl border border-[#E5E1D6] bg-white p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#4F4E55]">
                        Original (Before)
                      </span>
                      <span className="text-xs font-mono text-[#4F4E55]">
                        {formatBytes(activeFile.result.originalBytes)} •{' '}
                        {activeFile.result.elementCountBefore} elements
                      </span>
                    </div>
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl border border-[#E5E1D6] bg-transparency-grid flex items-center justify-center p-4">
                      <div
                        className="h-full w-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:w-auto"
                        dangerouslySetInnerHTML={{ __html: activeFile.originalRaw }}
                      />
                    </div>
                  </div>

                  {/* After Preview */}
                  <div className="rounded-2xl border-2 border-[#1F8C7F]/30 bg-white p-4 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-[#1F8C7F]">
                        Cleaned (After)
                      </span>
                      <span className="text-xs font-mono text-[#1F8C7F] font-bold">
                        {formatBytes(activeFile.result.cleanedBytes)} (-{activeFile.result.savingsPercent}%) •{' '}
                        {activeFile.result.elementCountAfter} elements
                      </span>
                    </div>
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl border border-[#E5E1D6] bg-transparency-grid flex items-center justify-center p-4">
                      <div
                        className="h-full w-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:w-auto"
                        dangerouslySetInnerHTML={{ __html: activeFile.result.cleanedSvg }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Privacy Badge */}
      <div className="mt-8 flex items-center justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#E5E1D6] bg-[#F4F2EC] px-4 py-2 text-xs font-medium text-[#4F4E55]">
          <ShieldCheck className="h-4 w-4 text-[#1F8C7F]" />
          <span>
            100% private. Your SVG is processed in your browser and never uploaded.
          </span>
        </div>
      </div>
    </div>
  );
}
