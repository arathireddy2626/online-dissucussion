# Online Discussion Tool Database Design

## Functionalities

### Common functionalities

- Login
- Logout
- Change Password

### Instructor functionalities

- Retrieve a request to add a new student
- Add a new student to the course (enrolling a student)
- Retrieve a request to remove a student
- Remove a student from the course (dropping a student)
- Create a new discussion
- Retrieve a request from a student to create a new discussion
- Browse all entries associated with a discussion
- Search for a discussion by topic or date of creation
- Post an entry for a selected discussion
- Search for an entry by username or date of posting
- Remove an entry from a selected discussion
- Browse all discussions
- Archive a selected discussion
- Browse all archived discussions
- Retrieve a request to retrieve an archived discussion
- Retrieve an archived discussion
- View all students in the course

### Student functionalities

- Request to join the course
- Request to leave the course
- Browse all discussions
- Browse all entries in a selected discussion
- Post an entry in a selected discussion
- Request to retrieve a discussion from the archive

## Entities

`*` marks a primary key. `FK` marks a foreign key. These entities correspond to the tables in `005_rubric_schema.sql`.

| Entity | Fields |
| --- | --- |
| LoginCredential | Username*, Password |
| StudentRecord | Firstname, Lastname, StudentID*, EmailAddress |
| EnrollQueue | StudentID (FK) |
| RemoveStudentQueue | StudentID (FK) |
| Dicussion | DiscussionID*, CourseName, DateAndTimeOfCreation, Topic |
| ReuqestToCreateDiscussion | StudentID* (FK), Topic* |
| Message | MessageID*, DateAndTime*, Username*, Contents |
| DiscussionToMessage | DicussionID* (FK), MessageID* (FK) |
| ArchivedDicussions | DiscussionID (FK) |
| RequestToRetrieveDiscussion | StudentID* (FK), Topic* |

## Relationships

Every relationship is one-to-many unless stated otherwise.

| From | To | Cardinality |
| --- | --- | --- |
| EnrollQueue | StudentRecord | Many-to-one |
| RemoveStudentQueue | StudentRecord | Many-to-one |
| ReuqestToCreateDiscussion | StudentRecord | Many-to-one |
| DiscussionToMessage | Dicussion | Many-to-one |
| DiscussionToMessage | Message | Many-to-one |
| ArchivedDicussions | Dicussion | Many-to-one |
| RequestToRetrieveDiscussion | Dicussion | Many-to-many |
| RequestToRetrieveDiscussion | StudentRecord | Many-to-many |

## E-R diagram boxes

Draw these 10 boxes:

- LoginCredential
- StudentRecord
- EnrollQueue
- RemoveStudentQueue
- Dicussion
- ReuqestToCreateDiscussion
- Message
- DiscussionToMessage
- ArchivedDicussions
- RequestToRetrieveDiscussion

Label relationship lines with the cardinalities shown above.

## Notes

The following implementation tables are intentionally not part of this professor-rubric design:

- UserAccount
- UserSession
- Course
- Enrollment
- EnrollmentRequest
- DiscussionCreationRequest
- ArchiveAccessRequest

The database uses the assignment's original entity names and spellings, including `Dicussion` and `ReuqestToCreateDiscussion`.
