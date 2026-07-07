ALTER TABLE seller_reviews
ADD COLUMN IF NOT EXISTS seller_specialties VARCHAR(300);
