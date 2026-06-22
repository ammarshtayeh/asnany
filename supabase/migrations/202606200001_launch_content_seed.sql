-- Starter blog articles for launch (idempotent)
INSERT INTO articles (title, excerpt, content, image_url, doctor_name, category, date, read_time)
SELECT *
FROM (
  VALUES
    (
      '5 علامات تدل على أنك تحتاج زيارة طبيب أسنان',
      'ألم، نزيف، أو حساسية؟ لا تؤجل الفحص — الاكتشاف المبكر يوفر عليك الوقت والتكلفة.',
      'الألم عند المضغ، نزيف اللثة، رائحة الفم المستمرة، الحساسية تجاه البارد والحار، وتغيّر لون الأسنان — كلها إشارات تستحق زيارة طبيب أسنان. في ملامح.ps يمكنك البحث عن أقرب عيادة موثّقة وحجز موعدك بدون حساب.',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80',
      'فريق ملامح',
      'بسمتك وصحة فمك',
      '2026-06-20',
      '4 دقائق'
    ),
    (
      'كيف تختار طبيب جلدية مناسب في فلسطين؟',
      'دليل سريع: التخصص الفرعي، التقييمات، التأمين، والموقع — قبل أن تحجز.',
      'ابدأ بتحديد احتياجك: حب الشباب، ليزر، فيلر، أو أمراض جلدية عامة. قارن الأطباء حسب المدينة، التأمين المقبول، وتوفر الحجز الإلكتروني. ملامح.ps يجمع كل ذلك في مكان واحد مع خريطة واتجاهات مباشرة.',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
      'فريق ملامح',
      'بشرتك ونضارتها',
      '2026-06-20',
      '5 دقائق'
    ),
    (
      'حجز موعد طبي إلكترونياً — أسهل مما تتوقع',
      'بدون حساب، بدون مكالمات طويلة — خطوات بسيطة عبر ملامح.ps',
      'اختر الطبيب، املأ اسمك ورقم هاتفك والتاريخ المطلوب، وتابع حالة الحجز من صفحة «حجوزاتي». الطبيب يستلم إشعاراً فورياً ويؤكد الموعد من لوحته. تجربة أبسط للمريض وأنظف للعيادة.',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=1200&q=80',
      'فريق ملامح',
      'لمسات الجمال',
      '2026-06-20',
      '3 دقائق'
    )
) AS seed(title, excerpt, content, image_url, doctor_name, category, date, read_time)
WHERE NOT EXISTS (SELECT 1 FROM articles LIMIT 1);

-- Launch ticker item
INSERT INTO news_ticker_items (title, subtitle, image_url, link_url, background_color, text_color, sort_order, is_active)
SELECT
  'ملامح.ps الآن live — دليلك لصحة وجمال الوجه',
  'ابحث · احجز · وفّر — موقع + تطبيق',
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=200&q=80',
  '/',
  '#0c5e47',
  '#ffffff',
  0,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM news_ticker_items WHERE title LIKE '%live%'
);
