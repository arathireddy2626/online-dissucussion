-- =====================================================================
-- MySQL demo: schema, tables and loaded values
-- Online Discussion Tool  (database: discussion_tool)
-- Run ONE section at a time in MySQL Workbench and explain what it shows.
-- (Select the lines of a section, then click the lightning bolt.)
-- =====================================================================

USE discussion_tool;

-- ---------------------------------------------------------------------
-- SECTION 1: THE SCHEMA (the structure, with no data yet)
-- ---------------------------------------------------------------------

-- 1.1  The 10 tables
SHOW TABLES;

-- 1.2  Columns of every table: name, type, NULL or not, key (PRI = primary key)
DESCRIBE LoginCredential;
DESCRIBE StudentRecord;
DESCRIBE EnrollQueue;
DESCRIBE RemoveStudentQueue;
DESCRIBE Dicussion;
DESCRIBE ReuqestToCreateDiscussion;
DESCRIBE Message;
DESCRIBE DiscussionToMessage;
DESCRIBE ArchivedDicussions;
DESCRIBE RequestToRetrieveDiscussion;

-- 1.3  The exact command that built one table
SHOW CREATE TABLE Message;

-- 1.4  The relationships: which column points to which table (foreign keys)
SELECT TABLE_NAME AS child_table, COLUMN_NAME AS child_column,
       REFERENCED_TABLE_NAME AS parent_table, REFERENCED_COLUMN_NAME AS parent_column
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'discussion_tool' AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;

-- ---------------------------------------------------------------------
-- SECTION 2: THE LOADED VALUES (the rows in each table)
-- ---------------------------------------------------------------------

SELECT Username, LEFT(Password, 20) AS password_hash_start, Role FROM LoginCredential;

SELECT StudentID, Firstname, Lastname, EmailAddress, Username FROM StudentRecord ORDER BY StudentID;

SELECT * FROM EnrollQueue;
SELECT * FROM RemoveStudentQueue;

SELECT DiscussionID, CourseName, DateAndTimeOfCreation, Topic FROM Dicussion ORDER BY DiscussionID;

SELECT * FROM ReuqestToCreateDiscussion;

-- Every message has its own MessageID
SELECT MessageID, DateAndTime, Username, LEFT(Contents, 60) AS Contents
FROM Message
ORDER BY MessageID;

-- The link table: which message belongs to which discussion, and its entry number
SELECT DicussionID, MessageID, EntryNo FROM DiscussionToMessage ORDER BY DicussionID, MessageID;

SELECT DiscussionID, FileName, FileType, ArchivedAt FROM ArchivedDicussions;

SELECT StudentID, Topic, DiscussionID, Status, RequestedAt FROM RequestToRetrieveDiscussion;

-- ---------------------------------------------------------------------
-- SECTION 3: PROOF THAT MESSAGE IDs ARE DISTINCT
-- ---------------------------------------------------------------------

-- 3.1  Both numbers must be equal
SELECT COUNT(*) AS total_messages, COUNT(DISTINCT MessageID) AS distinct_message_ids FROM Message;

-- 3.2  No message may belong to two discussions (this must return NO rows)
SELECT MessageID, COUNT(*) AS number_of_discussions
FROM DiscussionToMessage
GROUP BY MessageID
HAVING COUNT(*) > 1;

-- 3.3  No two entries may have the same entry number (this must return NO rows)
SELECT EntryNo, COUNT(*) AS times_used
FROM DiscussionToMessage
GROUP BY EntryNo
HAVING COUNT(*) > 1;

-- ---------------------------------------------------------------------
-- SECTION 4: THE TABLES JOINED TOGETHER (one readable picture)
-- ---------------------------------------------------------------------

SELECT d.DiscussionID, d.Topic, x.EntryNo, m.MessageID, m.Username, LEFT(m.Contents, 50) AS Contents
FROM Dicussion d
JOIN DiscussionToMessage x ON x.DicussionID = d.DiscussionID
JOIN Message m ON m.MessageID = x.MessageID
ORDER BY d.DiscussionID, m.MessageID;

-- ---------------------------------------------------------------------
-- SECTION 5: AFTER THE POSTMAN TEST, PROVE THE DATA IS IN THE DATABASE
-- ---------------------------------------------------------------------

-- 5.1  The student created by the test (newest student)
SELECT StudentID, Firstname, Lastname, EmailAddress, Username
FROM StudentRecord ORDER BY StudentID DESC LIMIT 1;

-- 5.2  Is the new student's login stored? (the password is a hash, never plain text)
SELECT Username, LEFT(Password, 20) AS password_hash_start, Role
FROM LoginCredential
WHERE Username = (SELECT Username FROM StudentRecord ORDER BY StudentID DESC LIMIT 1);

-- 5.3  The two newest discussions
SELECT DiscussionID, Topic, DateAndTimeOfCreation FROM Dicussion ORDER BY DiscussionID DESC LIMIT 2;

-- 5.4  Every entry of the two newest discussions
SELECT x.EntryNo, m.MessageID, m.Username, m.Contents
FROM DiscussionToMessage x
JOIN Message m ON m.MessageID = x.MessageID
WHERE x.DicussionID IN (SELECT DiscussionID FROM (SELECT DiscussionID FROM Dicussion ORDER BY DiscussionID DESC LIMIT 2) t)
ORDER BY x.DicussionID, m.MessageID;

-- ---------------------------------------------------------------------
-- SECTION 6: CLEAN UP THE TEST DATA AFTER THE CLASS (optional)
-- Removes only what the Postman demo made: topics starting with "Demo" and
-- the students whose ID is 100000 or higher.
-- ---------------------------------------------------------------------

SET SQL_SAFE_UPDATES = 0;

CREATE TEMPORARY TABLE demo_messages AS
SELECT MessageID FROM DiscussionToMessage
WHERE DicussionID IN (SELECT DiscussionID FROM Dicussion WHERE Topic LIKE 'Demo %');

CREATE TEMPORARY TABLE demo_users AS
SELECT Username FROM StudentRecord WHERE StudentID >= 100000 AND Username IS NOT NULL;

DELETE FROM DiscussionToMessage WHERE MessageID IN (SELECT MessageID FROM demo_messages);
DELETE FROM Message WHERE MessageID IN (SELECT MessageID FROM demo_messages);
DELETE FROM Dicussion WHERE Topic LIKE 'Demo %';

DELETE FROM EnrollQueue WHERE StudentID >= 100000;
DELETE FROM StudentRecord WHERE StudentID >= 100000;
DELETE FROM LoginCredential WHERE Username IN (SELECT Username FROM demo_users);

DROP TEMPORARY TABLE demo_messages;
DROP TEMPORARY TABLE demo_users;
