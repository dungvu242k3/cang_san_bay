-- Migration: Add participants column to events table
-- Description: Add participants field to store who will attend the event
-- Date: 2026-02-03

-- Add participants column
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS participants TEXT;

-- Comment
COMMENT ON COLUMN public.events.participants IS 'Thành phần tham dự sự kiện (danh sách nhân sự, phòng ban, hoặc mô tả)';
