import Link from 'next/link'
import { SITE_NAME, NAV_LINKS } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface">
      <div className="mx-auto max-w-[1920px] px-4 py-16 md:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-3">
          {/* Brand Column */}
          <div>
            <h3 className="font-headline text-headline-sm text-inverse-primary">
              {SITE_NAME}
            </h3>
            <p className="mt-4 max-w-xs text-body-sm text-inverse-on-surface/70">
              Mang phong cach noi that tinh te, hien dai vao khong gian song cua ban.
              Thiet ke - Thi cong - Noi that tron goi.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="font-label text-label-lg uppercase tracking-label-wide text-inverse-primary">
              Dieu huong
            </h4>
            <ul className="mt-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/about"
                  className="text-body-sm text-inverse-on-surface/70 transition-colors hover:text-inverse-primary"
                >
                  Ve chung toi
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="font-label text-label-lg uppercase tracking-label-wide text-inverse-primary">
              Lien he
            </h4>
            <ul className="mt-4 flex flex-col gap-3 text-body-sm text-inverse-on-surface/70">
              <li>Email: contact@vietnetinterior.vn</li>
              <li>Phone: 0901 234 567</li>
              <li>Dia chi: TP. Ho Chi Minh, Viet Nam</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-inverse-on-surface/10 pt-6">
          <p className="text-center text-body-sm text-inverse-on-surface/50">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
