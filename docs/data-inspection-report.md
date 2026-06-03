# Connected Facilities — Data Inspection Report

Generated: 2026-06-02T16:21:54.027119+00:00
Source: kobo

## Configuration

```json
{
  "kobo_base_url": "https://kf.kobotoolbox.org",
  "kobo_asset_configured": true,
  "supabase_configured": true,
  "expected_facilities": 38
}
```

## Kobo form

- **Name:** (Field Version) Facility Performance & Digital Readiness Assessment
- **Submissions (API):** 37

## Payload structure

- Submissions: **37**
- Unique field names (after flattening): **467**
- Group-prefixed paths in raw export: **457**

> Kobo exports answers as `group_xxx/Field_name`. The backend must flatten before scoring.

## Identity & geography

- Unique counties: **9**
- Unique facility names: **37**
- Geo-related keys: `['GPS_coordinates_Enumerator', '_geolocation', 'group_km4hb29/GPS_coordinates_Enumerator']`

### Identity field fill rates (%)

| Field | Fill % |
|-------|--------|
| `Facility_name` | 100.0 |
| `County` | 100.0 |
| `Heath_District` | 100.0 |
| `Health_District` | 100.0 |
| `Facility_type` | 100.0 |
| `Is_this_facility_currently_operational` | 100.0 |

## Scoring coverage by Kobo domain

| Domain | Avg fill % |
|--------|------------|
| Governance (`B_Governance`) | 43.5 |
| Health Workforce (`C_Workforce`) | 75.0 |
| Physical Infrastructure (`D_Infrastructure`) | 85.2 |
| Health Information (`E_HealthInformation`) | 74.5 |
| Digital Technologies (`F_DigitalTech`) | 50.0 |
| Clinical Service Delivery (`G_Clinical`) | 25.0 |
| Inventory & Supply Chain (`H_SupplyChain`) | 33.3 |
| Financing (`I_Financing`) | 43.2 |
| Operational Support (`J_OperationalSupport`) | 100.0 |

## Current dashboard readiness snapshot

```json
{
  "total_submissions": 37,
  "total_facilities": 38,
  "completion_pct": 97.4,
  "avg_score": 69.1,
  "tier_counts": {
    "Foundational": 14,
    "Blocked": 16,
    "Deployment Ready": 5,
    "Not Ready": 2
  },
  "blocked_count": 16,
  "by_county": [
    {
      "county": "Nimba",
      "total": 5,
      "tiers": {
        "Foundational": 5
      }
    },
    {
      "county": "Grand Cape Mount",
      "total": 4,
      "tiers": {
        "Blocked": 2,
        "Foundational": 2
      }
    },
    {
      "county": "Margibi",
      "total": 7,
      "tiers": {
        "Foundational": 1,
        "Deployment Ready": 1,
        "Blocked": 4,
        "Not Ready": 1
      }
    },
    {
      "county": "Maryland",
      "total": 2,
      "tiers": {
        "Foundational": 1,
        "Blocked": 1
      }
    },
    {
      "county": "River Gee",
      "total": 2,
      "tiers": {
        "Blocked": 2
      }
    },
    {
      "county": "Montserrado",
      "total": 12,
      "tiers": {
        "Blocked": 3,
        "Foundational": 4,
        "Deployment Ready": 4,
        "Not Ready": 1
      }
    },
    {
      "county": "Grand Gedeh",
      "total": 2,
      "tiers": {
        "Blocked": 2
      }
    },
    {
      "county": "Lofa",
      "total": 2,
      "tiers": {
        "Foundational": 1,
        "Blocked": 1
      }
    },
    {
      "county": "River Cess",
      "total": 1,
      "tiers": {
        "Blocked": 1
      }
    }
  ]
}
```

### Blockers

- 10× No functional devices found
- 8× No backup power systems available
- 1× No primary power source identified
- 1× Download speed below 5 Mbps threshold
- 1× Upload speed below 2 Mbps threshold

## TRIBE rubric vs this codebase

### Instruments

| Instrument | Platform | In repo |
|------------|----------|---------|
| General Facility Assessment (Field Version) | KoboToolbox | integrated |
| Staff Sentiment Survey | KoboToolbox | not_integrated |
| Digital Literacy Assessment | Google Forms | not_integrated |

### Implementation gaps

- Dashboard uses 8-domain mean % (B–J excl. H optional); rubric uses 5 weighted domains scored 0–3.
- Tier thresholds differ: rubric Tier 1 ≥75%; dashboard 'Deployment Ready' ≥80%.
- Sentiment survey and DLA not ingested — Domain 4/5 composite cannot match rubric.
- Cluster/region aggregates need facility→cluster mapping (not in current schema).
- BLK-04, BLK-05, BLK-06 not implemented in scoring.py.
- Facility names from Kobo are choice slugs; need MoH canonical list for 37/38 facilities.

## Suggested dashboard views

### national_overview
- **Deliverable:** National Facility Readiness Dashboard
- **Data ready:** partial
- **KPIs:** tier distribution, avg composite, blocker counts, completion 37/38
- **Charts:** tier donut, county bar, domain radar (national avg)

### cluster_regional
- **Deliverable:** Cluster & National Aggregate Analysis
- **Data ready:** needs_cluster_mapping
- **KPIs:** avg score by region/cluster, DLA avg, sentiment enthusiasm
- **Charts:** cluster comparison, domain heatmap by cluster

### facility_scorecard
- **Deliverable:** Facility Site Assessment Reports
- **Data ready:** partial
- **KPIs:** composite, tier, blockers, domain breakdown, DLA, sentiment

### ict_gap
- **Deliverable:** ICT Infrastructure Gap Analysis
- **Data ready:** needs_rubric_domains
- **KPIs:** D-POW/D-CON/D-ICT level distribution, remediation counts
- **Charts:** power/connectivity/device stacked bars

### dla_training
- **Deliverable:** Digital Literacy & Training Needs
- **Data ready:** needs_dla
- **KPIs:** DLA % by facility, training intensity class, WF3/WF4

### sentiment_adoption
- **Deliverable:** Staff Adoption & Sentiment
- **Data ready:** needs_sentiment
- **KPIs:** enthusiasm 0-10, burden modal, challenge league table

### roadmap
- **Deliverable:** Strategic Roadmap / deployment waves
- **Data ready:** needs_tier_alignment
- **KPIs:** wave assignment, blocker resolution pathway

## Recommended next steps

1. **Align scoring** to Part B (5 domains, 0–3 scores, weighted composite) or document deviation.
2. **Ingest Sentiment + DLA** with facility keys; enforce n≥3 validation flags.
3. **Add cluster/region dimension** to facility master list for aggregate views.
4. **Map MoH facility names** and GPS (fallback to MoH list when field GPS missing).
5. **Re-sync Supabase** after any scoring change: `POST /dashboard/cache/sync`.
