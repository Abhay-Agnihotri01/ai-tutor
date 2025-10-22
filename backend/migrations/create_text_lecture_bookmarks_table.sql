-- Create text_lecture_bookmarks table
CREATE TABLE IF NOT EXISTS text_lecture_bookmarks (
    id SERIAL PRIMARY KEY,
    "textLectureId" UUID NOT NULL,
    "courseId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_text_lecture_bookmarks_text_lecture_id ON text_lecture_bookmarks("textLectureId");
CREATE INDEX IF NOT EXISTS idx_text_lecture_bookmarks_user_id ON text_lecture_bookmarks("userId");
CREATE INDEX IF NOT EXISTS idx_text_lecture_bookmarks_course_id ON text_lecture_bookmarks("courseId");