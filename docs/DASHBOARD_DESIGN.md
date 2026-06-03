# Connected Facilities — Dashboard Design Guide

This document ties the **TRIBE analysis framework** (3 instruments, 5 rubric domains, 4 tiers) to what the DatFlow dashboard should show and what data must exist first.

Run the inspector to refresh facts from live Kobo data:

```bash
cd backend
python scripts/inspect_data.py --format markdown --out ../docs/data-inspection-report.md
```

---

## Programme scope

| Item | Count | Notes |
|------|-------|--------|
| Facilities (assessment target) | 38 in code / 37 submitted | 1 pending submission |
| Programme narrative | 34 HC + 3 hospitals, 10 counties | Align master facility list |
| Instruments | 3 | General (Kobo), Sentiment (Kobo), DLA (Google Forms) |

---

## Instrument → dashboard mapping

| # | Instrument | Feeds | Dashboard priority |
|---|------------|--------|-------------------|
| 1 | **General Facility Assessment** | Domains A–J, blockers, infrastructure | **Live today** — national overview, facility list, domain charts |
| 2 | **Staff Sentiment Survey** | D-SEN, adoption risk, challenge rankings | **Not integrated** — adoption page, facility scorecard Sec B/C/D/F |
| 3 | **Digital Literacy Assessment** | D-DIG, training intensity | **Not integrated** — DLA page, cross-check vs WF3/WF4 |

---

## Scoring models (choose one for v1)

### A. Current implementation (8 Kobo domains)

- Domain scores: % from weighted questions (1–4 scale, HIGH ×2)
- Overall: mean of 8 core domains (B–J, H optional)
- Tiers: ≥80% Ready, 60–79% Foundational, &lt;60% Not Ready, any blocker → Blocked

### B. TRIBE rubric (5 domains) — **target for national deliverable**

| Domain | Weight | Score | Primary source |
|--------|--------|-------|----------------|
| D-POW | 25% | 0–3 | General D (power) |
| D-CON | 20% | 0–3 | General D (connectivity) |
| D-ICT | 15% | 0–3 | General D (devices) |
| D-DIG | 25% | 0–3 | DLA + WF3–WF7 |
| D-SEN | 15% | 0–3 | Sentiment + GOV |

**Composite:** Σ(domain × weight) × (100 ÷ 3)

**Tiers (rubric):**

| Tier | Composite | Blockers |
|------|-----------|----------|
| 1 HOS-Ready | ≥75% | None |
| 2 Deployment-Eligible | 55–74% | None |
| 3 Structured Remediation | 35–54% | No hard blockers |
| 4 Not Deployment-Ready | Any | ≥1 BLK-01…06 |

**Recommendation:** Present rubric tiers on the national dashboard; keep domain drill-down on 10 Kobo domains until rubric engine is implemented.

---

## Suggested dashboard information architecture

```
/dashboard
├── Overview          ← National: tiers, completion, avg score, blockers (exists)
├── Facilities        ← Sortable table + filters (exists)
├── Facility /[id]    ← Scorecard: domains, blockers, raw KPIs (exists, extend)
├── By county         ← County aggregates (partial in overview chart)
├── By cluster        ← NEW: needs cluster assignment table
├── Domains           ← NEW: gap analysis heatmap (10 or 5 domains)
├── Infrastructure    ← NEW: ICT gap (POW/CON/ICT from rubric)
├── Digital literacy  ← NEW: DLA + training intensity (needs Google Forms)
├── Sentiment         ← NEW: enthusiasm, burden, challenges (needs 2nd Kobo form)
├── Analytics         ← EXISTS: connectivity/power/devices
└── Roadmap / Waves   ← NEW: tier → deployment wave, blocker remediation
```

---

## Page specs (MVP → full deliverable)

### 1. National overview (MVP — enhance)

**KPIs:** assessments completed (n/38), national mean composite, tier counts, blocker count by BLK code  
**Charts:** tier donut, county bar, top blockers bar  
**Filters:** county, facility type (hospital vs HC)

### 2. Facility scorecard (MVP — enhance)

Per facility report card:

- Composite + tier + deployment wave (when defined)
- Domain breakdown (10-domain % today → 5-domain 0–3 later)
- Blocker list with BLK codes and remediation hints
- DLA average + n respondents (when available)
- Sentiment snapshot: enthusiasm, burden modal, top-3 challenges (when available)
- GPS map pin (when lat/long present)
- Link to enumerator notes / photos if stored in Kobo

### 3. Cluster & regional view (Phase 2)

**Requires:** `facilities` master with `cluster` / `region` (4 regions in framework)  
**KPIs:** mean composite, tier mix, DLA avg, enthusiasm avg, top challenge per cluster  
**Charts:** grouped bar (clusters), domain radar comparison

### 4. ICT infrastructure gap (Phase 2)

**Data:** General assessment — power, connectivity, devices  
**Charts:** % facilities at score levels 0–3 per sub-indicator (once rubric scoring exists)  
**Tables:** facilities failing BLK-01/02/03

### 5. Digital literacy & training (Phase 3)

**Data:** Google Forms DLA + WF3/WF4 + Sentiment Sec D  
**KPIs:** national question-level correct rate, training intensity class per facility  
**Validation:** flag n&lt;3, DLA vs WF4 divergence &gt;20pp

### 6. Sentiment & adoption (Phase 3)

**Data:** Sentiment Kobo form aggregated per facility  
**KPIs:** mean enthusiasm (0–10), documentation burden mode, weighted challenge ranks  
**Risk flags:** enthusiasm &lt;5 + burden “Burdensome”

### 7. Strategic roadmap (Phase 4)

**Inputs:** final tiers, blockers, cluster readiness, training intensity  
**Outputs:** Wave 1/2/3 assignment table, county sequencing map, blocker owner/timeline (manual or workflow)

---

## Data quality gates (from framework A2)

Implement as **flags on each facility** in API/UI:

| Check | Rule | UI treatment |
|-------|------|----------------|
| HIGH field completeness | All HIGH indicators answered | Warning badge |
| Sentiment n≥3 | Else “indicative only” | Amber confidence |
| DLA n≥3 | Else 50% weight on D-DIG | Amber confidence |
| DLA vs WF4 | Divergence &gt;20pp | Review flag |
| GPS | lat/long or MoH fallback | Map icon note |
| Operational | BLK-06 if No | Exclude from deployment views |

---

## Technical prerequisites

1. **Kobo normalization** — flatten `group_*/Field` paths (implemented in `kobo_normalize.py`)
2. **Field mapping audit** — run `inspect_data.py` after each form version change
3. **Master facility table** — canonical name, county, cluster, region, MoH GPS, type
4. **Second Kobo asset** — sentiment form UID in `.env`
5. **DLA ingest** — CSV export or Sheets API keyed on facility
6. **Scoring v2** — optional module implementing Part B 0–3 domains

---

## What to run before each design review

```bash
cd backend
python scripts/inspect_data.py                    # human-readable report
python scripts/inspect_data.py --format json --out /tmp/inspect.json
```

Review: domain fill rates, unmapped fields, tier distribution, blocker breakdown, then update this doc and wireframes.
