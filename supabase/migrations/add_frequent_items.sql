-- Create frequent_items table
CREATE TABLE IF NOT EXISTS frequent_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  normalized_content TEXT NOT NULL,
  category TEXT,
  use_count INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, normalized_content)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_frequent_items_user ON frequent_items(user_id);
CREATE INDEX IF NOT EXISTS idx_frequent_items_count ON frequent_items(user_id, use_count DESC);

-- Enable Row Level Security
ALTER TABLE frequent_items ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own frequent items
CREATE POLICY "Users can manage own frequent items"
  ON frequent_items
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
