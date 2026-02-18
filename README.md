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

## 📁 Project Structure

```
srm-facerank/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app + middleware
│   │   ├── config.py            # Pydantic settings
│   │   ├── database.py          # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── user.py          # User model
│   │   │   ├── photo.py         # Photo model (with ELO fields)
│   │   │   └── vote.py          # Vote model
│   │   ├── schemas/
│   │   │   └── __init__.py      # All Pydantic schemas
│   │   ├── routes/
│   │   │   ├── auth.py          # POST /auth/register, /auth/login
│   │   │   ├── photos.py        # POST /photos/upload, DELETE, GET pair
│   │   │   ├── vote.py          # POST /vote
│   │   │   ├── leaderboard.py   # GET /leaderboard
│   │   │   └── admin.py         # Admin endpoints
│   │   └── utils/
│   │       ├── auth.py          # JWT helpers, get_current_user
│   │       ├── elo.py           # ELO calculation
│   │       └── cloudinary_helper.py
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/0001_initial.py
│   ├── alembic.ini
│   ├── requirements.txt
│   ├── .env.example
│   └── run.sh
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx             # Redirects to /vote or /login
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   ├── vote/page.tsx        # Main swipe UI
    │   ├── leaderboard/page.tsx
    │   ├── upload/page.tsx
    │   └── admin/page.tsx
    ├── components/
    │   └── Navbar.tsx
    ├── services/
    │   └── api.ts               # Axios client + all API calls
    ├── package.json
    ├── next.config.js
    ├── tailwind.config.js
    └── tsconfig.json
```

---

## 🚀 Local Setup (One-Day Guide)

### Prerequisites

1. **Python 3.12** — `python3.12 --version`
2. **Node.js 18+** — `node --version`
3. **PostgreSQL** — Running locally
4. **Cloudinary account** — [cloudinary.com](https://cloudinary.com) (free tier)

---

### Step 1: PostgreSQL Setup

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE srm_facerank;"
```

---

### Step 2: Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From the dashboard, copy your **Cloud Name**, **API Key**, and **API Secret**
3. You'll paste these into the `.env` file below

---

### Step 3: Backend Setup

```bash
cd srm-facerank/backend

# Create and activate virtual environment
python3.12 -m venv venv
source venv/bin/activate          # Linux/macOS
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values:
#   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/srm_facerank
#   SECRET_KEY=generate-a-random-64-char-string
#   CLOUDINARY_CLOUD_NAME=your_cloud_name
#   CLOUDINARY_API_KEY=your_api_key
#   CLOUDINARY_API_SECRET=your_api_secret

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be live at: **http://localhost:8000**
API Docs (Swagger): **http://localhost:8000/docs**

---

### Step 4: Frontend Setup

Open a new terminal:

```bash
cd srm-facerank/frontend

# Copy env file
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000  (already set)

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be live at: **http://localhost:3000**

---

### Step 5: Create Admin User

After registering a user normally, set them as admin via psql:

```bash
psql -U postgres -d srm_facerank -c \
  "UPDATE users SET is_admin = true WHERE username = 'your_username';"
```

---

## 🔌 API Reference

### Auth
| Method | Path | Body | Auth Required |
|--------|------|------|--------------|
| POST | `/auth/register` | `{username, email, password}` | No |
| POST | `/auth/login` | `{username, password}` | No |
| GET | `/auth/me` | — | Yes |

### Photos
| Method | Path | Auth Required |
|--------|------|--------------|
| POST | `/photos/upload` | Yes (multipart/form-data) |
| DELETE | `/photos/{id}` | Yes (uploader only) |
| GET | `/photos/random-pair` | Yes |
| GET | `/photos/my` | Yes |

### Voting
| Method | Path | Body |
|--------|------|------|
| POST | `/vote` | `{winner_photo_id, loser_photo_id}` |

### Leaderboard
| Method | Path | Params |
|--------|------|--------|
| GET | `/leaderboard` | `?limit=20&offset=0` |

### Admin
| Method | Path | Auth Required |
|--------|------|--------------|
| DELETE | `/admin/photo/{id}` | Admin only |
| POST | `/admin/ban-user/{id}` | Admin only |
| POST | `/admin/unban-user/{id}` | Admin only |
| GET | `/admin/users` | Admin only |

---

## ⚡ ELO Algorithm

```python
K = 32  # K-factor

def expected_score(rating_a, rating_b):
    return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

def calculate_elo(winner_rating, loser_rating):
    expected_winner = expected_score(winner_rating, loser_rating)
    new_winner = winner_rating + K * (1 - expected_winner)
    new_loser = loser_rating + K * (0 - (1 - expected_winner))
    return new_winner, new_loser
```

Starting ELO: **1000** for all photos.

---

## 🔐 Security Features

- Passwords hashed with bcrypt
- JWT tokens expire after 24 hours
- Rate limiting: 200 requests/minute per IP
- Photo delete: only uploader can delete their own photos
- Admin endpoints protected by role-based access control
- Banned users cannot login or vote

---

## 🛠️ Development Commands

```bash
# Backend: generate new migration after model changes
alembic revision --autogenerate -m "description"
alembic upgrade head

# Backend: run with auto-reload
uvicorn app.main:app --reload

# Frontend: build for production
npm run build
npm start
```