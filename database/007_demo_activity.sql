-- Demo activity for the Online Discussion Tool.
-- Run after 005_rubric_schema.sql and 006_rubric_demo_content.sql.

USE discussion_tool;

-- More student login records.
INSERT IGNORE INTO LoginCredential (Username, Password)
VALUES
    ('pnair32', 'Student@123'),
    ('mbell26', 'Student@123'),
    ('snguyen12', 'Student@123'),
    ('ebrooks53', 'Student@123');

-- More student records.
INSERT IGNORE INTO StudentRecord (StudentID, Firstname, Lastname, EmailAddress)
VALUES
    (4, 'Priya', 'Nair', 'priya.nair@campus.edu'),
    (8, 'Marcus', 'Bell', 'marcus.bell@campus.edu'),
    (6, 'Sofia', 'Nguyen', 'sofia.nguyen@campus.edu'),
    (7, 'Ethan', 'Brooks', 'ethan.brooks@campus.edu');

-- Pending student requests visible to the instructor.
INSERT IGNORE INTO EnrollQueue (StudentID)
VALUES (4), (6), (8);

INSERT IGNORE INTO RemoveStudentQueue (StudentID)
VALUES (2), (3);

-- Active discussion: project planning.
INSERT INTO Dicussion (CourseName, DateAndTimeOfCreation, Topic)
VALUES ('Software Engineering', UTC_TIMESTAMP(), 'Project planning and milestones');
SET @DiscussionOne = LAST_INSERT_ID();

INSERT INTO Message (DateAndTime, Username, Contents)
VALUES
    (UTC_TIMESTAMP(), 'jdoe23', 'Our group divided the project into research, design, implementation, and testing.'),
    (UTC_TIMESTAMP(), 'pnair32', 'Weekly milestones should help us track progress and identify risks early.');
SET @MessageOne = LAST_INSERT_ID() - 1;
SET @MessageTwo = LAST_INSERT_ID();

INSERT INTO DiscussionToMessage (DicussionID, MessageID)
VALUES (@DiscussionOne, @MessageOne), (@DiscussionOne, @MessageTwo);

-- Active discussion: accessibility.
INSERT INTO Dicussion (CourseName, DateAndTimeOfCreation, Topic)
VALUES ('Software Engineering', UTC_TIMESTAMP(), 'Accessibility and inclusive design');
SET @DiscussionTwo = LAST_INSERT_ID();

INSERT INTO Message (DateAndTime, Username, Contents)
VALUES
    (UTC_TIMESTAMP(), 'snguyen12', 'Keyboard navigation and readable contrast should be tested before release.'),
    (UTC_TIMESTAMP(), 'mbell26', 'Accessible labels also make the discussion tool easier for everyone to use.');
SET @MessageThree = LAST_INSERT_ID() - 1;
SET @MessageFour = LAST_INSERT_ID();

INSERT INTO DiscussionToMessage (DicussionID, MessageID)
VALUES (@DiscussionTwo, @MessageThree), (@DiscussionTwo, @MessageFour);

-- Archived discussion with an archive retrieval request.
INSERT INTO Dicussion (CourseName, DateAndTimeOfCreation, Topic)
VALUES ('Software Engineering', UTC_TIMESTAMP(), 'Previous semester project examples');
SET @ArchivedDiscussion = LAST_INSERT_ID();

INSERT INTO Message (DateAndTime, Username, Contents)
VALUES (UTC_TIMESTAMP(), 'drKasi', 'Archived examples of strong software engineering projects.');
SET @ArchivedMessage = LAST_INSERT_ID();

INSERT INTO DiscussionToMessage (DicussionID, MessageID)
VALUES (@ArchivedDiscussion, @ArchivedMessage);

INSERT IGNORE INTO ArchivedDicussions (DiscussionID)
VALUES (@ArchivedDiscussion);

INSERT IGNORE INTO RequestToRetrieveDiscussion (StudentID, Topic)
VALUES (1, 'Previous semester project examples');
