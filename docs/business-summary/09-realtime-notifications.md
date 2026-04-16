# 09. Real-time & Notifications

> Module: C3 (Real-time) + B2.8 (Notification Bell) + B4.4 (Consultation Alert)
> Priority: P1 | Status: Spec Done

---

## Summary

He thong thong bao real-time cho admin qua Socket.io. Khi co su kien quan trong (yeu cau tu van moi, project published, media processed), he thong gui thong bao tuc thi den admin dang online. Notifications duoc luu vao DB de admin xem lai sau. Ho tro notification bell voi unread count, mark as read, va notification sound (configurable).

---

## Workflow

### Socket.io Connection
```
Admin login thanh cong:
  → [1] Client connect Socket.io voi JWT trong auth.token
  → [2] Server middleware validate JWT
      - Invalid/expired → reject connection (error 401)
  → [3] Client emit 'join:admin'
  → [4] Server verify admin role, add vao room 'admin'
  → [5] Luu session: Redis session:{userId}
```

### Event Flow — New Consultation
```
Khach gui form tu van:
  → [1] API xu ly, luu DB
  → [2] Create notification records cho ALL active admins
  → [3] Socket.io emit 'consultation:new' → room 'admin'
      - Payload: { id, ref_code, name, project_type, created_at }
  → [4] Socket.io emit 'notification:new' → room user:{userId}
      - Payload: { id, type, title, body, link }
  → [5] Admin online:
      - Notification bell badge +1
      - Toast/popup hien thi
      - Notification sound (neu enabled)
```

### Event Flow — Media Ready
```
IMAGE_JOB xu ly xong:
  → [1] Socket.io emit 'media:ready' → room user:{uploadedBy}
      - Payload: { id, thumbnail_url, desktop_url, status }
  → [2] Admin UI cap nhat image preview
```

---

## Giai phap chi tiet

### Socket.io Events

**Server → Client:**

| Event | Room | Payload | Trigger |
|-------|------|---------|---------|
| `consultation:new` | admin | { id, ref_code, name, project_type } | Form submission |
| `consultation:status` | admin | { id, status, changed_by } | Status change |
| `media:ready` | user:{userId} | { id, thumbnail_url, desktop_url, status } | Image processed |
| `analytics:pageview` | admin | { path, count, timestamp } | Batched 10s |
| `notification:new` | user:{userId} | { id, type, title, body, link } | Any notification |

**Client → Server:**

| Event | Payload | Mo ta |
|-------|---------|-------|
| `join:admin` | {} | Admin join room (verified server-side) |

### Notification API (3 endpoints)

| Method | Path | Guard | Muc dich |
|--------|------|-------|----------|
| GET | `/api/notifications` | @Admin | List notifications (voi unread_count) |
| PUT | `/api/notifications/:id/read` | @Admin | Mark as read |
| PUT | `/api/notifications/read-all` | @Admin | Mark all as read |

### Notification Types

| Type | Mo ta | Link |
|------|-------|------|
| `consultation_new` | Yeu cau tu van moi | /admin/consultations/{id} |
| `project_published` | Du an duoc publish | /admin/projects/{id} |
| `system_error` | Loi he thong | null |

### DB Table: notifications

- id (ULID), user_id (FK), type, title, body
- link (URL de navigate), is_read (boolean)
- created_at
- Indexes: user_id + is_read, user_id + created_at
- Cleanup: xoa sau 90 ngay

### Redis Keys

```
session:{userId}  → { socketId, connectedAt, ip }
                  → TTL 86400s (24h)
```

### Technical Config

- Socket.io namespace: `/` (default)
- Redis adapter: pub/sub across instances
- Auth: JWT middleware on handshake
- Rate limit: connection attempts per IP
- Notification sound: configurable in settings

---

## Huong dan trien khai chi tiet

### Dieu kien tien quyet

- Auth module da hoan thanh (JWT cho Socket.io handshake)
- Redis da chay (Socket.io adapter)

### File Structure

```
backend/src/modules/notifications/
├── notifications.module.ts
├── notifications.service.ts     # CRUD notifications, create for events
├── notifications.controller.ts  # GET list, PUT read, PUT read-all
├── notifications.gateway.ts     # Socket.io WebSocket Gateway
└── entities/
    └── notification.entity.ts

backend/src/common/adapters/
└── redis-io.adapter.ts          # Socket.io Redis adapter (pub/sub)

frontend/src/
├── contexts/socket.context.tsx  # Socket.io client connection + events
├── components/admin/NotificationBell.tsx  # Bell icon + dropdown
└── hooks/useNotifications.ts    # Fetch + listen real-time
```

### Thu tu implement (Backend)

**Buoc 1: Socket.io Gateway**
```typescript
// notifications.gateway.ts
@WebSocketGateway({ cors: { origin: [...], credentials: true } })
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    // 1. Extract JWT tu client.handshake.auth.token
    // 2. Verify JWT → get user { id, role }
    // 3. Neu invalid → client.disconnect()
    // 4. Join room: client.join(`user:${userId}`)
  }

  @SubscribeMessage('join:admin')
  handleJoinAdmin(client: Socket) {
    // Verify user role is admin/super_admin
    const user = client.data.user;
    if (user.role === 'admin' || user.role === 'super_admin') {
      client.join('admin');
    }
  }

  // Helper methods (called by other services):
  emitToAdmin(event: string, data: any) {
    this.server.to('admin').emit(event, data);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
```

**Buoc 2: Redis Adapter (main.ts)**
```typescript
// main.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';

const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();
await Promise.all([pubClient.connect(), subClient.connect()]);

const app = await NestFactory.create(AppModule);
app.useWebSocketAdapter(new IoAdapter(app).createIOServer(server, {
  adapter: createAdapter(pubClient, subClient),
}));
```

**Buoc 3: Notification Service**
```typescript
@Injectable()
export class NotificationsService {
  // createForAllAdmins(type, title, body, link):
  //   1. SELECT all admin users WHERE is_active=1 AND deleted_at IS NULL
  //   2. Batch INSERT notifications (1 per admin)
  //   3. Emit 'notification:new' to each user room

  // findForUser(userId, query): pagination, unread_only filter
  //   - QUAN TRONG: luon tra unread_count trong meta

  // markRead(notificationId, userId):
  //   - Verify notification belongs to user
  //   - UPDATE is_read = true

  // markAllRead(userId):
  //   - UPDATE notifications SET is_read=1 WHERE user_id=? AND is_read=0
  //   - Return { updated: count }
}
```

**Buoc 4: Tich hop vao cac module khac**
```
// Trong ConsultationsService.create():
await this.notificationsService.createForAllAdmins(
  'consultation_new',
  'Yeu cau tu van moi',
  `${dto.name} - ${dto.project_type}`,
  `/admin/consultations/${consultation.id}`
);
this.gateway.emitToAdmin('consultation:new', {
  id: consultation.id, ref_code, name: dto.name, project_type: dto.project_type
});

// Trong ImageProcessor.process() (thanh cong):
this.gateway.emitToUser(uploadedBy, 'media:ready', {
  id: mediaId, thumbnail_url, desktop_url, status: 'completed'
});
```

### Frontend Implementation

**Socket Context:**
```typescript
// contexts/socket.context.tsx
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    const s = io(API_URL, {
      auth: { token: localStorage.getItem('access_token') },
    });
    s.on('connect', () => s.emit('join:admin'));
    setSocket(s);
    return () => { s.disconnect(); };
  }, [user]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
```

**NotificationBell:**
```
- Fetch initial: GET /notifications?unread_only=true&limit=5
- Listen: socket.on('notification:new', (data) => prepend to list, increment badge)
- Click bell: toggle dropdown, show notification list
- Click notification: navigate to link, PUT /notifications/:id/read
- "Mark all read": PUT /notifications/read-all
- Badge: unread count (tu meta.unread_count)
- Optional: play sound khi nhan notification (check settings.notification_sound)
```

### Testing Checklist

- [ ] Socket.io connect voi JWT valid → success, join rooms
- [ ] Socket.io connect voi JWT invalid → disconnect
- [ ] consultation:new event → admin nhan real-time
- [ ] media:ready event → chi user upload nhan
- [ ] Notification list: pagination, unread filter
- [ ] Mark read / mark all read
- [ ] Badge count dung, cap nhat real-time
