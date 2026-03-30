# FEATURE CHECKLIST -- VietNet Interior
> Updated: 2026-03-27 | Total: 112 features

## Status Legend
- [ ] Not started
- [x] Completed
- [DESIGN] Needs design first
- [DEV] In development
- [QC] In testing

---

## MODULE A: PUBLIC WEBSITE

### A1. Navigation & Layout
- [ ] A1.1 Glassmorphic Top Navigation (P0)
- [ ] A1.2 Mobile Bottom Navigation (P0)
- [ ] A1.3 Floating Action Widgets -- Zalo, Messenger, Phone (P1)
- [ ] A1.4 Footer -- 3 columns, newsletter signup (P0)
- [ ] A1.5 Breadcrumb Navigation (P1)

### A2. Homepage
- [ ] A2.1 Hero Section -- full viewport, gradient, CTAs (P0)
- [ ] A2.2 About Section -- asymmetric layout, stats (P0)
- [ ] A2.3 Featured Projects -- 3-col grid / carousel (P0)
- [ ] A2.4 Material Samples -- 4 circular swatches (P1)
- [ ] A2.5 Testimonials -- 2 cards, 5-star rating (P1)
- [ ] A2.6 Consultation CTA Form (P0)
- [ ] A2.7 Stats Counter -- animated numbers (P2)

### A3. Product Catalog
- [ ] A3.1 Material Filter Sidebar -- desktop (P0)
- [ ] A3.2 Mobile Filter Bottom Sheet (P0)
- [ ] A3.3 Horizontal Filter Chips -- mobile (P1)
- [ ] A3.4 Product Grid -- 3 cols / 2 cols staggered (P0)
- [ ] A3.5 Product Card Interactions -- hover, badges, ratings (P1)
- [ ] A3.6 Product Count Display (P1)
- [ ] A3.7 Pagination -- desktop & mobile variants (P0)
- [ ] A3.8 Material Samples Carousel (P2)

### A4. Project Detail Page [DESIGN MISSING]
- [DESIGN] A4.1 Project Hero Image (P0)
- [DESIGN] A4.2 Project Info -- title, description, style, materials (P0)
- [DESIGN] A4.3 Image Gallery with Lightbox (P0)
- [DESIGN] A4.4 Related Projects (P1)
- [DESIGN] A4.5 Social Sharing Buttons (P2)
- [DESIGN] A4.6 SEO -- meta, OG, JSON-LD (P0)
- [DESIGN] A4.7 Breadcrumb (P1)

### A5. Product Detail Page [DESIGN MISSING]
- [DESIGN] A5.1 Product Image Gallery (P0)
- [DESIGN] A5.2 Product Info -- name, material, description (P0)
- [DESIGN] A5.3 Material Specifications (P1)
- [DESIGN] A5.4 Related Products (P1)
- [DESIGN] A5.5 Consultation CTA (P0)

### A6. About Page [DESIGN MISSING]
- [DESIGN] A6.1 Company Story (P1)
- [DESIGN] A6.2 Facility Showcase (P2)
- [DESIGN] A6.3 Stats Counter (P2)
- [DESIGN] A6.4 Quality Commitment (P1)
- [DESIGN] A6.5 Warranty Policy (P1)

### A7. Contact Page [DESIGN MISSING]
- [DESIGN] A7.1 Contact Form (P0)
- [DESIGN] A7.2 Embedded Map (P2)
- [DESIGN] A7.3 Contact Info Display (P0)
- [DESIGN] A7.4 Social Links (P1)

### A8. Search [DESIGN MISSING]
- [DESIGN] A8.1 Global Search with Autocomplete (P1)
- [DESIGN] A8.2 Mixed Results -- projects + products (P1)
- [DESIGN] A8.3 No Results Empty State (P1)

### A9. Error Pages [DESIGN MISSING]
- [DESIGN] A9.1 404 Not Found Page (P1)
- [DESIGN] A9.2 500 Server Error Page (P2)

---

## MODULE B: ADMIN PANEL

### B1. Authentication [DESIGN MISSING]
- [DESIGN] B1.1 Login Page (P0)
- [DESIGN] B1.2 Forgot Password Flow (P1)
- [ ] B1.3 Session Management -- JWT (P0)

### B2. Dashboard
- [ ] B2.1 KPI Metrics Cards (P0)
- [ ] B2.2 Admin Sidebar Navigation (P0)
- [ ] B2.3 Quick Actions Cards (P1)
- [ ] B2.4 Recent Consultations Table (P0)
- [ ] B2.5 Top Performing Project Card (P2)
- [ ] B2.6 Mobile Activity Feed Timeline (P1)
- [ ] B2.7 Global Search (P1)
- [ ] B2.8 Notification Bell -- Socket.io (P1)

### B3. Post/Project Management
- [ ] B3.1 Project Table -- thumbnail, info, status (P0)
- [ ] B3.2 CRUD Operations (P0)
- [ ] B3.3 Status Flow -- Draft/Published (P0)
- [ ] B3.4 Category Tags -- Residential/Commercial/Hospitality (P0)
- [ ] B3.5 Image Gallery Manager (P0)
- [ ] B3.6 SEO Fields Editor (P0)
- [ ] B3.7 Search & Filter (P1)
- [ ] B3.8 Pagination (P1)

### B4. Consultation Management
- [ ] B4.1 Consultation Table (P0)
- [ ] B4.2 Status Workflow -- New/Contacted/Scheduled/Completed (P0)
- [ ] B4.3 Search & Date Filter (P1)
- [ ] B4.4 Real-time Alert -- Socket.io (P1)
- [ ] B4.5 Email Auto-reply (P1)

### B5. Page Builder
- [ ] B5.1 Edit Mode Toggle & Toolbar (P0)
- [ ] B5.2 Editable Blocks with Edit Triggers (P0)
- [ ] B5.3 Hero Section Editor (P0)
- [ ] B5.4 Section Editors -- About, Portfolio, Materials (P0)
- [ ] B5.5 Add/Remove Sections (P1)
- [ ] B5.6 Preview Mode -- Draft Mode (P0)
- [ ] B5.7 Save/Cancel with JSON Config (P0)

### B6. Analytics [DESIGN MISSING]
- [DESIGN] B6.1 Traffic Overview Chart (P1)
- [ ] B6.2 Bot Filtering Logic (P1)
- [ ] B6.3 Admin IP Exclusion (P1)
- [DESIGN] B6.4 Device Breakdown Chart (P2)
- [DESIGN] B6.5 Top Pages Ranking (P1)
- [DESIGN] B6.6 Traffic Sources (P2)

### B7. User Management [DESIGN MISSING]
- [DESIGN] B7.1 Admin User List Table (P1)
- [DESIGN] B7.2 Create/Edit Admin Form (P1)
- [DESIGN] B7.3 Role Management (P1)
- [DESIGN] B7.4 Delete Admin with Confirmation (P1)

### B8. Settings [DESIGN MISSING]
- [DESIGN] B8.1 Site Settings Form (P1)
- [DESIGN] B8.2 SEO Defaults Form (P1)
- [DESIGN] B8.3 Email Template Editor (P2)

---

## MODULE C: SYSTEM/BACKEND

### C1. Media Pipeline
- [ ] C1.1 Upload Endpoint with Validation (P0)
- [ ] C1.2 BullMQ IMAGE_JOB -- Sharp Processing (P0)
- [ ] C1.3 R2 Storage -- Private + Public Buckets (P0)

### C2. Email Service
- [ ] C2.1 BullMQ MAIL_JOB via Resend (P0)
- [ ] C2.2 Email Templates (P1)

### C3. Real-time
- [ ] C3.1 Socket.io Rooms Setup (P1)
- [ ] C3.2 Event Handlers -- consultation, page views (P1)

### C4. SEO Engine
- [ ] C4.1 Dynamic Sitemap Generation (P0)
- [ ] C4.2 JSON-LD Structured Data (P0)
- [ ] C4.3 Open Graph Meta Tags (P0)
- [ ] C4.4 Canonical URLs (P0)
- [ ] C4.5 robots.txt (P0)

### C5. Cache & Performance
- [ ] C5.1 Nginx Micro-cache 1s (P0)
- [ ] C5.2 Redis Cache for Queries (P0)
- [ ] C5.3 ISR -- revalidatePath (P0)
- [ ] C5.4 next/image Optimization (P0)

### C6. Security
- [ ] C6.1 Rate Limiting -- ThrottlerModule (P0)
- [ ] C6.2 DOMPurify for Rich Text (P0)
- [ ] C6.3 CORS Whitelist (P0)
- [ ] C6.4 Helmet.js Headers (P0)

### C7. Health & Monitoring
- [ ] C7.1 GET /api/health (P0)
- [ ] C7.2 Pino Logging with RequestID (P0)

---

## SUMMARY

| Module | Total | P0 | P1 | P2 | Design Missing |
|---|---|---|---|---|---|
| A: Public Website | 46 | 20 | 19 | 7 | 26 |
| B: Admin Panel | 44 | 19 | 21 | 4 | 13 |
| C: System | 22 | 19 | 3 | 0 | 0 |
| **TOTAL** | **112** | **58** | **43** | **11** | **39** |

### Design Missing Screens (39 features need design before dev):
1. A4: Project Detail Page (7 features)
2. A5: Product Detail Page (5 features)
3. A6: About Page (5 features)
4. A7: Contact Page (4 features)
5. A8: Search Results (3 features)
6. A9: Error Pages (2 features)
7. B1: Login/Auth (2 features)
8. B6: Analytics Dashboard (4 features -- charts only)
9. B7: User Management (4 features)
10. B8: Settings (3 features)
