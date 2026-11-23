export interface CleaningOptions {
  // Safe options (default true)
  removeComments: boolean;
  removeMetadata: boolean;
  removeEditorData: boolean;
  removeEmptyGroups: boolean;
  removeHiddenElements: boolean;
  removeUnusedDefs: boolean;

  // Aggressive & Phase 2 options
  roundCoordinates: boolean;
  shortenIds: boolean;
  removeDimensionsKeepViewBox: boolean;
  removeViewBox: boolean; // Phase 2
  removeWidthHeight: boolean; // Phase 2
  minifyStyles: boolean; // Phase 2
  minifyCode: boolean;
  prettyPrint: boolean; // Phase 2
}

export const DEFAULT_SAFE_OPTIONS: CleaningOptions = {
  removeComments: true,
  removeMetadata: true,
  removeEditorData: true,
  removeEmptyGroups: true,
  removeHiddenElements: true,
  removeUnusedDefs: true,

  roundCoordinates: false,
  shortenIds: false,
  removeDimensionsKeepViewBox: false,
  removeViewBox: false,
  removeWidthHeight: false,
  minifyStyles: true,
  minifyCode: false,
  prettyPrint: false,
};

export const MAXIMUM_OPTIONS: CleaningOptions = {
  removeComments: true,
  removeMetadata: true,
  removeEditorData: true,
  removeEmptyGroups: true,
  removeHiddenElements: true,
  removeUnusedDefs: true,

  roundCoordinates: true,
  shortenIds: true,
  removeDimensionsKeepViewBox: true,
  removeViewBox: false,
  removeWidthHeight: true,
  minifyStyles: true,
  minifyCode: true,
  prettyPrint: false,
};

// Phase 2 Presets: Web, Icon, Print
export const PRESET_OPTIONS: Record<'web' | 'icon' | 'print' | 'safe' | 'maximum', CleaningOptions> = {
  web: {
    removeComments: true,
    removeMetadata: true,
    removeEditorData: true,
    removeEmptyGroups: true,
    removeHiddenElements: true,
    removeUnusedDefs: true,
    roundCoordinates: false,
    shortenIds: false,
    removeDimensionsKeepViewBox: true,
    removeViewBox: false,
    removeWidthHeight: false,
    minifyStyles: true,
    minifyCode: true,
    prettyPrint: false,
  },
  icon: {
    removeComments: true,
    removeMetadata: true,
    removeEditorData: true,
    removeEmptyGroups: true,
    removeHiddenElements: true,
    removeUnusedDefs: true,
    roundCoordinates: true,
    shortenIds: true,
    removeDimensionsKeepViewBox: true,
    removeViewBox: false,
    removeWidthHeight: true,
    minifyStyles: true,
    minifyCode: true,
    prettyPrint: false,
  },
  print: {
    removeComments: true,
    removeMetadata: true,
    removeEditorData: true,
    removeEmptyGroups: true,
    removeHiddenElements: false,
    removeUnusedDefs: true,
    roundCoordinates: false,
    shortenIds: false,
    removeDimensionsKeepViewBox: false,
    removeViewBox: false,
    removeWidthHeight: false,
    minifyStyles: false,
    minifyCode: false,
    prettyPrint: true,
  },
  safe: DEFAULT_SAFE_OPTIONS,
  maximum: MAXIMUM_OPTIONS,
};

export interface RemovalsBreakdown {
  comments: number;
  metadata: number;
  editorTags: number;
  emptyGroups: number;
  unusedDefs: number;
  hiddenElements: number;
  summary: string;
}

export interface OptimizeResult {
  originalSvg: string;
  cleanedSvg: string;
  originalBytes: number;
  cleanedBytes: number;
  savingsBytes: number;
  savingsPercent: number;
  elementCountBefore: number;
  elementCountAfter: number;
  removals: RemovalsBreakdown;
}

function countElements(root: Element): number {
  return 1 + root.querySelectorAll('*').length;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

/**
 * Clean and optimize SVG content string using in-browser DOMParser.
 */
export function optimizeSvgString(
  rawSvg: string,
  options: CleaningOptions = DEFAULT_SAFE_OPTIONS
): OptimizeResult {
  const originalBytes = new TextEncoder().encode(rawSvg).length;

  let commentsCount = 0;
  let metadataCount = 0;
  let editorTagsCount = 0;
  let emptyGroupsCount = 0;
  let unusedDefsCount = 0;
  let hiddenElementsCount = 0;

  // 1. Initial cleanup: remove XML prolog and doctype if requested
  let text = rawSvg;
  if (options.removeMetadata) {
    const prologMatch = text.match(/<\?xml[\s\S]*?\?>/gi);
    if (prologMatch) metadataCount += prologMatch.length;
    text = text.replace(/<\?xml[\s\S]*?\?>/gi, '');

    const doctypeMatch = text.match(/<!DOCTYPE[\s\S]*?>/gi);
    if (doctypeMatch) metadataCount += doctypeMatch.length;
    text = text.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  }

  // 2. Parse SVG as XML
  if (typeof DOMParser === 'undefined') {
    throw new Error('DOMParser is not available in this environment');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'image/svg+xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(
      'Invalid SVG file format. Please check the file contents: ' +
        (parseError.textContent?.slice(0, 100) || 'Parse error')
    );
  }

  const svgRoot = doc.documentElement;
  if (!svgRoot || svgRoot.nodeName.toLowerCase() !== 'svg') {
    throw new Error('Root element is not <svg>. File is not a valid SVG.');
  }

  const elementCountBefore = countElements(svgRoot);

  // 3. Remove comments if requested
  if (options.removeComments) {
    const removeCommentsNode = (node: Node) => {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.COMMENT_NODE) {
          node.removeChild(child);
          commentsCount++;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          removeCommentsNode(child);
        }
      }
    };
    removeCommentsNode(svgRoot);
  }

  // 4. Remove metadata tags
  if (options.removeMetadata) {
    const metadataTags = svgRoot.querySelectorAll('metadata, title, desc');
    metadataCount += metadataTags.length;
    metadataTags.forEach((el) => el.parentNode?.removeChild(el));
  }

  // 5. Remove editor data (Illustrator, Inkscape, Figma, etc.)
  if (options.removeEditorData) {
    const editorPrefixes = [
      'i:',
      'ai:',
      'x:',
      'inkscape:',
      'sodipodi:',
      'figma:',
      'sketch:',
      'adobe:',
    ];

    const cleanAttributes = (el: Element) => {
      const attrs = Array.from(el.attributes);
      for (const attr of attrs) {
        const name = attr.name.toLowerCase();
        if (
          name.startsWith('xmlns:i') ||
          name.startsWith('xmlns:ai') ||
          name.startsWith('xmlns:x') ||
          name.startsWith('xmlns:inkscape') ||
          name.startsWith('xmlns:sodipodi') ||
          name.startsWith('xmlns:figma') ||
          name.startsWith('xmlns:sketch') ||
          name.startsWith('xmlns:adobe') ||
          editorPrefixes.some((prefix) => name.startsWith(prefix)) ||
          name === 'version' ||
          name === 'xml:space' ||
          name === 'enable-background' ||
          name === 'sodipodi:docname' ||
          name === 'inkscape:version'
        ) {
          el.removeAttribute(attr.name);
          editorTagsCount++;
        }
      }

      for (const child of Array.from(el.children)) {
        cleanAttributes(child);
      }
    };

    cleanAttributes(svgRoot);

    const foreignObjects = svgRoot.querySelectorAll(
      'foreignObject, i\\:pgf, i\\:rulerorigin, pgf'
    );
    editorTagsCount += foreignObjects.length;
    foreignObjects.forEach((el) => el.parentNode?.removeChild(el));
  }

  // 6. Remove hidden elements
  if (options.removeHiddenElements) {
    const hiddenElements = svgRoot.querySelectorAll(
      '[display="none"], [visibility="hidden"], [opacity="0"]'
    );
    hiddenElements.forEach((el) => {
      if (!el.closest('defs') && !el.closest('clipPath') && !el.closest('mask')) {
        el.parentNode?.removeChild(el);
        hiddenElementsCount++;
      }
    });
  }

  // 7. Remove unused defs
  if (options.removeUnusedDefs) {
    const defsList = svgRoot.querySelectorAll('defs');
    defsList.forEach((defs) => {
      const docXml = new XMLSerializer().serializeToString(svgRoot);
      const defItems = Array.from(defs.children);

      for (const item of defItems) {
        const id = item.getAttribute('id');
        if (id) {
          const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(#${escapedId}\\b|url\\(#${escapedId}\\))`, 'i');
          const matches = docXml.match(new RegExp(regex.source, 'gi'));
          if (!matches || matches.length <= 1) {
            item.parentNode?.removeChild(item);
            unusedDefsCount++;
          }
        }
      }

      if (defs.children.length === 0) {
        defs.parentNode?.removeChild(defs);
      }
    });
  }

  // 8. Remove empty groups iteratively
  if (options.removeEmptyGroups) {
    let removedAny = true;
    while (removedAny) {
      removedAny = false;
      const groups = svgRoot.querySelectorAll('g');
      for (const g of Array.from(groups)) {
        if (g.children.length === 0 && (!g.textContent || g.textContent.trim() === '')) {
          g.parentNode?.removeChild(g);
          emptyGroupsCount++;
          removedAny = true;
        }
      }
    }
  }

  // Phase 2: Remove ViewBox if requested
  if (options.removeViewBox) {
    if (svgRoot.hasAttribute('viewBox')) {
      svgRoot.removeAttribute('viewBox');
    }
  }

  // Phase 2: Remove Width / Height if requested
  if (options.removeWidthHeight) {
    if (svgRoot.hasAttribute('width')) svgRoot.removeAttribute('width');
    if (svgRoot.hasAttribute('height')) svgRoot.removeAttribute('height');
  }

  // 9. Remove dimensions and keep viewBox
  if (options.removeDimensionsKeepViewBox) {
    const hasViewBox = svgRoot.hasAttribute('viewBox');
    const width = svgRoot.getAttribute('width');
    const height = svgRoot.getAttribute('height');

    if (hasViewBox) {
      svgRoot.removeAttribute('width');
      svgRoot.removeAttribute('height');
    } else if (width && height) {
      const numW = parseFloat(width.replace(/px/i, ''));
      const numH = parseFloat(height.replace(/px/i, ''));
      if (!isNaN(numW) && !isNaN(numH) && numW > 0 && numH > 0) {
        svgRoot.setAttribute('viewBox', `0 0 ${numW} ${numH}`);
        svgRoot.removeAttribute('width');
        svgRoot.removeAttribute('height');
      }
    }
  }

  // Phase 2: Minify Styles
  if (options.minifyStyles) {
    const styleTags = svgRoot.querySelectorAll('style');
    styleTags.forEach((st) => {
      if (st.textContent) {
        st.textContent = st.textContent
          .replace(/\/\*[\s\S]*?\*\//g, '')
          .replace(/\s+/g, ' ')
          .replace(/\s*([{}:;,])\s*/g, '$1')
          .trim();
      }
    });
  }

  // 10. Aggressive: Shorten IDs
  if (options.shortenIds) {
    const elementsWithId = Array.from(svgRoot.querySelectorAll('[id]'));
    let idCounter = 0;
    const idMap = new Map<string, string>();

    const generateShortId = (index: number): string => {
      let s = '';
      let num = index;
      do {
        s = String.fromCharCode(97 + (num % 26)) + s;
        num = Math.floor(num / 26) - 1;
      } while (num >= 0);
      return s;
    };

    for (const el of elementsWithId) {
      const oldId = el.getAttribute('id');
      if (oldId && !idMap.has(oldId)) {
        idMap.set(oldId, generateShortId(idCounter++));
      }
    }

    for (const el of elementsWithId) {
      const oldId = el.getAttribute('id');
      if (oldId && idMap.has(oldId)) {
        el.setAttribute('id', idMap.get(oldId)!);
      }
    }

    const updateReferences = (el: Element) => {
      for (const attr of Array.from(el.attributes)) {
        let val = attr.value;
        let changed = false;
        idMap.forEach((newId, oldId) => {
          if (val.includes(`#${oldId}`)) {
            val = val.replace(new RegExp(`#${oldId}\\b`, 'g'), `#${newId}`);
            changed = true;
          }
        });
        if (changed) {
          el.setAttribute(attr.name, val);
        }
      }
      for (const child of Array.from(el.children)) {
        updateReferences(child);
      }
    };

    updateReferences(svgRoot);
  }

  // 11. Aggressive: Round coordinates to 2 decimal places
  if (options.roundCoordinates) {
    const roundNumber = (numStr: string): string => {
      const n = parseFloat(numStr);
      if (isNaN(n)) return numStr;
      return Math.round(n * 100) / 100 + '';
    };

    const roundPathD = (d: string): string => {
      return d.replace(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g, (match) => roundNumber(match));
    };

    const coordAttributes = [
      'd',
      'points',
      'x',
      'y',
      'x1',
      'y1',
      'x2',
      'y2',
      'cx',
      'cy',
      'r',
      'rx',
      'ry',
    ];

    const roundAttrs = (el: Element) => {
      for (const attrName of coordAttributes) {
        if (el.hasAttribute(attrName)) {
          const val = el.getAttribute(attrName);
          if (val) {
            if (attrName === 'd' || attrName === 'points') {
              el.setAttribute(attrName, roundPathD(val));
            } else {
              el.setAttribute(attrName, roundNumber(val));
            }
          }
        }
      }
      for (const child of Array.from(el.children)) {
        roundAttrs(child);
      }
    };

    roundAttrs(svgRoot);
  }

  // 12. Serialize DOM back to string
  const serializer = new XMLSerializer();
  let cleanSvg = serializer.serializeToString(svgRoot);

  // 13. Minification or Pretty Print (Phase 2)
  if (options.prettyPrint) {
    cleanSvg = formatSvgXml(cleanSvg);
  } else if (options.minifyCode) {
    cleanSvg = cleanSvg
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  const elementCountAfter = countElements(svgRoot);
  const cleanedBytes = new TextEncoder().encode(cleanSvg).length;
  const savingsBytes = Math.max(0, originalBytes - cleanedBytes);
  const savingsPercent =
    originalBytes > 0
      ? Math.max(0, Math.round((savingsBytes / originalBytes) * 100))
      : 0;

  const summaryParts: string[] = [];
  if (commentsCount > 0) summaryParts.push(`removed ${commentsCount} comment${commentsCount > 1 ? 's' : ''}`);
  if (metadataCount > 0) summaryParts.push(`removed ${metadataCount} metadata block${metadataCount > 1 ? 's' : ''}`);
  if (unusedDefsCount > 0) summaryParts.push(`removed ${unusedDefsCount} unused def${unusedDefsCount > 1 ? 's' : ''}`);
  if (emptyGroupsCount > 0) summaryParts.push(`removed ${emptyGroupsCount} empty group${emptyGroupsCount > 1 ? 's' : ''}`);
  if (summaryParts.length === 0) summaryParts.push('optimized SVG attributes and structure');

  const removals: RemovalsBreakdown = {
    comments: commentsCount,
    metadata: metadataCount,
    editorTags: editorTagsCount,
    emptyGroups: emptyGroupsCount,
    unusedDefs: unusedDefsCount,
    hiddenElements: hiddenElementsCount,
    summary: summaryParts.join(', '),
  };

  return {
    originalSvg: rawSvg,
    cleanedSvg: cleanSvg,
    originalBytes,
    cleanedBytes,
    savingsBytes,
    savingsPercent,
    elementCountBefore,
    elementCountAfter,
    removals,
  };
}

/**
 * Pretty-print formats an SVG XML string with clean 2-space indentation
 */
export function formatSvgXml(xml: string): string {
  let formatted = '';
  let indent = 0;
  const tab = '  ';
  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) indent = Math.max(0, indent - 1);
    formatted += tab.repeat(indent) + '<' + node + '>\n';
    if (node.match(/^<?\w[^>]*[^\/]$/) && !node.startsWith('input')) indent++;
  });
  return formatted.trim();
}

/**
 * Rasterizes an SVG string to a high-resolution PNG Blob (Phase 2)
 */
export async function rasterizeSvgToPng(
  svgString: string,
  targetDimension: 512 | 1024 | 2000,
  background: 'transparent' | 'white' = 'transparent'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = targetDimension;
      canvas.height = targetDimension;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas context could not be created'));
        return;
      }
      if (background === 'white') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetDimension, targetDimension);
      } else {
        ctx.clearRect(0, 0, targetDimension, targetDimension);
      }

      const w = img.naturalWidth || targetDimension;
      const h = img.naturalHeight || targetDimension;
      const scale = Math.min(targetDimension / w, targetDimension / h);
      const dw = w * scale;
      const dh = h * scale;
      const dx = (targetDimension - dw) / 2;
      const dy = (targetDimension - dh) / 2;

      ctx.drawImage(img, dx, dy, dw, dh);
      URL.revokeObjectURL(url);

      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Failed to rasterize SVG to PNG'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG for rasterization'));
    };
    img.src = url;
  });
}

/**
 * Extracts all .svg files recursively from a DragEvent DataTransfer (folder drag-and-drop)
 */
export async function getFilesFromDataTransfer(dataTransfer: DataTransfer): Promise<File[]> {
  const files: File[] = [];
  const items = dataTransfer.items;
  if (!items) {
    return Array.from(dataTransfer.files).filter((f) => f.name.toLowerCase().endsWith('.svg'));
  }

  async function traverseEntry(entry: any): Promise<void> {
    if (entry.isFile) {
      const file: File = await new Promise((resolve, reject) => entry.file(resolve, reject));
      if (file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml') {
        files.push(file);
      }
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader();
      const entries: any[] = await new Promise((resolve, reject) => {
        dirReader.readEntries(resolve, reject);
      });
      for (const child of entries) {
        await traverseEntry(child);
      }
    }
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null;
    if (entry) {
      await traverseEntry(entry);
    } else {
      const f = item.getAsFile();
      if (f && (f.name.toLowerCase().endsWith('.svg') || f.type === 'image/svg+xml')) {
        files.push(f);
      }
    }
  }
  return files;
}
