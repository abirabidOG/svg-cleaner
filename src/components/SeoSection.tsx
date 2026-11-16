import { FileCode, Eye, Zap, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function SeoSection() {
  return (
    <section className="mt-20 border-t border-[#E5E1D6] bg-[#F4F2EC] py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Main H1 & Introduction */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E5E1D6] text-xs font-mono font-medium text-[#1F8C7F] mb-4 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#1F8C7F]" />
            100% In-Browser Vector Sanitization
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#0B0B0D]">
            Free SVG Optimizer &amp; Cleaner
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#4F4E55] leading-relaxed">
            Clean and shrink SVG vector files free online. Strip editor comments, remove hidden layers, and minify code while keeping the exact same crisp visual look.
          </p>
        </div>

        {/* Section 1: H2 - Get a smaller SVG that looks exactly the same */}
        <div className="mb-16 rounded-3xl border border-[#E5E1D6] bg-white p-8 sm:p-12 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0B0D] mb-4">
            Get a smaller SVG that looks exactly the same
          </h2>
          <p className="text-sm sm:text-base text-[#4F4E55] leading-relaxed mb-6">
            When you export an SVG from graphics software, the application injects extensive internal data intended for reloading the project later. Web browsers do not need this metadata to render your graphic. SVG Optimizer &amp; Cleaner strips invisible bloat with deterministic XML parsing, reducing file size by 30% to 75% without shifting a single visible curve or path.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#E5E1D6]">
            <div>
              <p className="font-bold text-[#0B0B0D] text-sm mb-1">Pixel-Perfect Fidelity</p>
              <p className="text-xs text-[#4F4E55] leading-relaxed">
                Safe mode only removes non-rendering tags and unreferenced code. Shapes, colors, and viewBox stay identical.
              </p>
            </div>
            <div>
              <p className="font-bold text-[#0B0B0D] text-sm mb-1">Instant Synchronized Diff</p>
              <p className="text-xs text-[#4F4E55] leading-relaxed">
                Compare Before and After side by side on a transparent checkerboard to confirm zero visual change.
              </p>
            </div>
            <div>
              <p className="font-bold text-[#0B0B0D] text-sm mb-1">Batch ZIP Archive</p>
              <p className="text-xs text-[#4F4E55] leading-relaxed">
                Drop up to 20 icons or illustrations at once and package all cleaned files into a single ZIP archive.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: H2 - Why SVG files from Illustrator are so heavy with 3 short points */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0B0B0D]">
              Why SVG files from Illustrator are so heavy
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#4F4E55]">
              Three hidden sources of code bloat that weigh down your vector assets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-[#E5E1D6] bg-white p-6 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F8C7F]/10 text-[#1F8C7F] mb-4">
                <FileCode className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-[#0B0B0D] mb-2">
                Editor metadata
              </h3>
              <p className="text-sm text-[#4F4E55] leading-relaxed">
                Illustrator and Inkscape embed full XML namespace declarations, XMP packets, generator credits, and proprietary editor tags (<code className="text-xs font-mono bg-[#F4F2EC] px-1 py-0.5 rounded text-[#0B0B0D]">i:pgf</code>) that add dozens of useless kilobytes.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E1D6] bg-white p-6 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F8C7F]/10 text-[#1F8C7F] mb-4">
                <Eye className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-[#0B0B0D] mb-2">
                Hidden layers
              </h3>
              <p className="text-sm text-[#4F4E55] leading-relaxed">
                Invisible draft layers, empty group containers (<code className="text-xs font-mono bg-[#F4F2EC] px-1 py-0.5 rounded text-[#0B0B0D]">&lt;g&gt;</code>), and unreferenced gradients or masks linger in your export code even when toggled off in the design document.
              </p>
            </div>

            <div className="rounded-2xl border border-[#E5E1D6] bg-white p-6 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F8C7F]/10 text-[#1F8C7F] mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg text-[#0B0B0D] mb-2">
                Extra decimals
              </h3>
              <p className="text-sm text-[#4F4E55] leading-relaxed">
                Software often outputs coordinate precision up to 6 or 8 decimal places (e.g., <code className="text-xs font-mono bg-[#F4F2EC] px-1 py-0.5 rounded text-[#0B0B0D]">24.81928374</code>). Rounding to 2 decimal places reduces path byte count dramatically without any visible difference.
              </p>
            </div>
          </div>
        </div>

        {/* Cross-Promotion Banners to WEBPTools, Logo File Kit, Image Resizer, and Color Palette Extractor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#1F8C7F] font-semibold mb-1">
                Image Compression
              </p>
              <h4 className="font-bold text-[#0B0B0D] text-sm mb-1">
                Need lighter images too? Try WEBPTools
              </h4>
              <p className="text-xs text-[#4F4E55] leading-relaxed">
                Batch convert PNG, JPG and SVG to modern WebP.
              </p>
            </div>
            <a
              href="https://tools.abidmahmud.cv/webptools"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F8C7F] hover:text-[#176E64] transition-colors"
            >
              Open WEBPTools <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#1F8C7F] font-semibold mb-1">
                Brand Logo Resizer
              </p>
              <h4 className="font-bold text-[#0B0B0D] text-sm mb-1">
                Need the right logo files too? Try Logo File Kit
              </h4>
              <p className="text-xs text-[#4F4E55] leading-relaxed">
                Export transparent PNGs, favicons &amp; 2000px print masters.
              </p>
            </div>
            <a
              href="https://tools.abidmahmud.cv/logo-kit"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F8C7F] hover:text-[#176E64] transition-colors"
            >
              Open Logo File Kit <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#1F8C7F] font-semibold mb-1">
                Social &amp; Blog Resizer
              </p>
              <h4 className="font-bold text-[#0B0B0D] text-sm mb-1">
                Need the right image size too? Try Image Resizer
              </h4>
              <p className="text-xs text-[#4F4E55] leading-relaxed">
                Resize for Pinterest, Instagram, Etsy &amp; blog headers.
              </p>
            </div>
            <a
              href="https://tools.abidmahmud.cv/image-resizer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F8C7F] hover:text-[#176E64] transition-colors"
            >
              Open Image Resizer <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-2xl border border-[#E5E1D6] bg-white p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-[#1F8C7F] font-semibold mb-1">
                Color Quantization
              </p>
              <h4 className="font-bold text-[#0B0B0D] text-sm mb-1">
                Need colors from your logo too? Try Color Palette Extractor
              </h4>
              <p className="text-xs text-[#4F4E55] leading-relaxed">
                Pull HEX &amp; RGB palettes from any photo or vector logo.
              </p>
            </div>
            <a
              href="https://tools.abidmahmud.cv/palette-extractor"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#1F8C7F] hover:text-[#176E64] transition-colors"
            >
              Open Color Palette Extractor <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
