-- Add is_archived column to list_items table
ALTER TABLE list_items ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_list_items_is_archived ON list_items(is_archived);
