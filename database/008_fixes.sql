-- Step 8: simple fixes from the review document.
-- Run after 007_demo_activity.sql.

USE discussion_tool;

-- Store hashes in the existing Password field.
UPDATE LoginCredential
SET Password = '$2b$12$MOHurvG992sFnHYkrcqdSus0ZnHia2KpMZvtZMXdYYOip6v0AwG4.'
WHERE Username <> 'drKasi';

UPDATE LoginCredential
SET Password = '$2b$12$iZW.Dv00JJqKTcsnXrn4eO3X3rALQle5W0dkkrd4PbQpWoOiOS7sm'
WHERE Username = 'drKasi';

ALTER TABLE LoginCredential
    ADD COLUMN Role ENUM('INSTRUCTOR', 'STUDENT') NOT NULL DEFAULT 'STUDENT';

UPDATE LoginCredential
SET Role = 'INSTRUCTOR'
WHERE Username = 'drKasi';

ALTER TABLE StudentRecord
    ADD COLUMN Username VARCHAR(60) NULL UNIQUE;

ALTER TABLE StudentRecord
    ADD CONSTRAINT fk_student_login
        FOREIGN KEY (Username) REFERENCES LoginCredential (Username)
        ON DELETE SET NULL;

UPDATE StudentRecord SET Username = 'jdoe23' WHERE StudentID = 1;
UPDATE StudentRecord SET Username = 'arahman17' WHERE StudentID = 2;
UPDATE StudentRecord SET Username = 'dkim41' WHERE StudentID = 3;
UPDATE StudentRecord SET Username = 'pnair32' WHERE StudentID = 4;
UPDATE StudentRecord SET Username = 'snguyen12' WHERE StudentID = 6;
UPDATE StudentRecord SET Username = 'ebrooks53' WHERE StudentID = 7;
UPDATE StudentRecord SET Username = 'mbell26' WHERE StudentID = 8;

ALTER TABLE EnrollQueue
    ADD COLUMN RequestedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE RemoveStudentQueue
    ADD COLUMN RequestedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE Dicussion
    MODIFY Topic VARCHAR(80) NOT NULL;

ALTER TABLE ReuqestToCreateDiscussion
    MODIFY Topic VARCHAR(80) NOT NULL;

ALTER TABLE RequestToRetrieveDiscussion
    MODIFY Topic VARCHAR(80) NOT NULL;

UPDATE Dicussion
SET DateAndTimeOfCreation = DATE_ADD(DateAndTimeOfCreation, INTERVAL DiscussionID MINUTE);

ALTER TABLE Dicussion
    ADD UNIQUE (DateAndTimeOfCreation);

ALTER TABLE ArchivedDicussions
    ADD COLUMN FileName VARCHAR(255) NULL,
    ADD COLUMN FileType VARCHAR(10) NULL,
    ADD COLUMN FileData LONGBLOB NULL,
    ADD COLUMN ArchivedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE ArchivedDicussions
SET FileName = CONCAT('discussion-', DiscussionID, '.txt'),
    FileType = 'txt',
    FileData = CAST(CONCAT('Archived discussion ', DiscussionID) AS BINARY)
WHERE FileData IS NULL;

ALTER TABLE RequestToRetrieveDiscussion
    ADD COLUMN DiscussionID INT NULL,
    ADD COLUMN Status ENUM('PENDING', 'APPROVED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN RequestedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE RequestToRetrieveDiscussion
    ADD CONSTRAINT fk_retrieve_discussion
        FOREIGN KEY (DiscussionID) REFERENCES Dicussion (DiscussionID);

UPDATE RequestToRetrieveDiscussion r
JOIN Dicussion d ON d.Topic = r.Topic
SET r.DiscussionID = d.DiscussionID;

ALTER TABLE Message
    ADD COLUMN ImageName VARCHAR(255) NULL,
    ADD COLUMN ImageType VARCHAR(10) NULL,
    ADD COLUMN ImageData MEDIUMBLOB NULL;

ALTER TABLE Message
    ADD CONSTRAINT chk_image_type
        CHECK (ImageType IS NULL OR ImageType IN ('png', 'jpg', 'gif'));

CREATE INDEX idx_discussion_topic ON Dicussion (Topic);
CREATE INDEX idx_message_user_date ON Message (Username, DateAndTime);
