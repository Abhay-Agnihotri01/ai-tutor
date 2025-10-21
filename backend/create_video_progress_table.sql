-- Create video_progress table for tracking video completion
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "videoId" UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "videoId")
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_video_progress_user_course ON video_progress("userId", "courseId");
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress("videoId");