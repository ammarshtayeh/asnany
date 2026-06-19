# لقطات شاشة المتاجر — ملامح

## المطلوب قبل النشر

| المنصة | المقاس | العدد | الشاشات |
|--------|--------|-------|---------|
| **Google Play** | 1080×1920 (9:16) | 4–8 | الرئيسية، الأطباء، الحجز، العروض، حجوزاتي |
| **App Store iPhone 6.7"** | 1290×2796 | 3–10 | نفس الشاشات |
| **App Store iPhone 6.5"** | 1242×2688 | 3–10 | نفس الشاشات (إلزامي إذا لا تدعم iPad فقط) |
| **Feature graphic (Play)** | 1024×500 | 1 | اختياري |

> **مهم:** لقطات التطبيق يجب أن تكون من **build إنتاج** (EAS) وليس Expo Go، وباللغة العربية RTL.

---

## الطريقة 1 — التطبيق (موصى بها للمتاجر)

1. شغّل build production على محاكي/جهاز:
   ```bash
   npm run build:apk:prod
   # أو iOS: npm run build:ios:store
   ```
2. افتح التطبيق وصوّر:
   - **الرئيسية** — `(tabs)/index`
   - **الأطباء** — `(tabs)/doctors`
   - **الحجز** — `(tabs)/booking`
   - **العروض** — `(tabs)/offers`
   - **المزيد** — `(tabs)/more`
3. احفظ الملفات في:
   - `docs/store-screenshots/android/`
   - `docs/store-screenshots/ios/`

### Android Studio
`Device Manager` → Pixel 6 → Screenshot (أيقونة الكamera)

### iOS Simulator
`Cmd + S` يحفظ على سطح المكتب — انقل إلى `docs/store-screenshots/ios/`

---

## الطريقة 2 — الموقع (معاينة / Play listing backup)

للمعاينة السريعة أو إذا أردت لقطات PWA:

```bash
npm install
npx playwright install chromium
npm run capture:screenshots
```

السكربت يلتقط صفحات الموقع بمقاس موبايل ويحفظها في `docs/store-screenshots/web/`.

متغيرات اختيارية:
```bash
BASE_URL=https://www.malamih.ps npm run capture:screenshots
```

---

## تسمية الملفات

```
01-home.png
02-doctors.png
03-booking.png
04-offers.png
05-appointments.png
```

---

## Checklist

- [ ] لقطات عربية RTL بدون بيانات تجريبية حساسة
- [ ] شريط الحالة نظيف (Wi‑Fi، بطارية)
- [ ] Feature graphic 1024×500 (Google Play)
- [ ] أيقونة 512×512 من `apps/mobile/assets/icon.png`
