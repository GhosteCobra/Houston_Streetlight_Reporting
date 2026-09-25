# Initial implementation backlog

These are planning IDs, not created GitHub Issues. All work is pending. Copy a row into the issue template, assign an owner, and link its actual issue/PR here.

| ID | Owner | Task | Depends on | Acceptance evidence |
| --- | --- | --- | --- | --- |
| PLAN-01 | 1 | Assign roles and confirm requirements | None | Named team and reviewed MVP |
| PLAN-02 | 3 + 5 | Scaffold Next.js, TypeScript, styling, npm, checks | PLAN-01 | Clean install, dev page, production build |
| PLAN-03 | 4 + 2 | Implement shared schemas and synthetic fixtures | PLAN-01 | Valid/invalid fixture checks |
| PLAN-04 | 2 | Build ArcGIS map and selection | PLAN-02, PLAN-03 | Marker/list selection and manual fallback |
| PLAN-05 | 5 | Camera/upload preview | PLAN-02 | Capture, retake, remove, permission fallback |
| PLAN-06 | 4 | Supabase migrations and access policies | PLAN-03 | Two-session isolation and schema reset |
| PLAN-07 | 4 + 5 | Authorized image upload and validation | PLAN-05, PLAN-06 | Owned valid image only; invalid inputs rejected |
| PLAN-08 | 4 | Location, duplicate, report and status APIs | PLAN-03, PLAN-06 | Contract errors, retries, no live provider calls |
| PLAN-09 | 3 | Connect full capture/review/save flow | PLAN-04, PLAN-07, PLAN-08 | Successful end-to-end report with fallback paths |
| PLAN-10 | 5 + all | CI and real-device QA | PLAN-02 onward; release after PLAN-09 | Recorded CI run and test matrix |
| PLAN-11 | 1 + 2 | Provider/data research | PLAN-01 | Evidence/terms or explicit mock-only decision |
| PLAN-12 | 5 + 1 | HTTPS demo deployment and presentation | PLAN-09, PLAN-10 | Smoke test, rollback note, demo script |

Implement a thin working journey before advanced status management or image analysis. Live data/API approval is not a dependency for the synthetic demo. OCR, AI classification, cross-owner routing, offline sync, and live utility submission remain later work.
