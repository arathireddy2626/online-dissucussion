-- Step 4: simple design updates.
-- MySQL 8.0+. Run after migrations 001, 002, and 003.

USE discussion_tool;

-- These indexes are already created by UNIQUE fields, so remove duplicates.
DROP INDEX idx_user_account_username ON user_account;
DROP INDEX idx_student_record_user_id ON student_record;

-- The application checks for an existing PENDING request before inserting.
-- This keeps the SQL simple and lets the backend show:
-- "You already have a pending request."
