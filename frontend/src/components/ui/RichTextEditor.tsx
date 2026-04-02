'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TipTapLink from '@tiptap/extension-link'
import TipTapImage from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Link,
  Unlink,
  ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Code,
  Pilcrow,
  Type,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { useCallback, useState, useRef, useEffect } from 'react'
import { isUrlSafe } from '@/lib/sanitize'

/* ── Toolbar Button ─────────────────────────────────────────── */

function Btn({
  onClick,
  active,
  disabled,
  title,
  children,
  className = '',
}: {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        active
          ? 'bg-primary/15 text-primary'
          : 'text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface'
      } disabled:opacity-25 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <div className="mx-0.5 h-5 w-px bg-on-surface/10" />
}

/* ── Format Dropdown (giống WordPress Block Type) ──────────── */

const BLOCK_TYPES = [
  { label: 'Đoạn văn', value: 'paragraph', icon: Pilcrow },
  { label: 'Tiêu đề 2', value: 'h2', icon: Heading2 },
  { label: 'Tiêu đề 3', value: 'h3', icon: Heading3 },
  { label: 'Trích dẫn', value: 'blockquote', icon: Quote },
  { label: 'Code', value: 'codeBlock', icon: Code },
] as const

function FormatDropdown({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  // Xác định block type hiện tại
  function currentLabel() {
    if (editor.isActive('heading', { level: 2 })) return 'Tiêu đề 2'
    if (editor.isActive('heading', { level: 3 })) return 'Tiêu đề 3'
    if (editor.isActive('blockquote')) return 'Trích dẫn'
    if (editor.isActive('codeBlock')) return 'Code'
    return 'Đoạn văn'
  }

  function apply(value: string) {
    setOpen(false)
    switch (value) {
      case 'paragraph': editor.chain().focus().setParagraph().run(); break
      case 'h2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break
      case 'h3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break
      case 'blockquote': editor.chain().focus().toggleBlockquote().run(); break
      case 'codeBlock': editor.chain().focus().toggleCodeBlock().run(); break
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-7 items-center gap-1 rounded px-2 text-body-sm text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface"
      >
        <Type className="h-3.5 w-3.5" />
        <span className="max-w-[80px] truncate">{currentLabel()}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-10 mt-1 w-44 rounded-lg bg-surface py-1 shadow-ambient-lg">
          {BLOCK_TYPES.map(({ label, value, icon: Icon }) => {
            const isActive =
              (value === 'paragraph' && !editor.isActive('heading') && !editor.isActive('blockquote') && !editor.isActive('codeBlock')) ||
              (value === 'h2' && editor.isActive('heading', { level: 2 })) ||
              (value === 'h3' && editor.isActive('heading', { level: 3 })) ||
              (value === 'blockquote' && editor.isActive('blockquote')) ||
              (value === 'codeBlock' && editor.isActive('codeBlock'))
            return (
              <button
                key={value}
                type="button"
                onClick={() => apply(value)}
                className={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left text-body-sm transition-colors ${
                  isActive ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-on-surface/5'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ── Main Toolbar (2 hàng giống WordPress) ─────────────────── */

function Toolbar({ editor, expanded, onToggleExpand }: { editor: Editor; expanded: boolean; onToggleExpand: () => void }) {
  const addLink = useCallback(() => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('Nhập URL:', prev || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    if (!isUrlSafe(url)) { alert('URL không hợp lệ. Chỉ chấp nhận http://, https://, mailto:, tel:'); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const addImage = useCallback(() => {
    const url = window.prompt('Nhập URL hình ảnh:')
    if (!url) return
    if (!isUrlSafe(url)) { alert('URL hình ảnh không hợp lệ'); return }
    editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  return (
    <div className="border-b border-on-surface/8 bg-surface-container-low">
      {/* Row 1: Format + Text styles + Undo/Redo */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
        <FormatDropdown editor={editor} />

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="In đậm (Ctrl+B)">
          <Bold className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="In nghiêng (Ctrl+I)">
          <Italic className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Gạch chân (Ctrl+U)">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Gạch ngang">
          <Strikethrough className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách">
          <List className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
          <ListOrdered className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Căn trái">
          <AlignLeft className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Căn giữa">
          <AlignCenter className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Căn phải">
          <AlignRight className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn onClick={addLink} active={editor.isActive('link')} title="Chèn liên kết">
          <Link className="h-3.5 w-3.5" />
        </Btn>
        {editor.isActive('link') && (
          <Btn onClick={() => editor.chain().focus().unsetLink().run()} title="Xóa liên kết">
            <Unlink className="h-3.5 w-3.5" />
          </Btn>
        )}
        <Btn onClick={addImage} title="Chèn hình ảnh">
          <ImageIcon className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
          <Minus className="h-3.5 w-3.5" />
        </Btn>

        {/* Spacer → push undo/redo + expand sang phải */}
        <div className="flex-1" />

        <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
          <Undo className="h-3.5 w-3.5" />
        </Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
          <Redo className="h-3.5 w-3.5" />
        </Btn>

        <Sep />

        <Btn onClick={onToggleExpand} title={expanded ? 'Thu nhỏ' : 'Mở rộng'}>
          {expanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
        </Btn>
      </div>
    </div>
  )
}

/* ── Word Counter ──────────────────────────────────────────── */

function WordCount({ editor }: { editor: Editor }) {
  const text = editor.getText()
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length

  return (
    <div className="flex items-center justify-between border-t border-on-surface/8 bg-surface-container-low px-3 py-1.5">
      <span className="text-[11px] text-on-surface-variant/60">
        {words} từ &middot; {chars} ký tự
      </span>
      <span className="text-[11px] text-on-surface-variant/40">
        Tab để indent &middot; Ctrl+B/I/U
      </span>
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────── */

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Bắt đầu viết nội dung...',
  className = '',
}: {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer', rel: 'noopener noreferrer' },
        validate: (url) => isUrlSafe(url),
      }),
      TipTapImage.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none text-on-surface',
      },
    },
  })

  if (!editor) return null

  return (
    <div className={`tiptap overflow-hidden rounded-xl bg-surface-container ring-1 ring-on-surface/8 focus-within:ring-2 focus-within:ring-primary/40 transition-shadow ${
      expanded ? 'fixed inset-4 z-50 flex flex-col rounded-2xl shadow-2xl' : ''
    } ${className}`}>
      <Toolbar editor={editor} expanded={expanded} onToggleExpand={() => setExpanded(!expanded)} />
      <div className={`overflow-y-auto ${expanded ? 'flex-1' : 'min-h-[220px] max-h-[400px]'}`}>
        <div className="px-4 py-3">
          <EditorContent editor={editor} />
        </div>
      </div>
      <WordCount editor={editor} />
    </div>
  )
}
