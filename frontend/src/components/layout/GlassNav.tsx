'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS, SITE_NAME } from '@/lib/constants'
import { useScrollPosition } from '@/hooks/useScrollReveal'

export function GlassNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { isScrolled } = useScrollPosition()

  // Ẩn nav trên admin
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-[var(--z-fixed)] h-[var(--nav-height)] transition-all duration-500',
        isScrolled
          ? 'shadow-ambient-sm'
          : ''
      )}
      style={{
        backgroundColor: isScrolled
          ? 'rgba(252, 249, 247, 0.92)'
          : 'rgba(252, 249, 247, 0.7)',
        backdropFilter: `blur(${isScrolled ? '24px' : '16px'})`,
        WebkitBackdropFilter: `blur(${isScrolled ? '24px' : '16px'})`,
        borderBottom: isScrolled
          ? '1px solid rgba(212, 195, 186, 0.15)'
          : '1px solid rgba(212, 195, 186, 0.05)',
      }}
    >
      <nav className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-4 md:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 font-headline text-headline-sm text-primary transition-opacity duration-300 hover:opacity-80"
        >
          {/* Logo mark decorative - aria-hidden de tranh text duplication */}
          <span aria-hidden="true" className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 transition-colors duration-300 group-hover:bg-primary/10">
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
                  {/* Active indicator line */}
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

        {/* Mobile Hamburger */}
        <button
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl p-2.5 text-on-surface-variant transition-colors duration-200 active:bg-surface-container-high md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
        >
          <span className="relative h-6 w-6">
            <Menu className={cn(
              'absolute inset-0 h-6 w-6 transition-all duration-300',
              mobileMenuOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
            )} />
            <X className={cn(
              'absolute inset-0 h-6 w-6 transition-all duration-300',
              mobileMenuOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
            )} />
          </span>
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 top-[var(--nav-height)] bg-on-surface/10 animate-fade-in md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Menu panel */}
          <div
            className="absolute left-0 right-0 top-[var(--nav-height)] animate-mobile-menu md:hidden"
            style={{
              backgroundColor: 'rgba(252, 249, 247, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(212, 195, 186, 0.15)',
            }}
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {NAV_LINKS.map((link, index) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(link.href)

                return (
                  <li
                    key={link.href}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-4 py-3.5 font-label text-label-lg uppercase tracking-label-wide transition-all duration-200',
                        isActive
                          ? 'bg-primary/8 text-primary'
                          : 'text-on-surface-variant hover:bg-surface-container-high active:bg-surface-container-highest'
                      )}
                    >
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </header>
  )
}
