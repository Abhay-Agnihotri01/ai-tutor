-- Fix Quiz Tables for Supabase
-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS quiz_options CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;

-- Create quiz_questions table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "questionText" TEXT NOT NULL,
  "questionType" VARCHAR(20) DEFAULT 'single_correct',
  points INTEGER DEFAULT 1,
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create quiz_options table
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionId" UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  "optionText" TEXT NOT NULL,
  "isCorrect" BOOLEAN DEFAULT false,
  "orderIndex" INTEGER DEFAULT 0
);

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  "totalPoints" INTEGER DEFAULT 0,
  "timeTaken" INTEGER DEFAULT 0,
  "isPassed" BOOLEAN DEFAULT false,
  "startedAt" TIMESTAMP DEFAULT NOW(),
  "completedAt" TIMESTAMP,
  answers JSONB DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'in_progress',
  "fileUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions("quizId");
CREATE INDEX IF NOT EXISTS idx_quiz_options_question_id ON quiz_options("questionId");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts("userId", "quizId");

-- Enable RLS (Row Level Security)
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view quiz questions" ON quiz_questions FOR SELECT USING (true);
CREATE POLICY "Instructors can manage quiz questions" ON quiz_questions FOR ALL USING (true);

CREATE POLICY "Users can view quiz options" ON quiz_options FOR SELECT USING (true);
CREATE POLICY "Instructors can manage quiz options" ON quiz_options FOR ALL USING (true);

CREATE POLICY "Users can view their own attempts" ON quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Users can create attempts" ON quiz_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their attempts" ON quiz_attempts FOR UPDATE USING (true);