import httpx
import json
from typing import List, Dict, Any
from config import settings
from kobo_normalize import normalize_kobo_submission


async def _paginate(url: str, params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Follow KoboToolbox pagination and collect all results."""
    headers = {
        "Authorization": f"Token {settings.kobo_api_token}",
        "Accept": "application/json",
    }
    all_results = []
    async with httpx.AsyncClient(timeout=30.0) as client:
        while url:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
            for row in data.get("results", []):
                all_results.append(normalize_kobo_submission(row))
            url = data.get("next")
            params = {}  # next URL already has params baked in
    return all_results


async def fetch_asset_submissions(
    asset_uid: str,
    since_id: int = 0,
) -> List[Dict[str, Any]]:
    """Fetch submissions for any Kobo asset UID."""
    url = f"{settings.kobo_base_url}/api/v2/assets/{asset_uid}/data/"
    params: Dict[str, Any] = {"format": "json", "limit": 200}
    if since_id > 0:
        params["query"] = json.dumps({"_id": {"$gt": since_id}})
    return await _paginate(url, params)


async def fetch_asset_metadata(asset_uid: str) -> Dict[str, Any]:
    """Fetch form metadata for any Kobo asset UID."""
    url = f"{settings.kobo_base_url}/api/v2/assets/{asset_uid}/"
    headers = {
        "Authorization": f"Token {settings.kobo_api_token}",
        "Accept": "application/json",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()


async def fetch_submissions() -> List[Dict[str, Any]]:
    """Fetch ALL submissions. Used only on first run when DB is empty."""
    return await fetch_asset_submissions(settings.kobo_asset_uid)


async def fetch_new_submissions(since_id: int) -> List[Dict[str, Any]]:
    """Fetch only submissions with _id > since_id (diff fetch).
    When since_id is 0, fetches everything (first run)."""
    return await fetch_asset_submissions(settings.kobo_asset_uid, since_id)


async def fetch_form_metadata() -> Dict[str, Any]:
    """Fetch form metadata including submission count."""
    return await fetch_asset_metadata(settings.kobo_asset_uid)


async def fetch_sentiment_submissions() -> List[Dict[str, Any]]:
    """Staff Sentiment Survey submissions (second instrument)."""
    uid = settings.kobo_sentiment_asset_uid.strip()
    if not uid:
        return []
    return await fetch_asset_submissions(uid)
