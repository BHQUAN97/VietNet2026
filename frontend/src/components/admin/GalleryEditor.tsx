'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, GripVertical, ImageIcon, Loader2, ChevronUp, ChevronDown, ArrowLeftRight } from 'lucide-react'
import { fileToBase64, uploadMedia, validateImageFile } from '@/lib/media'

/* ================================================================
   TYPES
   ================================================================ */

export interface GalleryImage {
  /** Unique key cho React — có thể là media_id hoặc temp id */
  key: string
  /** Media ID đã upload lên server */
  mediaId: string
  /** URL hiển thị preview */
  previewUrl: string
  /** Caption mô tả ảnh */
  caption: string
  /** Đang upload? */
  uploading?: boolean
}

interface GalleryEditorProps {
  /** Danh sách ảnh hiện tại */
  images: GalleryImage[]
  /** Callback khi danh sách thay đổi */
  onChange: (images: GalleryImage[]) => void
  /** Số ảnh tối đa (default: 20) */
  maxImages?: number
}

/* ================================================================
   COMPONENT
   ================================================================ */

/**
 * GalleryEditor — upload nhiều ảnh, sắp xếp thứ tự, thêm caption.
 * Hỗ trợ: drag reorder (desktop) + nút lên/xuống (mobile).
 * Dùng chung cho Project gallery và Product images.
 */
export function GalleryEditor({ images, onChange, maxImages = 20 }: GalleryEditorProps) {
  const [error, setError] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const dragItemIndex = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Upload nhiều files cùng lúc
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError(null)
    const fileArr = Array.from(files)

    if (images.length + fileArr.length > maxImages) {
      setError(`Tối đa ${maxImages} ảnh. Còn ${maxImages - images.length} slot.`)
      return
    }

    // Tạo placeholder với base64 preview ngay lập tức
    const placeholders: GalleryImage[] = []
    for (const file of fileArr) {
      const validationError = validateImageFile(file)
      if (validationError) {
        setError(validationError)
        continue
      }
      const base64 = await fileToBase64(file)
      const tempKey = `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`
      placeholders.push({
        key: tempKey,
        mediaId: '',
        previewUrl: base64,
        caption: '',
        uploading: true,
      })
    }

    // Thêm placeholders vào list ngay
    const updated = [...images, ...placeholders]
    onChange(updated)

    // Upload từng file, cập nhật mediaId khi xong
    const validFiles = fileArr.filter((f) => !validateImageFile(f))
    for (let i = 0; i < validFiles.length; i++) {
      try {
        const media = await uploadMedia(validFiles[i])
        const targetKey = placeholders[i]?.key
        if (!targetKey) continue
        const target = updated.find((item) => item.key === targetKey)
        if (target) {
          target.mediaId = media.id
          target.previewUrl = media.preview_url || media.original_url
          target.uploading = false
        }
      } catch {
        const idx = updated.findIndex((item) => item.key === placeholders[i]?.key)
        if (idx >= 0) updated.splice(idx, 1)
      }
    }
    onChange([...updated])
  }, [images, maxImages, onChange])

  // Xóa ảnh
  const handleRemove = useCallback((index: number) => {
    const updated = images.filter((_, i) => i !== index)
    onChange(updated)
  }, [images, onChange])

  // Cập nhật caption
  const handleCaptionChange = useCallback((index: number, caption: string) => {
    const updated = images.map((img, i) => i === index ? { ...img, caption } : img)
    onChange(updated)
  }, [images, onChange])

  // Di chuyển ảnh lên/xuống — mobile-friendly
  const moveImage = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    onChange(updated)
  }, [images, onChange])

  // Drag & drop reorder (desktop)
  const handleDragStart = (index: number) => {
    dragItemIndex.current = index
  }
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }
  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    setDragOverIndex(null)
    const dragIndex = dragItemIndex.current
    if (dragIndex === null || dragIndex === dropIndex) return
    moveImage(dragIndex, dropIndex)
    dragItemIndex.current = null
  }
  const handleDragEnd = () => {
    setDragOverIndex(null)
    dragItemIndex.current = null
  }

  // Drop zone cho upload mới
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium uppercase tracking-wider text-on-surface-variant/70">
          Thư viện ảnh ({images.length}/{maxImages})
        </p>
        {images.length > 1 && (
          <p className="flex items-center gap-1 text-[10px] text-on-surface-variant/50">
            <ArrowLeftRight className="h-3 w-3" /> Kéo hoặc dùng mũi tên
          </p>
        )}
      </div>

      {/* Danh sách ảnh đã upload */}
      {images.length > 0 && (
        <div className="space-y-2">
          {images.map((img, index) => (
            <div
              key={img.key}
              draggable={!img.uploading}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group flex gap-2 rounded-lg border-2 p-1.5 transition-colors ${
                dragOverIndex === index
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent hover:border-on-surface/10'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.previewUrl}
                  alt={img.caption || ''}
                  className="h-full w-full object-cover"
                />
                {img.uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-on-surface/30">
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  </div>
                )}
                {/* Số thứ tự */}
                <div className="absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-on-surface/60 text-[9px] font-bold text-white">
                  {index + 1}
                </div>
              </div>

              {/* Caption + actions */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                {!img.uploading ? (
                  <input
                    type="text"
                    value={img.caption}
                    onChange={(e) => handleCaptionChange(index, e.target.value)}
                    placeholder="Mô tả ảnh..."
                    className="w-full rounded bg-transparent px-1 py-0.5 text-[11px] text-on-surface placeholder:text-on-surface-variant/40 focus:bg-surface-container focus:outline-none"
                  />
                ) : (
                  <span className="px-1 py-0.5 text-[11px] text-on-surface-variant">Đang tải...</span>
                )}

                {/* Action buttons — luôn hiện, không cần hover */}
                {!img.uploading && (
                  <div className="flex items-center gap-0.5">
                    {/* Drag handle — desktop */}
                    <button
                      type="button"
                      className="hidden cursor-grab rounded p-1 text-on-surface-variant/40 hover:text-on-surface-variant active:cursor-grabbing md:flex"
                      title="Kéo để sắp xếp"
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>

                    {/* Nút lên — mobile + desktop */}
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      disabled={index === 0}
                      className="rounded p-1 text-on-surface-variant/50 hover:text-on-surface disabled:opacity-20"
                      title="Di chuyển lên"
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>

                    {/* Nút xuống */}
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      disabled={index === images.length - 1}
                      className="rounded p-1 text-on-surface-variant/50 hover:text-on-surface disabled:opacity-20"
                      title="Di chuyển xuống"
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex-1" />

                    {/* Xóa */}
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="rounded p-1 text-on-surface-variant/40 hover:text-error"
                      title="Xóa ảnh"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {images.length < maxImages && (
        <div
          className={`relative rounded-xl border-2 border-dashed transition-colors ${
            isDraggingFile
              ? 'border-primary bg-primary/5'
              : 'border-on-surface/15 hover:border-on-surface/30'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true) }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDraggingFile(false)
            if (e.dataTransfer.files.length > 0) {
              handleFiles(e.dataTransfer.files)
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files)
              }
              e.target.value = ''
            }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-2 py-5 text-on-surface-variant/50 transition-colors hover:text-on-surface-variant"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container">
              {images.length === 0 ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
            </div>
            <div className="text-center">
              <p className="text-body-sm font-medium">
                {images.length === 0 ? 'Thêm ảnh vào thư viện' : 'Thêm ảnh'}
              </p>
              <p className="mt-0.5 text-[11px]">Chọn nhiều ảnh cùng lúc</p>
            </div>
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <p className="text-body-sm text-error">{error}</p>
      )}
    </div>
  )
}

/* ================================================================
   HELPER: Convert API gallery data ↔ GalleryImage[]
   ================================================================ */

/** Convert ProjectGalleryItem[] hoặc ProductImageItem[] từ API thành GalleryImage[] */
export function apiGalleryToImages(items: any[]): GalleryImage[] {
  return (items || [])
    .filter((item: any) => item.media?.preview_url || item.media?.original_url)
    .map((item: any) => ({
      key: item.id || item.media_id,
      mediaId: item.media_id || item.media?.id,
      previewUrl: item.media?.preview_url || item.media?.original_url || '',
      caption: item.caption || '',
    }))
}

/** Extract media_ids từ GalleryImage[] để gửi lên API */
export function imagesToMediaIds(images: GalleryImage[]): string[] {
  return images
    .filter((img) => img.mediaId && !img.uploading)
    .map((img) => img.mediaId)
}
