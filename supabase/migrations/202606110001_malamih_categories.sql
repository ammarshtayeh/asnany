-- Migration to support face, skin, beauty, eyes, ENT categories in Malamih platform
ALTER TABLE doctors 
ADD COLUMN category TEXT NOT NULL DEFAULT 'أسنان' 
CHECK (category IN ('أسنان', 'عيون', 'أنف وأذن وحنجرة', 'جلدية', 'تجميل'));
