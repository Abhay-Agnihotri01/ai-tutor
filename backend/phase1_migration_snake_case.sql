-- Phase 1 Features Database Schema (Using snake_case - Sequelize default)

-- 1. Quiz System Tables
CREATE TABLE IF NOT EXISTS quizzes (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  chapter_id CHAR(36),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  time_limit INTEGER DEFAULT 0,
  passing_score INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id CHAR(36) PRIMARY KEY,
  quiz_id CHAR(36) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) DEFAULT 'multiple_choice',
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_options (
  id CHAR(36) PRIMARY KEY,
  question_id CHAR(36) NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id CHAR(36) PRIMARY KEY,
  quiz_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  score INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  is_passed BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  answers JSON,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. Course Reviews System
CREATE TABLE IF NOT EXISTS course_reviews (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_course_review (course_id, user_id)
);

-- 3. Q&A System
CREATE TABLE IF NOT EXISTS course_questions (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  chapter_id CHAR(36),
  video_id CHAR(36),
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS question_answers (
  id CHAR(36) PRIMARY KEY,
  question_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  answer_text TEXT NOT NULL,
  is_instructor_answer BOOLEAN DEFAULT false,
  is_best_answer BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES course_questions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Certificates System
CREATE TABLE IF NOT EXISTS certificates (
  id CHAR(36) PRIMARY KEY,
  course_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  certificate_number VARCHAR(50) UNIQUE NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  certificate_url TEXT,
  is_valid BOOLEAN DEFAULT true,
  completion_percentage INTEGER DEFAULT 100,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_quizzes_course_id ON quizzes(course_id);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
CREATE INDEX idx_quiz_attempts_user_quiz ON quiz_attempts(user_id, quiz_id);
CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX idx_course_questions_course_id ON course_questions(course_id);
CREATE INDEX idx_question_answers_question_id ON question_answers(question_id);
CREATE INDEX idx_certificates_user_course ON certificates(user_id, course_id);