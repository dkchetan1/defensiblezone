# Defensible Zone™ — Architecture Reference

**Last updated:** July 16, 2026
**Basis:** Direct review of `App.jsx`, `EmployerEdition.js`, all `api/*.js` files, `EmployerPortal.jsx`, `EmployerAdmin.jsx`, plus a full `src/` file tree listing. Not secondhand summary — these files were read directly.

This document answers: what's live, what's dead, where does data live, and how do the pieces connect. For *why* things are designed this way, see `DZ_Employer_Edition_Spec.md`. For a running log of what's shipped, see `CHANGELOG.md`. For open bugs, see `KNOWN_ISSUES.md`.

---

## 1. Two separate codebases

- **`defensiblezone.ai`** (marketing site) — managed via **Lovable**. Not in this repo.
- **`app.defensiblezone.ai`** (the actual product) — **this repo**. Vite + React SPA, no framework routing (no Next.js, no react-router). Deployed via **Vercel**, built from GitHub. Code is written by **Cursor**; Claude writes specs/prompts, not code, except small isolated snippets.

---

## 2. Routing

`src/App.jsx` is the entire router: a manual `if (path === ...) return <X />` chain against `window.location.pathname`, with a `popstate` listener for back/forward navigation. No `react-router`.

**Confirmed full route table (as of July 16, 2026):**

| Path | Component | Notes |
|---|---|---|
| `/` | `Landing` (from `src/pages/Index.tsx`) | **Not** `src/Landing.jsx` — see Section 6, item 1 |
| `/about` | `About.jsx` | |
| `/confirmed` | `Confirmed.jsx` | |
| `/doctor`, `/doctor/report` | `Doctor.jsx` | B2C |
| `/engineer`, `/engineer/report` | `Engineer.jsx` | B2C |
| `/finance`, `/finance/report` | `Finance.jsx` | B2C |
| `/pm` | `ProductManager.jsx` | B2C |
| `/ux` | `UX.jsx` | B2C |
| `/smallbusiness`, `/smallbusiness/report` | `SmallBusiness.jsx` | B2C |
| `/sales`, `/sales/report` | `Sales.jsx` | B2C |
| `/localization` | `Localization.jsx` | B2C |
| `/employer` | `EmployerApp.jsx` | Employer Edition entry: access code → trust screen → pivot-openness screen → role picker → role flow |
| `/employer/engineer` | `EmployerEngineer.jsx` | **Direct route — bypasses EmployerApp's code/trust flow. See Section 6, item 2.** |
| `/employer/productmanager` | `EmployerProductManager.jsx` | Same as above |
| `/employer/sales` | `EmployerSales.jsx` | Same as above |
| `/employer/ux` | `EmployerUX.jsx` | Same as above |
| `/employer/finance` | `EmployerFinance.jsx` | Same as above |
| `/employer/portal` | `EmployerPortal.jsx` | Employer (HR) self-serve: login, quota, code generation, batch reporting |
| `/employer/admin` | `EmployerAdmin.jsx` | Founder-only: create employers, set quotas |

---

## 3. Product areas

### 3.1 B2C (original product — unchanged by Employer Edition work)

Individual, independent role files: `Engineer.jsx`, `Doctor.jsx`, `Finance.jsx`, `ProductManager.jsx`, `UX.jsx`, `Sales.jsx`, `SmallBusiness.jsx`, `Localization.jsx`.

- **Access/payment:** Stripe Checkout (`create-checkout-session.js`) → `verify-payment.js` issues a JWT `{ tier, product, session_id }` with a **10-year expiry** (a one-time purchase = permanent access, no ongoing session).
- **Report delivery:** email-gate pattern — `send-gate-email.js` issues a 24h JWT `{ email, product, type: "gate" }`, emails a link with `?gate_token=`; `verify-gate-token.js` verifies it. No cookie, no persistent session — re-verified via the token each time.
- **`send-report-email.js`** currently only handles the `"ux"` product (hardcoded check). How the other four B2C roles deliver report emails is not yet confirmed from what's been reviewed.

### 3.2 Employer Edition (this project's active work)

- **`EmployerApp.jsx`** (at `/employer`) — owns: access-code entry (validated via `validate-access-code.js`), trust statement screen, pivot-openness screen (both added July 16, 2026), role picker, and renders one of five role components inline based on selection.
- **Role components** — `EmployerEngineer.jsx`, `EmployerProductManager.jsx`, `EmployerSales.jsx`, `EmployerUX.jsx`, `EmployerFinance.jsx`. Each is **fully self-contained**: own React state, own client-built AI prompt strings (for landscape/skill generation and for Market Demand / AI Replaceability scoring), own `localStorage` save/restore logic. **No shared engine** — see Section 6, item 3.
- **`EmployerEdition.js`** — trivial: one `sessionStorage` flag (`dz_employer_access_granted`), set once a code validates successfully. `grantEmployerAccess()` / `isEmployerAccessGranted()`.
- **`EmployerPortal.jsx`** (at `/employer/portal`) — HR-facing: magic-link login, quota display, code generation (with server-side quota enforcement), CSV download, per-batch redemption reporting.
- **`EmployerAdmin.jsx`** (at `/employer/admin`) — founder-only (gated by `FOUNDER_EMAILS`): create employer accounts, list all employers, adjust quotas (with a floor-check preventing quota below `codesGenerated`).

---

## 4. Data model — Upstash Redis

Accessed via plain `fetch` against Upstash's REST API (`/get/{key}`, `/set/{key}`, `/pipeline`) — **not** the `@upstash/redis` npm package (chosen because npm was unreliable in this Cursor environment).

**Env vars:** `UPSTASH_REDIS_REST_KV_REST_API_URL`, `UPSTASH_REDIS_REST_KV_REST_API_TOKEN` (note: longer names than Upstash's shorter defaults — confirmed intentional, not a typo).

```
code:{CODE} → { batchId: string, status: "unused" | "redeemed", redeemedAt: string | null }

batch:{batchId} → { employerEmail: string, codeCount: number, createdAt: string }

employer:{email} → {
  companyName: string,
  quota: number,
  codesGenerated: number,
  batches: [batchId, ...],
  createdAt: string
}
```

**No reverse index from batch → codes.** `batch-report.js`'s redemption counts and `generate-codes.js`'s collision check both do a full `code:*` `KEYS` scan, then filter/pipeline in memory. Fine at current scale — flagged as a future scaling concern in Section 6.

Redis is used **only** for Employer Edition data. B2C has no persistent backend beyond Stripe + JWTs.

---

## 5. Auth — three separate, non-interoperable systems

### 5.1 B2C magic-link gate (original)
`send-gate-email.js` → JWT `{ email, product, type: "gate" }`, 24h expiry, no cookie, link contains `?gate_token=`. `verify-gate-token.js` verifies and returns `{ valid, email }` — no session persistence; re-verified via the token itself each time.

### 5.2 B2C Stripe payment token
`create-checkout-session.js` → Stripe Checkout → `verify-payment.js` issues JWT `{ tier, product, session_id }`, **10-year expiry** (permanent access post-purchase).

### 5.3 Employer Edition session (built this project)
- `employer-login.js` — looks up `employer:{email}` in Redis (bypassed for `FOUNDER_EMAILS` — founders don't need an employer record to log in). Issues JWT `{ email, type: "employer" }`, 24h expiry. Emails a link with `?token=`; a `destination` param (`"admin"` or default) picks whether the link points to `/employer/admin` or `/employer/portal`.
- `verify-employer-token.js` — verifies that token *or* an existing session cookie. On first successful verification, issues a **second** JWT `{ email, companyName, type: "employer_session" }`, stored as an httpOnly cookie `dz_employer_session`, 7-day expiry. Founder emails get `companyName: "Founder"` as a placeholder (no real employer record backs it).
- `employer-admin.js`, `generate-codes.js`, and `batch-report.js` each **independently re-verify** this session cookie server-side on every request. **Each file has its own copy of the verification function** — not a shared module. See Section 6, item 5.
- `employer-admin.js` additionally checks `FOUNDER_EMAILS` on every action — the only endpoint gated to founder-only.

### `FOUNDER_EMAILS`
Comma-separated env var, case-insensitive, trimmed matching. Currently: `dilip@recursiolab.com`. **Parsing logic is duplicated** across `employer-login.js`, `verify-employer-token.js`, and `employer-admin.js` — three separate copies, not a shared function.

---

## 6. Known oddities / technical debt (not blocking — tracked here so they aren't forgotten)

1. **`src/Landing.jsx` may be dead code.** It exists but is not imported anywhere in `App.jsx` — the `/` route actually renders `Landing` from `src/pages/Index.tsx`, a different file. Same pattern as `src/Employer.jsx`, which was confirmed dead and deleted July 16, 2026 after a full-repo reference search + git history check. `Landing.jsx` has **not** yet received the same verification — do not assume dead, confirm first.

2. **Direct `/employer/{role}` routes bypass the access-code and trust-screen flow entirely.** Someone hitting `/employer/engineer` directly skips code validation, the trust statement, and the pivot-openness question. Unconfirmed whether this is an intentional shortcut (e.g. for internal testing) or an unintended gap. Worth a deliberate decision, not an assumption.

3. **No shared engine across the five Employer role files.** Each independently hand-builds its own AI prompts and scoring logic. This was supposed to be addressed by Stages 1–3 of the original staged build plan (see spec doc Section 12), which is unfinished/parked (a stale branch `stage-1-engine-refactor` exists with two unresolved known issues — see `KNOWN_ISSUES.md`). Practical consequence: any edition-wide behavior that touches scoring (e.g. the pivot-openness question feeding Market Demand) requires a near-identical change repeated across all five files, not one shared change.

4. **Two `Navbar` files exist** — `src/Navbar.jsx` and `src/components/Navbar.tsx`. Which (if either, or both) is actually in use by which pages has not been confirmed.

5. **Auth/session verification logic is duplicated near-verbatim** across `employer-admin.js`, `generate-codes.js`, and `batch-report.js` (cookie parsing, JWT verification, `FOUNDER_EMAILS` parsing). A bug fix in this logic currently requires editing multiple files and risks drifting out of sync — this already happened once in a single session (the founder-login bug required patching `employer-login.js` and `verify-employer-token.js` separately, in sequence, because the same underlying assumption was duplicated in both). Worth extracting into one shared module eventually.

6. **`src/EmailGate.jsx`, `src/PDFButton.jsx`, `src/SharedComponents.jsx`** are not directly imported in `App.jsx` — they're likely imported by individual B2C product files (`Engineer.jsx`, etc.), but this hasn't been directly confirmed.

7. **`send-report-email.js` only supports the `"ux"` product.** How the other four B2C roles email their reports is unconfirmed.

8. **No durable "Defensible Profile" or shared assessment-state model exists yet** (spec doc Stage 13, not started). Each Employer role's `localStorage` save object is incomplete and inconsistent between its own save points, expires after 14 days, is unauthenticated, and is device-local only. Anything meant to persist for future stages (e.g. the pivot-openness answer, meant to eventually feed a resume generator) needs to be added to these existing save objects for now, since there's nowhere more durable to put it.

---

## 7. Third-party services

| Service | Used for | Scope |
|---|---|---|
| Anthropic API | AI generation | Via `generate.js`, a thin proxy — the **browser** builds the full prompt and model request; `generate.js` just forwards it to Anthropic with the server-side API key. No prompt construction happens server-side. |
| Resend | Transactional email | Gate links (B2C), employer login links (Employer Edition) |
| Stripe | Payment | B2C only — **not used anywhere in Employer Edition** (access is code-based, no payment screen shown to employees) |
| Upstash Redis | Data persistence | Employer Edition only |
| Kit (ConvertKit) | Mailing list | `subscribe.js` — unrelated to core product flows |

---

## 8. Verification method (per project convention)

Commit to a branch → Vercel generates a preview deployment → click through the preview URL → merge to `main` only after manual verification. **Note:** this convention was not consistently followed during the July 16, 2026 session — most changes were committed directly and verified against production after deploy, due to session pace. Worth returning to the branch-based method for larger or riskier changes going forward.
