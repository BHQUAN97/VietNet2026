/**
 * Sanitize rich text HTML (TipTap output) before persisting to DB.
 * Strict allowlist — strips script/style/iframe and inline event handlers.
 * Used by Articles and Projects services (content field).
 */
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
let DOMPurify: any;
try {
  // isomorphic-dompurify co the fail khi build neu ESM compat issue — fallback an toan ben duoi
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  DOMPurify = require('isomorphic-dompurify');
  if (DOMPurify && DOMPurify.default) DOMPurify = DOMPurify.default;
} catch {
  DOMPurify = null;
}

const ALLOWED_TAGS = [
  'p', 'br',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote',
  'strong', 'em', 'u', 's',
  'a', 'img',
  'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'code', 'pre',
  'span', 'div', 'hr',
];

const ALLOWED_ATTR = [
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height',
  'class', 'style',
  'colspan', 'rowspan',
];

const FORBID_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button'];
const FORBID_ATTR = ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur', 'onsubmit'];

const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Sanitize HTML string from TipTap editor before persisting.
 * Returns empty string for null/undefined input.
 */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return '';
  if (!DOMPurify?.sanitize) {
    // Fallback: strip script/style/iframe/object/embed tags khi DOMPurify khong load duoc
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/<(object|embed|form|input|button)\b[^>]*>/gi, '')
      .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    FORBID_TAGS,
    FORBID_ATTR,
  });
}
