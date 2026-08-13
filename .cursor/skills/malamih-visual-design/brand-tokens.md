# Malamih brand tokens (visual reference)

Read this when aligning CSS/Tailwind/React Native theme values. Prefer existing project tokens; do not invent a second palette.

## Core hex / HSL

| Token | Hex (approx) | CSS / notes |
|-------|--------------|-------------|
| Navy | `#0a1628` | `--malamih-navy` · `theme.navy` |
| Teal (primary) | `#295f59` | `--malamih-teal` / `--primary` · brand HEX |
| Teal light (sparingly) | `#10b981` | accents/gradients only — not neon chrome |
| Gold (optional metal) | `#d4af37` | `--malamih-gold` · CTAs/highlights |
| Cream / off-white | `#f7f5f0` | `--background` / `--malamih-cream` · `theme.bg` |
| White | `#ffffff` | cards, text on teal |
| Muted text | slate ~`#64748b` | body secondary |

## Web files

- `apps/web/app/globals.css` — CSS variables, `.btn-malama*`, `.card-malama`, `.bento-card`
- Shared UI under `apps/web/components/` — className-only restyles
- Avoid rewriting copy inside JSX string literals

## Mobile files

- `apps/mobile/constants/theme.ts` — single source for RN colors/radius/shadow
- **Do not expand** `purple` / `pink` / `sky` for new product chrome; treat as legacy. Prefer navy/teal/gold/cream/white.

## Logo usage

- Full lockup: `apps/web/public/brand/logo-full.png` — face mark + «ملامح» + دليل طبي. Use in navbar/footer without cropping to a circle.
- Tab / app icon: `apps/web/public/icon-512.png` and `logo-mark.png` — face line on `#295f59`.
- Do not crop the full lockup into a circle; that hides the wordmark.

## Typography

- Web: keep established Arabic/Latin stack already loaded (e.g. Cairo / project fonts in layout)—strengthen **heading vs body** roles via weight/size/tracking, don’t add random third families.
- Display: heavier weight, tighter tracking for brand moments; body: readable sans for UI.
- English brand moments may use spaced uppercase feel; Arabic brand moments keep calligraphic/display hierarchy without changing the word «ملامح» itself.

## Pattern

Subtle teal-on-teal topographic / wavy texture for hero/header atmosphere is on-brand. Keep opacity low; never compete with content.

## Anti-patterns

- Cream + terracotta `#D97757`
- Purple-on-white / indigo glow SaaS
- Black + single neon accent
- Decorative 01/02/03 without real sequence
- Heavy parallax / endless floating blobs
