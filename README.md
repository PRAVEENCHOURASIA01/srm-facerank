# 🔥 SRM FaceRank

A campus swipe voting game similar to Facemash — vote on photos, watch the ELO rankings update in real-time.

## ✨ Features

- **User Auth** — Register / login with JWT tokens
- **Photo Upload** — Cloudinary-backed image storage
- **Swipe Voting** — Click to vote between two random photos
- **ELO Rankings** — Standard chess-style ELO algorithm (K=32)
- **Leaderboard** — Live rankings sorted by ELO
- **My Photos** — Upload and delete your own photos
- **Admin Panel** — Delete any photo, ban/unban users
- **Rate Limiting** — 200 req/min per IP

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy 2.x, Pydantic v2 |
| Auth | python-jose (JWT), passlib[bcrypt] |
| Migrations | Alembic |
| Database | PostgreSQL |
| Image Storage | Cloudinary (free tier) |
| Frontend | Next.js 14, React 18, TailwindCSS |
| Animation | Framer Motion |
| HTTP Client | Axios |

---
