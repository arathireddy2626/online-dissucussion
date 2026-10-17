// =====================================================================
// Online Discussion Tool - MongoDB implementation
// Creates the 10 collections (the "tables"), their rules and indexes,
// and inserts the demo entries.
//
// Run with mongosh:
//     mongosh "mongodb://localhost:27017" mongodb_setup.js
//
// Collection names match the 10 entities in the E-R diagram
// (including the original spellings Dicussion and ReuqestToCreateDiscussion).
// Safe to run again: it drops and rebuilds the discussion_tool database.
// =====================================================================

db = db.getSiblingDB('discussion_tool')
db.dropDatabase()

// ---------------------------------------------------------------------
// PART 1: CREATE THE COLLECTIONS (with validation rules)
// A validator is MongoDB's version of column types and NOT NULL.
// ---------------------------------------------------------------------

db.createCollection('LoginCredential', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['Username', 'Password', 'Role'],
    properties: {
      Username: { bsonType: 'string', maxLength: 60 },
      Password: { bsonType: 'string', description: 'bcrypt hash, never plain text' },
      Role: { enum: ['INSTRUCTOR', 'STUDENT'] },
    },
  } },
})

db.createCollection('StudentRecord', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['StudentID', 'Firstname', 'Lastname', 'EmailAddress'],
    properties: {
      StudentID: { bsonType: 'number', minimum: 1 },
      Firstname: { bsonType: 'string', maxLength: 100 },
      Lastname: { bsonType: 'string', maxLength: 100 },
      EmailAddress: { bsonType: 'string', maxLength: 255 },
      Username: { bsonType: ['string', 'null'], maxLength: 60 },
    },
  } },
})

db.createCollection('EnrollQueue', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['StudentID', 'RequestedAt'],
    properties: {
      StudentID: { bsonType: 'number', minimum: 1 },
      RequestedAt: { bsonType: 'date' },
    },
  } },
})

db.createCollection('RemoveStudentQueue', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['StudentID', 'RequestedAt'],
    properties: {
      StudentID: { bsonType: 'number', minimum: 1 },
      RequestedAt: { bsonType: 'date' },
    },
  } },
})

db.createCollection('Dicussion', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['DiscussionID', 'CourseName', 'DateAndTimeOfCreation', 'Topic'],
    properties: {
      DiscussionID: { bsonType: 'number', minimum: 1 },
      CourseName: { bsonType: 'string', maxLength: 200 },
      DateAndTimeOfCreation: { bsonType: 'date' },
      Topic: { bsonType: 'string', maxLength: 80 },
    },
  } },
})

db.createCollection('ReuqestToCreateDiscussion', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['StudentID', 'Topic'],
    properties: {
      StudentID: { bsonType: 'number', minimum: 1 },
      Topic: { bsonType: 'string', maxLength: 80 },
    },
  } },
})

db.createCollection('Message', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['MessageID', 'DateAndTime', 'Username', 'Contents'],
    properties: {
      MessageID: { bsonType: 'number', minimum: 1 },
      DateAndTime: { bsonType: 'date' },
      Username: { bsonType: 'string', maxLength: 60 },
      Contents: { bsonType: 'string' },
      ImageName: { bsonType: ['string', 'null'] },
      ImageType: { enum: ['png', 'jpg', 'gif', null] },
      ImageData: { bsonType: ['binData', 'null'] },
    },
  } },
})

db.createCollection('DiscussionToMessage', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['DicussionID', 'MessageID', 'EntryNo'],
    properties: {
      DicussionID: { bsonType: 'number', minimum: 1 },
      MessageID: { bsonType: 'number', minimum: 1 },
      EntryNo: { bsonType: 'string', pattern: '^[0-9]+\\.[0-9]+$', description: 'like 1.1, 1.2, 2.1' },
    },
  } },
})

db.createCollection('ArchivedDicussions', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['DiscussionID', 'FileName', 'FileType', 'FileData', 'ArchivedAt'],
    properties: {
      DiscussionID: { bsonType: 'number', minimum: 1 },
      FileName: { bsonType: 'string', maxLength: 255 },
      FileType: { bsonType: 'string', maxLength: 10 },
      FileData: { bsonType: 'binData' },
      ArchivedAt: { bsonType: 'date' },
    },
  } },
})

db.createCollection('RequestToRetrieveDiscussion', {
  validator: { $jsonSchema: {
    bsonType: 'object',
    required: ['StudentID', 'Topic', 'DiscussionID', 'Status', 'RequestedAt'],
    properties: {
      StudentID: { bsonType: 'number', minimum: 1 },
      Topic: { bsonType: 'string', maxLength: 80 },
      DiscussionID: { bsonType: 'number', minimum: 1 },
      Status: { enum: ['PENDING', 'APPROVED'] },
      RequestedAt: { bsonType: 'date' },
    },
  } },
})

// ---------------------------------------------------------------------
// PART 2: INDEXES
// A unique index is MongoDB's version of PRIMARY KEY / UNIQUE.
// (MongoDB does not enforce FOREIGN KEYs: the app checks those links.)
// ---------------------------------------------------------------------

db.LoginCredential.createIndex({ Username: 1 }, { unique: true })

db.StudentRecord.createIndex({ StudentID: 1 }, { unique: true })
db.StudentRecord.createIndex({ EmailAddress: 1 }, { unique: true })
db.StudentRecord.createIndex(
  { Username: 1 },
  { unique: true, partialFilterExpression: { Username: { $type: 'string' } } }
)

db.EnrollQueue.createIndex({ StudentID: 1 }, { unique: true })
db.RemoveStudentQueue.createIndex({ StudentID: 1 }, { unique: true })

db.Dicussion.createIndex({ DiscussionID: 1 }, { unique: true })
db.Dicussion.createIndex({ DateAndTimeOfCreation: 1 }, { unique: true })
db.Dicussion.createIndex({ Topic: 1 })

db.ReuqestToCreateDiscussion.createIndex({ StudentID: 1, Topic: 1 }, { unique: true })

db.Message.createIndex({ MessageID: 1 }, { unique: true })
db.Message.createIndex({ Username: 1, DateAndTime: 1 })

db.DiscussionToMessage.createIndex({ DicussionID: 1, MessageID: 1 }, { unique: true })
db.DiscussionToMessage.createIndex({ EntryNo: 1 }, { unique: true })

db.ArchivedDicussions.createIndex({ DiscussionID: 1 }, { unique: true })

db.RequestToRetrieveDiscussion.createIndex({ StudentID: 1, Topic: 1 }, { unique: true })

// ---------------------------------------------------------------------
// PART 3: INSERT THE ENTRIES (demo data)
// Login passwords: drKasi = Instructor@123, every student = Student@123
// ---------------------------------------------------------------------

const instructorHash = '$2b$12$iZW.Dv00JJqKTcsnXrn4eO3X3rALQle5W0dkkrd4PbQpWoOiOS7sm'
const studentHash = '$2b$12$MOHurvG992sFnHYkrcqdSus0ZnHia2KpMZvtZMXdYYOip6v0AwG4.'

db.LoginCredential.insertMany([
  { Username: 'drKasi', Password: instructorHash, Role: 'INSTRUCTOR' },
  { Username: 'jdoe23', Password: studentHash, Role: 'STUDENT' },
  { Username: 'arahman17', Password: studentHash, Role: 'STUDENT' },
  { Username: 'dkim41', Password: studentHash, Role: 'STUDENT' },
  { Username: 'pnair32', Password: studentHash, Role: 'STUDENT' },
  { Username: 'snguyen12', Password: studentHash, Role: 'STUDENT' },
  { Username: 'ebrooks53', Password: studentHash, Role: 'STUDENT' },
  { Username: 'mbell26', Password: studentHash, Role: 'STUDENT' },
])

db.StudentRecord.insertMany([
  { StudentID: 1, Firstname: 'John', Lastname: 'Doe', EmailAddress: 'john.doe@campus.edu', Username: 'jdoe23' },
  { StudentID: 2, Firstname: 'Aisha', Lastname: 'Rahman', EmailAddress: 'aisha.rahman@campus.edu', Username: 'arahman17' },
  { StudentID: 3, Firstname: 'Daniel', Lastname: 'Kim', EmailAddress: 'daniel.kim@campus.edu', Username: 'dkim41' },
  { StudentID: 4, Firstname: 'Priya', Lastname: 'Nair', EmailAddress: 'priya.nair@campus.edu', Username: 'pnair32' },
  { StudentID: 6, Firstname: 'Sofia', Lastname: 'Nguyen', EmailAddress: 'sofia.nguyen@campus.edu', Username: 'snguyen12' },
  { StudentID: 7, Firstname: 'Ethan', Lastname: 'Brooks', EmailAddress: 'ethan.brooks@campus.edu', Username: 'ebrooks53' },
  { StudentID: 8, Firstname: 'Marcus', Lastname: 'Bell', EmailAddress: 'marcus.bell@campus.edu', Username: 'mbell26' },
])

// Pending requests to join / leave the course
db.EnrollQueue.insertMany([
  { StudentID: 4, RequestedAt: ISODate('2026-10-05T09:00:00Z') },
  { StudentID: 6, RequestedAt: ISODate('2026-10-05T09:30:00Z') },
  { StudentID: 8, RequestedAt: ISODate('2026-10-05T10:00:00Z') },
])

db.RemoveStudentQueue.insertMany([
  { StudentID: 2, RequestedAt: ISODate('2026-10-05T11:00:00Z') },
  { StudentID: 3, RequestedAt: ISODate('2026-10-05T11:30:00Z') },
])

db.Dicussion.insertMany([
  { DiscussionID: 1, CourseName: 'Software Engineering', DateAndTimeOfCreation: ISODate('2026-09-01T09:00:00Z'), Topic: 'Week 1: Introduction to software engineering' },
  { DiscussionID: 2, CourseName: 'Software Engineering', DateAndTimeOfCreation: ISODate('2026-09-02T09:00:00Z'), Topic: 'Project planning and milestones' },
  { DiscussionID: 3, CourseName: 'Software Engineering', DateAndTimeOfCreation: ISODate('2026-09-03T09:00:00Z'), Topic: 'Accessibility and inclusive design' },
  { DiscussionID: 4, CourseName: 'Software Engineering', DateAndTimeOfCreation: ISODate('2026-09-04T09:00:00Z'), Topic: 'Previous semester project examples' },
  { DiscussionID: 5, CourseName: 'Software Engineering', DateAndTimeOfCreation: ISODate('2026-09-05T09:00:00Z'), Topic: 'Agile vs Waterfall: which fits a student project?' },
])

// Students asking the instructor to create a new discussion
db.ReuqestToCreateDiscussion.insertMany([
  { StudentID: 1, Topic: 'AI in Software Development' },
  { StudentID: 4, Topic: 'Frontend web development' },
])

db.Message.insertMany([
  { MessageID: 1, DateAndTime: ISODate('2026-09-01T09:05:00Z'), Username: 'drKasi', Contents: 'Welcome to the Software Engineering discussion.' },
  { MessageID: 2, DateAndTime: ISODate('2026-09-02T09:05:00Z'), Username: 'jdoe23', Contents: 'Our group divided the project into research, design, implementation, and testing.' },
  { MessageID: 3, DateAndTime: ISODate('2026-09-02T09:20:00Z'), Username: 'pnair32', Contents: 'Weekly milestones should help us track progress and identify risks early.' },
  { MessageID: 4, DateAndTime: ISODate('2026-09-03T09:05:00Z'), Username: 'snguyen12', Contents: 'Keyboard navigation and readable contrast should be tested before release.' },
  { MessageID: 5, DateAndTime: ISODate('2026-09-03T09:20:00Z'), Username: 'mbell26', Contents: 'Accessible labels also make the discussion tool easier for everyone to use.' },
  { MessageID: 6, DateAndTime: ISODate('2026-09-04T09:05:00Z'), Username: 'drKasi', Contents: 'Archived examples of strong software engineering projects.' },
  { MessageID: 7, DateAndTime: ISODate('2026-09-05T09:05:00Z'), Username: 'drKasi', Contents: 'Compare Agile and Waterfall for a small team project. Which one would you choose and why?' },
  { MessageID: 8, DateAndTime: ISODate('2026-09-05T09:25:00Z'), Username: 'arahman17', Contents: 'I would pick Agile because our requirements keep changing every week.' },
  { MessageID: 9, DateAndTime: ISODate('2026-09-05T09:40:00Z'), Username: 'dkim41', Contents: 'Waterfall still helps for the documentation phase at the start.' },
  { MessageID: 10, DateAndTime: ISODate('2026-09-05T09:55:00Z'), Username: 'jdoe23', Contents: 'A hybrid works best: plan the scope up front, then build in short sprints.' },
])

// Which message belongs to which discussion, with its entry number
db.DiscussionToMessage.insertMany([
  { DicussionID: 1, MessageID: 1, EntryNo: '1.1' },
  { DicussionID: 2, MessageID: 2, EntryNo: '2.1' },
  { DicussionID: 2, MessageID: 3, EntryNo: '2.2' },
  { DicussionID: 3, MessageID: 4, EntryNo: '3.1' },
  { DicussionID: 3, MessageID: 5, EntryNo: '3.2' },
  { DicussionID: 4, MessageID: 6, EntryNo: '4.1' },
  { DicussionID: 5, MessageID: 7, EntryNo: '5.1' },
  { DicussionID: 5, MessageID: 8, EntryNo: '5.2' },
  { DicussionID: 5, MessageID: 9, EntryNo: '5.3' },
  { DicussionID: 5, MessageID: 10, EntryNo: '5.4' },
])

// Discussion 4 is archived. FileData holds the text "Archived discussion 4".
db.ArchivedDicussions.insertOne({
  DiscussionID: 4,
  FileName: 'discussion-4.txt',
  FileType: 'txt',
  FileData: BinData(0, 'QXJjaGl2ZWQgZGlzY3Vzc2lvbiA0'),
  ArchivedAt: ISODate('2026-09-20T12:00:00Z'),
})

// A student asking to retrieve the archived discussion
db.RequestToRetrieveDiscussion.insertOne({
  StudentID: 1,
  Topic: 'Previous semester project examples',
  DiscussionID: 4,
  Status: 'PENDING',
  RequestedAt: ISODate('2026-10-05T12:00:00Z'),
})

// ---------------------------------------------------------------------
// PART 4: CHECK THE RESULT
// ---------------------------------------------------------------------

print('\n=== Collections and number of entries ===')
db.getCollectionNames().sort().forEach((name) => {
  print(name.padEnd(30) + db.getCollection(name).countDocuments())
})

print('\n=== Entries in discussion 5 (browse all entries in a discussion) ===')
const links = db.DiscussionToMessage.find({ DicussionID: 5 }).sort({ MessageID: 1 }).toArray()
const messages = db.Message.find({ MessageID: { $in: links.map((l) => l.MessageID) } }).toArray()
links.forEach((link) => {
  const m = messages.find((x) => x.MessageID === link.MessageID)
  print(link.EntryNo + '  ' + m.Username + ': ' + m.Contents)
})

print('\n=== Archived discussions ===')
db.ArchivedDicussions.find({}, { _id: 0, DiscussionID: 1, FileName: 1, ArchivedAt: 1 }).forEach((a) => printjson(a))
