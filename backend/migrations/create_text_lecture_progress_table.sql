-- Create text_lecture_progress table for tracking text lecture completion
CREATE TABLE IF NOT EXISTS text_lecture_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "textLectureId" UUID NOT NULL REFERENCES text_lectures(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "textLectureId")
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_text_lecture_progress_user_course ON text_lecture_progress("userId", "courseId");
CREATE INDEX IF NOT EXISTS idx_text_lecture_progress_text_lecture ON text_lecture_progress("textLectureId");

-- Enable RLS
ALTER TABLE text_lecture_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own text lecture progress" ON text_lecture_progress
  FOR ALL USING ("userId" = auth.uid());