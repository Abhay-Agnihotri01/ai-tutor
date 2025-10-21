-- Phase 1 Features Database Schema (Fixed for existing camelCase schema)

-- 1. Quiz System Tables
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  "chapterId" UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "timeLimit" INTEGER DEFAULT 0,
  "passingScore" INTEGER DEFAULT 70,
  "maxAttempts" INTEGER DEFAULT 3,
  "isPublished" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  "questionText" TEXT NOT NULL,
  "questionType" VARCHAR(20) DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionId" UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  "optionText" TEXT NOT NULL,
  "isCorrect" BOOLEAN DEFAULT false,
  "orderIndex" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  "totalPoints" INTEGER DEFAULT 0,
  "timeTaken" INTEGER DEFAULT 0,
  "isPassed" BOOLEAN DEFAULT false,
  "startedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "completedAt" TIMESTAMP WITH TIME ZONE,
  answers JSONB DEFAULT '{}'
);

-- 2. Course Reviews System
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  "reviewText" TEXT,
  "isPublished" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("courseId", "userId")
);

-- 3. Q&A System
CREATE TABLE IF NOT EXISTS course_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  "chapterId" UUID REFERENCES chapters(id) ON DELETE CASCADE,
  "videoId" UUID REFERENCES videos(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  "questionText" TEXT NOT NULL,
  "isAnswered" BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionId" UUID REFERENCES course_questions(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "answerText" TEXT NOT NULL,
  "isInstructorAnswer" BOOLEAN DEFAULT false,
  "isBestAnswer" BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Certificates System
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "certificateNumber" VARCHAR(50) UNIQUE NOT NULL,
  "issuedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates("userId", "courseId");