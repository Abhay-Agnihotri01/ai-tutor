-- Create text_lectures table
CREATE TABLE IF NOT EXISTS text_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  "chapterId" UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  "filePath" TEXT NOT NULL,
  "fileName" VARCHAR(255) NOT NULL,
  "uploadType" VARCHAR(10) CHECK ("uploadType" IN ('file', 'url')) NOT NULL,
  "order" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_lectures_chapter_id ON text_lectures("chapterId");
CREATE INDEX IF NOT EXISTS idx_text_lectures_course_id ON text_lectures("courseId");
CREATE INDEX IF NOT EXISTS idx_text_lectures_order ON text_lectures("order");

-- Enable RLS (Row Level Security)
ALTER TABLE text_lectures ENABLE ROW LEVEL SECURITY;

-- Create policies for text_lectures
CREATE POLICY "Users can view text lectures for enrolled courses" ON text_lectures
  FOR SELECT USING (
    "courseId" IN (
      SELECT "courseId" FROM enrollments WHERE "userId" = auth.uid()
    ) OR 
    "courseId" IN (
      SELECT id FROM courses WHERE "instructorId" = auth.uid()
    )
  );

CREATE POLICY "Instructors can manage their course text lectures" ON text_lectures
  FOR ALL USING (
    "courseId" IN (
      SELECT id FROM courses WHERE "instructorId" = auth.uid()
    )
  );