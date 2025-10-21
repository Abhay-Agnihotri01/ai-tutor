-- Check if pricePaid column exists and add it if not
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "pricePaid" DECIMAL(10,2) DEFAULT 0;

-- Check if enrolledAt column exists and add it if not  
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "enrolledAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing enrollments to have proper timestamps and price paid
UPDATE enrollments 
SET "enrolledAt" = COALESCE("enrolledAt", NOW() - INTERVAL '1 day'),
    "pricePaid" = COALESCE("pricePaid", 0)
WHERE "enrolledAt" IS NULL OR "pricePaid" IS NULL;

-- For debugging: Show current enrollments data
SELECT 
    e.id,
    e."courseId",
    e."userId", 
    e."pricePaid",
    e."enrolledAt",
    c.title as course_title,
    c.price as current_course_price
FROM enrollments e
LEFT JOIN courses c ON e."courseId" = c.id
ORDER BY e."enrolledAt" DESC;