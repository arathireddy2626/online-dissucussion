-- Final beginner schema for the professor's rubric.
-- MySQL 8.0+. Run only after making a backup of any real database.
-- This intentionally uses the exact entity names from the assignment.

CREATE DATABASE IF NOT EXISTS discussion_tool
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE discussion_tool;

-- Remove the previous implementation tables first.
DROP TABLE IF EXISTS archive_access_request;
DROP TABLE IF EXISTS discussion_creation_request;
DROP TABLE IF EXISTS enrollment_request;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS discussiontomessage;
DROP TABLE IF EXISTS archiveddicussions;
DROP TABLE IF EXISTS requesttoretrievediscussion;
DROP TABLE IF EXISTS reuqesttocreatediscussion;
DROP TABLE IF EXISTS removestudentqueue;
DROP TABLE IF EXISTS enrollqueue;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS discussion;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS user_session;
DROP TABLE IF EXISTS student_record;
DROP TABLE IF EXISTS user_account;

-- Remove any previous rubric tables before recreating them.
DROP TABLE IF EXISTS RequestToRetrieveDiscussion;
DROP TABLE IF EXISTS ArchivedDicussions;
DROP TABLE IF EXISTS DiscussionToMessage;
DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS ReuqestToCreateDiscussion;
DROP TABLE IF EXISTS Dicussion;
DROP TABLE IF EXISTS RemoveStudentQueue;
DROP TABLE IF EXISTS EnrollQueue;
DROP TABLE IF EXISTS StudentRecord;
DROP TABLE IF EXISTS LoginCredential;

CREATE TABLE LoginCredential (
    Username VARCHAR(60) PRIMARY KEY,
    Password VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE StudentRecord (
    StudentID INT PRIMARY KEY,
    Firstname VARCHAR(100) NOT NULL,
    Lastname VARCHAR(100) NOT NULL,
    EmailAddress VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE EnrollQueue (
    StudentID INT PRIMARY KEY,
    FOREIGN KEY (StudentID) REFERENCES StudentRecord (StudentID)
) ENGINE=InnoDB;

CREATE TABLE RemoveStudentQueue (
    StudentID INT PRIMARY KEY,
    FOREIGN KEY (StudentID) REFERENCES StudentRecord (StudentID)
) ENGINE=InnoDB;

CREATE TABLE Dicussion (
    DiscussionID INT AUTO_INCREMENT PRIMARY KEY,
    CourseName VARCHAR(200) NOT NULL,
    DateAndTimeOfCreation DATETIME NOT NULL,
    Topic VARCHAR(200) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE ReuqestToCreateDiscussion (
    StudentID INT NOT NULL,
    Topic VARCHAR(200) NOT NULL,
    PRIMARY KEY (StudentID, Topic),
    FOREIGN KEY (StudentID) REFERENCES StudentRecord (StudentID)
) ENGINE=InnoDB;

CREATE TABLE Message (
    MessageID INT AUTO_INCREMENT PRIMARY KEY,
    DateAndTime DATETIME NOT NULL,
    Username VARCHAR(60) NOT NULL,
    Contents TEXT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE DiscussionToMessage (
    DicussionID INT NOT NULL,
    MessageID INT NOT NULL,
    PRIMARY KEY (DicussionID, MessageID),
    FOREIGN KEY (DicussionID) REFERENCES Dicussion (DiscussionID),
    FOREIGN KEY (MessageID) REFERENCES Message (MessageID)
) ENGINE=InnoDB;

CREATE TABLE ArchivedDicussions (
    DiscussionID INT PRIMARY KEY,
    FOREIGN KEY (DiscussionID) REFERENCES Dicussion (DiscussionID)
) ENGINE=InnoDB;

CREATE TABLE RequestToRetrieveDiscussion (
    StudentID INT NOT NULL,
    Topic VARCHAR(200) NOT NULL,
    PRIMARY KEY (StudentID, Topic),
    FOREIGN KEY (StudentID) REFERENCES StudentRecord (StudentID)
) ENGINE=InnoDB;

-- Simple development rows for testing the login screen.
INSERT INTO LoginCredential (Username, Password)
VALUES
    ('drKasi', 'Instructor@123'),
    ('jdoe23', 'Student@123'),
    ('arahman17', 'Student@123'),
    ('dkim41', 'Student@123');

INSERT INTO StudentRecord (StudentID, Firstname, Lastname, EmailAddress)
VALUES
    (1, 'John', 'Doe', 'john.doe@campus.edu'),
    (2, 'Aisha', 'Rahman', 'aisha.rahman@campus.edu'),
    (3, 'Daniel', 'Kim', 'daniel.kim@campus.edu');
