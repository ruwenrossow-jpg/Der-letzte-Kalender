-- Migration: Dismissed Updates Table
-- Purpose: Track which updates users have dismissed to enable granular control
-- Created: 2025-12-29

CREATE TABLE dismissed_updates (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  dismissed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, event_id)
);

-- Index for efficient queries
CREATE INDEX idx_dismissed_updates_user ON dismissed_updates(user_id);
CREATE INDEX idx_dismissed_updates_event ON dismissed_updates(event_id);

-- Enable Row Level Security
ALTER TABLE dismissed_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own dismissed updates
CREATE POLICY "Users can view own dismissed updates"
  ON dismissed_updates FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can dismiss updates for themselves
CREATE POLICY "Users can dismiss own updates"
  ON dismissed_updates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can un-dismiss their own updates
CREATE POLICY "Users can delete own dismissed updates"
  ON dismissed_updates FOR DELETE
  USING (auth.uid() = user_id);
