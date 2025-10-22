import supabase from './src/config/supabase.js';

async function setupVideoProgress() {
  try {
    console.log('🔥 Setting up video progress table...');
    
    // Create video_progress table
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS video_progress (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
      `
    });
    
    if (tableError) {
      console.error('Table creation error:', tableError);
    } else {
      console.log('✅ video_progress table created');
    }
    
    // Add columns to enrollments table
    const { error: enrollmentError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE enrollments 
        ADD COLUMN IF NOT EXISTS "lastWatchedVideoId" UUID REFERENCES videos(id),
        ADD COLUMN IF NOT EXISTS "lastWatchedAt" TIMESTAMP;
      `
    });
    
    if (enrollmentError) {
      console.error('Enrollment table update error:', enrollmentError);
    } else {
      console.log('✅ enrollments table updated');
    }
    
    // Create indexes
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_video_progress_user_course ON video_progress("userId", "courseId");
        CREATE INDEX IF NOT EXISTS idx_video_progress_video ON video_progress("videoId");
      `
    });
    
    if (indexError) {
      console.error('Index creation error:', indexError);
    } else {
      console.log('✅ Indexes created');
    }
    
    console.log('🎉 Video progress setup completed!');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

setupVideoProgress();