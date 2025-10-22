-- Create live_class_signals table for WebRTC signaling
CREATE TABLE IF NOT EXISTS live_class_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "meetingId" VARCHAR(100) NOT NULL,
  "fromUserId" UUID NOT NULL,
  "toUserId" UUID NOT NULL,
  signal TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_live_class_signals_meeting_to_user ON live_class_signals("meetingId", "toUserId");
CREATE INDEX IF NOT EXISTS idx_live_class_signals_created_at ON live_class_signals("createdAt");