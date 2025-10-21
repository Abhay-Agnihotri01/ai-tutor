-- Update existing enrollments to have enrolledAt timestamps
-- Set enrolledAt to a recent date for existing enrollments that don't have it
UPDATE enrollments 
SET "enrolledAt" = CURRENT_TIMESTAMP - INTERVAL '1 day'
WHERE "enrolledAt" IS NULL;