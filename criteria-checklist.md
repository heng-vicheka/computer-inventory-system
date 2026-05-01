# INF653 Criteria Checklist

Use this checklist to track implementation progress against `criteria.md`.

Scan date: 2026-05-01
Scan basis: current files in this branch.

## 1) Project Overview

- [ ] Build a web-based internal tool for IT to track hardware and peripherals.
- [ ] Support full asset lifecycle from procurement to assignment/check-in/check-out/reporting.

## 2) Technical Stack

- [x] Backend uses Node.js + Express.js.
- [x] Server-side rendering uses Handlebars (`.hbs`).
- [ ] Database layer uses MongoDB + Mongoose schema modeling.
- [ ] Document uploads use local filesystem storage or GridFS.
- [ ] Authentication supports JWT for API.
- [ ] Service-level access supports API Keys.
- [ ] UI auth uses JWT-cookie or session-based auth.
- [ ] Deploy app to cloud hosting (Render/Railway/AWS/DigitalOcean/etc.).

## 3) Security & Middleware Requirements

- [x] CORS is strictly same-origin (app domain only).
- [ ] Rate limiting is max 20 requests/minute/IP.
- [x] `morgan` request logging is integrated for audit trail.
- [ ] All API routes except `/login` require valid Bearer JWT.
- [ ] API key middleware validates custom header (for example `x-api-key`) for non-browser access.
- [ ] RBAC restricts user creation to Admin only.
- [ ] RBAC restricts API key generation to Admin only.
- [ ] RBAC restricts item deletion to Admin only.

## 4) Functional Requirements

### 4.1 Inventory Management (CRUD)

- [x] Inventory items are manageable via HBS UI forms.
- [x] Inventory items are manageable via JSON API endpoints.
- [x] Item has unique Item ID.
- [x] Item has Serial Number field.
- [x] Item has Model field.
- [x] Item has Brand field.
- [x] Item has Category field.
- [ ] Item has Status field with allowed values: Available, In-Use, Maintenance, Retired.
- [x] Item has Date Acquired field.
- [x] Classification supports Computers (Laptop/Desktop/Server).
- [x] Classification supports Peripherals (Monitor/Keyboard/etc.).

### 4.2 User Management & Roles

- [ ] Admin can create user accounts from UI.
- [ ] Admin can create user accounts from API.
- [ ] Users are assigned role (Admin or Technician) on create/update.
- [ ] Admin can enable/disable user accounts.
- [ ] Passwords are securely hashed (for example bcrypt).
- [ ] Login issues JWT token.

### 4.3 API Key Management (Admin Only)

- [ ] Admin UI page exists for API key generation.
- [ ] API key generation creates unique key values.
- [ ] API keys are hashed in database.
- [ ] Raw API key is shown only once at creation.
- [ ] Admin can list active API keys.
- [ ] Admin can revoke/delete API keys immediately.

### 4.4 Check-in / Check-out System

- [ ] Checkout assigns an Available item to a user.
- [ ] Checkout requires/uploads reference document.
- [ ] Check-in returns item status to Available.
- [ ] Check-in requires/uploads return inspection document.

### 4.5 Asset History Tracking

- [x] Keep chronological transaction log per item for all check-ins/checkouts.
- [ ] UI shows historical assignees per item.
- [ ] UI shows duration of use per assignment.
- [ ] UI provides links to uploaded reference documents.

### 4.6 Reporting

- [x] Inventory status report shows total vs deployed assets.
- [ ] Asset aging report lists items older than 3 years.
- [ ] User audit report shows assets currently associated with selected user.

## 5) API Endpoints

- [ ] `POST /api/auth/login` implemented and public (rate limited).
- [ ] `POST /api/users` implemented and JWT Admin-only.
- [ ] `PATCH /api/users/:id/role` implemented and JWT Admin-only.
- [ ] `PATCH /api/users/:id/status` implemented and JWT Admin-only.
- [ ] `POST /api/keys` implemented and JWT Admin-only.
- [ ] `GET /api/keys` implemented and JWT Admin-only.
- [ ] `DELETE /api/keys/:id` implemented and JWT Admin-only.
- [ ] `GET /api/items` implemented and allows JWT or API Key.
- [ ] `GET /api/items/:id/history` implemented and JWT-protected.
- [ ] `POST /api/items` implemented and JWT-protected.
- [ ] `PUT /api/items/:id` implemented and JWT-protected.
- [ ] `DELETE /api/items/:id` implemented as soft delete and JWT Admin-only.
- [ ] `POST /api/transactions/checkout` implemented and JWT + multipart upload.
- [ ] `POST /api/transactions/checkin` implemented and JWT + multipart upload.

## 6) Submission & Grading

### 6.1 Submission Rules

- [ ] Team has at least 80% requirement completion.
- [ ] Live deployed URL is available.
- [ ] GitHub repository URL is available.

### 6.2 Rubric Readiness

- [ ] Application functionality is production-ready (CRUD, check-in/out, API keys).
- [ ] UI/UX is polished, navigable, and responsive.
- [ ] Security is complete (JWT, API keys, RBAC, rate limiting, CORS).
- [ ] Audit logging/history tracking is complete and demonstrable.

## 7) Business Rules

- [ ] Items in `Maintenance` cannot be checked out.
- [ ] Items in `Retired` cannot be checked out.
- [ ] Disabled users cannot log in/authenticate.
- [ ] Disabled users' API keys are invalidated.
- [x] Items are not hard-deleted (use status/soft delete).
- [x] Users are not hard-deleted (use status/soft delete).
- [x] Historical logs are preserved for integrity.

## Suggested Tracking Fields

- [ ] Add owner for each major section.
- [ ] Add target date for each major section.
- [ ] Add evidence links (PR, screenshot, API test) for each completed item.

## Notes From This Scan

- Inventory CRUD is implemented in both UI and API (`/inventory`, `GET/POST/PUT/DELETE /api/items`), including soft delete for items.
- Dashboard provides inventory status totals (including deployed/in-use count), but dedicated reporting endpoints/pages are still incomplete.
- Rate limiting middleware exists, but current `.env` values do not match `20 req/min` (`RATE_LIMIT_MAX=100`, `RATE_LIMIT_WINDOW=15*60*1000`).
- JWT auth, API key middleware, RBAC enforcement, and most required auth-protected API behavior are not implemented in this branch.
- Criteria asks for MongoDB + Mongoose, but this branch currently uses Turso/SQLite via Drizzle.
