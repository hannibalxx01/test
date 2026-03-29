# Laperla SEO Action Plan
**Generated:** 2026-03-29
**Based on:** Full audit of https://www.laperlaoliveoil.com

Priority levels: **Critical** (fix immediately) → **High** (fix within 1 week) → **Medium** (fix within 1 month) → **Low** (backlog)

---

## CRITICAL — Fix Before Next Deployment

### C1. Deploy /ru/ pages to GitHub Pages
**Impact:** Fixes 5 × 404 errors in live sitemap, unblocks Russian SEO entirely

```bash
cd /Users/anesbs/Documents/Perla_website
git add ru/
git add sitemap.xml
git commit -m "Deploy Russian language pages and updated sitemap"
git push
```

---

### C2. Fix broken script tag in `ru/index.html`
**File:** `ru/index.html` lines 26-27
**Impact:** Fixes JavaScript parse error and raw keyword stuffing visible to crawlers

Remove these lines completely (raw Cyrillic text inside a `<script>` element):
```html
<!-- DELETE these 2 lines: -->
премиальное оливковое масло extra virgin, ECO-CERT, ...
</script>
```
The keywords are already correctly present in the `<meta name="keywords">` tag above.

---

### C3. Add `hreflang="ru"` to all 4 EN interior pages
**Files:** `product.html`, `heritage.html`, `blog.html`, `contact.html`
**Impact:** Fixes the entire Russian hreflang cluster for EN pages

For each page, add the ru line after the pl hreflang line:

**product.html** — change from:
```html
<link rel="alternate" hreflang="en" href="https://www.laperlaoliveoil.com/product.html" />
<link rel="alternate" hreflang="pl" href="https://www.laperlaoliveoil.com/pl/product.html" />
<link rel="alternate" hreflang="x-default" href="https://www.laperlaoliveoil.com/product.html" />
```
To:
```html
<link rel="alternate" hreflang="en"        href="https://www.laperlaoliveoil.com/product.html" />
<link rel="alternate" hreflang="pl"        href="https://www.laperlaoliveoil.com/pl/product.html" />
<link rel="alternate" hreflang="ru"        href="https://www.laperlaoliveoil.com/ru/product.html" />
<link rel="alternate" hreflang="x-default" href="https://www.laperlaoliveoil.com/product.html" />
```

Apply same pattern for `heritage.html`, `blog.html`, `contact.html` (substituting page names).

Also add `hreflang="ru"` to `index.html` (and the homepage already has EN+PL — add ru after pl):
```html
<link rel="alternate" hreflang="ru" href="https://www.laperlaoliveoil.com/ru/" />
```

---

### C4. Add `hreflang="ru"` to all 4 PL interior pages
**Files:** `pl/product.html`, `pl/heritage.html`, `pl/blog.html`, `pl/contact.html`

Same pattern — add one line after the existing pl hreflang. Example for `pl/product.html`:
```html
<link rel="alternate" hreflang="ru" href="https://www.laperlaoliveoil.com/ru/product.html" />
```

---

### C5. Add `hreflang` to all 5 RU pages (self-referencing required)
**Files:** All files in `ru/`
**Impact:** Without self-referencing, Google ignores the entire hreflang cluster for RU pages

**ru/product.html** — full correct set:
```html
<link rel="alternate" hreflang="en"        href="https://www.laperlaoliveoil.com/product.html" />
<link rel="alternate" hreflang="pl"        href="https://www.laperlaoliveoil.com/pl/product.html" />
<link rel="alternate" hreflang="ru"        href="https://www.laperlaoliveoil.com/ru/product.html" />
<link rel="alternate" hreflang="x-default" href="https://www.laperlaoliveoil.com/product.html" />
```

Apply same pattern to `ru/index.html`, `ru/heritage.html`, `ru/blog.html`, `ru/contact.html`.

---

## HIGH — Fix Within 1 Week

### H1. Fix canonical URL issues

**`pl/heritage.html`** — change:
```html
<link rel="canonical" href="https://laperlaoliveoil.com/pl/heritage.html" />
```
To:
```html
<link rel="canonical" href="https://www.laperlaoliveoil.com/pl/heritage.html" />
```

**`pl/contact.html`** — same fix (add `www.`).

**`pl/index.html`** — change:
```html
<link rel="canonical" href="https://www.laperlaoliveoil.com/pl/index.html" />
```
To:
```html
<link rel="canonical" href="https://www.laperlaoliveoil.com/pl/" />
```

---

### H2. Update robots.txt — add /ru/ rules and fix article conflict

**File:** `robots.txt`

```
# Current robots.txt (partial)
Allow: /pl/
Allow: /pl/*.html

# Add below these lines:
Allow: /ru/
Allow: /ru/*.html
```

Also remove the `?lang=` conflict by updating article hreflang entries in `sitemap.xml` (see H4).

---

### H3. Fix social media placeholder links on all pages
**Files:** All 10 EN/PL pages (footer section)
**Impact:** Fixes the most visible trust/E-E-A-T failure — QRG raters check social links

Find and replace:
```html
href="https://instagram.com/yourprofile"
href="https://facebook.com/yourprofile"
```
With the real profile URLs.

---

### H4. Fix article hreflang `?lang=` conflict in sitemap.xml
**File:** `sitemap.xml`
**Problem:** Sitemap lists `?lang=pl` and `?lang=ru` article URLs, but robots.txt blocks all `/*?lang=*`

Option A (recommended) — remove the broken `xhtml:link` entries for articles entirely until real translated article pages exist:

In `sitemap.xml`, find the article URL blocks and remove the `?lang=` alternate links:
```xml
<!-- DELETE these lines from article entries: -->
<xhtml:link rel="alternate" hreflang="pl" href="...?lang=pl"/>
<xhtml:link rel="alternate" hreflang="ru" href="...?lang=ru"/>
```

Option B (better long-term) — create real `/pl/articles/` and `/ru/articles/` static pages.

---

### H5. Fix placeholder telephone in `pl/contact.html` schema
**File:** `pl/contact.html`

Find:
```json
"telephone": "+216-XX-XXX-XXX"
```
Replace with real number or delete the `telephone` line entirely.

---

### H6. Add Product schema to `product.html` (EN) — currently has zero
**File:** `product.html`

Add this JSON-LD block inside `<head>`, replacing the `PRICE` placeholder with the actual price:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Chemlali Edition Prestige — Laperla Premium Extra Virgin Olive Oil",
  "description": "Premium extra virgin olive oil from 500-year-old Chemlali trees in Tunisia's Sidi Bou Ali. ECO-CERT and USDA Organic certified. Acidity below 0.3%, polyphenols above 600mg/kg.",
  "brand": {"@type": "Brand", "name": "Laperla"},
  "sku": "LAPERLA-CHEMLALI-500",
  "image": "https://www.laperlaoliveoil.com/assets/images/bottle.jpeg",
  "url": "https://www.laperlaoliveoil.com/product.html",
  "offers": {
    "@type": "Offer",
    "url": "https://www.laperlaoliveoil.com/product.html",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "price": "REPLACE_WITH_REAL_PRICE",
    "priceValidUntil": "2026-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5.0",
    "reviewCount": "3",
    "bestRating": "5",
    "worstRating": "1"
  },
  "additionalProperty": [
    {"@type": "PropertyValue", "name": "Acidity", "value": "<0.3%"},
    {"@type": "PropertyValue", "name": "Polyphenols", "value": ">600mg/kg"},
    {"@type": "PropertyValue", "name": "Certification", "value": "ECO-CERT, USDA Organic"},
    {"@type": "PropertyValue", "name": "Pressing Method", "value": "Cold-pressed within 4 hours of harvest"}
  ]
}
</script>
```

---

### H7. Fix `price` in existing Product schema on `index.html`
**File:** `index.html`

In the existing Product JSON-LD, find:
```json
"offers": {
  "@type": "Offer",
  "availability": "https://schema.org/InStock",
  "priceCurrency": "USD"
},
```
Replace with:
```json
"offers": {
  "@type": "Offer",
  "url": "https://www.laperlaoliveoil.com/product.html",
  "availability": "https://schema.org/InStock",
  "priceCurrency": "USD",
  "price": "REPLACE_WITH_REAL_PRICE",
  "priceValidUntil": "2026-12-31"
},
```
Also add to the rating block:
```json
"bestRating": "5",
"worstRating": "1"
```

---

### H8. Add Organization + WebSite schema to `index.html`
**File:** `index.html`

Add a second `<script type="application/ld+json">` block (after the existing Product one). Replace `sameAs` URLs with real social profile URLs:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.laperlaoliveoil.com/#organization",
      "name": "Laperla",
      "url": "https://www.laperlaoliveoil.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.laperlaoliveoil.com/assets/images/logo.png"
      },
      "description": "Producer of premium extra virgin olive oil from 500-year-old Chemlali trees in Sidi Bou Ali, Tunisia. ECO-CERT certified.",
      "foundingDate": "1523",
      "email": "info@laperlaoliveoil.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Sidi Bou Ali",
        "addressCountry": "TN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "info@laperlaoliveoil.com",
        "availableLanguage": ["English", "Polish", "Russian"]
      },
      "sameAs": [
        "REPLACE_WITH_REAL_INSTAGRAM_URL",
        "REPLACE_WITH_REAL_FACEBOOK_URL"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://www.laperlaoliveoil.com/#website",
      "url": "https://www.laperlaoliveoil.com/",
      "name": "Laperla Premium Olive Oil",
      "inLanguage": "en",
      "publisher": {"@id": "https://www.laperlaoliveoil.com/#organization"}
    }
  ]
}
</script>
```

---

### H9. Fix nav logo `<h2>` tag across all pages
**Impact:** Fixes heading hierarchy — logo `<h2>` appears before the page `<h1>` on every page

Find the nav logo (example pattern):
```html
<h2 class="...">LAPERLA</h2>
```
Replace `<h2>` and `</h2>` with `<span>` and `</span>` (or `<p>`, keeping all classes).

---

## MEDIUM — Fix Within 1 Month

### M1. Add schema to English `heritage.html`, `blog.html`, `contact.html`
The PL versions already have correct schema — port them to the EN equivalents.

**heritage.html** — Add AboutPage + BreadcrumbList (ready-to-paste in FULL-AUDIT-REPORT.md)
**blog.html** — Add Blog + BlogPosting + BreadcrumbList
**contact.html** — Add ContactPage + BreadcrumbList

---

### M2. Add schema to all 5 Russian pages
All `/ru/` pages have zero schema. After deploying, add localized schema to each.
See `FULL-AUDIT-REPORT.md` for the Russian homepage JSON-LD template.

---

### M3. Replace empty favicon

**All 17 HTML files** contain:
```html
<link rel="icon" type="image/x-icon" href="data:image/x-icon;base64," />
```

Replace with a real favicon:
1. Create or export a `favicon.ico` file (32×32px)
2. Place at `/assets/images/favicon.ico`
3. Change the tag to:
```html
<link rel="icon" type="image/x-icon" href="/assets/images/favicon.ico" />
```

---

### M4. Fix blog meta description (191 chars → target 155)

**File:** `blog.html`

Current: "Explore the world of premium olive oil with Laperla's blog. Discover ancient olive varieties, health benefits, culinary tips, and the heritage behind Tunisia's finest extra virgin olive oil." (191 chars)

Suggested replacement (155 chars):
```
Explore Laperla's olive oil blog — ancient Chemlali varieties, health benefits, and Tunisian heritage stories. Premium insights from 500-year-old groves.
```

---

### M5. Fix homepage title (72 chars → target 55-60)

**File:** `index.html`
Current: "Laperla | 500-Year-Old Trees | Premium Tunisian Extra Virgin Olive Oil" (72 chars — will truncate)

Suggested (58 chars):
```
Laperla | Premium Tunisian Extra Virgin Olive Oil
```

---

### M6. Add `defer` to language-manager.js on EN pages; remove from PL/RU

**EN pages** — change:
```html
<script src="assets/js/language-manager.js"></script>
```
To:
```html
<script src="assets/js/language-manager.js" defer></script>
```

**PL/RU pages** — remove the `<script src="../assets/js/language-manager.js">` line entirely (these are standalone static pages that don't need language switching logic).

---

### M7. Update copyright footer year

**All pages** — find `© 2025 Laperla` and replace with `© 2026 Laperla`.

---

### M8. Add `lastmod` dates to sitemap.xml

Add to every `<url>` block:
```xml
<lastmod>2026-03-29</lastmod>
```
For /ru/ pages use today's date. For existing pages use the actual last git commit date of each file.

---

### M9. Add a physical business address to contact.html

Even just the city/country is sufficient for trust and local SEO. Add to the contact page body and to the ContactPage schema.

---

### M10. Add named author/founder attribution

Add to heritage page and both articles:
```html
<p>Written by [Founder Name], [generation]-generation olive grower from Sidi Bou Ali, Tunisia</p>
```
Even a brand-level author entity ("Laperla Heritage Team") is better than anonymous.

---

### M11. Add Google Analytics to all main pages

`gtag.js` is currently only on the 2 article pages. All main pages (`index.html`, `product.html`, `heritage.html`, `blog.html`, `contact.html`) and their PL/RU equivalents are missing analytics.

Copy the gtag snippet from `articles/chemlali-olive-tree.html` and add to all remaining pages.

---

## LOW — Backlog

### L1. Create `/llms.txt` for AI search readiness

Create at `/Users/anesbs/Documents/Perla_website/llms.txt`:
```
# Laperla - Premium Tunisian Extra Virgin Olive Oil
> Producer of single-origin extra virgin olive oil from 500-year-old Chemlali trees in Sidi Bou Ali, Tunisia. ECO-CERT certified. Acidity <0.3%, polyphenols >600mg/kg. Cold-pressed within 4 hours of harvest.

## Key Facts
- Trees: Chemlali variety, 500+ years old, Sidi Bou Ali estate, Tunisia
- Certifications: ECO-CERT, USDA Organic, Organic Bio
- Acidity: <0.3% (industry limit for Extra Virgin: 0.8%)
- Polyphenols: >600 mg/kg
- Awards: Miami 2024, Geneva 2024, Abu Dhabi 2024, UAE 2026, Italy 2024
- Languages: English, Polish, Russian

## Pages
- Home: https://www.laperlaoliveoil.com/
- Product: https://www.laperlaoliveoil.com/product.html
- Heritage: https://www.laperlaoliveoil.com/heritage.html
- Blog: https://www.laperlaoliveoil.com/blog.html
- Contact: https://www.laperlaoliveoil.com/contact.html

## Articles
- https://www.laperlaoliveoil.com/articles/chemlali-olive-tree.html
- https://www.laperlaoliveoil.com/articles/olive-oil-health-benefits.html

## Contact
info@laperlaoliveoil.com
```

---

### L2. Add explicit AI crawler rules to robots.txt

```
# AI search crawlers — allow indexing
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: GoogleBot-Extended
Allow: /
```

---

### L3. Create named competition award entries

Replace generic award names with real competition body names on `index.html`:
- "US International Competition 2024" → actual competition name (e.g., "New York International Olive Oil Competition 2024")
- "European International Competition 2024" → actual name (e.g., "MARIO Geneva 2024")

This allows Googlebot and AI citation engines to verify the awards against public records.

---

### L4. Add FAQ section with FAQPage schema

Add 6–8 Q&A pairs to `index.html` and `product.html` targeting common premium olive oil queries. Mark up with `FAQPage` JSON-LD. Suggested questions:
- "What makes Chemlali olive oil different from Italian or Spanish olive oil?"
- "What polyphenol level is considered high in olive oil?"
- "What does ECO-CERT certification mean?"
- "Why does acidity matter in extra virgin olive oil?"
- "How old are the olive trees used in Laperla oil?"

---

### L5. Publish 3 additional blog articles

The blog index with 2 articles + "coming soon" is a thin-content risk. Adding 3 more articles (reaching 5 total) moves the page above the typical thin-content threshold and improves the blog's crawl signals.

---

### L6. Create a Wikidata entity for Laperla

A Wikidata Q-item for the brand enables `Organization.sameAs` linking and helps AI models resolve "Laperla olive oil" as a distinct brand entity separate from other uses of the word "laperla" in training data.

---

### L7. Migrate from GitHub Pages to Cloudflare Pages or Netlify

Benefits:
- Custom HTTP security headers (`X-Content-Type-Options`, `X-Frame-Options`, `CSP`)
- Longer `Cache-Control` (`max-age=86400` for HTML, `immutable` for versioned assets)
- Automatic redirects and rewrite rules (can solve `www` vs non-`www` at server level)
- Better branch preview deployments

---

## Prioritised Fix Order — Master Checklist

### Week 1 (Critical)
- [ ] C1: Push `/ru/` directory to GitHub Pages
- [ ] C2: Fix broken script tag in `ru/index.html`
- [ ] C3: Add `hreflang="ru"` to all 4 EN interior pages
- [ ] C4: Add `hreflang="ru"` to all 4 PL interior pages
- [ ] C5: Add complete hreflang set to all 5 RU pages
- [ ] H3: Fix placeholder social media links (yourprofile)

### Week 2 (High)
- [ ] H1: Fix canonical www/trailing-slash on pl/heritage, pl/contact, pl/index
- [ ] H2: Update robots.txt — add /ru/ Allow rules
- [ ] H4: Fix article ?lang= entries in sitemap.xml
- [ ] H5: Fix placeholder telephone in pl/contact.html schema
- [ ] H6: Add Product schema to product.html (EN)
- [ ] H7: Fix `price` in index.html Product schema
- [ ] H8: Add Organization + WebSite schema to index.html
- [ ] H9: Fix nav logo h2 → span across all pages

### Week 3-4 (Medium)
- [ ] M1: Add schema to EN heritage, blog, contact pages
- [ ] M2: Add schema to all /ru/ pages
- [ ] M3: Replace empty favicon with real .ico file
- [ ] M4: Fix blog.html meta description (191→155 chars)
- [ ] M5: Shorten homepage title (72→58 chars)
- [ ] M6: Add defer to language-manager.js; remove from PL/RU pages
- [ ] M7: Update copyright footer 2025 → 2026
- [ ] M8: Add lastmod dates to sitemap.xml
- [ ] M9: Add physical address to contact page
- [ ] M10: Add author attribution to heritage + articles
- [ ] M11: Add Google Analytics to all main pages

### Backlog (Low)
- [ ] L1: Create /llms.txt
- [ ] L2: Add AI crawler rules to robots.txt
- [ ] L3: Replace generic competition award names with real ones
- [ ] L4: Add FAQ section + FAQPage schema
- [ ] L5: Publish 3+ more blog articles
- [ ] L6: Create Wikidata entity for brand
- [ ] L7: Consider migrating to Cloudflare Pages or Netlify
