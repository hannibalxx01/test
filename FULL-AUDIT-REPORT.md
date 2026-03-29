# Laperla SEO Full Audit Report
**Site:** https://www.laperlaoliveoil.com
**Date:** 2026-03-29
**Pages audited:** 15 (EN × 5, PL × 5, RU × 5) + 2 articles

---

## Overall SEO Health Score: 54 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 54/100 | 11.9 |
| Content Quality | 23% | 68/100 | 15.6 |
| On-Page SEO | 20% | 58/100 | 11.6 |
| Schema / Structured Data | 10% | 42/100 | 4.2 |
| Performance (CWV) | 10% | 65/100 | 6.5 |
| AI Search Readiness (GEO) | 10% | 41/100 | 4.1 |
| Images | 5% | 55/100 | 2.75 |
| **TOTAL** | | | **56.65** |

> **Business type detected:** Premium DTC food/FMCG — international luxury olive oil brand targeting EN, PL, RU markets.

---

## CRITICAL: /ru/ Pages Are Not Deployed

The Russian pages exist locally in `/ru/` and are listed in `sitemap.xml`, but every one of them returns **HTTP 404** on the live server. Googlebot will crawl these 404s from the sitemap and may penalise crawl budget. This must be fixed before anything else.

```
https://www.laperlaoliveoil.com/ru/           → 404
https://www.laperlaoliveoil.com/ru/product.html → 404
https://www.laperlaoliveoil.com/ru/heritage.html → 404
https://www.laperlaoliveoil.com/ru/blog.html  → 404
https://www.laperlaoliveoil.com/ru/contact.html → 404
```

**Fix:** `git add ru/ && git commit -m "Add Russian pages" && git push` to deploy to GitHub Pages.

---

## Executive Summary

### Top 5 Critical Issues

1. **Russian pages return 404** — `/ru/` directory not pushed to GitHub Pages; Googlebot crawling dead links from sitemap
2. **Hreflang `ru` missing from 13 of 17 pages** — EN and PL interior pages have no `hreflang="ru"` tag; RU interior pages missing self-referencing `hreflang="ru"` — entire Russian hreflang cluster is invalid
3. **Broken `</script>` tag in `ru/index.html`** — raw Cyrillic keyword text injected as a text node inside a `<script>` element, corrupting the DOM
4. **Zero structured data on all English interior pages and all Russian pages** — only `index.html` (EN+PL) and PL interior pages have schema; `product.html`, `heritage.html`, `blog.html`, `contact.html` (EN) all have none
5. **Blog is thin content** — ~150 words of unique content, 2 article stubs, "coming soon" placeholder; a thin-content penalty risk

### Top 5 Quick Wins

1. Fix the broken script tag in `ru/index.html` (5-minute fix)
2. Add `hreflang="ru"` to all 4 EN interior pages (30-minute fix)
3. Fix placeholder social media links (`instagram.com/yourprofile`) — breaks trust signals globally
4. Fix `pl/heritage.html` and `pl/contact.html` canonicals: `laperlaoliveoil.com` → `www.laperlaoliveoil.com`
5. Add `Allow: /ru/` to `robots.txt`

---

## 1. Technical SEO — Score: 54/100

### Hreflang Matrix (Audit Result)

| Page | hreflang=en | hreflang=pl | hreflang=ru | x-default |
|---|---|---|---|---|
| `/` | ✅ | ✅ | ❌ | ✅ |
| `/product.html` | ✅ | ✅ | ❌ | ✅ |
| `/heritage.html` | ✅ | ✅ | ❌ | ✅ |
| `/blog.html` | ✅ | ✅ | ❌ | ✅ |
| `/contact.html` | ✅ | ✅ | ❌ | ✅ |
| `/pl/` | ✅ | ✅ | ❌ | ✅ |
| `/pl/product.html` | ✅ | ✅ | ❌ | ✅ |
| `/pl/heritage.html` | ✅ | ✅ | ❌ | ✅ |
| `/pl/blog.html` | ✅ | ✅ | ❌ | ✅ |
| `/pl/contact.html` | ✅ | ✅ | ❌ | ✅ |
| `/ru/` | — | — | — | — | ← 404
| `/ru/product.html` | — | — | — | — | ← 404
| `/ru/heritage.html` | — | — | — | — | ← 404
| `/ru/blog.html` | — | — | — | — | ← 404
| `/ru/contact.html` | — | — | — | — | ← 404

**Correct hreflang set for every interior page (copy-paste template):**
```html
<link rel="alternate" hreflang="en"        href="https://www.laperlaoliveoil.com/product.html" />
<link rel="alternate" hreflang="pl"        href="https://www.laperlaoliveoil.com/pl/product.html" />
<link rel="alternate" hreflang="ru"        href="https://www.laperlaoliveoil.com/ru/product.html" />
<link rel="alternate" hreflang="x-default" href="https://www.laperlaoliveoil.com/product.html" />
```

### Canonicalization Issues

| File | Problem | Fix |
|---|---|---|
| `pl/heritage.html` | `laperlaoliveoil.com` (no www) | Change to `https://www.laperlaoliveoil.com/pl/heritage.html` |
| `pl/contact.html` | `laperlaoliveoil.com` (no www) | Change to `https://www.laperlaoliveoil.com/pl/contact.html` |
| `pl/index.html` | Points to `/pl/index.html` (file form) | Change to `https://www.laperlaoliveoil.com/pl/` (trailing slash — matches sitemap) |

### robots.txt Issues

```
# Current — missing /ru/ coverage
Allow: /pl/
Allow: /pl/*.html

# Add these two lines:
Allow: /ru/
Allow: /ru/*.html
```

### Security Headers (GitHub Pages Limitation)

GitHub Pages does not support custom HTTP headers. The following are absent:

| Header | Risk Level |
|---|---|
| `X-Content-Type-Options: nosniff` | Medium |
| `X-Frame-Options: SAMEORIGIN` | Medium |
| `Content-Security-Policy` | High — site loads 4 external CDNs |
| `Permissions-Policy` | Low |

**Mitigation:** Migrate to Cloudflare Pages or Netlify (both support `_headers` file). This also solves the Cache-Control issue (currently `max-age=600` — 10 minutes).

### JavaScript Issues

- `language-manager.js` loads **synchronously** in `<head>` on all pages, including PL and RU. It fires a fetch to `api.ip-api.com` before page is interactive — delays INP and risks redirect loops on static PL/RU pages.
- PL and RU pages **don't need** `language-manager.js` at all — they are static standalone files.
- Add `defer` to the script tag on EN pages; remove the script include from all `/pl/` and `/ru/` templates.

---

## 2. Content Quality (E-E-A-T) — Score: 68/100

### E-E-A-T Breakdown

| Pillar | Score | Key Gap |
|---|---|---|
| Experience | 14/20 | No named founder or family member anywhere — anonymous first-person brand copy |
| Expertise | 17/25 | No author bylines; health claims unsubstantiated ("liquid medicine," "preserves life itself") |
| Authoritativeness | 19/25 | Award names are generic ("European International Competition") — can't be verified by Google |
| Trustworthiness | 18/30 | Placeholder social links, no physical address, no privacy policy, stale copyright (2025) |

### Per-Page Issues

| Page | Issue | Severity |
|---|---|---|
| All pages | Nav logo uses `<h2>` tag appearing before page `<h1>` — inverts heading hierarchy | Critical |
| All pages | Social links point to `instagram.com/yourprofile` and `facebook.com/yourprofile` | Critical |
| `blog.html` | ~150 words of unique content — thin content risk | Critical |
| `blog.html` | Meta description 191 chars (31 over limit) | High |
| `product.html` | No Product structured data (PL version has it) | High |
| `heritage.html` | No structured data (PL version has WebPage schema) | High |
| `contact.html` | No structured data; no physical address | High |
| `index.html` | Title tag 72 chars (12 over ideal — will truncate in SERPs) | Medium |
| `heritage.html` | Meta description 162 chars (2 over limit) | Medium |
| All pages | Copyright footer shows "© 2025" in 2026 | Medium |
| All pages | No privacy policy, no GDPR/cookie consent (targets EU) | Medium |
| All pages | No named founder, no author attribution on any content page | High |

---

## 3. Structured Data — Score: 42/100

### Coverage Matrix

| Page | Schema Present | Critical Missing |
|---|---|---|
| `index.html` | Product (broken — missing `price`) | Organization, WebSite, fix price |
| `product.html` | **None** | Product schema entirely absent |
| `heritage.html` | **None** | AboutPage schema |
| `blog.html` | **None** | Blog + BlogPosting |
| `contact.html` | **None** | ContactPage |
| `pl/index.html` | Product (broken — missing `price`) | Fix price |
| `pl/product.html` | Product (broken — missing `price`) | Fix price |
| `pl/heritage.html` | WebPage | — |
| `pl/blog.html` | Blog + ItemList | — |
| `pl/contact.html` | ContactPage (broken — placeholder phone) | Fix `+216-XX-XXX-XXX` |
| All `/ru/` pages | **None** | Everything |

### Key Schema Bugs

1. **`price` missing from all `Offer` blocks** — Product schema with no `price` is ineligible for Google Product rich results. This affects `index.html`, `pl/index.html`, `pl/product.html`.
2. **`pl/contact.html` has placeholder telephone** `"+216-XX-XXX-XXX"` — replace with real number or remove property.
3. **`product.html` (EN) has zero schema** — the site's main commercial page in the primary language has no structured data at all.

### Recommended JSON-LD additions

See [ACTION-PLAN.md](ACTION-PLAN.md) for complete ready-to-paste JSON-LD blocks.

---

## 4. Sitemap — Validation

| Check | Live Server | Local File | Status |
|---|---|---|---|
| XML well-formed | ✅ | ✅ | PASS |
| All 15 core pages | ❌ missing 5 RU | ✅ | FAIL (live) |
| All URLs return 200 | ❌ 5 × 404 (RU) | — | FAIL |
| `lastmod` on all URLs | ❌ none | ❌ none | FAIL |
| `x-default` hreflang in sitemap | ❌ none | ❌ none | FAIL |
| Article `?lang=` URLs | Blocked by robots.txt | Blocked by robots.txt | FAIL |
| `/ru/` explicitly allowed in robots.txt | ❌ | ❌ | WARN |
| robots.txt sitemap directive matches | ✅ | ✅ | PASS |

**Live sitemap is stale** — it predates the Russian update. Googlebot is reading the old file.

**Article hreflang conflict:** Both articles use `?lang=pl` and `?lang=ru` as alternate targets in the sitemap, but `robots.txt` blocks all `/*?lang=*` URLs. These hreflang entries are unreachable by design.

Fix options:
- Create real `/pl/articles/` and `/ru/articles/` pages (recommended — consistent with site architecture)
- Or remove `?lang=` from sitemap article entries and use EN canonical as the single hreflang target

---

## 5. Performance — Score: ~65/100 (estimated)

> Note: Live PageSpeed measurement hit rate limits. Assessment based on static analysis.

**What's working:**
- GitHub Pages served via Fastly CDN — good global edge performance
- Compiled Tailwind CSS (no CDN for styles) — no render-blocking CSS
- Google Fonts uses `preconnect` + `preload` + `onload` pattern — non-blocking
- HTTP/2 ✅, HTTPS ✅, HSTS ✅

**Performance risks:**
- `language-manager.js` in `<head>` without `defer` — blocks rendering on page load
- Geolocation API call to `api.ip-api.com` on every EN page load — 3s timeout blocks interactivity
- No WebP/AVIF image formats detected (likely JPEG only)
- Images likely missing explicit `width`/`height` — CLS risk
- Cache TTL: `max-age=600` (10 min) — unnecessarily low for static assets

---

## 6. GEO / AI Search Readiness — Score: 41/100

| Platform | Score | Primary Blocker |
|---|---|---|
| Google AI Overviews | 35/100 | No FAQPage schema, no question-format H2s |
| ChatGPT web browsing | 38/100 | No Article schema, no author attribution, no Organization/sameAs |
| Perplexity | 44/100 | Static HTML is positive; PubMed citations lack hyperlinks |
| Bing Copilot | 40/100 | Missing WebSite + SearchAction schema |
| Claude web search | 42/100 | Missing llms.txt, no bylines, thin review count |

**Missing: `/llms.txt`** — 404. This is the single highest-signal omission for AI search readiness.

**robots.txt names no AI crawlers** — GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot all implicitly allowed via wildcard. Explicit Allow rules are preferred.

**No brand entity establishment:** No Wikipedia page, no Wikidata Q-item, no Organization `sameAs` array. AI models resolving "Laperla olive oil" brand have no authoritative entity graph to anchor citations to.

---

## 7. Images — Score: ~55/100 (estimated)

- Image formats: JPEG confirmed for `bottle.jpeg`; no WebP variants detected
- Alt text: present on some images but consistency across all 17 pages is unverified
- No explicit `width`/`height` on images — CLS risk
- `og:image` not confirmed on all pages
- Logo referenced inconsistently: `.png` in schema vs `.jpeg` in product schema vs no dedicated favicon

---

## Files Requiring Action

| File | Issues |
|---|---|
| `ru/index.html` | Broken script tag lines 26-27; missing hreflang ru; missing schema |
| `ru/product.html` | 404 (not deployed); missing hreflang; missing schema |
| `ru/heritage.html` | 404; missing hreflang; missing schema |
| `ru/blog.html` | 404; missing hreflang; missing schema |
| `ru/contact.html` | 404; missing hreflang; missing schema |
| `index.html` | Missing hreflang ru; title too long; missing Organization/WebSite schema; fix Product price |
| `product.html` | Missing hreflang ru; missing Product schema entirely |
| `heritage.html` | Missing hreflang ru; missing AboutPage schema |
| `blog.html` | Missing hreflang ru; thin content; missing Blog schema; meta desc too long |
| `contact.html` | Missing hreflang ru; missing ContactPage schema; no address |
| `pl/index.html` | Missing hreflang ru; canonical uses file form not trailing slash |
| `pl/product.html` | Missing hreflang ru; fix Product price in schema |
| `pl/heritage.html` | Missing hreflang ru; canonical uses non-www |
| `pl/blog.html` | Missing hreflang ru |
| `pl/contact.html` | Missing hreflang ru; placeholder telephone in schema |
| `robots.txt` | Missing Allow: /ru/ and Allow: /ru/*.html |
| `sitemap.xml` | Outdated (not deployed); missing lastmod; article ?lang= conflict |
| `assets/js/language-manager.js` | Missing defer; unnecessary on PL/RU pages |
| All pages | Broken social links (yourprofile); nav logo h2; empty favicon; stale copyright |
