-- Add pricePaid column to enrollments table to track actual amount paid
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "pricePaid" DECIMAL(10,2) DEFAULT 0;

-- Update existing enrollments to set pricePaid based on when they enrolled
-- For existing free enrollments, set pricePaid to 0
UPDATE enrollments SET "pricePaid" = 0 WHERE "pricePaid" IS NULL;