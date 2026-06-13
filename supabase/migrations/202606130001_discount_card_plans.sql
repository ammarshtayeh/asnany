create table if not exists public.discount_card_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subtitle text,
  price numeric not null default 0,
  currency text not null default '₪',
  duration_months int not null default 12,
  badge text,
  benefits text[] not null default '{}',
  limits text[] not null default '{}',
  sort_order int not null default 0,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.discount_card_plans enable row level security;

drop policy if exists "public read active discount card plans" on public.discount_card_plans;
create policy "public read active discount card plans"
  on public.discount_card_plans for select
  using (is_active = true);

drop policy if exists "admin all discount card plans" on public.discount_card_plans;
create policy "admin all discount card plans"
  on public.discount_card_plans
  using (true)
  with check (true);

insert into public.discount_card_plans
  (name, subtitle, price, currency, duration_months, badge, benefits, limits, sort_order, is_featured, is_active)
values
  (
    'بطاقة أسناني الأساسية',
    'للمتابعة والكشف والخدمات الخفيفة',
    49,
    '₪',
    3,
    'بداية ذكية',
    array['خصومات عند العيادات المشاركة', 'إظهار البطاقة الرقمية داخل التطبيق', 'متابعة الشركاء والخصومات من مكان واحد'],
    array['صالحة لمدة 3 أشهر', 'لا تجمع مع عروض أخرى إلا بموافقة الشريك'],
    1,
    false,
    true
  ),
  (
    'بطاقة أسناني بلس',
    'الخيار الأفضل للعائلة والاستخدام المتكرر',
    99,
    '₪',
    12,
    'الأكثر طلباً',
    array['خصومات أعلى عند الشركاء', 'أولوية في عروض التبييض والتنظيف', 'بطاقة رقمية برقم عضوية جاهز للتحقق', 'تنبيهات بالعروض الجديدة'],
    array['صالحة لمدة سنة كاملة', 'البطاقة شخصية ولا تنقل لشخص آخر'],
    2,
    true,
    true
  ),
  (
    'بطاقة العائلة',
    'لأكثر من فرد داخل نفس البيت',
    179,
    '₪',
    12,
    'قيمة أعلى',
    array['تغطية حتى 4 أفراد', 'خصومات على الكشف والتنظيف والخدمات التجميلية', 'متابعة كل البطاقات من نفس رقم الهاتف', 'مناسبة للعائلات والأطفال'],
    array['صالحة لمدة سنة', 'يتم تسجيل أسماء أفراد العائلة عند التفعيل'],
    3,
    false,
    true
  )
on conflict do nothing;
