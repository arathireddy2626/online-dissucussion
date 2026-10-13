-- Step 2: course enrollment, discussions, messages, and request workflows.
-- MySQL 8.0+ migration. Run after 001_login.sql.

USE discussion_tool;

CREATE TABLE IF NOT EXISTS course (
    course_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_code VARCHAR(30) NOT NULL UNIQUE,
    course_name VARCHAR(200) NOT NULL,
    instructor_user_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_instructor
        FOREIGN KEY (instructor_user_id) REFERENCES user_account (user_id)
        ON DELETE RESTRICT
 ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollment (
    enrollment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    student_id BIGINT,
    student_number_snapshot VARCHAR(50) NOT NULL,
    status ENUM('ACTIVE', 'WITHDRAWN') NOT NULL DEFAULT 'ACTIVE',
    enrolled_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at DATETIME,
    CONSTRAINT uq_course_student UNIQUE (course_id, student_id),
    CONSTRAINT fk_enrollment_course
        FOREIGN KEY (course_id) REFERENCES course (course_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_enrollment_student
        FOREIGN KEY (student_id) REFERENCES student_record (student_id)
        ON DELETE SET NULL,
    CONSTRAINT chk_withdrawal_date
        CHECK ((status = 'ACTIVE' AND withdrawn_at IS NULL)
            OR (status = 'WITHDRAWN' AND withdrawn_at IS NOT NULL))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollment_request (
    enrollment_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    request_type ENUM('ENROLLMENT', 'WITHDRAWAL') NOT NULL,
    student_id BIGINT,
    firstname VARCHAR(100) NOT NULL,
    lastname VARCHAR(100) NOT NULL,
    student_number VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    processed_by BIGINT,
    created_user_id BIGINT,
    email_sent_at DATETIME,
    CONSTRAINT fk_enrollment_request_course
        FOREIGN KEY (course_id) REFERENCES course (course_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_enrollment_request_student
        FOREIGN KEY (student_id) REFERENCES student_record (student_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_enrollment_request_processor
        FOREIGN KEY (processed_by) REFERENCES user_account (user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_enrollment_request_created_user
        FOREIGN KEY (created_user_id) REFERENCES user_account (user_id)
        ON DELETE SET NULL
 ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS discussion (
    discussion_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    topic VARCHAR(200) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('ACTIVE', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    archived_at DATETIME,
    CONSTRAINT fk_discussion_course
        FOREIGN KEY (course_id) REFERENCES course (course_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_discussion_creator
        FOREIGN KEY (created_by) REFERENCES user_account (user_id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_archive_date
        CHECK ((status = 'ACTIVE' AND archived_at IS NULL)
            OR (status = 'ARCHIVED' AND archived_at IS NOT NULL))
 ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS message (
    message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    discussion_id BIGINT NOT NULL,
    author_user_id BIGINT,
    author_username VARCHAR(60) NOT NULL,
    posted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contents TEXT NOT NULL,
    CONSTRAINT fk_message_discussion
        FOREIGN KEY (discussion_id) REFERENCES discussion (discussion_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_message_author
        FOREIGN KEY (author_user_id) REFERENCES user_account (user_id)
        ON DELETE SET NULL
 ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS discussion_creation_request (
    discussion_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id BIGINT NOT NULL,
    student_id BIGINT,
    topic VARCHAR(200) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    processed_by BIGINT,
    created_discussion_id BIGINT,
    CONSTRAINT fk_discussion_request_course
        FOREIGN KEY (course_id) REFERENCES course (course_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_discussion_request_student
        FOREIGN KEY (student_id) REFERENCES student_record (student_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_discussion_request_processor
        FOREIGN KEY (processed_by) REFERENCES user_account (user_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_discussion_request_result
        FOREIGN KEY (created_discussion_id) REFERENCES discussion (discussion_id)
        ON DELETE SET NULL
 ) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS archive_access_request (
    archive_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    discussion_id BIGINT NOT NULL,
    student_id BIGINT,
    student_number_snapshot VARCHAR(50) NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    requested_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    processed_by BIGINT,
    CONSTRAINT uq_archive_request UNIQUE (discussion_id, student_id),
    CONSTRAINT fk_archive_request_discussion
        FOREIGN KEY (discussion_id) REFERENCES discussion (discussion_id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_archive_request_student
        FOREIGN KEY (student_id) REFERENCES student_record (student_id)
        ON DELETE SET NULL,
    CONSTRAINT fk_archive_request_processor
        FOREIGN KEY (processed_by) REFERENCES user_account (user_id)
        ON DELETE SET NULL
 ) ENGINE=InnoDB;

CREATE INDEX idx_discussion_topic ON discussion (topic);
CREATE INDEX idx_discussion_created_at ON discussion (created_at);
CREATE INDEX idx_message_author_date ON message (author_username, posted_at);
CREATE INDEX idx_message_discussion_date ON message (discussion_id, posted_at);
CREATE INDEX idx_enrollment_request_status ON enrollment_request (course_id, status);
CREATE INDEX idx_discussion_request_status ON discussion_creation_request (course_id, status);
CREATE INDEX idx_archive_request_status ON archive_access_request (status);