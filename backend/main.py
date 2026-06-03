from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routes import auth, dashboard, public
from cache import cache
from sentiment_cache import sentiment_cache
from dla_cache import dla_cache


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initial populate before first request is served
    await cache.refresh()
    await sentiment_cache.refresh()
    await dla_cache.refresh()

    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(cache.refresh, "interval", minutes=3, id="kobo_refresh")
    scheduler.add_job(sentiment_cache.refresh, "interval", minutes=3, id="sentiment_refresh")
    scheduler.add_job(dla_cache.refresh, "interval", minutes=3, id="dla_refresh")
    scheduler.start()

    yield

    scheduler.shutdown(wait=False)


app = FastAPI(
    title="DatFlow Dashboard API",
    description="Facility readiness scoring API for the Liberia Connected Facilities Baseline Assessment",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

_cors_origins = [
    origin.strip()
    for origin in settings.cors_allowed_origins.split(",")
    if origin.strip()
]
_cors_allow_all = not _cors_origins or settings.environment != "production"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if _cors_allow_all else _cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(public.router, prefix="/public", tags=["public"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])


@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "service": "DatFlow Dashboard API",
        "version": "1.0.0",
        "environment": settings.environment,
        "cache_populated": cache.is_populated,
        "cache_last_refreshed": cache.last_refreshed.isoformat() if cache.last_refreshed else None,
        "sentiment_cache_populated": sentiment_cache.is_populated,
        "sentiment_last_refreshed": (
            sentiment_cache.last_refreshed.isoformat() if sentiment_cache.last_refreshed else None
        ),
        "dla_cache_populated": dla_cache.is_populated,
        "dla_last_refreshed": (
            dla_cache.last_refreshed.isoformat() if dla_cache.last_refreshed else None
        ),
    }
