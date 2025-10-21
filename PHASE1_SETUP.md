# 🚀 Phase 1 Features Setup Guide

## 📋 **Setup Steps**

### **1. Install Dependencies**
```bash
cd backend
npm install pdfkit
```

### **2. Run Database Migration**
Execute this SQL in your Supabase SQL Editor:

```sql
-- Phase 1 Features Database Schema

-- 1. Quiz System Tables
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  is_passed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  answers JSONB DEFAULT '{}'
);

-- 2. Course Reviews System
CREATE TABLE IF NOT EXISTS course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

-- 3. Q&A System
CREATE TABLE IF NOT EXISTS course_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES course_questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  answer_text TEXT NOT NULL,
  is_instructor_answer BOOLEAN DEFAULT false,
  is_best_answer BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Certificates System
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_url TEXT,
  is_valid BOOLEAN DEFAULT true,
  completion_percentage INTEGER DEFAULT 100
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX IF NOT EXISTS idx_course_questions_course_id ON course_questions(course_id);
CREATE INDEX IF NOT EXISTS idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_course ON certificates(user_id, course_id);
```

### **3. Restart Backend Server**
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 🎯 **Phase 1 Features Implemented**

### **✅ 1. Quiz System**
- **Create Quizzes** - Instructors can create quizzes for chapters
- **Multiple Choice Questions** - Add questions with options
- **Quiz Attempts** - Students can take quizzes with attempt limits
- **Scoring System** - Automatic scoring and pass/fail logic
- **Time Limits** - Optional time constraints

**API Endpoints:**
- `POST /api/quiz` - Create quiz
- `POST /api/quiz/:quizId/questions` - Add questions
- `GET /api/quiz/:id` - Get quiz with questions
- `POST /api/quiz/:quizId/attempts` - Submit quiz attempt
- `GET /api/quiz/:quizId/attempts/user` - Get user attempts

### **✅ 2. Course Reviews**
- **Star Ratings** - 1-5 star rating system
- **Written Reviews** - Detailed feedback from students
- **Rating Statistics** - Average ratings and distribution
- **Review Management** - Create, update, delete reviews

**API Endpoints:**
- `POST /api/reviews/course/:courseId` - Create/update review
- `GET /api/reviews/course/:courseId` - Get course reviews
- `DELETE /api/reviews/:reviewId` - Delete review

### **✅ 3. Q&A System**
- **Ask Questions** - Students can ask course-related questions
- **Answer Questions** - Students and instructors can answer
- **Best Answers** - Mark helpful answers as best
- **Upvoting** - Community-driven content ranking
- **Instructor Badges** - Special marking for instructor answers

**API Endpoints:**
- `POST /api/qa/questions` - Create question
- `GET /api/qa/course/:courseId` - Get course questions
- `POST /api/qa/questions/:questionId/answers` - Create answer
- `PATCH /api/qa/answers/:answerId/best` - Mark best answer
- `PATCH /api/qa/:type/:id/upvote` - Upvote content

### **✅ 4. Certificate System**
- **Auto-Generation** - PDF certificates for course completion
- **Unique Numbers** - Each certificate has unique identifier
- **Cloud Storage** - Certificates stored on Cloudinary
- **Verification** - Public certificate verification
- **Download** - Students can download their certificates

**API Endpoints:**
- `POST /api/certificates/generate/:courseId` - Generate certificate
- `GET /api/certificates/user` - Get user certificates
- `GET /api/certificates/verify/:certificateNumber` - Verify certificate

## 🎨 **Next Steps**

1. **Frontend Implementation** - Build React components for each feature
2. **UI/UX Design** - Create beautiful interfaces for all features
3. **Testing** - Test all endpoints and functionality
4. **Integration** - Connect frontend with backend APIs

## 🔧 **Backend Architecture**

- **Modular Controllers** - Separate controllers for each feature
- **Proper Authentication** - Role-based access control
- **Database Optimization** - Indexes for better performance
- **Error Handling** - Comprehensive error management
- **Validation** - Input validation and sanitization

Your Phase 1 backend is now complete and ready for frontend integration! 🚀