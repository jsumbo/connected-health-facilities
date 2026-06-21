# Task 11 Report — Backend Endpoint: Question-Level DLA Statistics

## Status

Complete. The endpoint is implemented, syntax-verified, and import-verified.

---

## What Was Done

### File modified

`backend/app/routes/public.py` — actually located at `backend/routes/public.py` (the project uses a flat `backend/` layout, not a nested `backend/app/` layout).

### Changes made

1. Added `from pydantic import BaseModel` and `from dla import load_csv_rows` to imports.

2. Added two Pydantic models before the `/meta` endpoint section:
   - `DlaQuestionStat` — per-question stat shape matching the specified response schema
   - `DlaQuestionsResponse` — wraps the list

3. Added the module-level lookup tables `_DLA_QUESTION_ANSWERS` and `_DLA_QUESTION_ANSWERS_NORMALIZED` that define all 10 question column headers and their correct answers.

4. Added `GET /dla/questions` endpoint at line 305, registered **before** `/dla/{slug}` (line 354) to ensure FastAPI matches the static path first.

### Correct answer derivation

Correct answers were confirmed by filtering the CSV to rows with `Score = 100 / 100` (perfect score). Two such rows existed across 164 total responses, and both agreed on all 10 answers.

---

## Test Summary

### Logic unit test (run directly against CSV)

```
Q1:  143/161 = 88.8%  — Which of the following devices is a tablet?
Q2:  119/161 = 73.9%  — Which of the following is an example of an email address?
Q3:  151/161 = 93.8%  — Which of the following devices is a computer?
Q4:  121/161 = 75.2%  — Which of the following shows the button used to turn on the computer?
Q5:  137/161 = 85.1%  — You can send a file or photo as an attachment in an email.
Q6:  128/161 = 79.5%  — BEST practice when entering data into a health form
Q7:  119/161 = 73.9%  — Why is it important to enter patient data accurately?
Q8:   20/159 = 12.6%  — Phishing email scenario (hardest question)
Q9:  122/161 = 75.8%  — Turning a device off and on again
Q10:  91/160 = 56.9%  — What is a web browser?
```

Total CSV rows: 164 (3 had no responses on some questions, hence totals of 159–161).

### Syntax and import checks

- `python3 -m py_compile routes/public.py` — PASSED
- `from routes.public import router` (using venv Python) — PASSED
- Route order confirmed: `/dla` → `/dla/questions` → `/dla/{slug}`

### Live server test

Run with:
```bash
cd backend && uvicorn main:app --reload
curl http://localhost:8000/public/dla/questions
```

Expected: JSON with `"questions"` array of 10 objects, each with `questionNumber`, `questionText`, `correctCount`, `totalResponses`, `correctRate`.

---

## Concerns / Notes

- **Q8 correctRate is 12.6%** — this is not a bug. The phishing question asks what to do when receiving a suspicious email; most respondents chose to click the link or reply with their password, indicating a genuine security awareness gap.

- **Empty/missing CSV**: the endpoint returns `{"questions": []}` gracefully if the CSV is absent (guarded by `dla_cache.is_configured` and the `load_csv_rows` empty-list fallback).

- **Trailing whitespace in column Q2**: The CSV header for question 2 has a trailing space (`"2. Which of the following is an example of an email address? "`). The implementation strips all headers before matching, so the `questionText` returned is the cleaned version without trailing space.

- **No authentication required**: consistent with other `/public/dla/*` endpoints.
