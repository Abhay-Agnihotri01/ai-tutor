-- Create text_lecture_notes table
CREATE TABLE IF NOT EXISTS text_lecture_notes (
    id SERIAL PRIMARY KEY,
    "textLectureId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'text',
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_lecture_notes_text_lecture_id ON text_lecture_notes("textLectureId");
CREATE INDEX IF NOT EXISTS idx_text_lecture_notes_user_id ON text_lecture_notes("userId");
CREATE INDEX IF NOT EXISTS idx_text_lecture_notes_course_id ON text_lecture_notes("courseId");