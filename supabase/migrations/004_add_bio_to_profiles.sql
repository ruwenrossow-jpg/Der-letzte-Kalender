-- Migration: Add bio field to profiles
-- Purpose: Allow users to add a personal bio/description to their profile
-- Created: 2025-12-29

ALTER TABLE profiles ADD COLUMN bio text;
