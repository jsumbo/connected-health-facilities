**Assets:**  
[Facility\_Assessment](https://docs.google.com/document/d/1PA22b8QX9xwpxJCvK6iuY5Kc9M1fIiLhENYxluk8s7Q/edit?usp=sharing)  
[Assessment Notes + Observations](https://docs.google.com/document/d/1738XSzoJVCkuOINZS9aVpZbcOMJRS04uSdmAolaho_c/edit?usp=sharing)  
[Facility\_Performance\_Digital\_Readiness\_Assessment\_reviewed.docx.pdf](https://drive.google.com/file/d/1quQVIO2ftFhqH62iPZteExyctZfC7tLw/view?usp=sharing)	  
**[Proposed Digital Readiness Framework (DRF)](https://docs.google.com/document/d/1zQRwDLENmsXkGzGjzmLAIynD13jvh412TyZvgJIY5Eg/edit?usp=sharing)**  
[digital\_readiness\_framework\_indicators](https://docs.google.com/spreadsheets/d/1n4M-nhZLBSFT1V2x6mgM1j5gpYISIgWjT_iNnqYyW4s/edit?gid=2044455421#gid=2044455421)	

**Analysis**   
Cluster- level and national-level analysis  across 10 assessment domains: (weighting across indicators…)

- Data cleaning, cross-validation, and final quality checks across all 37 facility records  
- Cluster-level and national analysis   
- Measurement of indicators across various domains. Outputs: graphs, charts, etc.

Identification of readiness tiers and prioritization framework for HOS

- Integration sequencing   
- Gap analysis by domain 

Data cleaning, cross-validation, and final quality checks across all 37 facility records. Cluster-level and national-level analysis across all eight assessment domains. Identification of readiness tiers and prioritization framework for HOS integration sequencing. Gap analysis by domain. Structured data handoff to Sand Technologies for dashboard population. Drafting of facility-level site assessment reports for all 37 facilities. 

Facility-level assessment report:

**Domains:**

* DOMAIN A \- Facility Metadata  
* DOMAIN B \- Governance  
* DOMAIN C \- Health Workforce  
* DOMAIN D \- Physical Infrastructure  
* DOMAIN E \- Health Information  
* DOMAIN F \- Digital Technologies For Health  
* DOMAIN G \- Clinical Service Delivery  
* DOMAIN H \- Inventory & Supply Chain  
* DOMAIN I \- Financing  
* DOMAIN J \- Operational Support  
* GENERAL Comment/Feedback

**Expected Outputs:**

* **Facility Site Assessment Reports (×37).** *All 3 assessments.* Composite score, tier, domain breakdown, blocker status, DLA score, sentiment snapshot, enumerator field notes — one structured report per facility   
* **National Facility Readiness Dashboard.** *General \+ DLA.* Composite scores, tiers, GPS coordinates, cluster aggregates, DLA averages — structured to Sand Technologies schema for dashboard population  
* **ICT Infrastructure Gap Analysis.** *General Assessment.* D-POW and D-CON and D-ICT domain data — gap magnitude, facility counts per level, remediation requirements by type and cost category  
* **Digital Literacy & Training Needs Assessment.** *DLA \+ Sentiment \+ General WF3/4.* DLA scores by facility/cluster/question; Sentiment Sec D training recency/barriers; WF3/WF4 from General; training intensity classification per facility  
* **Clinical Workflow Optimization Report.** *General \+ Sentiment.* Domain E/F clinical workflow data (HI1–HI20+); Sentiment Sec F reporting and data capture challenges; data use culture (HI7); DHIS2 discipline (HI3/HI8)  
* **Recommendations for Digitization & Integration.** *All 3*. All gap analyses; Sentiment challenge rankings; adoption risk flags; infrastructure remediation requirements; training needs  
* **Strategic Roadmap for Connected Facility Deployment.** *All 3*. Tier classifications and blocker resolution pathways; deployment wave assignments; training mobilisation plan; phased HOS integration sequence by county and cluster.

**Tools suggestion:** Python / R / SPSS for EDA and statistical analysis. Google Data Studio, Power BI, API integration with viz tools etc. for dashboard//visualizations. Google Docs for literature reports. \+ High-quality national report.   
**Connected Facilities \- Health Center Site Assessment**  
34 Health Centers | 3 Hospitals | 10 Counties 

**Data Analysis Framework & Facility Readiness Scoring Rubric**

**Source(s) of Truth: 3 Instruments:**

1. **Assessment 1 — General Facility Assessment (KoboToolbox / Field Version):** Enumerator-administered. Covers facility metadata, governance, health workforce, physical infrastructure, health information, clinical workflows, clinical service delivery, inventory & supply chain, financing, and operational support across 10 domains with HIGH and MEDIUM priority indicators.  
2. **Assessment 2 — Facility Staff Sentiment Survey (KoboToolbox):** Individually completed by staff, anonymous, aggregated per facility. 7 sections: Respondent Details (A), Management & Leadership (B), Digitisation Attitude (C), Training & Skills (D), Systems & Support (E), Challenges Ranking (F), Open Feedback (G).  
3. **Assessment 3 — Digital Literacy Assessment (Google Forms):** 10-question knowledge test (MCQ \+ True/False, 10 points each \= 100 points total). Dimensions tested: device identification, email recognition, computer identification, power button identification, email attachments, data entry best practice, patient data importance, phishing awareness, data entry timing, browser definition.

**Part A \- Data Analysis Framework**   
This framework governs how TRIBE converts raw field data from three instruments and 37 facilities into the project deliverables. It defines the complete analytical pipeline from quality assurance through to deliverable production.  
 

# **A1. Instrument Architecture — What Each Assessment Measures**

| Instrument | Platform | Respondent | Record Unit | Key Variables for Scoring |
| ----- | ----- | ----- | ----- | ----- |
| **General Facility Assessment (Field Version)** | KoboToolbox | Enumerator \+ relevant staff by domain | 1 record per facility | Power (POW1, INF1, POW2), Connectivity (INF5, INF6a/b), Devices (INF8a/b/c), Workforce (WF3–WF9), Health Info (HI1–HI10), Clinical Workflows (HI11+), Governance (GOV5/6/7), Operations (OPS3) |
| **Staff Sentiment Survey** | KoboToolbox | Individual staff — anonymous (min. 3 per facility) | Multiple per facility → aggregated | Management support (Sec B), Enthusiasm 0–10 (Sec C), Documentation burden (Sec C), Operational problem impact (Sec C), Training recency (Sec D), Training barriers (Sec D), IT support & system access (Sec E), System uptime & backlog (Sec E), Challenge ranking top-3 (Sec F), Reporting & data capture challenges (Sec F) |
| **Digital Literacy Assessment** | Google Forms | Individual staff sample (min. 3 per facility) | Multiple per facility → averaged | Score out of 100: device ID (Q1), email address (Q2), computer ID (Q3), power button (Q4), email attachment (Q5), data entry best practice (Q6), patient data importance (Q7), phishing response (Q8), data entry timing (Q9), browser definition (Q10) |

 

# **A2. Data Audit \+ Validation (Mandatory: Before Analysis)**

| Check | What to Verify | Action if Failed |
| ----- | ----- | ----- |
| **General Assessment — HIGH field completeness** | Every HIGH-priority indicator has a valid, non-null response. Skip logic violations have documented reasons in comments field. | Flag record; attempt phone follow-up with Field Coordinator within 24 hrs; apply conservative scoring where gaps remain. |
| **Sentiment — minimum sample validity** | ≥3 completed surveys per facility for scores to be treated as representative. Fewer than 3 \= indicative only. | \<3 surveys: flag as insufficient; revert to General Assessment GOV5/GOV6/GOV7 proxy scoring for Domain 5; note in scorecard. |
| **DLA — minimum sample validity** | ≥3 completed tests per facility for a valid facility-level average. Fewer \= indicative only. | \<3 tests: flag as indicative; apply 50% confidence weighting to Domain 4 DLA component; note in scorecard. |
| **DLA vs WF4 cross-validation** | Cross-check DLA average score (%) against General Assessment WF4. Flag any divergence \>20 percentage points for review. | Divergences \>20pp: review field notes; where unexplained, weight DLA at 60% and WF4 at 40% for Domain 4 scoring. |
| **Deployment blocker verification** | All 5 blocker conditions verified against Visit Log and field notes before Tier 3 classification is finalised. | All Tier 3 classifications must be signed off by Data Lead before inclusion in any deliverable. |
| **GPS coordinate completeness** | All 37 facilities have valid lat/long captured for dashboard mapping. Cross-check against MoH facility list coordinates. | Use MoH facility list coordinates as fallback where field capture is missing; flag in dashboard notes. |
| **KoboToolbox ↔ Visit Log reconciliation** | Submission IDs match signed Visit Logs for each facility. No unmatched records. | Unmatched records must be resolved before scoring. Do not score unverified data. |

 

# **Step 2 — Data Cleaning & Standardisation**

* **Standardise** all facility names to the 37-facility list (from instrument dropdowns and MoH facility list)  
* **Digital Literacy:** calculate average score (%) across all staff assessed per facility. Express as a percentage. Flag if n\<3.  
* **Sentiment Survey:** compute per facility — mean enthusiasm score (0–10); mode for categorical items (documentation burden, management support, training recency, operational problem impact); frequency-weighted rank score for Section F challenges (1st=3pts, 2nd=2pts, 3rd=1pt); frequency count for multi-select reporting and data capture challenges  
* **Speed test recoding:** \<5 Mbps \= Low | 5–20 Mbps \= Moderate | \>20 Mbps \= High  
* **Latency recoding:** \>200ms \= High/Unstable | 80–200ms \= Moderate | \<80ms \= Low/Stable  
* **INF8 device blocker logic:** sum of functional laptops \+ desktops \+ tablets \= 0 → deployment blocker flag \= TRUE  
* Create one master analysis file per facility, merging key scoring variables from all 3 instruments, keyed on the canonical facility name.

# **A3. Analytical Workstreams (5)**

All five workstreams run in parallel following data audit/validation.

**Workstream 1: Facility Readiness Scoring:**

* Score each facility against the 5-domain rubric in Part B — integrating data from all 3 instruments where indicated.  
* Check all 5 deployment blocker conditions. Any blocker triggered → automatic Tier 3 regardless of composite score.  
* Compute weighted composite score: Σ (domain score 0–3 × weight) × (100 ÷ 3\).  
* Assign readiness tier (1–3) and deployment wave. Complete one scorecard per facility.  
* Produce ranked facility list (highest to lowest composite score) and cluster-level summary tables.

**Workstream 2: Cluster & National Aggregate Analysis**   
**\`**

| Level | What to Calculate |
| ----- | ----- |
| **By regions (4 regions)** | Average composite score | Tier distribution | Count and type of deployment blockers | Domain-level averages (to identify whether a cluster weakness is power, connectivity, literacy, or sentiment) | DLA average score | Sentiment average enthusiasm score | Top-ranked staff challenge per cluster |
| **National (all 37 facilities)** | Overall tier distribution | % facilities per blocker type | National domain averages | DLA score distribution | Sentiment enthusiasm distribution | Most cited challenge categories nationally (weighted rank from Section F) | Correlation analysis: DLA vs enthusiasm vs composite score |
| **By facility type** | Hospitals vs Health Centres — score comparison; used to shape differentiated EMR deployment strategy |
| **By county** | County-level score averages and tier distribution across 12 counties — used for county health team briefings and MoH reporting |
| **Sentiment by staff role** | Compare Section responses across cadres (clinical vs data clerks vs admin vs CHWs) — identifies where frustration and training gaps are most acute within facilities |

   
**Workstream 3 — Infrastructure Gap Analysis**

* For each infrastructure domain (Power, Connectivity, ICT Hardware): calculate % of facilities at each score level (0–3)  
* Identify the most common specific failure sub-indicators within each domain (e.g., within Power: is the gap most often "no backup" or "no primary source"?)  
* Quantify remediation requirement: Capital expenditure (hardware, infrastructure) | Operational (training, maintenance) | Procurement (devices, networking)  
* Flag facilities with compounding infrastructure gaps across domains — these require integrated intervention packages  
* Cross-reference with Sentiment Section F data capture challenges: "Devices unavailable/broken/slow" corroborates INF8 scores; "Connectivity issues prevent real-time entry" corroborates INF5/INF6

   
**Workstream 4 — Digital Literacy & Training Needs Analysis**

* Primary indicator: DLA average score (%) per facility from Google Forms data  
* Cross-check DLA against General Assessment WF4 (enumerator-administered competency) and WF3 (% trained in 12 months)  
* Triangulate with Sentiment Section D (training recency per individual) and Section E (IT support access, system uptime experience)  
* DLA question-level analysis: identify which of the 10 questions has the lowest correct rate nationally — pinpoints the most universal knowledge gap for training curriculum design  
* Classify each facility: Intensive (\<50%) | Structured (50–69%) | Targeted (70–89%) | Maintenance (≥90%)  
* Map training intensity by region — identifies which clusters require pre-deployment training mobilisation before any HOS go-live  
* Cross-reference Sentiment Section F: where "Staff training/skills" ranks in the top 3 challenges — corroborate with DLA scores and WF3 training coverage

   
**Workstream 5 — Staff Adoption & Sentiment Analysis**  
The Sentiment Survey provides a layer of evidence that infrastructure data alone cannot reveal. It measures attitudes, frustrations, and readiness to adopt that will determine whether deployment succeeds post go-live.  
 

| Section / Dimension | Analytical Approach |
| ----- | ----- |
| **Sec B — Management Support** | Mode response per facility (Not engaged / Partially engaged / Actively driving). Cross-reference with General Assessment GOV5. Divergences between staff perception and enumerator-observed management engagement flagged for qualitative review. |
| **Sec C — Digitisation Enthusiasm** | Average enthusiasm score (0–10) per facility. Score \<5 \= at-risk for post-deployment adoption failure. Cross-reference with documentation-burden modal response — high burden \+ low enthusiasm \= highest dropout-risk flag. |
| **Sec C — Documentation Burden** | Modal response per facility (Burdensome / Tolerable / Neutral / Useful). "Burdensome" dominant \= strong indicator of friction that will compound post-EMR deployment if not addressed through workflow redesign. |
| **Sec C — Operational Problem Impact** | Modal response (Minimally / Moderately / Severely). "Severely" \= resilience gap; flag for prioritisation in roadmap. |
| **Sec D — Training Recency** | % respondents per category: Never / More than 1 year ago / Within last year / Within last 6 months. Gap between WF3 (% trained) and sentiment "Never" response \= training that occurred but was not retained or perceived as relevant. |
| **Sec D — Training Barriers** | Frequency count across barrier categories. Most cited barriers directly inform training design in the TNA deliverable. |
| **Sec E — IT Support & Systems** | IT support channel availability, equipment sufficiency, resolution time, uptime estimate, and data entry backlog timing. Triangulate with WF7 (dedicated IT staff) and INF5/INF6 (connectivity scores). |
| **Sec F — Challenge Ranking (Top 3\)** | Weighted rank score per challenge: 1st=3pts, 2nd=2pts, 3rd=1pt. Produce facility and national challenge league tables. Cross-reference with domain scores to validate or challenge infrastructure data. |
| **Sec F — Reporting Challenges** | Multi-select frequency count. Directly informs the Clinical Workflow Optimization Report. "System/connectivity issues prevent timely submission" corroborates INF5/INF6 domain scores. |
| **Sec F — Data Capture Challenges** | Multi-select frequency count. "Devices unavailable/broken/slow" validates INF8 scores. "Fields do not match clinical workflow" \= workflow redesign priority for roadmap. |

 

**A4. Deliverables \+ Expected Output**

| Deliverable | Primary Source(s) | Key Analytical Inputs |
| ----- | :---: | ----- |
| **Facility Site Assessment Reports (×37)** | **All 3 assessments**  | Composite score, tier, domain breakdown, blocker status, DLA score, sentiment snapshot, enumerator field notes — one structured report per facility |
| **National Facility Readiness Dashboard** | **General \+ DLA** | Composite scores, tiers, GPS coordinates, cluster aggregates, DLA averages — structured to Sand Technologies schema for dashboard population |
| **ICT Infrastructure Gap Analysis** | **General Assessment** | D-POW and D-CON and D-ICT domain data — gap magnitude, facility counts per level, remediation requirements by type and cost category |
| **Digital Literacy & Training Needs Assessment** | **DLA \+ Sentiment \+ General WF3/4** | DLA scores by facility/cluster/question; Sentiment Sec D training recency/barriers; WF3/WF4 from General; training intensity classification per facility |
| **Clinical Workflow Optimization Report** | **General \+ Sentiment** | Domain E/F clinical workflow data (HI1–HI20+); Sentiment Sec F reporting and data capture challenges; data use culture (HI7); DHIS2 discipline (HI3/HI8) |
| **Recommendations for Digitization & Integration** | **All 3** | All gap analyses, sentiment challenge rankings, adoption risk flags, infrastructure remediation requirements, and training needs |
| **Strategic Roadmap for Connected Facility Deployment** | **All 3** | Tier classifications and blocker resolution pathways; deployment wave assignments; training mobilisation plan; phased HOS integration sequence by county and cluster |

 

# **Part B: Facility Readiness Scoring Rubric** 

This rubric converts raw data from all three field instruments into a single Composite Digital Readiness Score per facility. It covers five weighted domains, a deployment-blocker override system, and three readiness tiers that determine the sequencing of HOS integration.

**B1. Scoring Architecture**

| How the composite score is built from 3 instruments Each facility receives a domain score (0–3) across 5 domains. Domains are weighted by their criticality to HOS deployment readiness. The weighted sum produces a Composite Score out of 100\. Domain 4 (Digital Literacy) uses the DLA average score as its primary input, cross-checked against General Assessment WF4. Domain 5 (Adoption & Sentiment) uses the Staff Sentiment Survey as its primary input and cross-checks it against General Assessment GOV indicators. Composite Score Formula:  Σ (Domain Score 0–3 × Domain Weight) × (100 ÷ 3\) Deployment Blocker Override: any facility triggering one or more hard blockers is automatically classified as Tier 3 — Not Deployment-Ready — regardless of its composite score. Confidence flags: where DLA or Sentiment has \<3 respondents, note reduced confidence in the scorecard. DLA \<3: apply 50% weighting to the DLA component of Domain 4\. Sentiment \<3: revert to General Assessment GOV proxy for Domain 5\. |
| :---- |

   
**B2. Domain Weights, Sources, and Key Indicators**  
Weights reflect the relative criticality of each domain for functional HOS deployment. Power and digital literacy are weighted highest — power is an absolute infrastructure prerequisite; digital literacy determines whether deployment produces quality data or fails.

A sixth scored element, Data Maturity & Health Information, is added to score what the prior rubric measured but did not weight. Weights are restated to sum to 100%. The values below are a proposed rebalance for ministry sign-off; relative ordering follows the priority logic in B2a.

| No. | Domain | Weight | Primary Source | Key Scoring Indicators |
| ----- | ----- | :---: | ----- | ----- |
| **1** | **Power & Energy (D-POW)** Priority 1 | 22% | General Assessment | POW1, INF1, INF2, POW2, POW2.2 |
| **2** | **Internet & Connectivity (D-CON)** Priority 1 | 18% | General Assessment | INF5, INF6a, INF6b, DIG\_LAT, MOB2 |
| **3** | **ICT Hardware & Devices (D-ICT)** Priority 1 | 13% | General Assessment | INF8a/b/c, INF7 |
| **4** | **Digital Literacy & Workforce (D-DIG)** Priority 2 | 22% | DLA \+ General WF | DLA average; WF3, WF5, WF6, WF7; WF1 patient volume |
| **5** | **Adoption, Sentiment & Governance (D-SEN)** Priority 3 | 15% | Sentiment Survey \+ General GOV | Sec B/C/D/F; GOV5, GOV6, GOV7 |
| **6** | **Data Maturity & Health Information (D-DAT)** Priority 2 | 10% | General Assessment | HI1, HI1b, HI3, HI9, HI10 |
|  | **COMPOSITE** | **100%** | **All 3 instruments** | **Sum (Domain Score x Weight) x (100 / 3\)** |

# **B2a. Weighting Rationale**

Domain and indicator weights follow a three-tier priority logic.

1. **Priority 1 (highest weight):** *deployment prerequisites.* Their absence makes other indicators irrelevant. Power, connectivity, devices, IT support, and reporting.  
2. **Priority 2 (mid-weight):** *quality of use.* Weakness degrades outcomes but does not prevent deployment. Digital literacy, direct clinician documentation, and patient volume.  
3. **Priority 3 (lower weight):** *longevity*. Predicts whether the system survives. Management engagement, financial stability, and existing data maturity.

*A missing indicator scores zero, but its weight remains in the denominator. Incomplete reporting is itself a capacity signal, so it is penalised rather than ignored. This replaces the prior "apply conservative scoring where gaps remain" instruction with a defined rule.*

**B3. Per-Domain Scoring Rubric — 0 to 3**  
Conservative principle: when a facility sits between two levels, assign the lower score unless there is clear evidence for the higher. Deployment Blocker (score 0\) has specific hard criteria — do not use it unless the exact condition is met.  
   
**Domain 1 — Power & Energy Infrastructure (D-POW)  |  Weight: 22%  |  Source: General Assessment**  
 

| Score | Level | Observable Criteria — What the Data Shows |
| :---: | ----- | ----- |
| **3** | **Strong** | Primary power source: Grid or Solar (reliable and consistent) Average weekly outage: \<4 hours Backup system present — UPS plus generator or solar UPS is installed at all critical workstations |
| **2** | **Adequate** | Primary power source: Grid, Solar, or Generator (functional) Average weekly outage: 4–15 hours At least one backup power system available UPS at some workstations |
| **1** | **Marginal** | Primary power source: Generator only (fuel-dependent or irregular) Average weekly outage: \>15 hours No backup power system available No UPS at any workstation |
| **0** | **BLOCKER** | POW1 \= None  →  AUTOMATIC DEPLOYMENT BLOCKER — BLK-01 No power source \= no digital health system can operate. No exceptions. Remediation required before any deployment step. |

 

| Scoring note: Outage duration (INF1) is the strongest EMR data-loss predictor within this domain. A facility with grid power but \>15 hrs/week outage and no backup should score 1, not 2\. |
| :---- |

   
**Domain 2 — Internet & Connectivity (D-CON)  |  Weight: 18%  |  Source: General Assessment**  
 

| Score | Level | Observable Criteria — What the Data Shows |
| :---: | ----- | ----- |
| **3** | **Strong** | Internet type: Fibre, 4G, or Starlink Download speed: \>20 Mbps  |  Upload speed: \>10 Mbps Connectivity uptime: ≥90% Network latency: \<80ms (Low/Stable) Mobile network signal: Strong (backup available) |
| **2** | **Adequate** | Internet type: 4G, 3G, or Wi-Fi (functional) Download: 5–20 Mbps  |  Upload: 2–10 Mbps Uptime: 70–89% Latency: 80–200ms (Moderate) Mobile signal: Moderate or better |
| **1** | **Marginal** | Internet type: 3G only or intermittent Wi-Fi Download: 1–5 Mbps  |  Upload: \<2 Mbps Uptime: 50–69% or unknown Latency: \>200ms (High/Unstable) Mobile signal: Weak |
| **0** | **BLOCKER** | INF5 \= None (no internet of any type) and no viable offline alternative  →  BLK-02 Blocks all cloud-based EMR and real-time DHIS2 reporting. Flag for offline-first tool consideration; document in roadmap. Download \<1 Mbps or no connectivity  |  Uptime \<50% |

   
**Domain 3 — ICT Hardware & Devices (D-ICT)  |  Weight: 13%  |  Source: General Assessment**  
 

| Score | Level | Observable Criteria — What the Data Shows |
| :---: | ----- | ----- |
| **3** | **Strong** | ≥3 functional computers (laptops or desktops) OR ≥5 functional tablets Functional router/access point in place ≥80% of essential clinical equipment functional At least one device present at each key service point (registration, consultation, pharmacy) |
| **2** | **Adequate** | 1–2 functional computers OR 2–4 functional tablets Networking device present (router or modem) 60–79% of clinical equipment functional Shared device arrangement is functional and accessible |
| **1** | **Marginal** | Only smartphones available for data entry — no computers or tablets in service No functional networking device 40–59% of clinical equipment functional Device sharing severely limits workflow coverage |
| **0** | **BLOCKER** | INF8a/b \= Zero functional computers, desktops, AND zero tablets  →  BLK-03 No hardware \= no digital health workflow possible, regardless of all other scores. Hardware procurement must precede any deployment planning for this facility. |

   
**Domain 4 — Digital Literacy & Workforce Capacity (D-DIG)  |  Weight: 22%  |  Primary: DLA \+ General WF3/4/5/6/7**  
 

| Scoring note: The DLA average score (%) is the primary indicator for this domain. Where DLA data is absent or \<3 respondents, fall back to General Assessment WF4. WF6 (clinicians document directly) is the second most critical indicator — clerk proxy entry is the strongest predictor of EMR data quality collapse post-deployment. Weight it heavily when a facility sits between tiers. |
| :---- |

 

| Score | Level | Observable Criteria — What the Data Shows |
| :---: | ----- | ----- |
| **3** | **Strong** | DLA average score: ≥70% WF3: ≥90% of staff trained in digital skills in the last 12 months WF5: ≥70% of staff can use digital tools without supervision WF6: Clinicians document consultations directly (Yes) WF7: Dedicated IT support available — full or part-time |
| **2** | **Adequate** | DLA average score: 50–69% WF3: 60–89% of staff trained in digital skills WF5: 50–69% using tools without supervision WF6: Hybrid pattern — some direct documentation, some clerk proxy WF7: Shared or ad-hoc IT support accessible |
| **1** | **Marginal** | DLA average score: 30–49% WF3: \<60% of staff trained in digital skills in the last 12 months WF5: \<50% using tools without supervision WF6: No direct clinician documentation — clerk proxy only WF7: No dedicated IT support — staff entirely self-reliant |
| **0** | **BLOCKER** | DLA average score: \<30%  →  Critical literacy gap — BLK-04 (when compounded) AND/OR: WF6 \= No AND WF7 \= No AND WF3 \<60% — compounded risk constellation Deployment without intensive pre-deployment training will generate corrupt data and fail post go-live. |

   
**Domain 5 — Adoption, Sentiment & Governance (D-SEN)  |  Weight: 15%  |  Primary: Sentiment Survey \+ General GOV**  
 

| This domain integrates the Staff Sentiment Survey as a formally scored input. Where Sentiment data is insufficient (\<3 surveys returned), score using General Assessment GOV5/GOV6/GOV7 only and note reduced confidence in the scorecard. The enthusiasm score (Section C, 0–10 scale) and documentation burden (Section C) are the two most predictive variables for post-deployment dropout risk. |
| :---- |

 

| Score | Level | Observable Criteria — What the Data Shows |
| :---: | ----- | ----- |
| **3** | **Strong** | Management: Actively driving digital adoption (Sentiment Sec B mode \= "Actively driving" and/or GOV5 \= Actively driving) Enthusiasm score: ≥7 out of 10 (Sentiment Sec C mean) Documentation burden modal: "It's useful — it enables us deliver better care" Training recency: Majority of respondents trained within the last 6 months (Sentiment Sec D) GOV6: Financially stable and operationally predictable Top challenge: operational in nature (power, connectivity) — not attitudinal (training, time, staffing) |
| **2** | **Adequate** | Management: Partially engaged (Sentiment Sec B mode \= "Partially engaged" and/or GOV5 \= Partially engaged) Enthusiasm score: 5–6.9 out of 10 Documentation burden modal: "Neutral" or "Tolerable" Training recency: Majority trained within last year GOV6: Moderate stability with some disruptions Top challenge: mix of operational and attitudinal |
| **1** | **Marginal** | Management: Not engaged (Sentiment Sec B mode \= "Not engaged" and/or GOV5 \= Not engaged) Enthusiasm score: 3–4.9 out of 10 Documentation burden modal: "Burdensome — takes time away from patients" Training recency: Majority trained \>1 year ago or Never GOV6: Unstable — frequent operational disruptions or funding gaps Top 3 challenges dominated by: staff training/skills, staffing constraints, time/workload |
| **0** | **BLOCKER** | Management: Actively resisting digital adoption  →  BLK-05 Enthusiasm score: \<3 out of 10 with "Burdensome" as modal documentation burden Leadership opposition \+ staff resistance \= highest post-deployment dropout risk. Stakeholder engagement and change management must precede any deployment. |

 

**Domain 6 — Data Maturity & Health Information (D-DAT)** Priority 2 **|  Weight: 10%  |  General Assessment | HI1, HI1b, HI3, HI9, HI10** 

| Scoring note: The unique client ID indicator is the primary indicator for this domain. A consistently used and verified client ID is what makes a patient traceable across visits and prevents duplicate records, so it is the strongest single signal of data maturity. Weight it heavily when a facility sits between levels. The hard condition of a facility not reporting to DHIS2 or the national HIS within the last 3 months is not scored here; it is a deployment blocker (BLK-04) handled in B4. |
| :---- |

 

| Score | Level | Observable Criteria — What the Data Shows |
| :---: | ----- | ----- |
| **3** | **Strong** | Standardized system in use for individual patient records (HI1 \= Yes) One or more digital health systems already in active use (HI1b ≥ 1\) On-time reporting ≥90% of monthly reports (HI3)  Unique client ID consistently used and verified at registration (HI9 \= Yes)Recognized ID type in use such as national ID or national health ID (HI10) |
| **2** | **Adequate** | Standardized record-keeping partially in place At least one digital system in use or transition underway (HI1b \= 1\) On-time reporting 70–89% (HI3) Client ID used but not consistently verified at registration (HI9 \= partial)Facility-specific or non-standard ID type (HI10) |
| **1** | **Marginal** | No standardized record system, inconsistent paper capture (HI1 \= No) No digital systems, fully paper (HI1b \= 0\)On-time reporting 50–69%, or reports frequently late (HI3) No unique client ID, or IDs not reused across visits (HI9 \= No) |
| **0** | **BLOCKER** | No structured patient records of any kind (HI1 \= No)No digital systems; on-time reporting \<50% (HI3)No client identification in use (HI9 \= No). No automatic deployment blocker originates in this domainNon-reporting to DHIS2/HIS in the last 3 months is captured under BLK-04 in B4 |

**B4. Deployment Blocker Override —**   
   
Any ONE of the following conditions triggers an automatic Tier 3 classification. Record the blocker code in the facility scorecard. All Tier 3 classifications must be confirmed by the Data Lead before inclusion in deliverables. Blockers are restricted to hard infrastructure and operational prerequisites. 

NB: Workforce literacy and management posture are scored within their domains and surfaced in the Gap Matrix; they no longer trigger automatic Tier 3\.

| Blocker Code | Condition | Source & Rationale |
| ----- | ----- | ----- |
| **BLK-01** | POW1 \= None, or confirmed power available under 5 hours per day | General Assessment (POW1, INF1). Absolute hard stop. No power means no digital system of any kind. Remediation required before any deployment step. |
| **BLK-02** | INF5 \= None with no viable offline alternative, or download speed under 2 Mbps | General Assessment (INF5, INF6). Blocks cloud EMR and real-time DHIS2 reporting. Flag for offline-first tool assessment; include in roadmap investment plan. |
| **BLK-03** | No functional device (computer, laptop, or tablet) at one or more key service points: registration, consultation, pharmacy | General Assessment (INF8a/b). A device must exist at every service point, not merely somewhere in the facility. Hardware procurement precedes deployment planning. |
| **BLK-04** | Facility not actively reporting to DHIS2 or the national HIS within the last 3 months | General Assessment (HI3, reporting status). Promoted to a standalone blocker. Signals the data culture and technical baseline that EMR integration depends on. |
| **BLK-05** | No IT or digital support available: no dedicated person at the facility, and no shared support across five or fewer facilities | General Assessment (WF7). Promoted to a standalone blocker. Kenya evidence: issue-resolution time directly predicts dropout; the total absence of support is a deployment-critical failure. |
| **BLK-06** | Facility not operational (Domain A confirmation \= No) | General Assessment (Domain A). A non-operational facility cannot be assessed or deployed to. Record reason, exclude from scoring, flag for MoH follow-up. |

# **B4a. Gate Threshold Reference \-** 

Hard thresholds are stated once here and applied consistently across the rubric and the blocker override. A missing value fails the threshold.

| Indicator | Rule | Minimum Condition |
| ----- | ----- | ----- |
| **Primary power present (POW1)** | Boolean true | Power source confirmed present |
| **Power availability (INF1-derived)** | Min value | At least 5 hours per day |
| **Internet present (INF5)** | Boolean true | Connectivity confirmed present |
| **Download speed (INF6a)** | Min value | At least 2 Mbps |
| **Functional device per service point (INF8)** | Boolean true | At least 1 functional device at each key service point |
| **DHIS2 / HIS reporting (HI3)** | Boolean true | Reporting within the last 3 months |
| **IT support (WF7)** | Boolean true | At least 1 dedicated person, or shared across 5 or fewer facilities |

 

# **B5. Readiness Tiers: HOS Integration Classification**

Tiers. Gate and blocker status are evaluated first as a hard prerequisite, then the composite score. 

| Tier | Threshold | Interpretation |
| ----- | ----- | ----- |
| **Tier 1** | Score at or above 75%, no blockers | **HOS-Ready.** Meets the threshold for near-term deployment. Prioritise for Wave 1\. Recommend as model facilities for peer learning across the county cluster. |
| **Tier 2** | Score \<75%, no blockers | **Deployment-Eligible with Targeted Investment.** *Score 55 to 74%.* 1 to 2 domains need specific intervention before going live. Map the exact gaps and develop a 3 to 6-month pre-deployment plan. Wave 2\.  **Requires Structured Remediation.** *Score 35 to 54%.* Significant gaps across multiple domains. A structured programme across infrastructure, training, and governance is required before deployment. Wave 3\. Begin remediation planning immediately. |
| **Tier 3** | Any score, one or more blockers | **Not Deployment-Ready.** Each blocker must have a named owner, a specific remediation action, and a realistic timeline. Exclude from active deployment planning until all blockers clear. A high composite score does not override Tier 3\. |

# **B6. Gap Matrix and Intervention Recommendations**

For every indicator that is missing or below threshold, the matrix states the gap, its significance, the recommended intervention, and whether the intervention is in-scope or requires third-party procurement. The reader infers the intervention directly from the gap, with no separate interpretation step.

| Gap | Significance | Recommended Intervention | Provision |
| ----- | ----- | ----- | ----- |
| Power below threshold (BLK-01) | **Priority 1: blocker** | Solar or grid connection plus UPS at critical workstations | Procurement |
| Connectivity below threshold (BLK-02) | **Priority 1: blocker** | Fixed connectivity or offline-first tooling; bandwidth upgrade | Procurement |
| No device at a service point (BLK-03) | **Priority 1: blocker** | Device procurement per service point | Procurement |
| Not reporting to DHIS2 (BLK-04) | **Priority 1: blocker** | Re-establish reporting; data-clerk support | In-scope |
| No IT support (BLK-05) | **Priority 1: blocker** | Assign or share IT support across 5 or fewer facilities | In-scope or procurement |
| DLA under 50%, no blocker | **Priority 2: quality of use** | Intensive or structured pre-deployment training | In-scope |
| Low enthusiasm or burdensome documentation | **Priority 2: quality of use** | Workflow redesign and change-management engagement | In-scope |
| Management not engaged | **Priority 3: sustainability** | Leadership engagement before go-live | In-scope |

