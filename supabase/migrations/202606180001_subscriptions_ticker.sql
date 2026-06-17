-- Subscription packages for doctors/partners
CREATE TABLE IF NOT EXISTS subscription_packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT,
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  billing_period TEXT NOT NULL DEFAULT 'yearly' CHECK (billing_period IN ('monthly', 'yearly', 'per_ad')),
  original_price_usd NUMERIC(10,2),
  features TEXT[] NOT NULL DEFAULT '{}',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctor_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  package_id UUID REFERENCES subscription_packages(id) ON DELETE SET NULL,
  advertiser_name TEXT,
  advertiser_type TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  amount_usd NUMERIC(10,2),
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dynamic news ticker under navbar
CREATE TABLE IF NOT EXISTS news_ticker_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  background_color TEXT DEFAULT '#0f172a',
  text_color TEXT DEFAULT '#ffffff',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscription_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_ticker_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active subscription packages"
  ON subscription_packages FOR SELECT
  USING (is_active = true);

CREATE POLICY "admin all subscription packages"
  ON subscription_packages FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "public insert subscription requests"
  ON doctor_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "admin all doctor subscriptions"
  ON doctor_subscriptions FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "public read active ticker items"
  ON news_ticker_items FOR SELECT
  USING (
    is_active = true
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

CREATE POLICY "admin all ticker items"
  ON news_ticker_items FOR ALL
  USING (true) WITH CHECK (true);

INSERT INTO subscription_packages (slug, name, subtitle, price_usd, billing_period, original_price_usd, features, sort_order, is_active)
VALUES
  (
    'directory',
    'باقة الدليل',
    'صفحة تعريف عن الطبيب + إعلانات في المجلة',
    100,
    'yearly',
    120,
    ARRAY[
      'صفحة تعريف كاملة عن الطبيب وعيادته',
      'ظهور في دليل الأطباء المعتمد',
      'إعلانات في المجلة الطبية',
      'بيانات التواصل والموقع على الخريطة'
    ],
    1,
    true
  ),
  (
    'premium',
    'الباقة المميزة',
    'حجوزات + استشارات + متابعات عاجلة',
    300,
    'yearly',
    NULL,
    ARRAY[
      'كل مزايا باقة الدليل',
      'حجوزات من خلال الموقع والتطبيق',
      'تتبع الحجوزات للطبيب والمريض',
      'استشارات كتابية ومتابعات',
      'الاتصالات والمتابعات العاجلة'
    ],
    2,
    true
  ),
  (
    'featured-ads',
    'العروض والإعلانات المميزة',
    'عروض + حجوزات + مجلة — حسب الإعلان',
    50,
    'per_ad',
    NULL,
    ARRAY[
      'إعلان مميز في الصفحة الرئيسية',
      'عروض خاصة للمختبرات ومراكز التجميل',
      'ظهور في المجلة والحملات',
      'حجوزات مرتبطة بالعرض'
    ],
    3,
    true
  )
ON CONFLICT (slug) DO NOTHING;
