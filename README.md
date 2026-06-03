# DatFlow Dashboard

**Connected Facilities Baseline Assessment — Facility Readiness & Assessment Tracking Dashboard**

Built for the **Liberia National Health Intelligence Centre (LNHIC)**, **Ministry of Health, Republic of Liberia**, in collaboration with **Sand Technologies** and **TRIBE**.

---

## Overview

This dashboard provides real-time visibility into the **Connected Facilities Baseline Assessment** — a nationwide diagnostic across 43 health facilities in Liberia assessing readiness for Health Operating System (HOS) deployment.

It pulls live submission data from KoboToolbox via API, applies an automated domain-based scoring engine, and surfaces facility-level readiness tiers, deployment blockers, and assessment progress to programme decision-makers.

---

## Features

- **Live KoboToolbox sync** — submissions fetched and scored on demand
- **Automated readiness scoring** across 10 domains (Governance, Workforce, Infrastructure, Health Information, Digital Technologies, Clinical Delivery, Supply Chain, Financing, Operational Support)
- **Deployment blocker detection** — power, connectivity, and device gaps flagged immediately
- **Facility readiness tiers** — Deployment Ready / Foundational / Not Ready / Blocked
- **Assessment progress tracking** — by county, cluster, and enumerator
- **Facility detail views** — full domain breakdown per facility
- **Protected dashboard** — login-gated, credentials stored in environment variables
- **Offline-capable architecture** — FastAPI backend caches Kobo data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, Python 3.11+, httpx, python-jose |
| Data source | KoboToolbox REST API v2 |
| Auth | JWT (HS256), httpOnly cookies |
| Package management | npm (frontend), pip (backend) |
| Monorepo | Turborepo-compatible structure |

---

## Project Structure

```
datflow-dashboard/
├── backend/                    # FastAPI application
│   ├── config.py               # Environment settings
│   ├── auth.py                 # JWT utilities
│   ├── kobo.py                 # KoboToolbox API client
│   ├── scoring.py              # Domain scoring engine
│   ├── models.py               # Pydantic response models
│   ├── routes/
│   │   ├── auth.py             # Login endpoint
│   │   └── dashboard.py        # Data endpoints
│   ├── main.py
│   └── requirements.txt
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/          # Login page
│   │   │   ├── dashboard/      # Protected dashboard
│   │   │   └── api/auth/       # Auth API routes
│   │   ├── components/         # UI components
│   │   ├── lib/                # API client, types
│   │   └── middleware.ts        # Route protection
│   └── package.json
├── CLAUDE.md                   # AI assistant context
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- A KoboToolbox account with API access
- Your form's Asset UID (from the KoboToolbox URL)

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd datflow-dashboard
cp .env.example .env
```

Edit `.env` with your KoboToolbox credentials and dashboard login.

### 2. Start the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### 4. Login

Navigate to `http://localhost:3000` — you will be redirected to the login page. Use the credentials set in your `.env` file (`DASHBOARD_USERNAME` / `DASHBOARD_PASSWORD`).

---

## Scoring Methodology

Facilities are scored across 10 domains using a weighted rubric:

- **Per question:** worst response = 1pt, best response = 3pt (4pt for 4-option questions)
- **HIGH priority questions** count double in domain score calculation
- **Domain score** = (weighted points earned / max possible) × 100
- **Overall score** = weighted average of all domain scores

| Score | Tier | Colour |
|---|---|---|
| ≥ 80% | Deployment Ready | Green |
| 60–79% | Foundational | Amber |
| < 60% | Not Ready | Red |
| Any blocker | Blocked | Dark Red |

**Deployment blockers** — the following automatically override the score to **Blocked**:
- Primary power source: None
- Backup power: None
- Internet uptime: < 50%
- Download speed: < 5 Mbps
- Upload speed: < 2 Mbps
- All device counts (laptops + desktops + tablets + phones) = 0

---

## Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `KOBO_API_TOKEN` | KoboToolbox API token |
| `KOBO_ASSET_UID` | Form asset UID from KoboToolbox |
| `DASHBOARD_USERNAME` | Dashboard login username |
| `DASHBOARD_PASSWORD` | Dashboard login password |
| `JWT_SECRET_KEY` | Secret for signing JWT tokens |

---

## Deployment

The app can be deployed as two separate services or via Docker Compose:

```bash
docker-compose up --build
```

For production:
- Set `NODE_ENV=production` and `ENVIRONMENT=production`
- Use a strong `JWT_SECRET_KEY` (min 32 chars)
- Run the frontend behind a reverse proxy (nginx/Caddy)
- Consider a cron job or webhook to refresh Kobo data periodically

---

## Context

This project was built as part of the **Connected Facilities Baseline Assessment** for the Liberia Health Operating System (HOS) rollout — a collaboration between the Ministry of Health, Sand Technologies, and TRIBE Consulting. The assessment covers 43 health facilities across 8 counties and 6 geographic clusters, evaluating infrastructure, ICT readiness, connectivity, digital literacy, clinical workflows, and HOS integration readiness.

---

## License

Built for DatFlow / TRIBE Consulting. All rights reserved.
