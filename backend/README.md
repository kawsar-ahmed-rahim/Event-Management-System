# Event Management System API

Express + MongoDB (Mongoose) REST API with JWT auth, roles, event CRUD and seat-safe registration. Runs locally and on Vercel.

## Run locally
```bash
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run dev               # http://localhost:5000/api/v1/health
npm run seed:admin        # optional: creates an admin from ADMIN_* in .env
```

## Deploy to Vercel
1. Push to GitHub (`.env` is git-ignored; commit `package-lock.json`).
2. Import the repo in Vercel (Framework preset: **Other**).
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `COOKIE_EXPIRES_DAYS`, `CLIENT_URL`.
4. In MongoDB Atlas, Network Access, allow `0.0.0.0/0` (Vercel IPs are dynamic).
5. Deploy, then open `https://<your-app>.vercel.app/api/v1/health`.

## Endpoints (prefix `/api/v1`)
| Method | Path | Access |
|---|---|---|
| POST | `/auth/register`, `/auth/login`, `/auth/logout` | public |
| GET | `/auth/me` | logged in |
| GET | `/events` (search, category, city, from, to, free, past, sort, page, limit) | public |
| GET | `/events/:id` | public (drafts: owner/admin) |
| POST | `/events` | organizer, admin |
| PATCH / DELETE | `/events/:id` | owner, admin |
| GET | `/events/mine`, `/events/:id/attendees` | organizer, admin |
| POST / DELETE | `/events/:id/register` | logged in |
| GET | `/registrations/me` | logged in |
| GET | `/admin/stats`, `/admin/users` | admin |
| PATCH | `/admin/users/:id/role` | admin |

Auth works with the `token` httpOnly cookie or an `Authorization: Bearer <token>` header.
Frontends must send `credentials: "include"` (fetch) / `withCredentials: true` (axios) to use the cookie.
