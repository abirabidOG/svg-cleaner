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
  Trash2,
  Table,
  Image as ImageIcon,
  FolderOpen,
  Code2,
} from 'lucide-react';
import JSZip from 'jszip';
import {
  type CleaningOptions,
  type OptimizeResult,
  PRESET_OPTIONS,
  DEFAULT_SAFE_OPTIONS,
  MAXIMUM_OPTIONS,
  optimizeSvgString,
  rasterizeSvgToPng,
  getFilesFromDataTransfer,
  formatBytes,
} from '../lib/svgOptimizer';
import { SAMPLE_SVG_CONTENT, SAMPLE_SVG_NAME } from '../lib/sampleSvg';
import {
  trackSvgOptimized,
  trackDownloadSvgClean,
  trackCodePasted,
  trackSvgToPng,
  trackPresetChanged,
} from '../lib/analytics';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 50;

interface UploadedSvgFile {
  id: string;
  name: string;
  originalRaw: string;
  result: OptimizeResult;
}

export default function SvgOptimizerTool() {
  const [files, setFiles] = useState<UploadedSvgFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [options, setOptions] = useState<CleaningOptions>(PRESET_OPTIONS.web);
  const [activePreset, setActivePreset] = useState<'web' | 'icon' | 'print' | 'custom'>('web');

  // Input Mode: File Upload vs Direct Code Paste
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload');
  const [pastedCode, setPastedCode] = useState<string>('');

  // View Mode: Preview vs Code View vs Results Table
  const [activeViewTab, setActiveViewTab] = useState<'preview' | 'code' | 'table'>('preview');

  // PNG Rasterizer Options (Phase 2)
  const [pngDimension, setPngDimension] = useState<512 | 1024 | 2000>(1024);
  const [pngBackground, setPngBackground] = useState<'transparent' | 'white'>('transparent');
  const [isRasterizing, setIsRasterizing] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Active file
  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0] || null;
  }, [files, activeFileId]);

  // Clear toast after 2.5s
  useEffect(() => {
    if (!copiedCode && !feedbackToast) return;
    const timer = setTimeout(() => {
      setCopiedCode(false);
      setFeedbackToast(null);
    }, 2500);
    return () => clearTimeout(timer);
  }, [copiedCode, feedbackToast]);

  // Re-optimize all files when options change
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

  const handlePresetSelect = (presetKey: 'web' | 'icon' | 'print') => {
    setActivePreset(presetKey);
    const newOptions = PRESET_OPTIONS[presetKey];
    setOptions(newOptions);
    setFiles((prev) => reoptimizeFiles(newOptions, prev));
    trackPresetChanged(presetKey);

    if (activeFile) {
      trackSvgOptimized({
        original_bytes: activeFile.result.originalBytes,
        cleaned_bytes: activeFile.result.cleanedBytes,
        savings_percent: activeFile.result.savingsPercent,
        preset: 'custom',
      });
    }
  };

  const handleOptionToggle = (key: keyof CleaningOptions) => {
    setActivePreset('custom');
    const newOptions: CleaningOptions = {
      ...options,
      [key]: !options[key],
    };
    setOptions(newOptions);
    setFiles((prev) => reoptimizeFiles(newOptions, prev));
  };

  // Process incoming raw file list
  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      setErrorMessage(null);
      const incoming = Array.from(fileList);

      if (files.length + incoming.length > MAX_FILES) {
        setErrorMessage(`You can upload a maximum of ${MAX_FILES} SVGs at once.`);
        return;
      }

      const newUploadedFiles: UploadedSvgFile[] = [];

      for (const file of incoming) {
        if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          setErrorMessage(
            `"${file.name}" is over 10 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed is 10 MB.`
          );
          return;
        }

        const text = await file.text();
        try {
          const result = optimizeSvgString(text, options);
          newUploadedFiles.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name: file.name,
            originalRaw: text,
            result,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to parse SVG';
          setErrorMessage(`Error in "${file.name}": ${msg}`);
        }
      }

      if (newUploadedFiles.length > 0) {
        setFiles((prev) => {
          const updated = [...prev, ...newUploadedFiles];
          if (!activeFileId) setActiveFileId(newUploadedFiles[0].id);
          return updated;
        });
        setFeedbackToast(`Processed ${newUploadedFiles.length} SVG file${newUploadedFiles.length > 1 ? 's' : ''}!`);
      }
    },
    [files.length, options, activeFileId]
  );

  // Folder drag & drop handler (Phase 2)
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer) {
      try {
        const extractedFiles = await getFilesFromDataTransfer(e.dataTransfer);
        if (extractedFiles.length > 0) {
          await handleFiles(extractedFiles);
        } else if (e.dataTransfer.files.length > 0) {
          await handleFiles(e.dataTransfer.files);
        }
      } catch {
        if (e.dataTransfer.files.length > 0) {
          await handleFiles(e.dataTransfer.files);
        }
      }
    }
  };

  // Direct Code Paste Handler (Phase 2)
  const handleProcessPastedCode = () => {
    if (!pastedCode.trim()) {
      setErrorMessage('Please paste valid SVG markup into the textarea.');
      return;
    }

    try {
      const result = optimizeSvgString(pastedCode.trim(), options);
      const newFile: UploadedSvgFile = {
        id: `pasted-${Date.now()}`,
        name: `pasted-icon-${files.length + 1}.svg`,
        originalRaw: pastedCode.trim(),
        result,
      };

      setFiles((prev) => [newFile, ...prev]);
      setActiveFileId(newFile.id);
      trackCodePasted(pastedCode.length);
      setFeedbackToast('Cleaned pasted SVG successfully!');
      setPastedCode('');
      setInputMode('upload');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid SVG code';
      setErrorMessage(msg);
    }
  };

  const handleLoadSample = () => {
    try {
      const result = optimizeSvgString(SAMPLE_SVG_CONTENT, options);
      const sampleItem: UploadedSvgFile = {
        id: 'sample-icon',
        name: SAMPLE_SVG_NAME,
        originalRaw: SAMPLE_SVG_CONTENT,
        result,
      };
      setFiles([sampleItem]);
      setActiveFileId(sampleItem.id);
      setFeedbackToast('Loaded sample SVG vector with editor metadata.');
    } catch {
      setErrorMessage('Could not load sample SVG.');
    }
  };

  // Copy SVG Code
  const handleCopyCode = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.result.cleanedSvg);
    setCopiedCode(true);
    setFeedbackToast('Optimized SVG code copied to clipboard!');
  };

  // Download Single SVG
  const handleDownloadSingleSvg = (fileItem: UploadedSvgFile) => {
    const blob = new Blob([fileItem.result.cleanedSvg], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileItem.name.replace(/\.svg$/i, '') + '-cleaned.svg';
    a.click();
    URL.revokeObjectURL(url);

    trackDownloadSvgClean({
      format: 'svg',
      files_count: 1,
      total_savings_bytes: fileItem.result.savingsBytes,
    });
  };

  // SVG to PNG Rasterizer (Phase 2)
  const handleRasterizePng = async () => {
    if (!activeFile) return;
    setIsRasterizing(true);
    try {
      const blob = await rasterizeSvgToPng(activeFile.result.cleanedSvg, pngDimension, pngBackground);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeFile.name.replace(/\.svg$/i, '')}-${pngDimension}px.png`;
      a.click();
      URL.revokeObjectURL(url);
      trackSvgToPng(pngDimension, pngBackground);
      setFeedbackToast(`Exported ${pngDimension}px PNG (${pngBackground})!`);
    } catch (err) {
      setErrorMessage('Failed to rasterize SVG to PNG.');
    } finally {
      setIsRasterizing(false);
    }
  };

  // Download All as ZIP
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
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cleaned-svgs.zip';
      a.click();
      URL.revokeObjectURL(url);

      trackDownloadSvgClean({
        format: 'zip',
        files_count: files.length,
        total_savings_bytes: totalSavings,
      });

      setFeedbackToast(`Downloaded ${files.length} cleaned SVGs in ZIP!`);
    } catch {
      setErrorMessage('Could not generate ZIP archive.');
    } finally {
      setIsZipping(false);
    }
  };

  // Total summary calculations
  const totalOriginalBytes = files.reduce((acc, f) => acc + f.result.originalBytes, 0);
  const totalCleanedBytes = files.reduce((acc, f) => acc + f.result.cleanedBytes, 0);
  const totalSavedBytes = Math.max(0, totalOriginalBytes - totalCleanedBytes);
  const totalSavingsPercent =
    totalOriginalBytes > 0 ? Math.round((totalSavedBytes / totalOriginalBytes) * 100) : 0;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".svg,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...({ webkitdirectory: '', directory: '' } as any)}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Hero Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#5846F6]/10 px-3.5 py-1 text-xs font-bold text-[#5846F6] border border-[#5846F6]/20">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Phase 2 Enhanced • Web / Icon / Print Presets • SVG to PNG Rasterizer</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0B0B0D]">
          Free SVG Optimizer & Cleaner
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#4F4E55] leading-relaxed">
          Strip illustrator metadata, comments, unused IDs, and unneeded tags. Minify code or pretty-print,
          view line numbers, and rasterize to PNG directly in your browser.
        </p>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 font-semibold">{errorMessage}</div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-500">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {feedbackToast && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-900 shadow-xs">
          <Check className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-semibold">{feedbackToast}</div>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="rounded-3xl border border-[#C9C7C1] bg-white p-5 sm:p-7 md:p-8 shadow-xs space-y-8">
        {/* Upload Zone / Direct Paste Tabs (Phase 2) */}
        {files.length === 0 ? (
          <div className="space-y-4">
            {/* Input Mode Switcher */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-xl border border-[#C9C7C1]">
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    inputMode === 'upload'
                      ? 'bg-[#5846F6] text-white shadow-xs'
                      : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                  }`}
                >
                  Upload SVG Files
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('paste')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    inputMode === 'paste'
                      ? 'bg-[#5846F6] text-white shadow-xs'
                      : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                  }`}
                >
                  Paste SVG Code
                </button>
              </div>
            </div>

            {inputMode === 'upload' ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all ${
                  isDragging
                    ? 'border-[#5846F6] bg-[#5846F6]/5 scale-[1.01]'
                    : 'border-[#C9C7C1] bg-[#F4F2EC]/40 hover:bg-[#F4F2EC] hover:border-[#5846F6]'
                }`}
              >
                <div className="max-w-md mx-auto space-y-4">
                  <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-white text-[#5846F6] shadow-xs border border-[#C9C7C1]">
                    <UploadCloud className="h-8 w-8" />
                  </div>

                  <div className="space-y-1">
                    <p className="text-base sm:text-lg font-bold text-[#0B0B0D]">
                      Drag and drop SVG files or folders
                    </p>
                    <p className="text-xs sm:text-sm text-[#4F4E55]">
                      Folder drag-and-drop supported • Up to 50 SVGs, 10 MB each
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#5846F6] hover:bg-[#4735E2] text-white px-6 py-3 text-sm font-bold shadow-md cursor-pointer"
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>Browse Files</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => folderInputRef.current?.click()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#C9C7C1] bg-white hover:bg-[#F4F2EC] text-[#0B0B0D] px-5 py-3 text-sm font-semibold shadow-2xs"
                    >
                      <FolderOpen className="h-4 w-4 text-[#5846F6]" />
                      <span>Select Folder</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLoadSample}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-[#C9C7C1] bg-white hover:bg-[#F4F2EC] text-[#0B0B0D] px-5 py-3 text-sm font-semibold shadow-2xs"
                    >
                      <Sparkles className="h-4 w-4 text-[#5846F6]" />
                      <span>Try Sample</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Direct SVG Code Paste Textarea (Phase 2) */
              <div className="rounded-2xl border border-[#C9C7C1] bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#0B0B0D] flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-[#5846F6]" />
                    <span>Paste Raw SVG Markup:</span>
                  </label>
                  <span className="text-[11px] text-[#4F4E55]">
                    {pastedCode.length} characters
                  </span>
                </div>

                <textarea
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  placeholder="<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>...</svg>"
                  rows={8}
                  className="w-full rounded-xl border border-[#C9C7C1] p-3 text-xs font-mono text-[#0B0B0D] focus:border-[#5846F6] outline-hidden resize-y"
                />

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPastedCode('')}
                    className="text-xs text-[#4F4E55] hover:text-[#0B0B0D]"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessPastedCode}
                    className="inline-flex items-center gap-2 rounded-full bg-[#5846F6] hover:bg-[#4735E2] text-white px-5 py-2.5 text-xs font-bold shadow-md"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Clean Pasted SVG</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* WORKSPACE WITH LOADED SVGS */
          <div className="space-y-6">
            {/* Top Toolbar: Presets & View Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C9C7C1] pb-4">
              {/* Presets: Web / Icon / Print (Phase 2) */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-[#4F4E55]">
                  Presets:
                </span>
                <div className="flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-xl border border-[#C9C7C1]">
                  {(['web', 'icon', 'print'] as ('web' | 'icon' | 'print')[]).map((pKey) => (
                    <button
                      key={pKey}
                      type="button"
                      onClick={() => handlePresetSelect(pKey)}
                      className={`px-3 py-1 text-xs font-bold uppercase rounded-lg transition-all ${
                        activePreset === pKey
                          ? 'bg-[#5846F6] text-white shadow-xs'
                          : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                      }`}
                    >
                      {pKey}
                    </button>
                  ))}
                </div>
              </div>

              {/* View Switcher: Preview, Code View with Line Numbers, Results Table */}
              <div className="flex items-center gap-1 bg-[#F4F2EC] p-1 rounded-xl border border-[#C9C7C1]">
                <button
                  type="button"
                  onClick={() => setActiveViewTab('preview')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeViewTab === 'preview'
                      ? 'bg-white text-[#5846F6] shadow-2xs'
                      : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                  }`}
                >
                  Visual Preview
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('code')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeViewTab === 'code'
                      ? 'bg-white text-[#5846F6] shadow-2xs'
                      : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                  }`}
                >
                  Cleaned Code View
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('table')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    activeViewTab === 'table'
                      ? 'bg-white text-[#5846F6] shadow-2xs'
                      : 'text-[#4F4E55] hover:text-[#0B0B0D]'
                  }`}
                >
                  Results Table ({files.length})
                </button>
              </div>

              {/* Add More & Clear */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#C9C7C1] bg-white px-3 py-1.5 text-xs font-bold text-[#0B0B0D] hover:bg-[#F4F2EC]"
                >
                  <UploadCloud className="h-3.5 w-3.5 text-[#5846F6]" />
                  <span>Add More</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFiles([]);
                    setActiveFileId(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            {/* TAB 1: VISUAL PREVIEW & TOGGLES */}
            {activeViewTab === 'preview' && activeFile && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left: Preview Canvas & File Selection */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-2xl border border-[#C9C7C1] bg-white p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#0B0B0D] truncate max-w-[200px]">
                        {activeFile.name}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Saved {activeFile.result.savingsPercent}%
                      </span>
                    </div>

                    {/* SVG Render Box */}
                    <div
                      className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#C9C7C1] bg-transparency-grid flex items-center justify-center p-6"
                      dangerouslySetInnerHTML={{ __html: activeFile.result.cleanedSvg }}
                    />

                    {/* Size and Savings Readout */}
                    <div className="flex items-center justify-between text-xs text-[#4F4E55] pt-1">
                      <span>Before: <strong>{formatBytes(activeFile.result.originalBytes)}</strong></span>
                      <ArrowRight className="h-3.5 w-3.5 text-neutral-400" />
                      <span>After: <strong className="text-emerald-700">{formatBytes(activeFile.result.cleanedBytes)}</strong></span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#C9C7C1] bg-white hover:border-[#5846F6] hover:text-[#5846F6] text-[#0B0B0D] py-2 text-xs font-bold transition-all shadow-2xs"
                      >
                        {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedCode ? 'Copied' : 'Copy SVG'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingleSvg(activeFile)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#5846F6] hover:bg-[#4735E2] text-white py-2 text-xs font-bold transition-all shadow-xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>

                  {/* SVG to PNG Rasterizer Box (Phase 2) */}
                  <div className="rounded-2xl border border-[#C9C7C1] bg-[#F4F2EC] p-5 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0B0B0D] flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-[#5846F6]" />
                      <span>Export as High-Res PNG</span>
                    </span>

                    <div className="grid grid-cols-3 gap-2">
                      {([512, 1024, 2000] as (512 | 1024 | 2000)[]).map((dim) => (
                        <button
                          key={dim}
                          type="button"
                          onClick={() => setPngDimension(dim)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            pngDimension === dim
                              ? 'border-[#5846F6] bg-white text-[#5846F6] shadow-2xs'
                              : 'border-[#C9C7C1] bg-white/70 text-[#4F4E55] hover:bg-white'
                          }`}
                        >
                          {dim}px
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPngBackground('transparent')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                            pngBackground === 'transparent' ? 'bg-white border-[#5846F6] text-[#5846F6]' : 'border-[#C9C7C1] text-[#4F4E55]'
                          }`}
                        >
                          Transparent
                        </button>
                        <button
                          type="button"
                          onClick={() => setPngBackground('white')}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                            pngBackground === 'white' ? 'bg-white border-[#5846F6] text-[#5846F6]' : 'border-[#C9C7C1] text-[#4F4E55]'
                          }`}
                        >
                          White Bg
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleRasterizePng}
                        disabled={isRasterizing}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B0B0D] hover:bg-[#5846F6] text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                      >
                        {isRasterizing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                        <span>PNG</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Optimization Toggles & Breakdown */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Removal Breakdown Summary Card */}
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 flex items-center justify-between gap-3 text-emerald-900 text-xs">
                    <div>
                      <p className="font-bold">Breakdown of Cleaned Assets:</p>
                      <p className="text-emerald-800 mt-0.5">{activeFile.result.removals.summary}</p>
                    </div>
                  </div>

                  {/* Cleaning Options Checklist */}
                  <div className="rounded-2xl border border-[#C9C7C1] bg-white p-6 space-y-5 shadow-xs">
                    <h3 className="text-sm font-extrabold text-[#0B0B0D]">
                      Optimization Settings & Advanced Toggles
                    </h3>

                    <div className="space-y-3">
                      {[
                        { key: 'removeComments', label: 'Remove XML & editor comments', desc: 'Safely removes comment lines' },
                        { key: 'removeMetadata', label: 'Strip <metadata>, <title>, <desc>', desc: 'Removes non-visual metadata' },
                        { key: 'removeEditorData', label: 'Remove Illustrator / Figma / Inkscape data', desc: 'Strips proprietary namespace attributes' },
                        { key: 'removeEmptyGroups', label: 'Remove empty <g> groups', desc: 'Cleans nested empty tags' },
                        { key: 'removeHiddenElements', label: 'Remove hidden elements (display:none)', desc: 'Strips unused invisible shapes' },
                        { key: 'removeUnusedDefs', label: 'Remove unused <defs> and gradients', desc: 'Cleans unreferenced resources' },
                        { key: 'minifyStyles', label: 'Minify CSS styles & inline styles', desc: 'Compresses whitespace in stylesheets' },
                        { key: 'removeDimensionsKeepViewBox', label: 'Remove width/height (Keep viewBox)', desc: 'Makes SVG responsively scalable' },
                        { key: 'roundCoordinates', label: 'Round path coordinates to 2 decimals', desc: 'Reduces precision float bloat' },
                        { key: 'prettyPrint', label: 'Pretty-print formatted XML with indentation', desc: 'Formats readable multi-line code' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-[#F4F2EC] transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={!!options[item.key as keyof CleaningOptions]}
                            onChange={() => handleOptionToggle(item.key as keyof CleaningOptions)}
                            className="mt-1 h-4 w-4 rounded border-[#C9C7C1] text-[#5846F6] focus:ring-[#5846F6] cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#0B0B0D] block">{item.label}</span>
                            <span className="text-[11px] text-[#4F4E55]">{item.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CLEANED CODE VIEW WITH LINE NUMBERS (Phase 2) */}
            {activeViewTab === 'code' && activeFile && (
              <div className="rounded-3xl border border-[#C9C7C1] bg-white p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-[#5846F6]" />
                    <span className="text-xs font-bold text-[#0B0B0D]">
                      Cleaned Code: {activeFile.name}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#5846F6] hover:bg-[#4735E2] text-white px-4 py-1.5 text-xs font-bold shadow-xs transition-all"
                  >
                    {copiedCode ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                {/* Monospace Code Box with Line Numbers */}
                <div className="rounded-2xl border border-[#C9C7C1] bg-[#0B0B0D] text-neutral-200 p-4 font-mono text-xs max-h-[500px] overflow-y-auto flex">
                  {/* Line Numbers Column */}
                  <div className="select-none text-neutral-600 pr-4 text-right border-r border-neutral-800 space-y-1">
                    {activeFile.result.cleanedSvg.split('\n').map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Code Column */}
                  <pre className="pl-4 whitespace-pre-wrap break-all flex-1 text-emerald-400">
                    <code>{activeFile.result.cleanedSvg}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 3: RESULTS TABLE WITH BREAKDOWN (Phase 2) */}
            {activeViewTab === 'table' && (
              <div className="rounded-3xl border border-[#C9C7C1] bg-white p-6 space-y-4 shadow-xs overflow-x-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#C9C7C1]">
                  <div>
                    <h3 className="text-sm font-extrabold text-[#0B0B0D]">Batch Optimization Table</h3>
                    <p className="text-xs text-[#4F4E55]">Detailed breakdown of removals per file</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isZipping}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#5846F6] hover:bg-[#4735E2] text-white px-4 py-2 text-xs font-bold shadow-md"
                  >
                    {isZipping ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FileArchive className="h-3.5 w-3.5" />}
                    <span>Download All (ZIP)</span>
                  </button>
                </div>

                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#C9C7C1] text-[#4F4E55] uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">File Name</th>
                      <th className="py-2.5 px-3">Original</th>
                      <th className="py-2.5 px-3">Cleaned</th>
                      <th className="py-2.5 px-3">Saved</th>
                      <th className="py-2.5 px-3">Removal Breakdown</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#C9C7C1]/50">
                    {files.map((item) => (
                      <tr key={item.id} className="hover:bg-[#F4F2EC]/50">
                        <td className="py-3 px-3 font-semibold text-[#0B0B0D] max-w-[180px] truncate">
                          {item.name}
                        </td>
                        <td className="py-3 px-3 font-mono text-[#4F4E55]">
                          {formatBytes(item.result.originalBytes)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          {formatBytes(item.result.cleanedBytes)}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-600">
                          {item.result.savingsPercent}%
                        </td>
                        <td className="py-3 px-3 text-[11px] text-[#4F4E55]">
                          {item.result.removals.summary}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleDownloadSingleSvg(item)}
                            className="p-1.5 rounded-lg border border-[#C9C7C1] hover:border-[#5846F6] hover:text-[#5846F6] text-[#0B0B0D] bg-white inline-flex items-center"
                            title={`Download ${item.name}`}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Combined Total Row (Phase 2) */}
                    <tr className="bg-[#F4F2EC] font-bold text-[#0B0B0D]">
                      <td className="py-3 px-3 uppercase text-[11px]">Total ({files.length} SVGs)</td>
                      <td className="py-3 px-3 font-mono">{formatBytes(totalOriginalBytes)}</td>
                      <td className="py-3 px-3 font-mono text-emerald-700">{formatBytes(totalCleanedBytes)}</td>
                      <td className="py-3 px-3 text-emerald-700">{totalSavingsPercent}% Saved</td>
                      <td className="py-3 px-3 text-[11px] text-[#4F4E55]">
                        Combined savings: {formatBytes(totalSavedBytes)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={handleDownloadAllZip}
                          className="text-xs text-[#5846F6] underline"
                        >
                          ZIP All
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRIVACY BADGE */}
      <div className="rounded-2xl border border-[#C9C7C1] bg-white p-4 text-center max-w-xl mx-auto flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold text-[#0B0B0D]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#5846F6]" />
        <span>100% private. All SVG parsing and optimization runs client-side in your browser.</span>
      </div>
    </div>
  );
}
