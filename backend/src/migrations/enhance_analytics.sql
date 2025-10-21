-- Add timestamp columns for better analytics
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS "enrolledAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "viewCount" INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS "lastViewedAt" TIMESTAMP WITH TIME ZONE;

-- Create analytics events table for detailed tracking
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL, -- 'course_view', 'enrollment', 'video_watch', 'course_complete'
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create revenue tracking table
CREATE TABLE IF NOT EXISTS revenue_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'refunded'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_course_id ON analytics_events(course_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_revenue_records_instructor_id ON revenue_records(instructor_id);
CREATE INDEX IF NOT EXISTS idx_revenue_records_created_at ON revenue_records(created_at);
CREATE INDEX IF NOT EXISTS idx_enrollments_enrolled_at ON enrollments(enrolledAt);