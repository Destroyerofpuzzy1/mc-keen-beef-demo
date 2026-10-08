# Security

Scope: public corporate website with two write endpoints (B2B offer enquiry, job application with optional CV). No user accounts, no database, no admin panel. The highest-value data are personal data in forms (names, phones, e-mails, CVs) and the company's reputation (defacement, spam sent "from" the site).

Applied references: OWASP Top 10:2025, OWASP ASVS 5.0 L1/L2 controls relevant to input handling, file upload and error handling; Next.js 16 CSP guide.

---

## 1. Threat model

| Asset | Threat | Likelihood | Impact | Control |
|---|---|---|---|---|
| Form endpoints | Spam / bot flooding, mail-quota exhaustion | High | Medium | Rate limit, honeypot, minimum fill time, optional Turnstile, body size cap |
| Recipients' mailboxes | Malicious attachment (macro DOC, polyglot PDF), phishing links | Medium | High | Allow-list PDF/DOC/DOCX, magic-byte check, size cap, filename sanitising, attachment sent as `application/octet-stream`-safe type, no auto-execution; recipients warned in e-mail footer that the file is user-supplied |
| E-mail rendering | HTML injection / header injection via form fields | Medium | Medium | All values escaped for HTML; CR/LF stripped from anything used in headers; Reply-To only set to a validated e-mail |
| CV personal data | Disclosure (public URL, logs, disk) | Medium | High | Processed in memory only, never written to disk or `/public`, never logged; logs contain only a redacted summary |
| Site visitors | XSS, clickjacking, injected third-party scripts | Low | High | Nonce CSP with `strict-dynamic`, `frame-ancestors 'none'`, no `dangerouslySetInnerHTML` except JSON-LD built from our own data and serialised with `<` escaped |
| Endpoints | CSRF-style cross-site POST (spam via third-party pages) | Medium | Low | Same-origin check (Origin / Sec-Fetch-Site / Referer), no CORS headers at all |
| Secrets (SMTP, API keys) | Leak into client bundle | Low | High | Server-only modules (`import 'server-only'`), no secret uses `NEXT_PUBLIC_` |
| Availability | Large uploads exhausting memory | Medium | Medium | `Content-Length` checked before parsing (≤ 6 MB careers, ≤ 64 kB enquiries); file ≤ 5 MB |
| Error paths | Stack trace / config disclosure | Low | Medium | Generic error messages, error id logged server-side, fail-closed |
| Supply chain | Malicious dependency | Low | High | Minimal deps (next, react, zod, nodemailer); lockfile committed; `npm audit` in CI |

Out of scope: DDoS at network level (hosting/CDN), mailbox security on the client's side.

---

## 2. Forms protection (both endpoints)

Implemented in `src/lib/security/*`, `src/lib/validation/*`, `src/app/api/*/route.ts`.

1. **Method / type**: only `POST` with `multipart/form-data` or `application/x-www-form-urlencoded`; anything else 405/415.
2. **Size cap** before parsing: `Content-Length` required and bounded (enquiry 64 kB, careers 6 MB). Requests without length or above the cap → 413.
3. **Same-origin**: request accepted only if `Origin` equals the site origin; if `Origin` is absent, `Sec-Fetch-Site: same-origin` or a `Referer` with the site origin is required. Otherwise 403. No `Access-Control-Allow-*` headers are ever sent.
4. **Rate limit**: per route + client key (SHA-256 of IP with server salt, IP never stored in clear). Enquiry 5 / 10 min, careers 3 / 10 min. 429 with `Retry-After`.
5. **Bot checks** (`src/lib/forms/session.ts`, unit tests in `tests/forms-session.test.mjs`):
   - honeypot field `website` filled → the only "bot" state: fake success (`200 ok`), nothing delivered, logged `form.*.bot-suspected`;
   - `startedAt` missing, malformed or older than 24 h → `409 expired` with a fresh `startedAt`; the client keeps the entered data, swaps the stamp and the person sends again (no fake success, no lost lead);
   - submitted less than 3 s after opening (autofill) → `409 tooFast`; data kept, a resend a moment later passes. A stamp from the future (device clock) is replaced;
   - dialogs compute `startedAt` from the server render time plus elapsed local time (`useServerClock`), so a wrong device clock cannot trigger these states;
   - optional **Cloudflare Turnstile** only when BOTH `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are set (widget, CSP origin and server check use the same rule; with one key the challenge is fully off). Token verified server-side with the remote IP; failure → 400 shown as a generic error; the widget is reset after any non-success.
6. **Validation**: Zod schemas, allow-lists for enumerations (product groups, product form, position), strict length caps, Unicode normalisation (NFC), control characters stripped, e-mail format validated, phone restricted to digits, spaces and `+()-`. Client-side validation mirrors the rules for UX only.
7. **Consent**: required privacy consent checkbox; the version of the consent text is included in the e-mail for accountability.
8. **Responses**: JSON for fetch clients, 303 redirect to `/wyslano` for no-JS clients. Every non-success outcome (`invalid`, `rate`, `unavailable`, `error`, `forbidden`, `expired`, `tooFast`, or anything unknown/non-JSON) renders a visible, localised status; unrecoverable ones add the direct phone/e-mail fallback. Entered data is never cleared on failure. Internal reasons are not exposed.
9. **Fail-closed**: any unexpected exception → 500 generic message + error id; nothing is sent.

## 3. CV upload security

- Optional field. Allowed: `.pdf`, `.doc`, `.docx` only.
- Max size **5 MB** (typical CV ≪ 1 MB; leaves room for scanned PDFs).
- Three independent checks must all agree:
  1. extension allow-list,
  2. declared MIME allow-list (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`; `application/octet-stream` tolerated only when the signature check passes),
  3. **magic bytes**: PDF `%PDF-`; DOC OLE2 `D0 CF 11 E0 A1 B1 1A E1`; DOCX ZIP `50 4B 03 04` **and** the archive contains `[Content_Types].xml` and a `word/` entry.
- Filename sanitised: basename only, NFC → ASCII transliteration, `[^a-zA-Z0-9._-]` → `-`, collapsed, max 80 chars, extension re-applied from the validated type. The original name is never used in a path.
- File is never written to disk, never to `/public`, never served back. It exists only in memory and as an e-mail attachment to `CAREERS_FORM_RECIPIENT`.
- Content is not parsed or executed; no antivirus is available in this stack, so the recipient e-mail states the file is applicant-supplied and must be opened under the company's normal mail security. Recommendation for production: route through a mail server with attachment scanning.

## 4. Rate limiting

`src/lib/rate-limit/` exposes `limit(key, {limit, windowSec})`.

- `memory` adapter: fixed window in a module-level `Map`. **Only valid for local development and single-instance hosting.** On serverless / multi-instance hosting each instance has its own memory, so the effective limit multiplies and resets on cold start.
- `upstash` adapter: Upstash Redis REST (`INCR` + `EXPIRE` pipeline) via `fetch`, configured with `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Any Redis offering the same REST protocol works.
- Selection: Upstash when configured; otherwise memory, and in production a one-time warning is logged (`rate-limit: using in-memory limiter in production`). Deployment checklist requires Upstash for serverless deployments.
- If the Redis call fails the limiter **fails closed for careers** (CV uploads are expensive) and **fails open with logging for enquiries** (a lost sales lead costs more than a few spam e-mails). This asymmetry is intentional.

## 5. HTTP headers

Set in `src/proxy.ts` for pages and in `next.config.ts` `headers()` for everything else (API, static files).

| Header | Value |
|---|---|
| `Content-Security-Policy` | see §6 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` — **production only** (never on localhost/HTTP dev) |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()` |
| `X-Frame-Options` | `DENY` (legacy companion to `frame-ancestors 'none'`) |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `X-Powered-By` | removed (`poweredByHeader: false`) |
| API responses | `Cache-Control: no-store` |

## 6. CSP strategy

Nonce-based, generated per request in `proxy.ts` (Next.js extracts the nonce from the CSP request header and applies it to framework scripts automatically):

```
default-src 'self';
script-src 'self' 'nonce-{n}' 'strict-dynamic' [https://challenges.cloudflare.com if Turnstile] ['unsafe-eval' dev only];
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self';
media-src 'self';
connect-src 'self' [https://challenges.cloudflare.com];
frame-src [https://challenges.cloudflare.com] or 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests (production only)
```

Decisions:
- `style-src 'unsafe-inline'`: React `style` attributes (used sparingly for CSS custom properties) cannot carry nonces. Style injection without script execution is a much lower risk; scripts remain strictly nonce-bound.
- Nonces force dynamic rendering. Accepted (content is in-memory TypeScript, renders in milliseconds). Alternative documented by Next.js: experimental SRI hash-based CSP to restore static generation; revisit if hosting cost requires it.
- JSON-LD `<script type="application/ld+json">` receives the nonce and its content is produced only from our own data with `<` escaped as `<`.
- No third-party origins by default. Analytics, maps embeds or Turnstile must add their origins explicitly in `src/lib/security/csp.ts`.
- Google Maps is linked (external link), not embedded, so no frame source is required.

## 7. Consent strategy

- The site sets **no non-essential cookies** at launch: no analytics, no marketing pixels, no embedded maps or video players from third parties. Therefore no consent banner is legally required and none is shown (unlike the legacy "Rozumiem" bar, which loaded Google Analytics regardless).
- Consent architecture is ready: `src/lib/consent.ts` (cookie `mb_consent`, JSON `{v:1, analytics:boolean, ts}`, `SameSite=Lax`, `Secure` in production, 180 days) and `components/consent/ConsentBanner.tsx`, enabled only when `NEXT_PUBLIC_ANALYTICS_PROVIDER` is set. Analytics scripts may load **only** after an explicit opt-in, with equal-weight "Akceptuję" / "Odrzucam" buttons and a footer link "Ustawienia cookies" to change the choice.
- No GA4 property is invented. When the client provides one, add it behind consent and add its origins to the CSP.

## 8. Privacy-sensitive data flow

```
Browser ──HTTPS──▶ /api/careers (memory only)
                     │ validate → build e-mail (escaped)
                     └──▶ Mail provider (SMTP/Resend, TLS) ──▶ CAREERS_FORM_RECIPIENT mailbox
Logs: { form:'careers', id, at, hasCv, sizeBucket, result } — no name, phone, e-mail, message or file
```

- Data minimisation: careers requires name, phone, position and consent; e-mail, message and CV are optional (production hiring is phone-first). Enquiry requires company, contact person, country, e-mail, at least one product group and consent; phone, product form, volume, message and VAT ID are optional.
- Retention: the website stores nothing. Retention in mailboxes is the client's responsibility; the privacy policy must describe recruitment processing (missing in the legacy RODO text → `client-confirmations.md`).
- IP addresses: hashed with a server-side salt (`RATE_LIMIT_SALT`) for rate limiting only, TTL = window length in Redis.
- Development `log` mail adapter prints only metadata plus a field list with values truncated to 20 characters; CV contents are never printed.

## 9. Error handling and logging

- `lib/security/errors.ts`: `logEvent(level, event, meta)` → structured JSON to stdout (hosting log drain). Security events logged: rate-limit hit, origin rejected, honeypot, Turnstile fail, file rejected (reason), mail send failure.
- Users see localised generic messages with the direct phone/e-mail alternative.

## 10. Deployment checklist

- [ ] HTTPS with valid certificate; HTTP → HTTPS redirect at host level.
- [ ] `NEXT_PUBLIC_SITE_URL` set to the production origin (used for canonical URLs and the same-origin check).
- [ ] Mail provider configured and a test message delivered for both forms.
- [ ] `SALES_FORM_RECIPIENT`, `CAREERS_FORM_RECIPIENT`, `FORM_FROM_EMAIL` confirmed by the client.
- [ ] Upstash (or compatible) Redis configured for serverless/multi-instance hosting.
- [ ] `RATE_LIMIT_SALT` set to a random 32+ byte value.
- [ ] Optional: Turnstile keys — both or neither.
- [ ] Client IP: `clientIp()` trusts the first `X-Forwarded-For` value. Confirm the host overwrites/sanitises that header (Vercel, Cloudflare, a reverse proxy); otherwise adapt `src/lib/security/request.ts` to the platform's trusted header, or the rate limit can be bypassed by spoofing it.
- [ ] After deploy: check that the log has no `config.invalid` entries and that canonical/OG URLs show the production origin.
- [ ] Controlled delivery test of both forms to the approved mailboxes only (local tests: `npm test`, `npm run test:forms` against a local server).
- [ ] `npm audit --omit=dev` clean.
- [ ] securityheaders.com and Mozilla Observatory check after deploy.
