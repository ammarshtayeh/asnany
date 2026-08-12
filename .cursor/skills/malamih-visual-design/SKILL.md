---
name: malamih-visual-design
description: Reviews and improves Malamih (ملامح) visual UI/UX only—colors, typography, spacing, decoration, motion, consistency, responsiveness—without changing logic, APIs, routes, features, or copy. Use when acting as frontend/UI-UX, polishing design, fixing template-looking UI, aligning to brand identity, or when the user asks to مراجعة التصميم البصري / تحسين الواجهة / هوية بصرية.
---

# Malamih Visual Design (UI/UX only)

Act as a frontend + UI/UX designer for **ملامح / Malamih**. Improve **visual design only**. Encode brand from the Malameh identity board (deep teal, cream, white, face-line mark, serif wordmark).

## Hard boundaries (verbatim)

❌ ممنوع:
- تغيير أي منطق برمجي (logic)، وظائف (functionality)، أو API calls
- تغيير بنية البيانات أو الـ routes
- حذف أو إضافة أي feature
- تغيير المحتوى النصي الفعلي (النصوص، البيانات، المعلومات)

✅ المطلوب فقط:
راجع التصميم البصري وأصلح أي شي يبين إنه "قالب افتراضي" أو غير مقصود، خصوصًا:

1. **الألوان**: إذا فيه تركيبة ألوان عشوائية أو افتراضية (زي خلفية كريمية + لون تراكوتا #D97757، أو أسود + لون فوسفوري واحد) — استبدلها بلوحة ألوان مقصودة ومترابطة (4-6 ألوان) تناسب طبيعة المشروع تحديدًا.

2. **الخطوط**: تأكد إن فيه اختيار واضح لخط عرض (headings) وخط أساسي (body) يعبّرون عن هوية الموقع، مو الخطوط الافتراضية العشوائية.

3. **التباعد والتنظيم (spacing/layout)**: افحص إذا فيه تباعد غير متسق بين الأقسام، عناصر متلاصقة أو بعيدة بشكل غير مريح، أو محاذاة غير دقيقة.

4. **عناصر زخرفية بلا معنى**: احذف أي عنصر تزييني ما له وظيفة أو معنى حقيقي (أرقام ترقيم 01/02/03 لأشياء مو متسلسلة فعليًا، خطوط فاصلة زايدة، أيقونات بلا داعي).

5. **الحركة/الأنيميشن**: إذا فيه حركات كثيرة أو غير محسوبة تشتت — قللها أو احذفها. إذا ناقص حركة بسيطة تحسن التجربة (hover states، transitions) أضفها بشكل هادئ.

6. **التناسق العام**: تأكد إن كل صفحة تتبع نفس نظام التصميم (نفس الأزرار، نفس الكروت، نفس الهيدرات) بدون اختلافات عشوائية بين الصفحات.

7. **الاستجابة (responsiveness)**: تأكد التصميم يشتغل صح على الموبايل بدون ما يكسر أي عنصر.

قبل ما تسوي أي تعديل، اعطني ملخص بالمشاكل اللي لاحظتها في التصميم الحالي (سطر أو سطرين لكل مشكلة)، وبعدها ابدأ التنفيذ خطوة بخطوة بدون ما تلمس أي شي غير بصري.

## Brand identity (source of truth)

Premium medical / organic / trustworthy. Not purple SaaS, not neon, not cream+terracotta template.

| Role | Direction | Prefer tokens |
|------|-----------|---------------|
| Primary | Deep teal / forest | `#295f59` (`--malamih-teal` / `--primary`) |
| Deep surface | Near-black teal / navy | `--malamih-navy` / `#0a1628` |
| Secondary surface | Warm off-white / soft cream | `#f7f5f0`–`#faf8f5`, not flat gray-only |
| Accent on dark | White / soft ivory | text & logo on teal |
| Optional metal | Soft gold (sparingly) | `--malamih-gold` / `#d4af37` — CTAs/highlights only |
| Text | High-contrast on cream; light on teal | navy/teal body, white on dark |

**Logo language:** continuous single-line face profile; white on teal or teal on light. English wordmark: elegant spaced caps serif (“MALAMEH”); Arabic «ملامح» refined calligraphic feel via existing Arabic display/body pairing—do not invent new copy.

**Texture:** subtle tonal teal topographic / wavy line pattern OK for headers/section atmosphere; keep quiet.

**Forbidden drifts:** terracotta `#D97757`, purple/pink/indigo gradients, neon green, black+single phosphor accent, Inter/Roboto/Arial/system as intentional brand voice, purple leftovers in mobile theme for product chrome.

Full token map: [brand-tokens.md](brand-tokens.md).

## Workflow

1. **Audit first (no code yet)** — List visual problems only; 1–2 lines each (colors, type, spacing, decoration, motion, consistency, responsive).
2. **Propose palette + type pairing** briefly if changing tokens (must match brand table).
3. **Implement visual-only**, step by step:
   - Web: `apps/web/app/globals.css`, Tailwind theme classes, shared UI components’ **className/style** only.
   - Mobile: `apps/mobile/constants/theme.ts` and style objects / classNames only.
4. **Do not** touch handlers, fetch, schemas, routes, feature flags, or string literals that are user-facing content (labels/copy/data). Changing a color class or font family is OK; rewriting Arabic/English marketing sentences is not.
5. **Preserve** existing layout structure and interaction flows; restyle containers, not rewire them.
6. After a batch of changes, re-check consistency (buttons, cards, headers) and mobile breakpoints.

## Visual checklist

- [ ] Palette is 4–6 intentional colors; no random/default combos
- [ ] Clear display + body font roles (Noto Naskh / Amiri-style display vs Noto Sans Arabic body already in web—keep that hierarchy; avoid stacking extra random Google fonts)
- [ ] Section spacing rhythm consistent; no cramped or sparse accidents
- [ ] No meaningless 01/02/03, orphan dividers, or decorative icons without job
- [ ] Motion calm: prefer short opacity/transform transitions & hover; remove distracting loops
- [ ] Same button/card/header language across pages
- [ ] Mobile: no overflow, stacked CTAs usable, readable type size

## Scope reminder

If a fix seems to need new features, new routes, copy rewrites, or API changes → **stop** and do only the visual part, or ask before expanding scope.
