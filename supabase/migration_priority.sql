-- Migration: Add priority to list_items
-- Execute this in Supabase SQL Editor

-- Add priority column to list_items
ALTER TABLE list_items
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal'
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Add due_date column for deadlines
ALTER TABLE list_items
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- Create index for priority filtering
CREATE INDEX IF NOT EXISTS idx_list_items_priority ON list_items(priority);
CREATE INDEX IF NOT EXISTS idx_list_items_due_date ON list_items(due_date);
