-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  "firstName" VARCHAR(100) NOT NULL,
  "lastName" VARCHAR(100) NOT NULL,
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  avatar TEXT,
  "isEmailVerified" BOOLEAN DEFAULT FALSE,
  "googleId" VARCHAR(255),
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  "shortDescription" TEXT,
  description TEXT,
  thumbnail TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  "discountPrice" DECIMAL(10,2),
  category VARCHAR(100),
  level VARCHAR(50),
  language VARCHAR(50),
  "instructorId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "isPublished" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  "order" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "chapterId" UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "videoUrl" TEXT,
  "thumbnailUrl" TEXT,
  duration INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "chapterId" UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "fileName" VARCHAR(255),
  "fileSize" INTEGER,
  "order" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress DECIMAL(5,2) DEFAULT 0,
  "enrolledAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "courseId")
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "chapterId" UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'quiz' CHECK (type IN ('quiz', 'assignment')),
  position VARCHAR(20) DEFAULT 'end_of_chapter' CHECK (position IN ('after_video', 'end_of_chapter')),
  "videoId" UUID REFERENCES videos(id),
  "timeLimit" INTEGER,
  "totalMarks" INTEGER DEFAULT 0,
  "passingMarks" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE,
  "order" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'mcq' CHECK (type IN ('mcq', 'true_false', 'short_answer')),
  options JSONB,
  "correctAnswer" TEXT,
  marks INTEGER DEFAULT 1,
  "order" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Quiz Attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "quizId" UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  "totalMarks" INTEGER DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'graded')),
  "fileUrl" TEXT,
  feedback TEXT,
  "submittedAt" TIMESTAMP,
  "gradedAt" TIMESTAMP,
  "quizVersion" INTEGER DEFAULT 1,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Question Responses table
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "attemptId" UUID REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  "questionId" UUID REFERENCES questions(id) ON DELETE CASCADE,
  answer TEXT,
  "isCorrect" BOOLEAN DEFAULT FALSE,
  "marksAwarded" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "courseId" UUID REFERENCES courses(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "courseId")
);