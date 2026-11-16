export interface CleaningOptions {
  // Safe options (default true)
  removeComments: boolean;
  removeMetadata: boolean;
  removeEditorData: boolean;
  removeEmptyGroups: boolean;
  removeHiddenElements: boolean;
  removeUnusedDefs: boolean;

  // Aggressive options (default false)
  roundCoordinates: boolean;
  shortenIds: boolean;
  removeDimensionsKeepViewBox: boolean;
  minifyCode: boolean;
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
  minifyCode: false,
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
  minifyCode: true,
};

export interface OptimizeResult {
  originalSvg: string;
  cleanedSvg: string;
  originalBytes: number;
  cleanedBytes: number;
  savingsBytes: number;
  savingsPercent: number;
  elementCountBefore: number;
  elementCountAfter: number;
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

  // 1. Initial cleanup: remove XML prolog and doctype if requested
  let text = rawSvg;
  if (options.removeMetadata) {
    text = text.replace(/<\?xml[\s\S]*?\?>/gi, '');
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
    metadataTags.forEach((el) => el.parentNode?.removeChild(el));
  }

  // 5. Remove editor data (Illustrator, Inkscape, Figma, etc.)
  if (options.removeEditorData) {
    // Remove known editor namespaces and attributes from root & elements
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
        // Check for editor namespace declarations or prefixed attributes
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
        }
      }

      // Recursively clean children
      for (const child of Array.from(el.children)) {
        cleanAttributes(child);
      }
    };

    cleanAttributes(svgRoot);

    // Remove any foreignObject or proprietary editor tags
    const foreignObjects = svgRoot.querySelectorAll(
      'foreignObject, i\\:pgf, i\\:rulerorigin, pgf'
    );
    foreignObjects.forEach((el) => el.parentNode?.removeChild(el));
  }

  // 6. Remove hidden elements
  if (options.removeHiddenElements) {
    const hiddenElements = svgRoot.querySelectorAll(
      '[display="none"], [visibility="hidden"], [opacity="0"]'
    );
    hiddenElements.forEach((el) => {
      // Don't remove if inside <defs> or <clipPath> or <mask>, which might be referenced
      if (!el.closest('defs') && !el.closest('clipPath') && !el.closest('mask')) {
        el.parentNode?.removeChild(el);
      }
    });
  }

  // 7. Remove unused defs
  if (options.removeUnusedDefs) {
    const defsList = svgRoot.querySelectorAll('defs');
    defsList.forEach((defs) => {
      // Find all IDs used in the document
      const docXml = new XMLSerializer().serializeToString(svgRoot);
      const defItems = Array.from(defs.children);

      for (const item of defItems) {
        const id = item.getAttribute('id');
        if (id) {
          // Check if id is referenced in fill="url(#id)", stroke="url(#id)", clip-path="url(#id)", href="#id", etc.
          const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(`(#${escapedId}\\b|url\\(#${escapedId}\\))`, 'i');

          // Count occurrences in docXml (1 occurrence means it's only in the definition itself)
          const matches = docXml.match(new RegExp(regex.source, 'gi'));
          if (!matches || matches.length <= 1) {
            item.parentNode?.removeChild(item);
          }
        }
      }

      // If defs is now completely empty, remove it
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
          removedAny = true;
        }
      }
    }
  }

  // 9. Aggressive: Remove dimensions and keep viewBox
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

    // Build map of oldId -> shortId
    for (const el of elementsWithId) {
      const oldId = el.getAttribute('id');
      if (oldId && !idMap.has(oldId)) {
        idMap.set(oldId, generateShortId(idCounter++));
      }
    }

    // Apply new IDs
    for (const el of elementsWithId) {
      const oldId = el.getAttribute('id');
      if (oldId && idMap.has(oldId)) {
        el.setAttribute('id', idMap.get(oldId)!);
      }
    }

    // Update references across all elements
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
      // Matches floating point numbers in path definitions, including scientific notation
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

  // 13. Minification
  if (options.minifyCode) {
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

  return {
    originalSvg: rawSvg,
    cleanedSvg: cleanSvg,
    originalBytes,
    cleanedBytes,
    savingsBytes,
    savingsPercent,
    elementCountBefore,
    elementCountAfter,
  };
}
