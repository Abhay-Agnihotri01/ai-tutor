# Manual Migration Steps for Phase 1 Features

## Root Cause Analysis
The error `column "courseId" does not exist` occurs because:

1. **Database System**: Your application uses **Supabase (PostgreSQL)**, not MySQL
2. **Missing Tables**: The Phase 1 feature tables don't exist yet
3. **Missing Columns**: The existing `quizzes` table is missing the `courseId` column
4. **Column Naming**: Supabase uses camelCase with quotes (e.g., `"courseId"`, `"userId"`)

## Required Actions

### Step 1: Add Missing Column to Existing Table
Execute this SQL in your Supabase SQL Editor:

```sql
-- Add courseId column to existing quizzes table
ALTER TABLE quizzes ADD COLUMN "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE;
```

### Step 2: Create Missing Tables
Execute these SQL statements in your Supabase SQL Editor:

```sql
-- 1. Quiz Questions Table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  "questionText" TEXT NOT NULL,
  "questionType" VARCHAR(20) DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  "orderIndex" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- 2. Quiz Options Table
CREATE TABLE quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "questionId" UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  "optionText" TEXT NOT NULL,
  "isCorrect" BOOLEAN DEFAULT false,
  "orderIndex" INTEGER DEFAULT 0
);

-- 3. Course Reviews Table
CREATE TABLE course_reviews (
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

-- 4. Course Questions Table (Q&A System)
CREATE TABLE course_questions (
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

-- 5. Question Answers Table
CREATE TABLE question_answers (
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

-- 6. Certificates Table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "certificateNumber" VARCHAR(50) UNIQUE NOT NULL,
  "issuedAt" TIMESTAMP DEFAULT NOW(),
  "certificateUrl" TEXT,
  "isValid" BOOLEAN DEFAULT true,
  "completionPercentage" INTEGER DEFAULT 100
);
```

### Step 3: Create Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_quizzes_course_id ON quizzes("courseId");
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions("quizId");
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts("userId", "quizId");
CREATE INDEX idx_course_reviews_course_id ON course_reviews("courseId");
CREATE INDEX idx_course_questions_course_id ON course_questions("courseId");
CREATE INDEX idx_question_answers_question_id ON question_answers("questionId");
CREATE INDEX idx_certificates_user_course ON certificates("userId", "courseId");
```

### Step 4: Update Quiz Attempts Table (if needed)
```sql
-- Add missing columns to quiz_attempts if they don't exist
ALTER TABLE quiz_attempts 
ADD COLUMN IF NOT EXISTS "timeTaken" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isPassed" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP,
ADD COLUMN IF NOT EXISTS answers JSONB DEFAULT '{}';
```

## How to Execute

1. **Go to your Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Copy and paste each SQL block above**
4. **Execute them one by one**

## Verification

After running the migration, test with:
```bash
node test_and_create_tables.js
```

All tables should show ✅ status.

## Why This Happened

1. **Mixed Database Systems**: Your codebase has both MySQL (Sequelize models) and Supabase (PostgreSQL) configurations
2. **Incomplete Migration**: The Phase 1 features were added to controllers but the database schema wasn't updated
3. **Column Naming Convention**: Supabase uses quoted camelCase (`"courseId"`) while MySQL uses snake_case (`course_id`)

The solution is to complete the Supabase schema with the missing tables and columns.