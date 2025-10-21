-- Fix quiz_attempts table structure
-- Add missing columns to quiz_attempts table

ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS "totalPoints" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "timeTaken" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isPassed" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'in_progress',
ADD COLUMN IF NOT EXISTS "fileUrl" TEXT;

-- Update existing records to have default values
UPDATE quiz_attempts 
SET "totalPoints" = 0 
WHERE "totalPoints" IS NULL;

UPDATE quiz_attempts 
SET "timeTaken" = 0 
WHERE "timeTaken" IS NULL;

UPDATE quiz_attempts 
SET "isPassed" = false 
WHERE "isPassed" IS NULL;

UPDATE quiz_attempts 
SET answers = '{}' 
WHERE answers IS NULL;

UPDATE quiz_attempts 
SET status = 'completed' 
WHERE status IS NULL;