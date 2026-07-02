# ConnectSphere

A production-ready, full-stack social networking platform — Spring Boot + React, with JWT auth, real-time chat/notifications over WebSocket, and a premium dark-themed UI.

```
Backend:  Java 21 · Spring Boot 3 · Spring Security · JWT · Spring Data JPA · MySQL · WebSocket (STOMP) · Maven
Frontend: React 18 (Vite) · Tailwind CSS · Framer Motion · Axios · React Router · Context API
```

---

## 1. Folder structure

```
connectsphere/
├── backend/
│   ├── src/main/java/com/connectsphere/
│   │   ├── config/          # Security, WebSocket, Swagger, CORS, file storage, JPA auditing, data seeding
│   │   ├── controller/      # REST + WebSocket controllers
│   │   ├── dto/
│   │   │   ├── request/     # Validated request payloads (Jakarta Validation)
│   │   │   └── response/    # Response payloads (records)
│   │   ├── entity/          # JPA entities
│   │   ├── exception/       # Custom exceptions + GlobalExceptionHandler
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # JWT util, filters, UserDetailsService
│   │   ├── service/         # Service interfaces
│   │   │   └── impl/        # Service implementations
│   │   └── util/            # DTO mapping helpers
│   ├── src/test/            # JUnit 5 + Mockito unit tests
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + endpoint wrappers
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth, Toast, Socket (WebSocket) contexts
│   │   └── pages/           # Route-level pages
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
├── database/
│   └── schema.sql           # Reference MySQL DDL (app also auto-migrates via Hibernate)
├── docker-compose.yml        # MySQL + backend + frontend, one command
└── ConnectSphere.postman_collection.json
```

---

## 2. Architecture

**Layered backend:** `Controller → Service → Repository → Entity`, with DTOs at the controller boundary so entities never leak over the wire. `GlobalExceptionHandler` converts every exception (validation, not-found, duplicate, unauthorized, token, generic) into a consistent `ApiResponse` JSON envelope.

**Auth:** Access tokens (JWT, 15 min) are stateless and validated on every request by `JwtAuthenticationFilter`. Refresh tokens (7 days) are opaque UUIDs persisted in `refresh_tokens` and rotated on refresh/logout. Passwords are BCrypt-hashed. `RoleName.ROLE_USER` / `ROLE_ADMIN` drive method- and endpoint-level authorization (`hasRole("ADMIN")`, `@EnableMethodSecurity`).

**Real-time:** STOMP over WebSocket (SockJS fallback) at `/ws`. `WebSocketAuthInterceptor` authenticates the STOMP `CONNECT` frame using the same JWT, and attaches the user's email as the STOMP `Principal` so `convertAndSendToUser(email, ...)` reaches the right private queue:
- `/user/queue/messages` — live chat delivery
- `/user/queue/notifications` — live notification push
- `/user/queue/typing` — typing indicators

**Frontend:** `AuthContext` owns the session and silent token refresh (Axios response interceptor retries once on 401, refreshing via `/auth/refresh`, queuing concurrent requests). `SocketContext` opens the STOMP connection once a user is authenticated and exposes `sendChatMessage` / `sendTyping` plus subscribable handlers consumed by `Navbar` (badges) and `Chat` (live thread).

---

## 3. Database schema

See [`database/schema.sql`](./database/schema.sql) for the full reference DDL (also reproduced as an ER summary below). In development, Hibernate (`ddl-auto: update`) creates/evolves this schema automatically from the JPA entities — the SQL file is for review, manual provisioning, and environments where migrations are managed outside the app.

**Core tables:** `users`, `roles`, `user_roles` (RBAC) · `friend_requests`, `friendships` · `posts`, `comments` (self-referencing for replies), `post_likes` · `messages` · `notifications` · `refresh_tokens`.

Key design choices:
- `friendships` stores one row per pair (`user_one_id < user_two_id`) to avoid duplicate/symmetric rows.
- `comments.parent_comment_id` self-references for threaded replies.
- `notifications.reference_id` + `type` let the frontend route to the right screen without extra joins.

---

## 4. Getting started (local, no Docker)

### Prerequisites
- Java 21, Maven 3.9+
- Node.js 20+
- MySQL 8 running locally

### Backend
```bash
cd backend
cp .env.example .env        # edit DB credentials / JWT secret as needed
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS connectsphere"
mvn spring-boot:run
```
The app seeds RBAC roles and a default admin (`admin@connectsphere.com` / `Admin@123`) on first boot — **change this password immediately in any non-local environment.**

API docs (Swagger UI): `http://localhost:8080/swagger-ui.html`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`. The Vite dev server proxies `/api`, `/uploads` and `/ws` to `http://localhost:8080`.

---

## 5. Getting started (Docker)

```bash
docker compose up --build
```
This starts MySQL, the backend (`:8080`), and the frontend served by nginx (`:80`). First boot seeds roles + the default admin account automatically. Uploaded files persist in the `uploads-data` volume; MySQL data persists in `mysql-data`.

To run against a separately-hosted MySQL, edit the `backend` service environment block in `docker-compose.yml` (`DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`).

---

## 6. Running tests

```bash
cd backend
mvn test
```
Unit tests use JUnit 5 + Mockito against an H2 in-memory profile (`application-test.yml`), isolating the service layer from MySQL. `AuthServiceImplTest` and `PostServiceImplTest` cover registration/login/token flows and post ownership authorization as representative examples — the same pattern (mock repositories, assert on DTOs and thrown exceptions) extends cleanly to the remaining services.

---

## 7. API overview

20+ REST endpoints across 7 resource groups, documented interactively via Swagger/OpenAPI and importable from [`ConnectSphere.postman_collection.json`](./ConnectSphere.postman_collection.json):

| Group | Examples |
|---|---|
| Auth | register, login, refresh, logout, change-password, forgot/reset-password |
| Users | me, get profile, update profile, upload avatar/cover, search, suggested |
| Friends | send/accept/reject/cancel request, remove friend, pending/sent, list, mutual count |
| Posts | create/update/delete, get, feed (paginated), user timeline, like/unlike, share, upload image |
| Comments | add (with optional `parentCommentId` for replies), delete, list (nested) |
| Messages | send, conversation history (paginated), mark read, unread count |
| Notifications | list (paginated), mark one/all read, unread count |
| Admin | list users, disable/enable, delete user, delete post, dashboard analytics |

Every response is wrapped in a uniform envelope:
```json
{ "success": true, "message": "Success", "data": { ... }, "timestamp": "2026-07-01T10:00:00" }
```
Validation failures return `data.errors` as a field → message map; all errors carry an appropriate HTTP status (400/401/403/404/409/413/500).

---

## 8. Security

- BCrypt password hashing, stateless JWT access tokens, rotating opaque refresh tokens
- `SecurityFilterChain` locks down every route except `/api/auth/**`, Swagger, static uploads, and health, and requires `ROLE_ADMIN` for `/api/admin/**`
- CORS restricted to configured origins (`app.cors.allowed-origins`)
- Jakarta Validation on every request DTO (`@NotBlank`, `@Email`, `@Size`, password complexity pattern, etc.)
- `GlobalExceptionHandler` never leaks stack traces to clients
- WebSocket `CONNECT` frames are authenticated the same way as REST calls (JWT in the `Authorization` STOMP header) — there's no unauthenticated path into the message broker

---

## 9. Frontend UI/UX notes

Dark-mode-only, glassmorphic surfaces (`bg-card/70` + `backdrop-blur-xl`), 12–16px rounded corners, and a consistent token set (`bg`, `bg-secondary`, `card`, `accent`, `accent-secondary`, `success`, `error`, `text-primary`, `text-secondary`) defined once in `tailwind.config.js` and reused everywhere via utility classes (`.card`, `.btn-primary`, `.input-field`, `.glass`).

Framer Motion drives page/element transitions, hover/tap feedback, animated dropdowns and modals, and toast entrances/exits. Skeleton loaders (`SkeletonCard.jsx`) cover the feed, profile, friends, and notifications while data loads. The layout is mobile-first with a collapsible desktop sidebar and a bottom tab bar under `lg` breakpoints.

---

## 10. Deployment guide (production checklist)

1. **Secrets:** generate a strong, unique `JWT_SECRET` (32+ random bytes, base64-encoded) and real MySQL credentials — never reuse the values in `.env.example`.
2. **Database:** point `DB_HOST`/`DB_USERNAME`/`DB_PASSWORD` at a managed MySQL instance (RDS, Cloud SQL, etc.); consider switching `ddl-auto` to `validate` and managing migrations with Flyway/Liquibase once the schema stabilizes.
3. **File storage:** swap `FileStorageServiceImpl` for an S3/Cloud Storage-backed implementation (`FileStorageService` interface stays the same) instead of the local filesystem.
4. **CORS:** set `CORS_ORIGINS` to your real frontend domain(s) only.
5. **TLS:** terminate HTTPS at a load balancer/reverse proxy in front of both the backend and the nginx frontend container; update the frontend's `/ws` and `/api` targets accordingly (or keep the nginx proxy pattern from `vite.config.js`, mirrored in production via an nginx `location` block).
6. **Mail:** configure `MAIL_HOST`/`MAIL_USERNAME`/`MAIL_PASSWORD` (or an API-based provider) to actually deliver password-reset emails — `AuthServiceImpl.forgotPassword` currently logs the reset token and is the single integration point.
7. **Build & ship:** `docker compose build` produces the backend and frontend images; push them to your registry and deploy behind your orchestrator of choice (ECS, Kubernetes, etc.), with MySQL as a managed service rather than the compose container.
8. **Observability:** `/actuator/health` is exposed for liveness/readiness probes; wire up centralized logging and a metrics backend (Micrometer → Prometheus/Datadog) for production visibility.

---

## 11. Best practices reflected in this codebase

- DTO pattern at every controller boundary; entities never serialize directly
- Layered architecture with interfaces for every service (testable, swappable implementations)
- Centralized, typed exception handling instead of ad-hoc try/catch in controllers
- Jakarta Validation on all inputs, with a uniform validation-error response shape
- Idempotent data seeding (`DataInitializer`) instead of brittle SQL-only fixtures
- Stateless auth (no server-side session), short-lived access tokens, rotating refresh tokens
- Pagination on every list endpoint that can grow unbounded (feed, timeline, conversations, notifications, admin user list)
- Multi-stage Docker builds for small, reproducible production images
- Environment-driven configuration (`application.yml` reads from env vars with sane local defaults) — no secrets hardcoded
