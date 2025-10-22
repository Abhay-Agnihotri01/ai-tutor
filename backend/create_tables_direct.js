import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function createTables() {
  try {
    // Test if notifications table exists by trying to select from it
    const { error: testError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);

    if (testError && testError.code === 'PGRST116') {
      console.log('❌ Notifications table does not exist');
      console.log('📝 Please create the tables manually in Supabase SQL Editor:');
      console.log(`
-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  "courseId" UUID,
  "senderId" UUID,
  subject VARCHAR(255) NOT NULL,
  content TEXT,
  metadata JSONB,
  "sentAt" TIMESTAMPTZ DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_course_id ON notifications("courseId");
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications("senderId");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications("sentAt");

-- Create notification_recipients table
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "notificationId" UUID NOT NULL,
  "userId" UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  "deliveredAt" TIMESTAMPTZ,
  "readAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification_recipients
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id ON notification_recipients("notificationId");
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id ON notification_recipients("userId");
CREATE INDEX IF NOT EXISTS idx_notification_recipients_status ON notification_recipients(status);
      `);
      console.log('\n🔗 Go to: https://supabase.com/dashboard/project/[your-project]/sql');
    } else {
      console.log('✅ Notifications table already exists');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();