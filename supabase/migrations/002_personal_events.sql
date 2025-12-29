-- Migration: Personal Events Table
-- Purpose: Allow users to create personal events not tied to entities
-- Created: 2025-12-29

CREATE TABLE personal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  location_name text,
  notes text,
  color text DEFAULT '#6B7280',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for efficient queries by user and date
CREATE INDEX idx_personal_events_user_start ON personal_events(user_id, start_at);

-- Enable Row Level Security
ALTER TABLE personal_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own personal events
CREATE POLICY "Users can view own personal events"
  ON personal_events FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own personal events
CREATE POLICY "Users can create own personal events"
  ON personal_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own personal events
CREATE POLICY "Users can update own personal events"
  ON personal_events FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policy: Users can delete their own personal events
CREATE POLICY "Users can delete own personal events"
  ON personal_events FOR DELETE
  USING (auth.uid() = user_id);
