let DOMPurify: any;
try {
  // isomorphic-dompurify co the fail do ESM compatibility issue
  DOMPurify = require('isomorphic-dompurify');
  // Handle cả default export và named export
  if (DOMPurify && DOMPurify.default) DOMPurify = DOMPurify.default;
} catch {
  DOMPurify = null;
}

const ALLOWED_TAGS = [
  'b', 'i', 'u', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'img', 'br', 'strong', 'em', 'blockquote',
  'pre', 'code', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span', 'figure', 'figcaption', 'hr', 'sub', 'sup', 'small', 's',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
  'width', 'height', 'loading', 'colspan', 'rowspan',
];

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return '';
  if (!DOMPurify?.sanitize) {
    // Fallback: strip script tags khi DOMPurify khong load duoc
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
