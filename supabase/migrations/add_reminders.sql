-- Create reminders table for improved notification system
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES list_items(id) ON DELETE CASCADE,
  reminder_time TIMESTAMPTZ NOT NULL,
  is_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_time ON reminders(reminder_time) WHERE is_sent = FALSE;
CREATE INDEX IF NOT EXISTS idx_reminders_item ON reminders(item_id);

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own reminders
CREATE POLICY "Users can manage own reminders"
  ON reminders
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
