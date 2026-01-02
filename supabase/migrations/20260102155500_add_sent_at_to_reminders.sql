-- Add sent_at column to reminders table
ALTER TABLE reminders ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Update index to include sent_at if needed (optional, but good for analytics)
CREATE INDEX IF NOT EXISTS idx_reminders_sent_at ON reminders(sent_at);
