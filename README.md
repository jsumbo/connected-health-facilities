# DatFlow Dashboard

Facility readiness dashboard for the Liberia Connected Facilities Baseline Assessment. The backend fetches KoboToolbox data, applies the scoring engine, and serves the API that powers the Next.js dashboard.

## Project Layout

- `backend/` - FastAPI API, scoring logic, Kobo integration, and sync jobs
- `frontend/` - Next.js dashboard and UI
- `docs/` - design notes, reports, and supporting documentation
- `plan/` - working analysis artifacts and reference material

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- KoboToolbox API token and asset IDs
- A CSV export for the Digital Literacy Assessment, for DLA pages to load
- Optional: Supabase credentials if you are using database-backed sync paths

## Local Setup

### 1) Clone the repository

```bash
git clone <repo-url>
cd datflow-dashboard
```

### 2) Configure the backend

Create `backend/.env` with the values your environment needs. The backend reads these settings:

- `KOBO_API_TOKEN`
- `KOBO_ASSET_UID`
- `KOBO_SENTIMENT_ASSET_UID`
- `DLA_CSV_PATH`
- `DASHBOARD_USERNAME`
- `DASHBOARD_PASSWORD`
- `JWT_SECRET_KEY`
- `JWT_ALGORITHM`
- `JWT_EXPIRE_MINUTES`
- `ENVIRONMENT`
- `MASTER_SCORES_XLSX_PATH`
- `CORS_ALLOWED_ORIGINS`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### 3) Install and run the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

### 4) Configure the frontend

Create `frontend/.env.local` with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5) Install and run the frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:3000`.

## Docker Setup

Use Docker Compose if you want to run both services together:

```bash
docker compose up --build
```

The compose file expects a root-level `.env` file for shared configuration.

## Useful Commands

Backend:

```bash
uvicorn main:app --reload
```

Frontend:

```bash
npm run dev
npm run build
npm run start
```

## Notes

- The backend refreshes Kobo, sentiment, DLA, and master-data caches on startup.
- If you change environment variables, restart the relevant service.
- Keep secrets out of version control; the repo already ignores local `.env` files and workspace-only helper folders.