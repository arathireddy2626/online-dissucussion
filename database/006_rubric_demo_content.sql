-- Optional simple demo content for the connected frontend.
-- Run after 005_rubric_schema.sql.

USE discussion_tool;

INSERT INTO Dicussion (CourseName, DateAndTimeOfCreation, Topic)
VALUES ('Software Engineering', UTC_TIMESTAMP(), 'Week 1: Introduction to software engineering');
SET @DiscussionID = LAST_INSERT_ID();

INSERT INTO Message (DateAndTime, Username, Contents)
VALUES (UTC_TIMESTAMP(), 'drKasi', 'Welcome to the Software Engineering discussion.');
SET @MessageID = LAST_INSERT_ID();

INSERT INTO DiscussionToMessage (DicussionID, MessageID)
VALUES (@DiscussionID, @MessageID);