# Defensible Zone™ — Changelog

Reverse-chronological. One line per shipped, committed change. Entries here are things that actually happened — for what's planned, see the stage tracker in `DZ_Employer_Edition_Spec.md`; for what exists right now, see `ARCHITECTURE.md`; for open bugs, see `KNOWN_ISSUES.md`.

**Maintenance note:** an entry goes here only once it's committed via GitHub Desktop and confirmed working — not when a Cursor prompt is written, and not when Cursor merely reports success. If a change is in progress but not yet committed, it does not appear here yet.

---

## 2026-07-16

- Remove superseded `Employer.jsx` (dead code, replaced by `EmployerApp.jsx` on June 25, 2026 — confirmed via full-repo reference search and git history before deletion)
- Add trust statement screen to Employer Edition flow (`EmployerApp.jsx`) — Section 8, item 1 of the spec's psychological design requirements
- Fix founder login verification to not require an employer record (`verify-employer-token.js`) — founders (`FOUNDER_EMAILS`) have no `employer:{email}` Redis record by design; verification incorrectly rejected them as invalid
- Add missing label to quota field in employer admin creation form (`EmployerAdmin.jsx`) — cosmetic, the "Initial quota" input had no visible label
- Allow founder emails to receive login links without an existing employer record (`employer-login.js`) — founders aren't employers, so the existing-record check needed a `FOUNDER_EMAILS` bypass
- Add founder-only `/employer/admin` route for employer account and quota management — new `api/employer-admin.js`, new `EmployerAdmin.jsx`, new route in `App.jsx`, plus a `destination` param added to `employer-login.js` so magic links can point at either `/employer/portal` or `/employer/admin`
- Add per-batch redemption reporting to employer portal — new `api/batch-report.js`, "Your batches" section in `EmployerPortal.jsx`
- Add quota-aware access-code generation UI + CSV download to employer portal — new `api/generate-codes.js`, generation form + CSV export in `EmployerPortal.jsx`
- Add employer portal login (magic-link auth, signed JWT session) at `/employer/portal` — new `api/employer-login.js`, new `api/verify-employer-token.js`, new `EmployerPortal.jsx`, new route in `App.jsx`

**Also this session (documentation, not code):**
- Created `ARCHITECTURE.md` — first version, based on direct review of `App.jsx`, all `api/*.js` files, `EmployerEdition.js`, `EmployerPortal.jsx`, `EmployerAdmin.jsx`, and a full `src/` tree listing
- Created this changelog

---

## 2026-07-15 (reconstructed from session handoff doc)

- Vercel KV → Upstash Redis infrastructure set up (database `dz-employer-codes`, accessed via plain `fetch` against Upstash's REST API rather than the `@upstash/redis` package)
- Add access-code validation endpoint (`api/validate-access-code.js`) — verified end-to-end via curl and live UI (valid code, already-used code, invalid code)
- Wire access-code screen to real validation in `EmployerApp.jsx` — `handleCodeSubmit` now calls the real endpoint instead of accepting any non-empty string
- Log actual error in `validate-access-code.js` (debugging improvement, `console.error` added)

*(Earlier history — original `EmployerApp.jsx` creation on June 25, 2026 replacing `Employer.jsx`; the five `Employer*.jsx` role file builds; B2C product work — is visible in git history but has not yet been reconstructed into dated changelog entries here. Backfill opportunistically if useful, otherwise treat 2026-07-15 as the practical start of this changelog's coverage.)*
