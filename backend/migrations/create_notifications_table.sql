-- Create notifications table for tracking sent notifications
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_course_id ON notifications("courseId");
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications("senderId");
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications("sentAt");

-- Create notification_recipients table for tracking individual recipients
CREATE TABLE IF NOT EXISTS notification_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "notificationId" UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'sent',
  "deliveredAt" TIMESTAMPTZ,
  "readAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for notification recipients
CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id ON notification_recipients("notificationId");
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id ON notification_recipients("userId");
CREATE INDEX IF NOT EXISTS idx_notification_recipients_status ON notification_recipients(status);