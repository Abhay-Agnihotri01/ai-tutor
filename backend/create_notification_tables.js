import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function createNotificationTables() {
  try {
    // Create notifications table
    const { error: notificationsError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
        
        CREATE INDEX IF NOT EXISTS idx_notifications_course_id ON notifications("courseId");
        CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications("senderId");
        CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
        CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications("sentAt");
      `
    });

    if (notificationsError) {
      console.error('Error creating notifications table:', notificationsError);
    } else {
      console.log('✅ Notifications table created successfully');
    }

    // Create notification_recipients table
    const { error: recipientsError } = await supabase.rpc('exec_sql', {
      sql_query: `
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
        
        CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id ON notification_recipients("notificationId");
        CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id ON notification_recipients("userId");
        CREATE INDEX IF NOT EXISTS idx_notification_recipients_status ON notification_recipients(status);
      `
    });

    if (recipientsError) {
      console.error('Error creating notification_recipients table:', recipientsError);
    } else {
      console.log('✅ Notification recipients table created successfully');
    }

    console.log('🎉 All notification tables created successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

createNotificationTables();