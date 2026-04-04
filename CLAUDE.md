# CLAUDE.md — VietNet Interior 2026

This file provides guidance to Claude Code when working with this repository.
**Constitution:** `.sdd/constitution.md` — doc TRUOC khi lam bat ky viec gi.

# Stack: Next.js 14+ App Router + TypeScript + Tailwind CSS + Shadcn UI (FE) | NestJS + TypeScript + TypeORM (BE)
# Domain: bhquan.site | DB: MySQL 8 | Cache: Redis 7 | Storage: Cloudflare R2 | Queue: BullMQ

---

## BUILD & DEV COMMANDS

```bash
# Frontend (Next.js)
npm run dev                # Dev server
npm run build              # Production build
npm run start              # Production server
npm run lint               # ESLint
npx tsc --noEmit           # Type check

# Backend (NestJS)
npm run start:dev          # Dev server (watch mode)
npm run build              # Production build
npm run start:prod         # Production server
npm run lint               # ESLint
npx tsc --noEmit           # Type check
npm run migration:run      # DB migrations

# Docker
docker-compose up -d       # Start all services (Nginx, NestJS, Next.js, MySQL, Redis)
docker-compose down        # Stop all services
docker-compose logs -f     # Follow logs
```

---

## AUTO MODE — QUYET DINH TU DONG

### TU DONG THUC HIEN (khong hoi):
- Doc bat ky file nao trong repo
- Chay: build, typecheck, lint, test
- Tao/sua file code trong src/
- Cai package npm (khong phai global)
- Doc .env.example (KHONG doc .env that)

### BAT BUOC HOI USER:
- Xoa file hoac thu muc
- Chay migration DB production
- SSH vao VPS / lenh tren server
- Deploy len production
- Thay doi .env production
- Xoa data trong DB
- Commit va push len git
- Bat ky hanh dong khong the hoan tac

---

## SYSTEM COMPONENTS
- **Public Website:** SSR via Next.js App Router — 100% server-rendered for SEO
- **Admin Panel:** CMS with Page Builder (JSON config), Draft Mode preview
- **API Server:** NestJS modular backend with layered architecture
- **Workers:** BullMQ + Redis (IMAGE_JOB, MAIL_JOB, TRAFFIC_SYNC_JOB)
- **Real-time:** Socket.io rooms (user:{userId}, admin)
- **CDN/Storage:** Cloudflare R2 (private + public buckets)
- **Infra:** Docker Compose on 4 Core / 16GB RAM / 160GB SSD

---

## KEY DOCUMENTATION FILES
- `02_MASTER_ARCH_RULES.md` — 28 BE + 20 FE architecture rules
- `DESIGN.md` — Full design system ("Curated Atelier")
- `MISA_Design_System_Full.md` — Extended MISA design standards
- `VIETNET_MASTER_BLUEPRINT.md` — Master blueprint v2.1
- `INFRA_OPS_DOCKER.md` — Docker & infrastructure setup
- `SECURITY_RULES.md` — Security standards
- `IMPLEMENTATION_PLAN.md` — 6-stage roadmap (6 weeks)
- `DESIGN/` — Figma design exports (mobile + web)
