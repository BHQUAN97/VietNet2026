/**
 * PageHeader — header chuan cho tat ca pages (public + admin).
 * Thay the 13+ cho copy-paste label + title + description + deco-line.
 */

interface PageHeaderProps {
  /** Label nho phia tren title (vd: "Blog", "Du an") */
  label?: string
  /** Title chinh */
  title: string
  /** Mo ta ngan */
  description?: string
  /** Hien deco-line duoi title (default true) */
  showDecoLine?: boolean
  /** Custom className */
  className?: string
  /** Children — render o ben phai (vd: button "Them moi") */
  children?: React.ReactNode
}

export function PageHeader({
  label,
  title,
  description,
  showDecoLine = true,
  className = '',
  children,
}: PageHeaderProps) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {label && (
            <p className="font-label text-label-sm uppercase tracking-[0.08em] text-primary/70">
              {label}
            </p>
          )}
          <h1 className="mt-2 font-headline text-headline-sm text-gradient-primary md:text-headline-md lg:text-headline-lg">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-body-sm text-on-surface-variant md:text-body-md">
              {description}
            </p>
          )}
          {showDecoLine && <span className="deco-line mt-4" />}
        </div>
        {children && <div className="flex-shrink-0">{children}</div>}
      </div>
    </div>
  )
}
