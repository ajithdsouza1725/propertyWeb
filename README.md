# PropertyWeb (MangaloreHomes)

Frontend: Next.js + Tailwind v4 + shadcn/ui  
Backend: Spring Boot + Spring Security + JWT  
Database: PostgreSQL + Flyway

## Repo layout

- `propertyweb/` – Next.js app (public site + seller/admin shells)
- `backend/` – Spring Boot API (`propertyweb-api`)

## Prerequisites

- Node.js (latest LTS recommended)
- Java 21
- Maven 3.9+
- PostgreSQL 14+

## 1) Run PostgreSQL

Create a database:

```sql
create database propertyweb;
```

## 2) Run backend (Spring Boot)

From `backend/`:

```bash
mvn spring-boot:run
```

Environment (optional):

- `DATABASE_URL` (default `jdbc:postgresql://localhost:5432/propertyweb`)
- `DATABASE_USERNAME` (default `postgres`)
- `DATABASE_PASSWORD` (default `postgres`)
- `JWT_SECRET` (default is dev-only; set a long secret in prod)
- `CORS_ALLOWED_ORIGINS` (default `http://localhost:3000`)

On first start, Flyway runs `backend/src/main/resources/db/migration/V1__init.sql` to create tables + seed localities/types/amenities.

### Backend endpoints (MVP)

- **Auth**
  - `POST /api/auth/signup`
  - `POST /api/auth/login`
  - `GET /api/auth/me` (Bearer token)
- **Public**
  - `GET /api/public/property-types`
  - `GET /api/public/localities`
  - `GET /api/public/properties`
  - `GET /api/public/properties/{slug}`
  - `POST /api/public/enquiries`
- **Seller** (Bearer token; role OWNER/AGENT/ADMIN)
  - `GET /api/seller/properties`
  - `POST /api/seller/properties`
  - `GET /api/seller/enquiries`
- **Admin** (Bearer token; role ADMIN)
  - `GET /api/admin/properties`
  - `POST /api/admin/properties/{id}/approve`
  - `POST /api/admin/properties/{id}/reject`
  - `GET /api/admin/enquiries`

## 3) Run frontend (Next.js)

From `propertyweb/`:

```bash
npm run dev
```

Open:

- `http://localhost:3000/` (public)
- `http://localhost:3000/seller` (seller shell)
- `http://localhost:3000/admin` (admin shell)

## Notes

- Image hosting is currently using Unsplash remote images (Next.js `remotePatterns` set). Later we’ll switch listing uploads to Cloudinary.

