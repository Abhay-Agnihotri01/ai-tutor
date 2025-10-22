-- Phase 1 Features Database Schema for Supabase (PostgreSQL)

-- 1. Quiz System Tables (Enhanced)
-- Add missing columns to existing quizzes table
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS "maxAttempts" INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN DEFAULT false;

-- Create quiz_questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "questionText" TEXT NOT NULL,
  "questionType" VARCHAR(20) DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Create quiz_options table
CREATE TABLE IF NOT EXISTS quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionId" UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  "optionText" TEXT NOT NULL,
  "isCorrect" BOOLEAN DEFAULT false,
  "orderIndex" INTEGER DEFAULT 0
);

-- Update quiz_attempts table structure
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS "timeTaken" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isPassed" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}';

-- 2. Course Reviews System
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  "reviewText" TEXT,
  "isPublished" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("courseId", "userId")
);

-- 3. Q&A System
CREATE TABLE IF NOT EXISTS course_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "chapterId" UUID REFERENCES chapters(id) ON DELETE CASCADE,
  "videoId" UUID REFERENCES videos(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  "questionText" TEXT NOT NULL,
  "isAnswered" BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionId" UUID NOT NULL REFERENCES course_questions(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "answerText" TEXT NOT NULL,
  "isInstructorAnswer" BOOLEAN DEFAULT false,
  "isBestAnswer" BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 4. Video Progress Tracking System
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "videoId" UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP,
  "watchTime" INTEGER DEFAULT 0,
  "watchPercentage" DECIMAL(5,2) DEFAULT 0,
  "lastWatchedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "videoId")
);

-- Add video progress columns to enrollments
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS "lastWatchedVideoId" UUID REFERENCES videos(id),
ADD COLUMN IF NOT EXISTS "lastWatchedAt" TIMESTAMP;

-- 5. Student Notes System
CREATE TABLE IF NOT EXISTS student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "videoId" UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  type VARCHAR(20) DEFAULT 'text',
  content TEXT NOT NULL,
  timestamp INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- 6. Certificates System
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "certificateNumber" VARCHAR(50) UNIQUE NOT NULL,
  "issuedAt" TIMESTAMP DEFAULT NOW(),
  "certificateUrl" TEXT,
  "isValid" BOOLEAN DEFAULT true,
  "completionPercentage" INTEGER DEFAULT 100
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes("courseId");
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions("quizId");
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts("userId", "quizId");
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews("courseId");
CREATE INDEX IF NOT EXISTS idx_course_questions_course_id ON course_questions("courseId");
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers("questionId");
CREATE INDEX IF NOT EXISTS idx_video_progress_user_course ON video_progress("userId", "courseId");
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress("videoId");
CREATE INDEX IF NOT EXISTS idx_student_notes_user_video ON student_notes("userId", "videoId");
CREATE INDEX IF NOT EXISTS idx_student_notes_course ON student_notes("courseId");
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates("userId", "courseId");