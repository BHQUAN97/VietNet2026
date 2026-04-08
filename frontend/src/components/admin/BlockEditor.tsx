'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TipTapLink from '@tiptap/extension-link'
import TipTapImage from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import CharacterCount from '@tiptap/extension-character-count'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Heading2, Heading3,
  Quote, Undo, Redo, Link, Unlink, ImageIcon,
  AlignLeft, AlignCenter, AlignRight, Minus, Code,
  Type, ChevronDown, Copy, Trash2, ArrowUp, ArrowDown,
  Plus, Pilcrow, Highlighter, GripVertical,
} from 'lucide-react'
import {
  useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef,
  type ReactNode,
} from 'react'
import { uploadImageGetUrl } from '@/lib/media'
import { isUrlSafe } from '@/lib/sanitize'

/* ================================================================
   TYPES
   ================================================================ */

export interface BlockEditorRef {
  getJSON: () => any
  getHTML: () => string
  setContent: (content: any) => void
}

interface BlockEditorProps {
  initialContent?: any
  onChange?: (json: any) => void
  placeholder?: string
}

/* ================================================================
   TOOLBAR PRIMITIVES
   ================================================================ */

function Btn({ onClick, active, disabled, title, children, className = '' }: {
  onClick: () => void; active?: boolean; disabled?: boolean; title: string
  children: ReactNode; className?: string
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors
        ${active ? 'bg-primary/15 text-primary' : 'text-on-surface-variant hover:bg-on-surface/5 hover:text-on-surface'}
        disabled:opacity-25 disabled:cursor-not-allowed ${className}`}>
      {children}
    </button>
  )
}

function Sep() { return <div className="mx-0.5 h-5 w-px bg-on-surface/10" /> }

/* ================================================================
   FORMAT DROPDOWN
   ================================================================ */

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

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  function currentLabel() {
    if (editor.isActive('heading', { level: 2 })) return 'Tiêu đề 2'
    if (editor.isActive('heading', { level: 3 })) return 'Tiêu đề 3'
    if (editor.isActive('blockquote')) return 'Trích dẫn'
    if (editor.isActive('codeBlock')) return 'Code'
    return 'Đoạn văn'
  }

  function apply(v: string) {
    setOpen(false)
    const chain = editor.chain().focus()
    switch (v) {
      case 'paragraph': chain.setParagraph().run(); break
      case 'h2': chain.toggleHeading({ level: 2 }).run(); break
      case 'h3': chain.toggleHeading({ level: 3 }).run(); break
      case 'blockquote': chain.toggleBlockquote().run(); break
      case 'codeBlock': chain.toggleCodeBlock().run(); break
    }
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-1 rounded-md px-2 text-body-sm text-on-surface-variant hover:bg-on-surface/5">
        <Type className="h-3.5 w-3.5" />
        <span className="max-w-[72px] truncate">{currentLabel()}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-44 rounded-xl bg-surface py-1 shadow-ambient-lg ring-1 ring-on-surface/8">
          {BLOCK_TYPES.map(({ label, value, icon: Icon }) => {
            const isActive =
              (value === 'paragraph' && !editor.isActive('heading') && !editor.isActive('blockquote') && !editor.isActive('codeBlock')) ||
              (value === 'h2' && editor.isActive('heading', { level: 2 })) ||
              (value === 'h3' && editor.isActive('heading', { level: 3 })) ||
              (value === 'blockquote' && editor.isActive('blockquote')) ||
              (value === 'codeBlock' && editor.isActive('codeBlock'))
            return (
              <button key={value} type="button" onClick={() => apply(value)}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-sm transition-colors
                  ${isActive ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-on-surface/5'}`}>
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

/* ================================================================
   MAIN TOOLBAR (sticky)
   ================================================================ */

function MainToolbar({ editor, onImageUpload }: { editor: Editor; onImageUpload: () => void }) {
  const addLink = useCallback(() => {
    const prev = editor.getAttributes('link').href
    const url = window.prompt('Nhập URL:', prev || 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    if (!isUrlSafe(url)) { alert('URL không hợp lệ. Chỉ chấp nhận http://, https://, mailto:, tel:'); return }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-on-surface/8 bg-surface/95 px-3 py-1.5 backdrop-blur-sm">
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
      <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
        <Highlighter className="h-3.5 w-3.5" />
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
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Danh sách">
        <List className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Danh sách số">
        <ListOrdered className="h-3.5 w-3.5" />
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
      <Btn onClick={onImageUpload} title="Chèn hình ảnh">
        <ImageIcon className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Đường kẻ ngang">
        <Minus className="h-3.5 w-3.5" />
      </Btn>
      <div className="flex-1" />
      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Hoàn tác (Ctrl+Z)">
        <Undo className="h-3.5 w-3.5" />
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Làm lại (Ctrl+Y)">
        <Redo className="h-3.5 w-3.5" />
      </Btn>
    </div>
  )
}

/* ================================================================
   FLOATING TOOLBAR (hiện khi bôi đen text)
   ================================================================ */

function FloatingToolbar({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const update = () => {
      const { from, to, empty } = editor.state.selection
      if (empty || from === to || !editor.isFocused) { setPos(null); return }

      // Lấy tọa độ selection
      const sel = window.getSelection()
      if (!sel || sel.rangeCount === 0) { setPos(null); return }
      const range = sel.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (rect.width === 0) { setPos(null); return }

      setPos({
        top: rect.top + window.scrollY - 48,
        left: rect.left + window.scrollX + rect.width / 2,
      })
    }

    editor.on('selectionUpdate', update)
    return () => { editor.off('selectionUpdate', update) }
  }, [editor])

  if (!pos) return null

  return (
    <div ref={ref} className="fixed z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-1 duration-150"
      style={{ top: pos.top, left: pos.left }}>
      <div className="flex items-center gap-0.5 rounded-lg bg-on-surface px-1.5 py-1 shadow-lg">
        {[
          { fn: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), icon: Bold, title: 'Bold' },
          { fn: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), icon: Italic, title: 'Italic' },
          { fn: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), icon: UnderlineIcon, title: 'Underline' },
          { fn: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), icon: Strikethrough, title: 'Strike' },
        ].map(({ fn, active, icon: Icon, title }) => (
          <button key={title} type="button" onClick={fn} title={title}
            className={`flex h-7 w-7 items-center justify-center rounded transition-colors
              ${active ? 'bg-surface/25 text-surface' : 'text-surface/70 hover:text-surface hover:bg-surface/15'}`}>
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
        <div className="mx-0.5 h-4 w-px bg-surface/20" />
        <button type="button" title="Link" onClick={() => {
          const prev = editor.getAttributes('link').href
          const url = window.prompt('URL:', prev || 'https://')
          if (url === null) return
          if (url === '') { editor.chain().focus().unsetLink().run(); return }
          if (!isUrlSafe(url)) { alert('URL không hợp lệ'); return }
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        }} className={`flex h-7 w-7 items-center justify-center rounded transition-colors
          ${editor.isActive('link') ? 'bg-surface/25 text-surface' : 'text-surface/70 hover:text-surface hover:bg-surface/15'}`}>
          <Link className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

/* ================================================================
   SLASH COMMAND MENU (gõ "/" đầu dòng)
   ================================================================ */

const SLASH_ITEMS = [
  { label: 'Tiêu đề 2', icon: Heading2, command: (e: Editor) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'Tiêu đề 3', icon: Heading3, command: (e: Editor) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { label: 'Danh sách', icon: List, command: (e: Editor) => e.chain().focus().toggleBulletList().run() },
  { label: 'Danh sách số', icon: ListOrdered, command: (e: Editor) => e.chain().focus().toggleOrderedList().run() },
  { label: 'Trích dẫn', icon: Quote, command: (e: Editor) => e.chain().focus().toggleBlockquote().run() },
  { label: 'Đường kẻ', icon: Minus, command: (e: Editor) => e.chain().focus().setHorizontalRule().run() },
  { label: 'Code block', icon: Code, command: (e: Editor) => e.chain().focus().toggleCodeBlock().run() },
  { label: 'Hình ảnh', icon: ImageIcon, command: (_e: Editor) => { /* handled via callback */ } },
]

function SlashMenu({ editor, onImageInsert }: { editor: Editor; onImageInsert: () => void }) {
  const [show, setShow] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [selectedIdx, setSelectedIdx] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  const filtered = SLASH_ITEMS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const check = () => {
      const { $from } = editor.state.selection
      const text = $from.parent.textContent
      // Chỉ hiện khi paragraph bắt đầu bằng "/"
      if ($from.parent.type.name === 'paragraph' && text.startsWith('/')) {
        const coords = editor.view.coordsAtPos($from.pos)
        setPos({ top: coords.bottom + 4, left: coords.left })
        setQuery(text.slice(1))
        setSelectedIdx(0)
        setShow(true)
      } else {
        setShow(false)
      }
    }
    editor.on('update', check)
    editor.on('selectionUpdate', check)
    return () => { editor.off('update', check); editor.off('selectionUpdate', check) }
  }, [editor])

  // Keyboard navigation trong slash menu
  useEffect(() => {
    if (!show) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter' && filtered[selectedIdx]) {
        e.preventDefault()
        selectItem(filtered[selectedIdx])
      }
      if (e.key === 'Escape') { e.preventDefault(); setShow(false) }
    }
    window.addEventListener('keydown', handleKey, true)
    return () => window.removeEventListener('keydown', handleKey, true)
  }, [show, selectedIdx, filtered])

  function selectItem(item: typeof SLASH_ITEMS[0]) {
    // Xóa "/" text trước khi apply command
    const { $from } = editor.state.selection
    const start = $from.start()
    editor.chain().focus()
      .deleteRange({ from: start, to: start + $from.parent.textContent.length })
      .run()

    if (item.label === 'Hình ảnh') {
      onImageInsert()
    } else {
      item.command(editor)
    }
    setShow(false)
  }

  if (!show || filtered.length === 0) return null

  return (
    <div ref={menuRef} className="fixed z-50" style={{ top: pos.top, left: pos.left }}>
      <div className="w-56 rounded-xl bg-surface py-1.5 shadow-ambient-lg ring-1 ring-on-surface/8">
        <p className="px-3 pb-1 font-label text-[11px] uppercase tracking-wider text-on-surface-variant/50">
          Chèn block
        </p>
        {filtered.map((item, idx) => {
          const Icon = item.icon
          return (
            <button key={item.label} type="button"
              onClick={() => selectItem(item)}
              onMouseEnter={() => setSelectedIdx(idx)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-sm transition-colors
                ${idx === selectedIdx ? 'bg-primary/10 text-primary' : 'text-on-surface hover:bg-on-surface/5'}`}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${idx === selectedIdx ? 'bg-primary/15' : 'bg-surface-container'}`}>
                <Icon className="h-4 w-4" />
              </div>
              {item.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ================================================================
   BLOCK HOVER TOOLBAR — hiện khi hover vào block, bên trái editor
   ================================================================ */

function BlockHoverToolbar({ editor }: { editor: Editor }) {
  const [hoverPos, setHoverPos] = useState<{ top: number; blockPos: number } | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const editorWrapRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const editorEl = editor.view.dom
    // Lắng nghe trên wrapper (chứa cả toolbar + editor) để tránh mất hover khi chuột đi qua vùng padding
    const wrapperEl = editorEl.closest('.tiptap-content-wrap') as HTMLElement
    if (!wrapperEl) return
    editorWrapRef.current = wrapperEl

    const handleMouseMove = (e: MouseEvent) => {
      // Cho phép giữ toolbar khi hover toolbar
      if (toolbarRef.current?.contains(e.target as Node)) return

      // Chỉ tính vị trí block khi chuột trong vùng editor content
      if (!editorEl.contains(e.target as Node)) return

      // Tìm block node gần nhất
      const pos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY })
      if (!pos) return

      try {
        const resolved = editor.state.doc.resolve(pos.pos)
        // Lấy top-level block (depth 1)
        const depth = Math.min(resolved.depth, 1)
        if (depth < 1) return
        const blockStart = resolved.before(depth)
        const domNode = editor.view.nodeDOM(blockStart)
        if (!domNode || !(domNode instanceof HTMLElement)) return

        const rect = domNode.getBoundingClientRect()
        const wrapRect = editorEl.closest('.tiptap')?.getBoundingClientRect()
        if (!wrapRect) return

        setHoverPos({
          top: rect.top - wrapRect.top,
          blockPos: blockStart,
        })
      } catch {
        // Bỏ qua nếu resolve thất bại
      }
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.relatedTarget as Node)) return
      setHoverPos(null)
      setShowMenu(false)
    }

    wrapperEl.addEventListener('mousemove', handleMouseMove)
    wrapperEl.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      wrapperEl.removeEventListener('mousemove', handleMouseMove)
      wrapperEl.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [editor])

  const moveUp = useCallback(() => {
    if (!hoverPos) return
    const { blockPos } = hoverPos
    try {
      const node = editor.state.doc.nodeAt(blockPos)
      if (!node) return
      const resolved = editor.state.doc.resolve(blockPos)
      if (resolved.index(0) <= 0) return
      const prevPos = resolved.before(1) - 1
      const prevResolved = editor.state.doc.resolve(prevPos)
      const prevStart = prevResolved.before(1)
      const json = node.toJSON()
      editor.chain().focus()
        .deleteRange({ from: blockPos, to: blockPos + node.nodeSize })
        .insertContentAt(prevStart, json)
        .run()
    } catch { /* ignore */ }
    setShowMenu(false)
  }, [editor, hoverPos])

  const moveDown = useCallback(() => {
    if (!hoverPos) return
    const { blockPos } = hoverPos
    try {
      const node = editor.state.doc.nodeAt(blockPos)
      if (!node) return
      const after = blockPos + node.nodeSize
      if (after >= editor.state.doc.content.size) return
      const nextNode = editor.state.doc.nodeAt(after)
      if (!nextNode) return
      const json = node.toJSON()
      editor.chain().focus()
        .deleteRange({ from: blockPos, to: blockPos + node.nodeSize })
        .insertContentAt(blockPos + nextNode.nodeSize, json)
        .run()
    } catch { /* ignore */ }
    setShowMenu(false)
  }, [editor, hoverPos])

  // Nút + thêm block và focus cursor vào paragraph mới
  const addBelow = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hoverPos) return
    try {
      const { doc } = editor.state
      const node = doc.nodeAt(hoverPos.blockPos)
      if (!node) return
      const endOfBlock = hoverPos.blockPos + node.nodeSize
      const insertPos = endOfBlock >= doc.content.size ? doc.content.size : endOfBlock
      editor.chain().focus().insertContentAt(insertPos, { type: 'paragraph' }).run()
      // Đặt cursor vào paragraph mới (insertPos + 1 = bên trong paragraph node)
      setTimeout(() => {
        editor.commands.focus(insertPos + 1)
      }, 0)
    } catch { /* ignore */ }
    setShowMenu(false)
  }, [editor, hoverPos])

  const addAbove = useCallback(() => {
    if (!hoverPos) return
    try {
      const insertPos = Math.max(0, hoverPos.blockPos)
      editor.chain().focus().insertContentAt(insertPos, { type: 'paragraph' }).run()
      setTimeout(() => {
        editor.commands.focus(insertPos + 1)
      }, 0)
    } catch { /* ignore */ }
    setShowMenu(false)
  }, [editor, hoverPos])

  const duplicateBlock = useCallback(() => {
    if (!hoverPos) return
    try {
      const { doc } = editor.state
      const node = doc.nodeAt(hoverPos.blockPos)
      if (!node) return
      const endOfBlock = hoverPos.blockPos + node.nodeSize
      const insertPos = Math.min(endOfBlock, doc.content.size)
      editor.chain().focus().insertContentAt(insertPos, node.toJSON()).run()
    } catch { /* ignore */ }
    setShowMenu(false)
  }, [editor, hoverPos])

  const deleteBlock = useCallback(() => {
    if (!hoverPos) return
    try {
      const node = editor.state.doc.nodeAt(hoverPos.blockPos)
      if (!node) return
      editor.chain().focus().deleteRange({ from: hoverPos.blockPos, to: hoverPos.blockPos + node.nodeSize }).run()
    } catch { /* ignore */ }
    setHoverPos(null)
    setShowMenu(false)
  }, [editor, hoverPos])

  if (!hoverPos) return null

  return (
    <div
      ref={toolbarRef}
      className="absolute -left-11 z-20 flex flex-col items-center gap-0.5 transition-all duration-100"
      style={{ top: hoverPos.top }}
      onMouseLeave={() => { setShowMenu(false) }}
    >
      {/* Drag handle + quick actions */}
      <div className="flex items-center gap-0.5 rounded-lg bg-surface-container/90 p-0.5 shadow-md ring-1 ring-on-surface/8 backdrop-blur-sm">
        {/* Block actions menu */}
        <button
          type="button"
          title="Thao tác block"
          onClick={() => setShowMenu(!showMenu)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant/50 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Quick add — onMouseDown + preventDefault để không steal focus */}
        <button
          type="button"
          title="Thêm block bên dưới"
          onMouseDown={addBelow}
          className="flex h-7 w-7 items-center justify-center rounded-md text-on-surface-variant/50 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Expanded menu khi click grip */}
      {showMenu && (
        <div className="mt-1 w-44 rounded-xl bg-surface py-1 shadow-ambient-lg ring-1 ring-on-surface/8 animate-in fade-in slide-in-from-top-1 duration-150">
          {[
            { label: 'Thêm block trên', icon: ArrowUp, fn: addAbove, color: '' },
            { label: 'Thêm block dưới', icon: ArrowDown, fn: addBelow, color: '' },
            { label: 'Di chuyển lên', icon: ArrowUp, fn: moveUp, color: '' },
            { label: 'Di chuyển xuống', icon: ArrowDown, fn: moveDown, color: '' },
            { label: 'Nhân bản', icon: Copy, fn: duplicateBlock, color: '' },
            { label: 'Xóa block', icon: Trash2, fn: deleteBlock, color: 'text-error hover:bg-error/10' },
          ].map(({ label, icon: Icon, fn, color }) => (
            <button key={label} type="button" onClick={fn}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-sm transition-colors
                ${color || 'text-on-surface hover:bg-on-surface/5'}`}>
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   CONTEXT MENU (chuột phải trên block)
   ================================================================ */

function ContextMenu({ editor }: { editor: Editor }) {
  const [show, setShow] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const editorEl = editor.view.dom
      if (!editorEl.contains(e.target as Node)) return
      e.preventDefault()
      setPos({ x: e.clientX, y: e.clientY })
      setShow(true)
    }
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false)
    }
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('mousedown', close)
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('mousedown', close)
    }
  }, [editor])

  if (!show) return null

  const actions = [
    {
      label: 'Nhân bản block', icon: Copy,
      fn: () => {
        try {
          const { $from } = editor.state.selection
          const node = $from.parent
          const afterPos = $from.after()
          const maxPos = editor.state.doc.content.size
          editor.chain().focus().insertContentAt(Math.min(afterPos, maxPos), node.toJSON()).run()
        } catch { /* ignore */ }
      },
    },
    {
      label: 'Di chuyển lên', icon: ArrowUp,
      fn: () => {
        try {
          const { $from } = editor.state.selection
          const pos = $from.before()
          if (pos <= 1) return
          const node = $from.parent
          const prevResolved = editor.state.doc.resolve(pos - 1)
          const prevStart = prevResolved.before()
          editor.chain().focus()
            .deleteRange({ from: $from.before(), to: $from.after() })
            .insertContentAt(prevStart, node.toJSON())
            .run()
        } catch { /* ignore */ }
      },
    },
    {
      label: 'Di chuyển xuống', icon: ArrowDown,
      fn: () => {
        try {
          const { $from } = editor.state.selection
          const after = $from.after()
          if (after >= editor.state.doc.content.size) return
          const nextResolved = editor.state.doc.resolve(after + 1)
          const nextNode = nextResolved.parent
          const node = $from.parent
          editor.chain().focus()
            .deleteRange({ from: $from.before(), to: $from.after() })
            .insertContentAt(Math.min($from.before() + nextNode.nodeSize, editor.state.doc.content.size), node.toJSON())
            .run()
        } catch { /* ignore */ }
      },
    },
    {
      label: 'Chèn block mới', icon: Plus,
      fn: () => {
        try {
          const { $from } = editor.state.selection
          const afterPos = $from.after()
          const maxPos = editor.state.doc.content.size
          editor.chain().focus().insertContentAt(Math.min(afterPos, maxPos), { type: 'paragraph' }).run()
        } catch { /* ignore */ }
      },
    },
    {
      label: 'Xóa block', icon: Trash2,
      fn: () => {
        try {
          const { $from } = editor.state.selection
          // Resolve block position at depth 1 (top-level block)
          const depth = Math.max(1, $from.depth)
          const blockStart = $from.before(depth)
          const blockEnd = $from.after(depth)
          editor.chain().focus().deleteRange({ from: blockStart, to: blockEnd }).run()
        } catch { /* ignore */ }
      },
    },
  ]

  return (
    <div ref={ref} className="fixed z-50" style={{ top: pos.y, left: pos.x }}>
      <div className="w-48 rounded-xl bg-surface py-1 shadow-ambient-lg ring-1 ring-on-surface/8">
        {actions.map(({ label, icon: Icon, fn }) => (
          <button key={label} type="button"
            onClick={() => { fn(); setShow(false) }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-body-sm text-on-surface transition-colors hover:bg-on-surface/5">
            <Icon className="h-4 w-4 text-on-surface-variant" />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* ================================================================
   STATUS BAR
   ================================================================ */

function StatusBar({ editor }: { editor: Editor }) {
  const chars = editor.storage.characterCount?.characters() ?? 0
  const words = editor.storage.characterCount?.words() ?? 0

  return (
    <div className="flex items-center justify-between border-t border-on-surface/8 bg-surface-container-lowest px-4 py-1.5">
      <span className="text-[11px] text-on-surface-variant/50">
        {words} từ &middot; {chars} ký tự
      </span>
      <span className="text-[11px] text-on-surface-variant/40">
        Gõ <kbd className="rounded bg-surface-container px-1 py-0.5 font-mono text-[10px]">/</kbd> để chèn block
      </span>
    </div>
  )
}

/* ================================================================
   MAIN BLOCK EDITOR
   ================================================================ */

const BlockEditor = forwardRef<BlockEditorRef, BlockEditorProps>(function BlockEditor(
  { initialContent, onChange, placeholder = 'Bắt đầu viết nội dung... Gõ "/" để chèn block' },
  ref,
) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload ảnh inline
  const handleImageUpload = useCallback(async (file: File, editor: Editor) => {
    const url = await uploadImageGetUrl(file)
    editor.chain().focus().setImage({ src: url }).run()
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      TipTapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer', rel: 'noopener noreferrer' },
        validate: (url) => isUrlSafe(url),
      }),
      TipTapImage.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full mx-auto' },
        allowBase64: true,
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      Highlight.configure({ multicolor: false }),
      CharacterCount,
    ],
    content: initialContent || '',
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none text-on-surface min-h-[400px] px-0 py-4',
      },
      // Paste ảnh từ clipboard
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (file && editor) handleImageUpload(file, editor)
            return true
          }
        }
        return false
      },
      // Drop ảnh từ file explorer
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false
        const images = Array.from(files).filter(f => f.type.startsWith('image/'))
        if (images.length === 0) return false
        event.preventDefault()
        images.forEach(file => { if (editor) handleImageUpload(file, editor) })
        return true
      },
    },
  })

  // Expose ref methods
  useImperativeHandle(ref, () => ({
    getJSON: () => editor?.getJSON(),
    getHTML: () => editor?.getHTML() || '',
    setContent: (content: any) => editor?.commands.setContent(content),
  }), [editor])

  // Trigger file input cho image upload
  const triggerImageUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editor) handleImageUpload(file, editor)
    e.target.value = ''
  }, [editor, handleImageUpload])

  if (!editor) return null

  return (
    <div className="tiptap flex flex-col rounded-xl bg-surface-container-lowest ring-1 ring-on-surface/8 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
      <MainToolbar editor={editor} onImageUpload={triggerImageUpload} />
      <div className="tiptap-content-wrap relative flex-1 px-6 pl-14 md:px-8 md:pl-16">
        <BlockHoverToolbar editor={editor} />
        <FloatingToolbar editor={editor} />
        <SlashMenu editor={editor} onImageInsert={triggerImageUpload} />
        <ContextMenu editor={editor} />
        <EditorContent editor={editor} />
      </div>
      <StatusBar editor={editor} />
    </div>
  )
})

export default BlockEditor
