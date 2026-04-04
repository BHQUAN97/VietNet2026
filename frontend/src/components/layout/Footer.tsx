'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SITE_NAME, NAV_LINKS } from '@/lib/constants'
import { ArrowUpRight } from 'lucide-react'

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/vietnetinterior', icon: 'fb' },
  { label: 'Instagram', href: 'https://instagram.com/vietnetinterior', icon: 'ig' },
  { label: 'YouTube', href: 'https://youtube.com/@vietnetinterior', icon: 'yt' },
]

export function Footer() {
  const pathname = usePathname()

  // Ẩn footer trên admin
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="relative overflow-hidden bg-inverse-surface text-inverse-on-surface pb-20 md:pb-0">
      {/* Decorative gradient top edge */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-inverse-primary/20 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 md:px-8">
        {/* Main footer content */}
        <div className="py-8 md:py-10">
          {/* Top row: Brand + Nav + Contact inline */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-12 md:gap-8">
            {/* Brand — col 1-4 */}
            <div className="col-span-2 md:col-span-4">
              <Link href="/" className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-lg bg-inverse-primary/10">
                  <span className="font-headline text-body-sm font-bold text-inverse-primary">V</span>
                </span>
                <span className="font-headline text-title-sm text-inverse-primary">
                  {SITE_NAME}
                </span>
              </Link>
              <p className="mt-2 text-body-sm leading-relaxed text-inverse-on-surface/50 max-w-[260px]">
                Thiết kế & thi công nội thất cao cấp trọn gói.
              </p>
              {/* Social icons */}
              <div className="mt-3 flex items-center gap-1.5">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-inverse-on-surface/5 text-inverse-on-surface/40 transition-all duration-300 hover:bg-inverse-primary/15 hover:text-inverse-primary"
                  >
                    <SocialIcon type={social.icon} />
                  </a>
                ))}
              </div>
            </div>

            {/* Nav column — col 5-6 */}
            <div className="md:col-span-2">
              <h4 className="font-label text-[11px] uppercase tracking-[0.08em] text-inverse-on-surface/35">
                Điều hướng
              </h4>
              <ul className="mt-2 flex flex-col gap-1.5">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-inverse-on-surface/60 transition-colors duration-200 hover:text-inverse-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* More links — col 7-8 */}
            <div className="md:col-span-2">
              <h4 className="font-label text-[11px] uppercase tracking-[0.08em] text-inverse-on-surface/35">
                Khám phá
              </h4>
              <ul className="mt-2 flex flex-col gap-1.5">
                <li>
                  <Link href="/about" className="text-body-sm text-inverse-on-surface/60 transition-colors duration-200 hover:text-inverse-primary">
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link href="/articles" className="text-body-sm text-inverse-on-surface/60 transition-colors duration-200 hover:text-inverse-primary">
                    Bài viết
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="text-body-sm text-inverse-on-surface/60 transition-colors duration-200 hover:text-inverse-primary">
                    Dự án tiêu biểu
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact — col 9-12 */}
            <div className="col-span-2 md:col-span-4">
              <h4 className="font-label text-[11px] uppercase tracking-[0.08em] text-inverse-on-surface/35">
                Liên hệ
              </h4>
              <ul className="mt-2 flex flex-col gap-1.5 text-body-sm text-inverse-on-surface/60">
                <li>
                  <a href="mailto:contact@vietnetinterior.vn" className="break-all transition-colors duration-200 hover:text-inverse-primary">
                    contact@vietnetinterior.vn
                  </a>
                </li>
                <li>
                  <a href="tel:0901234567" className="transition-colors duration-200 hover:text-inverse-primary">
                    0901 234 567
                  </a>
                </li>
                <li>TP. Hồ Chí Minh, Việt Nam</li>
              </ul>
              <Link
                href="/contact"
                className="mt-3 group inline-flex items-center gap-1.5 rounded-full bg-inverse-primary/10 px-4 py-2 font-label text-label-sm uppercase tracking-label-wide text-inverse-primary transition-all duration-300 hover:bg-inverse-primary/20"
              >
                Tư vấn miễn phí
                <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-inverse-on-surface/10 flex flex-col items-center gap-1 py-4 sm:flex-row sm:justify-between">
          <p className="text-[11px] text-inverse-on-surface/30">
            &copy; {new Date().getFullYear()} {SITE_NAME}
          </p>
          <p className="text-[11px] text-inverse-on-surface/25">
            Thiết kế & phát triển bởi VietNet Team
          </p>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ type }: { type: string }) {
  if (type === 'fb') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    )
  }
  if (type === 'ig') {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}
