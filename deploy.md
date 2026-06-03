# DEPLOYMENT.md

## DatFlow Dashboard — Render Deployment Guide

**Stack:** FastAPI (backend) + Next.js 15 (frontend)  
**Platform:** [Render.com](https://render.com)  
**Repo structure:** Monorepo — one GitHub repo, two Render services

---

## Before You Start — Checklist

You will need:

- [ ] A [GitHub](https://github.com) account
- [ ] A [Render](https://render.com) account (free tier is fine)
- [ ] Your **KoboToolbox API token** (Account Settings → API Token)
- [ ] Your **KoboToolbox Asset UID** (from the form URL: `kf.kobotoolbox.org/#/forms/{ASSET_UID}/...`)
- [ ] Git installed on your machine
- [ ] Node.js 18+ and Python 3.11+ installed locally (for testing before deploy)

---

## Part 1 — Prepare the Project

### Step 1 — Add the two Dockerfiles

These files tell Render how to build each service.

**Create `backend/Dockerfile`:**

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create `frontend/Dockerfile`:**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

### Step 2 — Enable standalone output in Next.js

Open `frontend/next.config.ts` and add `output: "standalone"`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",       // ← add this line
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
```

---

### Step 3 — Add the render.yaml blueprint (optional but recommended)

Create `render.yaml` in the **root** of the repo (next to `backend/` and `frontend/`):

```yaml
services:
  - type: web
    name: datflow-backend
    runtime: docker
    rootDir: backend
    envVars:
      - key: KOBO_API_TOKEN
        sync: false
      - key: KOBO_ASSET_UID
        sync: false
      - key: KOBO_BASE_URL
        value: https://kf.kobotoolbox.org
      - key: DASHBOARD_USERNAME
        sync: false
      - key: DASHBOARD_PASSWORD
        sync: false
      - key: JWT_SECRET_KEY
        generateValue: true
      - key: JWT_ALGORITHM
        value: HS256
      - key: JWT_EXPIRE_MINUTES
        value: 480
      - key: ENVIRONMENT
        value: production

  - type: web
    name: datflow-frontend
    runtime: docker
    rootDir: frontend
    envVars:
      - key: NEXT_PUBLIC_API_URL
        fromService:
          name: datflow-backend
          type: web
          property: host
```

> `generateValue: true` tells Render to auto-generate a secure random string for `JWT_SECRET_KEY`.  
> `fromService` tells Render to automatically wire the backend URL into the frontend — no manual copy-paste needed.

---

### Step 4 — Add a .dockerignore to each service

**`backend/.dockerignore`:**
```
__pycache__/
*.pyc
.venv/
venv/
.env
*.egg-info/
```

**`frontend/.dockerignore`:**
```
node_modules/
.next/
.env
.env.local
```

---

## Part 2 — Push to GitHub

### Step 5 — Initialise the git repository

From the project root (`datflow-dashboard/`):

```bash
git init
git add .
git commit -m "Initial commit — DatFlow Dashboard"
```

### Step 6 — Create a GitHub repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `datflow-dashboard`
3. Set it to **Private** (this repo contains deployment config)
4. Do **not** initialise with a README — your local repo already has one
5. Click **Create repository**

### Step 7 — Push your code

Copy the commands GitHub shows you, or run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/datflow-dashboard.git
git branch -M main
git push -u origin main
```

Confirm everything is on GitHub before moving to Render.

---

## Part 3 — Deploy on Render

You have two options: **Blueprint** (automated, uses render.yaml) or **Manual** (step by step). Blueprint is faster if you added `render.yaml` in Step 3.

---

### Option A — Blueprint Deploy (recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New → Blueprint**
3. Connect your GitHub account if prompted
4. Select your `datflow-dashboard` repo
5. Render reads `render.yaml` and shows you both services
6. Click **Apply**
7. Render prompts you to fill in the `sync: false` variables:
   - `KOBO_API_TOKEN` — paste your KoboToolbox API token
   - `KOBO_ASSET_UID` — paste your form asset UID
   - `DASHBOARD_USERNAME` — choose a username (e.g. `admin`)
   - `DASHBOARD_PASSWORD` — choose a strong password
8. Click **Apply** to start both deploys

Render builds the backend first, then wires its URL into the frontend automatically.

---

### Option B — Manual Deploy (step by step)

**Deploy the backend first.**

#### Step 8 — Deploy the backend

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New → Web Service**
3. Connect GitHub and select your repo
4. Fill in the service settings:
   - **Name:** `datflow-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Docker (Render auto-detects the Dockerfile)
   - **Region:** Choose the region closest to your users (Oregon or Frankfurt)
   - **Branch:** `main`
   - **Instance type:** Free (or Starter $7/mo for always-on)
5. Scroll to **Environment Variables** and add:

   | Key | Value |
   |-----|-------|
   | `KOBO_API_TOKEN` | your KoboToolbox API token |
   | `KOBO_ASSET_UID` | your form asset UID |
   | `KOBO_BASE_URL` | `https://kf.kobotoolbox.org` |
   | `DASHBOARD_USERNAME` | e.g. `admin` |
   | `DASHBOARD_PASSWORD` | a strong password |
   | `JWT_SECRET_KEY` | a random 32+ character string — generate one with: `python3 -c "import secrets; print(secrets.token_hex(32))"` |
   | `JWT_ALGORITHM` | `HS256` |
   | `JWT_EXPIRE_MINUTES` | `480` |
   | `ENVIRONMENT` | `production` |

6. Click **Create Web Service**
7. Wait for the build to complete (3–5 minutes first time)
8. Copy the service URL shown at the top — it looks like `https://datflow-backend.onrender.com`

#### Step 9 — Deploy the frontend

1. Click **New → Web Service** again
2. Select the same repo
3. Fill in the service settings:
   - **Name:** `datflow-frontend`
   - **Root Directory:** `frontend`
   - **Runtime:** Docker
   - **Region:** Same as backend
   - **Branch:** `main`
4. Scroll to **Environment Variables** and add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | the backend URL from Step 8 (e.g. `https://datflow-backend.onrender.com`) |

5. Scroll to **Advanced → Docker Build Arguments** and add the same:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://datflow-backend.onrender.com` |

   > This is needed because `NEXT_PUBLIC_*` variables are baked in at **build time** in Next.js, not just runtime. Both the env var and the build argument are required.

6. Click **Create Web Service**
7. Wait for the build (5–8 minutes first time)
8. Your dashboard URL is shown at the top — e.g. `https://datflow-frontend.onrender.com`

---

## Part 4 — Post-Deploy Configuration

### Step 10 — Update CORS in the backend

Once you have the frontend URL, open `backend/main.py` and add it to the allowed origins:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://datflow-frontend.onrender.com",   # ← your actual frontend URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push — Render auto-redeploys on every push to `main`.

```bash
git add backend/main.py
git commit -m "Add production frontend URL to CORS"
git push
```

### Step 11 — Verify the deployment

1. Visit your frontend URL (e.g. `https://datflow-frontend.onrender.com`)
2. You should see the login screen
3. Log in with the `DASHBOARD_USERNAME` and `DASHBOARD_PASSWORD` you set
4. The overview page should load — if KoboToolbox has no submissions yet, it shows "No data available"
5. Check the backend health endpoint directly: `https://datflow-backend.onrender.com/health` — should return `{"status": "ok"}`

---

## Part 5 — Organise Under a Render Project (optional)

Render **Projects** are just a label to group services — they don't affect how services run.

1. In the Render dashboard, click **Projects → New Project**
2. Name it `DatFlow Dashboard`
3. Drag both services (`datflow-backend` and `datflow-frontend`) into the project

This keeps your dashboard tidy and makes it easy to find both services.

---

## Troubleshooting

### Build fails — "cannot find module" or import error
- Check that `requirements.txt` (backend) or `package.json` (frontend) includes all dependencies
- Confirm the **Root Directory** is set correctly in Render (should be `backend` or `frontend`, not the repo root)

### Login works but dashboard shows "Error loading data"
- Confirm `KOBO_API_TOKEN` is correct — test it with: `curl -H "Authorization: Token YOUR_TOKEN" https://kf.kobotoolbox.org/api/v2/assets/`
- Confirm `KOBO_ASSET_UID` matches your form
- Check the backend logs in Render (Dashboard → datflow-backend → Logs)

### Frontend can't reach backend ("Network Error" in browser console)
- Confirm `NEXT_PUBLIC_API_URL` matches the backend URL exactly (no trailing slash)
- Confirm the backend URL is also in the Docker build argument
- Confirm CORS includes the frontend URL (Step 10)

### Slow first load (30–60 seconds)
- This is expected on Render's **free tier** — services spin down after 15 minutes of inactivity
- Upgrade to **Starter ($7/mo)** to keep services always on
- Alternatively, set up a cron job to ping `https://datflow-backend.onrender.com/health` every 10 minutes to keep it warm

### Changes not reflecting after a push
- Render deploys automatically on push to `main` by default
- Check Render dashboard → Events to confirm a deploy was triggered
- Check the deploy logs for errors

---

## Environment Variables — Full Reference

### Backend (`datflow-backend`)

| Variable | Required | Description |
|----------|----------|-------------|
| `KOBO_API_TOKEN` | Yes | KoboToolbox API token from Account Settings |
| `KOBO_ASSET_UID` | Yes | Form UID from KoboToolbox form URL |
| `KOBO_BASE_URL` | Yes | `https://kf.kobotoolbox.org` (or humanitarian server) |
| `DASHBOARD_USERNAME` | Yes | Login username for the dashboard |
| `DASHBOARD_PASSWORD` | Yes | Login password — use something strong |
| `JWT_SECRET_KEY` | Yes | Random string min 32 chars — never share this |
| `JWT_ALGORITHM` | Yes | `HS256` |
| `JWT_EXPIRE_MINUTES` | Yes | `480` (8 hours) |
| `ENVIRONMENT` | Yes | `production` |

### Frontend (`datflow-frontend`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Full URL of the backend service, no trailing slash |

---

## Updating the App

Every push to `main` triggers an automatic redeploy on Render.

```bash
# Make your changes locally, then:
git add .
git commit -m "describe your change"
git push
```

Both services redeploy independently. The backend typically rebuilds in 2–3 minutes, the frontend in 4–6 minutes.

To redeploy manually without a code change (e.g. after updating an env var), go to the service in the Render dashboard and click **Manual Deploy → Deploy latest commit**.

---

## Local Development Reference

To run the app locally before deploying:

```bash
# Terminal 1 — backend
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env         # fill in your values
uvicorn main:app --reload --port 8000

# Terminal 2 — frontend
cd frontend
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Visit `http://localhost:3000` to use the app locally.

---