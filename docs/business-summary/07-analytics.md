# 07. Traffic Analytics

> Module: B6 (Analytics) + B2.1 (Dashboard KPIs) + C5 (Cache)
> Priority: P1 | Status: Spec Done

---

## Summary

He thong theo doi traffic website tu xay dung (khong dung 3rd party). Page views duoc ghi nhanh vao Redis (INCR), sync sang MySQL moi 10 phut qua BullMQ TRAFFIC_SYNC_JOB. Ho tro loc bot, loai tru admin IP. Dashboard admin hien thi: tong visitors, conversion rate, top pages, device breakdown, traffic sources. Du lieu visualize bang charts (7d/30d/90d).

---

## Workflow

### Page View Recording (Real-time)
```
User visit trang public:
  → [1] POST /api/analytics/pageview { path, referrer, title }
  → [2] Parse: ip, user_agent, device_type
  → [3] Filter:
      - Check bot: user-agent match patterns → flag is_bot
      - Check excluded IPs: admin IP whitelist → skip recording
  → [4] Record vao Redis (KHONG ghi MySQL truc tiep):
      - INCR analytics:pageview:{date}:{path}
      - PFADD analytics:visitors:{date} {ip}  (HyperLogLog unique)
  → [5] Tra 204 No Content
```

### Traffic Sync Job (Moi 10 phut)
```
TRAFFIC_SYNC_JOB (BullMQ cron: */10 * * * *):
  → [1] SCAN Redis keys: analytics:pageview:{date}:*
  → [2] Doc HyperLogLog: analytics:visitors:{date}
  → [3] Aggregate va UPSERT vao MySQL page_view_daily:
      - INSERT ... ON DUPLICATE KEY UPDATE total_views = ?
  → [4] Optionally ghi detailed records vao page_views table
  → [5] Redis keys giu nguyen (TTL 48h tu clean)
  → [6] Neu MySQL insert fail → Redis keys KHONG bi xoa (retry lan sau)
```

### Dashboard Query
```
Admin xem Analytics:
  → [1] GET /api/analytics/overview?period=30d
      - total_visitors, conversion_rate, total_inquiries
      - So sanh voi period truoc (% change)
  → [2] GET /api/analytics/traffic?period=30d&interval=day
      - Data cho chart: labels[], page_views[], visitors[]
  → [3] GET /api/analytics/top-pages?limit=10&period=30d
  → [4] GET /api/analytics/devices?period=30d
  → [5] GET /api/analytics/sources?period=30d
```

---

## Giai phap chi tiet

### API Endpoints (6 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| POST | `/api/analytics/pageview` | @Public | Ghi page view |
| GET | `/api/analytics/overview` | @Admin | KPI summary |
| GET | `/api/analytics/traffic` | @Admin | Chart data (labels + values) |
| GET | `/api/analytics/top-pages` | @Admin | Top pages ranking |
| GET | `/api/analytics/devices` | @Admin | Desktop/Mobile/Tablet breakdown |
| GET | `/api/analytics/sources` | @Admin | Traffic sources (google, fb, direct...) |

### KPI Metrics (Dashboard Cards)

| Metric | Cong thuc | Mo ta |
|--------|-----------|-------|
| Total Visitors | SUM unique visitors | HyperLogLog count |
| Conversion Rate | (consultations / visitors) * 100 | % khach gui form |
| Total Inquiries | COUNT consultations | Trong period |
| Avg Session Duration | AVG session time | Seconds |
| Total Projects | COUNT published projects | — |
| Total Products | COUNT published products | — |

### Redis Keys Structure

```
analytics:pageview:{YYYY-MM-DD}:{path}    → STRING (INCR), TTL 48h
analytics:visitors:{YYYY-MM-DD}            → HyperLogLog (PFADD), TTL 48h
```

### DB Tables

**page_views** (detailed, high volume):
- BIGINT PK (khong ULID), page_path, visitor_ip, user_agent
- referrer, device_type, is_bot, session_id, viewed_at
- Partitioned by YEAR cho performance

**page_view_daily** (aggregated, fast query):
- page_path + view_date (unique)
- total_views, unique_visitors
- mobile_views, desktop_views, tablet_views, bot_views

### Bot Filtering

Patterns tu settings: Googlebot, Bingbot, Slurp, DuckDuckBot, Facebookbot...
- Bot traffic ghi rieng (is_bot=1), khong hien thi tren dashboard
- Empty User-Agent → khong tinh

### Admin IP Exclusion

- Setting: `analytics_excluded_ips` (JSON array)
- Admin IP tu dong exclude → khong cong traffic khi F5

### BullMQ Config

- Queue: `analytics`
- Schedule: Cron `*/10 * * * *` (moi 10 phut)
- Concurrency: 1 (chi 1 instance)
- Atomic: Redis MULTI/EXEC cho read-and-delete

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Redis da chay, BullMQ da setup
- Settings module da co (bot patterns, excluded IPs)

### File Structure

```
backend/src/modules/analytics/
├── analytics.module.ts
├── analytics.service.ts         # Pageview recording, dashboard queries
├── analytics.controller.ts      # Public pageview + Admin dashboard
├── entities/
│   ├── page-view.entity.ts      # BIGINT PK, partitioned by year
│   └── page-view-daily.entity.ts # Aggregated, UNIQUE path+date
└── dto/
    ├── record-pageview.dto.ts   # path, referrer, title
    └── analytics-query.dto.ts   # period (7d/30d/90d), interval

backend/src/queues/
└── traffic-sync.processor.ts    # TRAFFIC_SYNC_JOB cron

frontend/src/
├── hooks/usePageTracking.ts     # Auto-record pageview
└── app/admin/analytics/page.tsx # Dashboard voi charts
```

### Thu tu implement (Backend)

**Buoc 1: Pageview Recording (Redis, fast path)**
```typescript
// analytics.service.ts
async recordPageview(path: string, ip: string, ua: string, referrer?: string) {
  // 1. Check bot
  const botPatterns = await this.getSettingCached('analytics_bot_patterns');
  if (this.isBot(ua, botPatterns)) return; // silent skip

  // 2. Check excluded IPs
  const excludedIps = await this.getSettingCached('analytics_excluded_ips');
  if (excludedIps.includes(ip)) return; // admin IP skip

  // 3. Record vao Redis (KHONG ghi MySQL)
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const multi = this.redis.multi();
  multi.incr(`analytics:pageview:${date}:${path}`);
  multi.pfadd(`analytics:visitors:${date}`, ip);
  // TTL 48h cho tu cleanup
  multi.expire(`analytics:pageview:${date}:${path}`, 172800);
  multi.expire(`analytics:visitors:${date}`, 172800);
  await multi.exec();
}
```

**Buoc 2: TRAFFIC_SYNC_JOB**
```typescript
// traffic-sync.processor.ts
@Processor('analytics')
export class TrafficSyncProcessor extends WorkerHost {
  // Cron: */10 * * * * (moi 10 phut)
  async process(job: Job) {
    const today = new Date().toISOString().split('T')[0];

    // 1. SCAN Redis keys: analytics:pageview:{today}:*
    const keys = await this.redis.keys(`analytics:pageview:${today}:*`);

    for (const key of keys) {
      const path = key.replace(`analytics:pageview:${today}:`, '');
      const views = parseInt(await this.redis.get(key)) || 0;
      const uniqueKey = `analytics:visitors:${today}`;
      const unique = await this.redis.pfcount(uniqueKey);

      // 2. UPSERT vao page_view_daily
      await this.repo.query(`
        INSERT INTO page_view_daily (page_path, view_date, total_views, unique_visitors)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_views = VALUES(total_views),
          unique_visitors = VALUES(unique_visitors)
      `, [path, today, views, unique]);
    }
    // Redis keys giu nguyen (TTL 48h tu cleanup)
  }
}
```

**Buoc 3: Dashboard Queries**
```
GET /analytics/overview?period=30d:
  - total_visitors: SUM unique_visitors tu page_view_daily WHERE date range
  - total_inquiries: COUNT consultations WHERE date range
  - conversion_rate: inquiries / visitors * 100
  - Compare voi previous period → calculate % change

GET /analytics/traffic?period=30d&interval=day:
  - GROUP BY view_date, return labels[] + page_views[] + visitors[]

GET /analytics/top-pages?limit=10:
  - SUM total_views GROUP BY page_path ORDER BY total DESC

GET /analytics/devices:
  - Tu page_view_daily: SUM mobile_views, desktop_views, tablet_views
  - Calculate percentages

GET /analytics/sources:
  - Tu page_views (detailed): GROUP BY referrer domain
```

### Frontend Implementation

```
// hooks/usePageTracking.ts — auto pageview
useEffect(() => {
  api.post('/analytics/pageview', {
    path: window.location.pathname,
    referrer: document.referrer,
    title: document.title,
  }).catch(() => {}); // silent fail
}, [pathname]);

// admin/analytics/page.tsx
// Charts: recharts hoac chart.js
// Cards: total visitors, conversion rate, inquiries (voi % change)
// Top pages table
// Device pie chart
// Source bar chart
// Period selector: 7d | 30d | 90d
```

### Testing Checklist

- [ ] Pageview ghi vao Redis, KHONG ghi MySQL truc tiep
- [ ] Bot user-agent → khong ghi
- [ ] Admin IP → khong ghi
- [ ] TRAFFIC_SYNC_JOB chay moi 10 phut, UPSERT dung
- [ ] Dashboard KPIs: dung so lieu, % change dung
- [ ] HyperLogLog unique visitors dung
