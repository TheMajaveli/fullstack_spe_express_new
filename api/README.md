# CineNoir API (Node.js + Express + TypeScript + PostgreSQL + Prisma)

## Requirements
- Node 18+ (Docker recommended)

## Quick start (Docker)

From repo root:

```bash
docker-compose up -d --build
```

API will be on `http://localhost:4000`.

## Environment

Copy `api/env.example` to your own env file and export variables, or rely on `docker-compose.yml`.

Required:
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

## Database

### Migrations

Initial migration SQL is in `api/prisma/migrations/0001_init/migration.sql`.

If you want to apply it via Prisma (recommended):

```bash
cd api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cinenoir?schema=public" npx prisma migrate deploy
```

### Seed

```bash
cd api
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cinenoir?schema=public" npm run prisma:seed
```

Seeded admin:
- Email: `admin@cinenoir.local`
- Password: `Admin1234`

## Scripts

```bash
cd api
npm run dev
npm run build
npm test
```

## Endpoints (current)

### Health
- `GET /health` -> `{ ok: true }`

### Auth
- `POST /auth/register` body `{ email, username, password }`
- `POST /auth/login` body `{ email, password }`
- `POST /auth/refresh` body `{ refreshToken }`
- `POST /auth/logout` body `{ refreshToken }`
- `GET /auth/me` header `Authorization: Bearer <accessToken>`

### Movies (catalog)
- `GET /movies?q=&category=&rating=&sort=&page=` -> `{ success, data: { data, total, totalPages } }`
- `GET /movies/:id`

### Admin (ADMIN)
- `POST /movies` (multipart/form-data, optional file field `poster`)
- `PUT /movies/:id` (multipart/form-data, optional file field `poster`)
- `DELETE /movies/:id`
- `GET /categories`
- `POST /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

### Member space (JWT)
- `GET /user/me`
- `POST /user/watchlist/:movieId`
- `DELETE /user/watchlist/:movieId`
- `POST /user/ratings/:movieId` body `{ ratingNumber, note? }`
- `POST /user/history/:movieId`

## cURL examples

```bash
curl -s http://localhost:4000/health
```

