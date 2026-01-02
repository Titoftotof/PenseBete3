-- Add recurrence fields to reminders table
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS recurrence_type TEXT CHECK (recurrence_type IN ('daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;

-- Remove the unique constraint on item_id to allow multiple reminders (history + next recurrence)
ALTER TABLE reminders DROP CONSTRAINT IF EXISTS reminders_item_id_key;

-- Create index for recurrence optimization
CREATE INDEX IF NOT EXISTS idx_reminders_item_id ON reminders(item_id);
