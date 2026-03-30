'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS, SITE_NAME } from '@/lib/constants'

export function GlassNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[var(--z-fixed)] h-[var(--nav-height)]"
      style={{
        backgroundColor: 'var(--glass-bg)',
        backdropFilter: `blur(var(--glass-blur))`,
        WebkitBackdropFilter: `blur(var(--glass-blur))`,
        borderBottom: '1px solid var(--glass-border)',
      }}
    >
      <nav className="mx-auto flex h-full max-w-[1920px] items-center justify-between px-4 md:px-8 lg:px-12">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-headline text-headline-sm text-primary"
        >
          {SITE_NAME}
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 md:flex">
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
                    'font-label text-label-lg uppercase tracking-label-wide transition-colors duration-300',
                    isActive
                      ? 'text-primary'
                      : 'text-on-surface-variant hover:text-primary'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <Link
            href="/admin/login"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2.5 text-on-surface-variant md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="absolute left-0 right-0 top-[var(--nav-height)] border-b md:hidden"
          style={{
            backgroundColor: 'var(--glass-bg-strong)',
            backdropFilter: `blur(var(--glass-blur-xl))`,
            WebkitBackdropFilter: `blur(var(--glass-blur-xl))`,
            borderColor: 'var(--glass-border)',
          }}
        >
          <ul className="flex flex-col gap-1 px-4 py-4">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href)

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'block rounded-xl px-4 py-3 font-label text-label-lg uppercase tracking-label-wide transition-colors',
                      isActive
                        ? 'bg-primary-fixed text-on-primary-fixed'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </header>
  )
}
