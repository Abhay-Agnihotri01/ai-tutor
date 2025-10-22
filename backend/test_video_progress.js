import supabase from './src/config/supabase.js';

async function testVideoProgress() {
  try {
    console.log('🔥 Testing video progress system...');
    
    // Check if video_progress table exists
    const { data: testData, error: testError } = await supabase
      .from('video_progress')
      .select('*')
      .limit(1);
    
    if (testError) {
      if (testError.code === 'PGRST116') {
        console.log('❌ video_progress table does not exist');
        console.log('Please run the migration SQL in Supabase dashboard:');
        console.log(`
CREATE TABLE IF NOT EXISTS video_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "videoId" UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  "courseId" UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  "completedAt" TIMESTAMP,
  "watchTime" INTEGER DEFAULT 0,
  "watchPercentage" DECIMAL(5,2) DEFAULT 0,
  "lastWatchedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "videoId")
);

CREATE INDEX IF NOT EXISTS idx_video_progress_user_course ON video_progress("userId", "courseId");
CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress("videoId");

ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS "lastWatchedVideoId" UUID REFERENCES videos(id),
ADD COLUMN IF NOT EXISTS "lastWatchedAt" TIMESTAMP;
        `);
        return;
      } else {
        throw testError;
      }
    }
    
    console.log('✅ video_progress table exists');
    
    // Check if enrollments table has the new columns
    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('lastWatchedVideoId, lastWatchedAt')
      .limit(1);
    
    if (enrollmentError) {
      console.log('❌ enrollments table missing video progress columns');
      console.log('Please add columns to enrollments table:');
      console.log(`
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS "lastWatchedVideoId" UUID REFERENCES videos(id),
ADD COLUMN IF NOT EXISTS "lastWatchedAt" TIMESTAMP;
      `);
    } else {
      console.log('✅ enrollments table has video progress columns');
    }
    
    // Test basic functionality
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    const { data: videos } = await supabase
      .from('videos')
      .select('id, chapterId')
      .limit(1);
    
    const { data: courses } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (users?.length && videos?.length && courses?.length) {
      console.log('✅ Required tables have data for testing');
      console.log('🎉 Video progress system is ready!');
    } else {
      console.log('⚠️ Missing test data in users, videos, or courses tables');
    }
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testVideoProgress();