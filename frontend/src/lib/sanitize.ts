/**
 * Robust HTML sanitization for rendering content from API.
 * Uses a whitelist-based approach safe for both server and client rendering.
 * Backend uses DOMPurify for thorough sanitization; this is a defense-in-depth layer.
 */

/** Tags allowed in sanitized output */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'em', 'strong', 'u', 's', 'small', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'a', 'img', 'figure', 'figcaption',
  'blockquote', 'pre', 'code', 'hr',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
  'div', 'span', 'section', 'article',
])

/** Attributes allowed per tag (or '*' for all tags) */
const ALLOWED_ATTRS: Record<string, Set<string>> = {
  '*': new Set(['class', 'id', 'title', 'lang', 'dir']),
  'a': new Set(['href', 'target', 'rel']),
  'img': new Set(['src', 'alt', 'width', 'height', 'loading']),
  'td': new Set(['colspan', 'rowspan']),
  'th': new Set(['colspan', 'rowspan', 'scope']),
}

/** Protocols allowed in href/src attributes */
const SAFE_URL_PROTOCOLS = /^(?:https?|mailto|tel):/i

/** Matches HTML tags (opening, closing, self-closing) */
const TAG_RE = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)?\/?>/g

/** Matches individual attributes within a tag */
const ATTR_RE = /([a-zA-Z][a-zA-Z0-9_-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g

/** Matches HTML comments */
const COMMENT_RE = /<!--[\s\S]*?-->/g

export function isUrlSafe(url: string): boolean {
  const trimmed = url.trim()
  // Relative URLs are safe
  if (trimmed.startsWith('/') || trimmed.startsWith('#') || trimmed.startsWith('.')) {
    return true
  }
  // Block javascript:, data:, vbscript: and other dangerous protocols
  if (/^\s*(javascript|data|vbscript)\s*:/i.test(trimmed)) {
    return false
  }
  // Allow safe protocols
  if (SAFE_URL_PROTOCOLS.test(trimmed)) {
    return true
  }
  // Block anything else with a colon before a slash (unknown protocol)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return false
  }
  return true
}

function sanitizeAttributes(tagName: string, attrString: string): string {
  const globalAttrs = ALLOWED_ATTRS['*'] || new Set()
  const tagAttrs = ALLOWED_ATTRS[tagName.toLowerCase()] || new Set()
  const result: string[] = []

  let match: RegExpExecArray | null
  ATTR_RE.lastIndex = 0
  while ((match = ATTR_RE.exec(attrString)) !== null) {
    const attrName = match[1].toLowerCase()
    const attrValue = match[2] ?? match[3] ?? match[4] ?? ''

    // Block all event handlers (on*)
    if (attrName.startsWith('on')) continue

    // Block style attribute (can contain expressions)
    if (attrName === 'style') continue

    // Only allow whitelisted attributes
    if (!globalAttrs.has(attrName) && !tagAttrs.has(attrName)) continue

    // Validate URL attributes
    if (attrName === 'href' || attrName === 'src') {
      if (!isUrlSafe(attrValue)) continue
    }

    result.push(`${attrName}="${attrValue.replace(/"/g, '&quot;')}"`)
  }

  // Force rel="noopener noreferrer" on links with target
  if (tagName.toLowerCase() === 'a') {
    const hasTarget = result.some(a => a.startsWith('target='))
    if (hasTarget) {
      const relIdx = result.findIndex(a => a.startsWith('rel='))
      if (relIdx >= 0) {
        result[relIdx] = 'rel="noopener noreferrer"'
      } else {
        result.push('rel="noopener noreferrer"')
      }
    }
  }

  return result.length > 0 ? ' ' + result.join(' ') : ''
}

export function sanitizeHtml(html: string | null | undefined): string {
  if (!html) return ''

  let cleaned = html
    // Remove HTML comments (can hide attack vectors)
    .replace(COMMENT_RE, '')
    // Remove null bytes
    .replace(/\0/g, '')

  // Process tags: keep allowed, strip disallowed
  cleaned = cleaned.replace(TAG_RE, (fullMatch, tagName: string, attrString: string) => {
    const lower = tagName.toLowerCase()
    if (!ALLOWED_TAGS.has(lower)) return ''

    const isClosing = fullMatch.startsWith('</')
    if (isClosing) return `</${lower}>`

    const isSelfClosing = fullMatch.endsWith('/>')
    const sanitizedAttrs = sanitizeAttributes(lower, attrString || '')
    return `<${lower}${sanitizedAttrs}${isSelfClosing ? ' /' : ''}>`
  })

  return cleaned
}
