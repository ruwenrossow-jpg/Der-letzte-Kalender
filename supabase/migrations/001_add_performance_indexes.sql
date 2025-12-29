-- Performance Optimization Indexes
-- Run this migration to add missing indexes that improve query performance

-- Index for faster attendee count queries
-- Used when counting how many users have added an event to their calendar
CREATE INDEX IF NOT EXISTS idx_calendar_items_event_status 
ON user_calendar_items(event_id, status) 
WHERE status = 'going';

-- Index for faster "who follows this entity" queries
-- Used when checking follower counts and filtering feed events
CREATE INDEX IF NOT EXISTS idx_follows_entity 
ON follows(entity_id);

-- Index for faster published event queries by date
-- Used when fetching upcoming published events
CREATE INDEX IF NOT EXISTS idx_events_published_start 
ON events(start_at, status) 
WHERE status = 'published';

-- Index for faster calendar item lookups by user
-- Improves calendar day view performance
CREATE INDEX IF NOT EXISTS idx_calendar_items_user_status 
ON user_calendar_items(user_id, status);

-- Index for faster event queries by entity
-- Used on entity profile pages showing upcoming events
CREATE INDEX IF NOT EXISTS idx_events_entity_status 
ON events(entity_id, status) 
WHERE status = 'published';

-- Comment: These indexes will significantly improve query performance,
-- especially noticeable when:
-- - Viewing the feed with many followed entities
-- - Checking attendee counts for multiple events
-- - Loading calendar views with many events
-- - Viewing entity profiles with many upcoming events
