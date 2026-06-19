# نشر تطبيق ملامح — Google Play & App Store

## قبل النشر

1. **قاعدة البيانات**
   ```bash
   npm run supabase:db:push
   ```

2. **الموقع على الدومين**
   - تأكد أن `https://malamih.ps` يعمل ويشير لنسخة الإنتاج
   - صفحات مطلوبة للمتاجر: `/privacy` · `/terms` · `/about`

3. **متغيرات EAS** (مضبوطة في `apps/mobile/eas.json`)
   - `EXPO_PUBLIC_API_BASE_URL=https://malamih.ps`
   - Supabase URL + Anon Key
   - EAS Project ID

---

## بناء الإنتاج

| الهدف | الأمر |
|--------|--------|
| APK للتجربة الداخلية | `npm run build:apk:prod` |
| Google Play (AAB) | `npm run build:android:store` |
| App Store (IPA) | `npm run build:ios:store` |

> أول بناء iOS يتطلب حساب Apple Developer وربط الشهادات عبر `eas credentials`.

---

## Google Play Console

### معلومات القائمة
- **اسم التطبيق:** ملامح
- **الوصف القصير:** دليل فلسطين لصحة وجمال الوجه
- **الوصف الكامل:**
  > ملامح — منصتك الطبية في فلسطين. ابحث عن أطباء الأسنان والتجميل، احجز مواعيدك، تابع العروض والإعلانات، واستفد من بطاقة الخصم. للأطباء: انضم للشبكة، اشترك في باقة الدليل أو المميز، وأعلن عروضك.

### التصنيف
- الفئة: طبي / صحة ولياقة
- التصنيف العمري: للجميع

### الروابط
- سياسة الخصوصية: `https://malamih.ps/privacy`
- البريد: `ammar.shtayeh@gmail.com`
- الموقع: `https://malamih.ps`

### الأصول المطلوبة
- أيقونة 512×512 (من `apps/mobile/assets/icon.png`)
- لقطات شاشة: الرئيسية، الأطباء، الحجز، العروض، المزيد
- Feature graphic 1024×500 (اختياري)
- **دليل كامل:** [`docs/store-screenshots/README.md`](store-screenshots/README.md)
- **التقاط تلقائي (موقع):** `npm run capture:screenshots`

### الرفع
```bash
npm run build:android:store
cd apps/mobile && npm run submit:android
```
أو ارفع ملف `.aab` يدوياً من [expo.dev](https://expo.dev).

---

## App Store Connect

### معلومات التطبيق
- **اسم العرض:** ملامح
- **Bundle ID:** `ps.malamih.app`
- **الفئة:** Medical
- **الخصوصية:** رابط `https://malamih.ps/privacy`

### وصف App Store (عربي)
> ملامح — دليل فلسطين لصحة وجمال الوجه. احجز عند طبيبك، اكتشف العروض، وتابع أخبار الصحة والتجميل. للأطباء والعيادات: باقات اشتراك وإعلانات مميزة.

### الكلمات المفتاحية
`طبيب, أسنان, تجميل, فلسطين, حجز, عيادة, صحة`

### لقطات الشاشة
- iPhone 6.7" و 6.5" (إلزامي)
- iPad إذا `supportsTablet: true`

### الرفع
```bash
npm run build:ios:store
cd apps/mobile && npm run submit:ios
```

---

## Checklist سريع

- [ ] الدومين `malamih.ps` يعمل على HTTPS
- [ ] Migrations مطبّقة على Supabase (`npm run supabase:db:push`)
- [ ] بناء production ناجح (Android + iOS)
- [ ] اختبار الحجز end-to-end على جهاز حقيقي
- [ ] اختبار الإشعارات: حجز جديد → طبيب + أدمن (Push + toast)
- [ ] اختبار شريط الإعلانات من `/admin/ticker`
- [ ] اختبار `/doctors/search` وصفحات الأطباء
- [ ] لقطات شاشة عربية RTL
- [ ] سياسة خصوصية منشورة (`/privacy`)
- [ ] حساب مطوّر Google Play + Apple Developer
- [ ] رفع AAB/IPA وإرسال للمراجعة

## QA قبل النشر

| المنصة | ما تختبره |
|--------|-----------|
| **الموقع** | الرئيسية، البحث، الحجز، العروض، PWA offline banner |
| **الأدمن** | تسجيل دخول، مواعيد، إشعارات، شريط إعلانات |
| **الطبيب** | لوحة التحكم، إشعارات، تحديث حالة موعد |
| **التطبيق** | التبويبات الخمسة، Push، شريط إعلانات، حجز |
| **الإشعارات** | Expo push على build production (ليس Expo Go) |

---

## ملاحظات

- **لا يوجد دفع إلكتروني** داخل التطبيق — الباقات للعرض والتفعيل اليدوي فقط.
- إصدار التطبيق يُزاد تلقائياً عبر `autoIncrement` في EAS production.
- للدعم: `ammar.shtayeh@gmail.com`
