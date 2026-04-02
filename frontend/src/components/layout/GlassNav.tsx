'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Search, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS, SITE_NAME } from '@/lib/constants'
import { useScrollPosition } from '@/hooks/useScrollReveal'

export function GlassNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isScrolled } = useScrollPosition()

  // Dong menu khi chuyen trang
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // An nav tren admin
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[var(--z-fixed)] h-[var(--nav-height)] transition-all duration-500',
        isScrolled ? 'shadow-ambient-sm' : ''
      )}
      style={{
        backgroundColor: isScrolled
          ? 'var(--glass-bg-strong)'
          : 'var(--glass-bg)',
        backdropFilter: `blur(${isScrolled ? '24px' : '16px'})`,
        WebkitBackdropFilter: `blur(${isScrolled ? '24px' : '16px'})`,
        borderBottom: 'none',
      }}
    >
      <nav className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-4 md:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 font-headline text-title-md uppercase tracking-[0.1em] text-primary transition-opacity duration-300 hover:opacity-80 md:text-headline-sm md:tracking-normal md:normal-case"
        >
          <span aria-hidden="true" className="relative hidden h-9 w-9 items-center justify-center rounded-lg bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10 md:flex">
            <span className="font-headline text-title-md text-primary">V</span>
          </span>
          {SITE_NAME}
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href)

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 font-label text-label-lg uppercase tracking-label-wide transition-colors duration-300',
                    isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full bg-primary animate-line-expand origin-left" />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/search"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high hover:text-primary"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/admin/login"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-on-surface-variant transition-all duration-300 hover:bg-surface-container-high hover:text-primary"
            aria-label="Tài khoản"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>

        {/* Mobile Right Actions */}
        <div className="flex items-center gap-1 md:hidden">
          {/* Cart icon (matching design 18.html) */}
          <Link
            href="/catalog"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-on-surface-variant transition-colors active:bg-surface-container-high"
            aria-label="Danh mục"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>
          {/* Account icon */}
          <Link
            href="/admin/login"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-on-surface-variant transition-colors active:bg-surface-container-high"
            aria-label="Tài khoản"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </nav>

      {/* Mobile Menu handled by BottomNav — top nav doesn't have hamburger anymore on mobile */}
    </header>
  )
}
