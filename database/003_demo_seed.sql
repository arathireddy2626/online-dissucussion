-- Step 3: development accounts and one course for local frontend integration.
-- MySQL 8.0+. Run after 001_login.sql and 002_course_workflows.sql.

USE discussion_tool;

INSERT IGNORE INTO user_account (username, password_hash, role, email)
VALUES
    ('drKasi', '$2b$12$iZW.Dv00JJqKTcsnXrn4eO3X3rALQle5W0dkkrd4PbQpWoOiOS7sm', 'INSTRUCTOR', 'dr.kasi@campus.edu'),
    ('jdoe23', '$2b$12$MOHurvG992sFnHYkrcqdSus0ZnHia2KpMZvtZMXdYYOip6v0AwG4.', 'STUDENT', 'john.doe@campus.edu'),
    ('arahman17', '$2b$12$MOHurvG992sFnHYkrcqdSus0ZnHia2KpMZvtZMXdYYOip6v0AwG4.', 'STUDENT', 'aisha.rahman@campus.edu'),
    ('dkim41', '$2b$12$MOHurvG992sFnHYkrcqdSus0ZnHia2KpMZvtZMXdYYOip6v0AwG4.', 'STUDENT', 'daniel.kim@campus.edu');

INSERT IGNORE INTO student_record (user_id, student_number, firstname, lastname)
SELECT user_id, 'ST-001', 'John', 'Doe'
FROM user_account WHERE username = 'jdoe23';

INSERT IGNORE INTO student_record (user_id, student_number, firstname, lastname)
SELECT user_id, 'ST-002', 'Aisha', 'Rahman'
FROM user_account WHERE username = 'arahman17';

INSERT IGNORE INTO student_record (user_id, student_number, firstname, lastname)
SELECT user_id, 'ST-003', 'Daniel', 'Kim'
FROM user_account WHERE username = 'dkim41';

INSERT IGNORE INTO course (course_code, course_name, instructor_user_id)
SELECT 'SWE-101', 'Software Engineering', user_id
FROM user_account
WHERE username = 'drKasi';

INSERT IGNORE INTO enrollment (course_id, student_id, student_number_snapshot)
SELECT c.course_id, s.student_id, s.student_number
FROM course c
JOIN student_record s
WHERE c.course_code = 'SWE-101'
  AND s.student_number IN ('ST-001', 'ST-002', 'ST-003');
