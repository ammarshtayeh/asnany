-- Default promotional ticker items (shown when table is empty)
INSERT INTO news_ticker_items (title, subtitle, image_url, link_url, background_color, text_color, sort_order, is_active)
SELECT *
FROM (
  VALUES
    (
      'انضم كطبيب شريك على ملامح.ps',
      'اعرض عيادتك لآلاف المراجعين في فلسطين',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=200&q=80',
      '/join',
      '#0a1628',
      '#ffffff',
      1,
      true
    ),
    (
      'عروض حصرية على التجميل والأسنان',
      'خصومات محدثة أسبوعياً من عيادات معتمدة',
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=200&q=80',
      '/offers',
      '#0c5e47',
      '#ffffff',
      2,
      true
    ),
    (
      'احجز موعدك خلال دقيقة — بدون مكالمات',
      'دليل فلسطين لصحة وجمال الوجه',
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
      '/booking',
      '#0a1628',
      '#fde68a',
      3,
      true
    )
) AS seed(title, subtitle, image_url, link_url, background_color, text_color, sort_order, is_active)
WHERE NOT EXISTS (SELECT 1 FROM news_ticker_items LIMIT 1);
