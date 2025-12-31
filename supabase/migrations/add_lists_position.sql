-- Add position column to lists table
ALTER TABLE lists ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;

-- Update existing lists with positions based on created_at
WITH numbered_lists AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) - 1 as new_position
  FROM lists
  WHERE position IS NULL OR position = 0
)
UPDATE lists
SET position = numbered_lists.new_position
FROM numbered_lists
WHERE lists.id = numbered_lists.id;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_lists_position ON lists(position);
