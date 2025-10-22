-- Add pricePaid column to enrollments table for revenue tracking
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS "pricePaid" DECIMAL(10,2) DEFAULT 0;

-- Update existing enrollments with course prices (for historical data)
UPDATE enrollments 
SET "pricePaid" = COALESCE(
  (SELECT COALESCE("discountPrice", price, 0) 
   FROM courses 
   WHERE courses.id = enrollments."courseId"), 
  0
)
WHERE "pricePaid" IS NULL OR "pricePaid" = 0;