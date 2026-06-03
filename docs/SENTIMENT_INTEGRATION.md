# Staff Sentiment Survey — Integration Notes

**Kobo asset:** `aDSWKdetZ7beGFjXapmNYX`  
**Form title:** (Facility Staff Sentiment Survey) Connected Facilities

## Coverage (2026-06-02)

| Metric | Value |
|--------|------:|
| Raw submissions | 141 |
| Unique facilities (`Facility_name` slug) | 37 / 37 |
| General assessment submissions | 37 / 37 |

Facility linkage uses the same Kobo choice slug as the general assessment (`Facility_name`).

## Programme target

`PROGRAMME_FACILITY_TARGET` is **37**. The placeholder 38th “pending” slot was removed — both instruments now cover all programme facilities.

## Backend

- Env: `KOBO_SENTIMENT_ASSET_UID=aDSWKdetZ7beGFjXapmNYX`
- Modules: `sentiment.py`, `sentiment_cache.py`
- API: `GET /public/sentiment`, `GET /public/sentiment/{slug}`
- Facility rows include `sentiment_*` fields; overview includes sentiment KPIs.

## Inspect

```bash
cd backend && python scripts/inspect_sentiment.py
```
