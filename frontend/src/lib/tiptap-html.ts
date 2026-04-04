/**
 * Convert TipTap/ProseMirror JSON to HTML.
 * Lightweight converter — khong can import toan bo TipTap runtime.
 */

interface TipTapNode {
  type: string
  content?: TipTapNode[]
  text?: string
  attrs?: Record<string, any>
  marks?: TipTapMark[]
}

interface TipTapMark {
  type: string
  attrs?: Record<string, any>
}

/** Render marks (bold, italic, link...) bao quanh text */
function renderMarks(text: string, marks?: TipTapMark[]): string {
  if (!marks || marks.length === 0) return text
  let result = text
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
      case 'strong':
        result = `<strong>${result}</strong>`
        break
      case 'italic':
      case 'em':
        result = `<em>${result}</em>`
        break
      case 'underline':
        result = `<u>${result}</u>`
        break
      case 'strike':
        result = `<s>${result}</s>`
        break
      case 'code':
        result = `<code>${result}</code>`
        break
      case 'link': {
        const href = escapeHtml(mark.attrs?.href || '#')
        // Block javascript: protocol
        if (/^\s*javascript\s*:/i.test(mark.attrs?.href || '')) break
        result = `<a href="${href}" target="${mark.attrs?.target || '_blank'}" rel="noopener noreferrer">${result}</a>`
        break
      }
      case 'highlight':
        result = `<mark>${result}</mark>`
        break
      case 'textStyle': {
        // Chỉ cho phép color hợp lệ (hex, tên màu)
        const color = mark.attrs?.color
        if (color && /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{1,20})$/.test(color)) {
          result = `<span style="color: ${color}">${result}</span>`
        }
        break
      }
    }
  }
  return result
}

/** Escape HTML entities trong text content */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Render mot TipTap node thanh HTML */
function renderNode(node: TipTapNode): string {
  switch (node.type) {
    case 'doc':
      return (node.content || []).map(renderNode).join('')

    case 'text':
      return renderMarks(escapeHtml(node.text || ''), node.marks)

    case 'paragraph': {
      const inner = (node.content || []).map(renderNode).join('')
      const align = node.attrs?.textAlign
      // Chỉ cho phép giá trị textAlign hợp lệ
      const validAligns = ['left', 'center', 'right', 'justify']
      const style = align && validAligns.includes(align) ? ` style="text-align: ${align}"` : ''
      return `<p${style}>${inner}</p>`
    }

    case 'heading': {
      const level = node.attrs?.level || 2
      const tag = `h${Math.min(Math.max(level, 1), 6)}`
      const inner = (node.content || []).map(renderNode).join('')
      return `<${tag}>${inner}</${tag}>`
    }

    case 'bulletList':
      return `<ul>${(node.content || []).map(renderNode).join('')}</ul>`

    case 'orderedList':
      return `<ol>${(node.content || []).map(renderNode).join('')}</ol>`

    case 'listItem':
      return `<li>${(node.content || []).map(renderNode).join('')}</li>`

    case 'blockquote':
      return `<blockquote>${(node.content || []).map(renderNode).join('')}</blockquote>`

    case 'codeBlock': {
      // Chỉ cho phép tên ngôn ngữ alphanumeric
      const rawLang = node.attrs?.language || ''
      const lang = /^[a-zA-Z0-9_-]+$/.test(rawLang) ? rawLang : ''
      const inner = (node.content || []).map(renderNode).join('')
      return `<pre><code${lang ? ` class="language-${lang}"` : ''}>${inner}</code></pre>`
    }

    case 'image': {
      const src = node.attrs?.src || ''
      const alt = node.attrs?.alt || ''
      const title = node.attrs?.title || ''
      return `<figure><img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" />${title ? `<figcaption>${escapeHtml(title)}</figcaption>` : ''}</figure>`
    }

    case 'horizontalRule':
    case 'horizontal_rule':
      return '<hr />'

    case 'hardBreak':
    case 'hard_break':
      return '<br />'

    case 'table':
      return `<table>${(node.content || []).map(renderNode).join('')}</table>`

    case 'tableRow':
      return `<tr>${(node.content || []).map(renderNode).join('')}</tr>`

    case 'tableHeader':
      return `<th>${(node.content || []).map(renderNode).join('')}</th>`

    case 'tableCell':
      return `<td>${(node.content || []).map(renderNode).join('')}</td>`

    default:
      // Fallback: render children neu co
      if (node.content) {
        return (node.content || []).map(renderNode).join('')
      }
      return ''
  }
}

/**
 * Convert TipTap JSON (string or object) to HTML.
 * Neu input da la HTML (khong phai JSON) → tra ve nguyen.
 */
export function tiptapJsonToHtml(content: string | null | undefined): string {
  if (!content) return ''

  // Neu la string, thu parse JSON
  if (typeof content === 'string') {
    const trimmed = content.trim()
    // Khong phai JSON → tra ve nguyen (co the la HTML)
    if (!trimmed.startsWith('{')) return content

    try {
      const parsed = JSON.parse(trimmed)
      if (parsed.type === 'doc') {
        return renderNode(parsed)
      }
      // JSON nhung khong phai TipTap format → tra ve nguyen
      return content
    } catch {
      return content
    }
  }

  return ''
}
