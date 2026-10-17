// Small test API for the MongoDB version of the Online Discussion Tool.
// It has the SAME routes and answers as the MySQL server (server/index.js),
// so the same Postman collection can test both databases.
// It is NOT connected to the front-end. Postman is the only client.
//
// Start:   npm install   (once)   then   npm start
// Port:    3002
// Needs:   MongoDB running, and mongodb_setup.js already run once.

import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import { MongoClient } from 'mongodb'
import { randomInt } from 'node:crypto'

const port = Number(process.env.PORT || 3002)
const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017'
const dbName = process.env.MONGO_DB || 'discussion_tool'

const client = new MongoClient(mongoUrl)
await client.connect()
const db = client.db(dbName)
const col = (name) => db.collection(name)

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '10mb' }))

// ---------- helpers ----------

// MongoDB has no auto-increment, so the next ID is "highest ID + 1".
const nextId = async (collection, field) => {
  const last = await col(collection).find({}, { projection: { [field]: 1, _id: 0 } }).sort({ [field]: -1 }).limit(1).toArray()
  return (last[0]?.[field] || 0) + 1
}

const pick = (list) => list[randomInt(list.length)]

// 8 characters: letters, digits and special characters, shuffled.
const generatePassword = () => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  const digits = '23456789'
  const specials = '!@#$%^&*'
  const chars = [pick(letters), pick(letters), pick(letters), pick(letters), pick(digits), pick(digits), pick(specials), pick(specials)]
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

// first letter of the first name + last name + two digits (example: jdoe23)
const createUniqueUsername = async (firstname, lastname) => {
  const base = `${firstname.charAt(0)}${lastname}`.toLowerCase().replace(/[^a-z0-9]/g, '')
  for (let attempt = 0; attempt < 200; attempt += 1) {
    const candidate = `${base}${randomInt(10, 100)}`
    if (!(await col('LoginCredential').findOne({ Username: candidate }))) return candidate
  }
  throw new Error('Could not create a unique username.')
}

// Jan-24-2024:11:34:28
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const toKey = (value) => {
  if (!value) return ''
  const date = new Date(value)
  const two = (number) => String(number).padStart(2, '0')
  return `${MONTHS[date.getMonth()]}-${two(date.getDate())}-${date.getFullYear()}:${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}`
}

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// ---------- routes ----------

app.get('/api/health', async (_request, response) => {
  try {
    await db.command({ ping: 1 })
    response.json({ ok: true, database: 'connected', engine: 'mongodb' })
  } catch {
    response.status(503).json({ ok: false, error: 'Database unavailable' })
  }
})

app.post('/api/auth/login', async (request, response) => {
  const username = String(request.body.username || '').trim()
  const password = String(request.body.password || '')
  if (!username || !password) return response.status(400).json({ error: 'Username and password are required.' })

  try {
    const login = await col('LoginCredential').findOne({ Username: { $regex: `^${escapeRegex(username)}$`, $options: 'i' } })
    if (!login || !(await bcrypt.compare(password, login.Password))) {
      return response.status(401).json({ error: 'Invalid username or password.' })
    }
    const student = await col('StudentRecord').findOne({ Username: login.Username })
    const role = login.Role === 'INSTRUCTOR' ? 'Instructor' : 'Student'
    const studentId = student?.StudentID || null
    response.json({
      user: {
        id: studentId || login.Username,
        username: login.Username,
        name: role === 'Instructor' ? 'Dr. Kasi' : `${student?.Firstname || ''} ${student?.Lastname || login.Username}`.trim(),
        studentId,
        email: student?.EmailAddress || '',
        role,
      },
    })
  } catch {
    response.status(500).json({ error: 'Unable to complete login.' })
  }
})

// Student asks to join (or leave) the course
app.post('/api/enrollment-requests', async (request, response) => {
  const studentId = Number(request.body.studentId)
  const type = request.body.type === 'withdrawal' ? 'withdrawal' : 'enrollment'
  if (!studentId) return response.status(400).json({ error: 'Student ID is required.' })

  try {
    if (type === 'enrollment' && request.body.firstname) {
      await col('StudentRecord').insertOne({
        StudentID: studentId,
        Firstname: request.body.firstname,
        Lastname: request.body.lastname,
        EmailAddress: request.body.email,
      })
    }
    const queue = type === 'enrollment' ? 'EnrollQueue' : 'RemoveStudentQueue'
    await col(queue).insertOne({ StudentID: studentId, RequestedAt: new Date() })
    response.status(201).json({ message: 'Request submitted.' })
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: 'You already have a pending request.' })
    response.status(500).json({ error: 'Unable to submit request.' })
  }
})

// Instructor retrieves the waiting requests
app.get('/api/enrollment-requests', async (_request, response) => {
  try {
    const students = await col('StudentRecord').find({}).toArray()
    const byId = new Map(students.map((student) => [student.StudentID, student]))
    const build = (rows, type, prefix) => rows
      .filter((row) => byId.has(row.StudentID))
      .map((row) => {
        const student = byId.get(row.StudentID)
        return {
          id: `${prefix}-${row.StudentID}`, type, studentId: student.StudentID,
          firstname: student.Firstname, lastname: student.Lastname, email: student.EmailAddress,
          status: 'Pending review',
        }
      })
    const enrollments = build(await col('EnrollQueue').find({}).toArray(), 'enrollment', 'enroll')
    const withdrawals = build(await col('RemoveStudentQueue').find({}).toArray(), 'withdrawal', 'withdraw')
    response.json({ requests: [...enrollments, ...withdrawals] })
  } catch {
    response.status(500).json({ error: 'Unable to load enrollment requests.' })
  }
})

// Instructor adds (approves) the student: a login is created and returned
app.post('/api/students/:studentId/credentials', async (request, response) => {
  const studentId = Number(request.params.studentId)
  if (!studentId) return response.status(400).json({ error: 'Student ID is required.' })

  try {
    const student = await col('StudentRecord').findOne({ StudentID: studentId })
    if (!student) return response.status(404).json({ error: 'Student record was not found.' })

    const username = await createUniqueUsername(student.Firstname, student.Lastname)
    const password = generatePassword()
    const passwordHash = await bcrypt.hash(password, 12)

    await col('LoginCredential').insertOne({ Username: username, Password: passwordHash, Role: 'STUDENT' })
    await col('StudentRecord').updateOne({ StudentID: studentId }, { $set: { Username: username } })
    await col('EnrollQueue').deleteOne({ StudentID: studentId })

    console.log(`\n[EMAIL NOT SENT - demo only]\nTo: ${student.EmailAddress}\nUsername: ${username}\nPassword: ${password}\n`)
    response.status(201).json({ username, password, email: student.EmailAddress })
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: 'These login credentials already exist.' })
    response.status(500).json({ error: 'Unable to save student credentials.' })
  }
})

// Instructor creates a discussion (the optional first post becomes entry .1)
app.post('/api/discussions', async (request, response) => {
  const topic = String(request.body.topic || '').trim()
  const content = String(request.body.content || '').trim()
  const username = String(request.body.username || '').trim()
  if (!topic || !username) return response.status(400).json({ error: 'Topic and username are required.' })
  if (topic.length > 80) return response.status(400).json({ error: 'Topic must be 80 characters or fewer.' })

  try {
    const discussionId = await nextId('Dicussion', 'DiscussionID')
    await col('Dicussion').insertOne({
      DiscussionID: discussionId,
      CourseName: 'Software Engineering',
      DateAndTimeOfCreation: new Date(),
      Topic: topic,
    })
    if (content) {
      const messageId = await nextId('Message', 'MessageID')
      await col('Message').insertOne({ MessageID: messageId, DateAndTime: new Date(), Username: username, Contents: content })
      await col('DiscussionToMessage').insertOne({ DicussionID: discussionId, MessageID: messageId, EntryNo: `${discussionId}.1` })
    }
    response.status(201).json({ id: String(discussionId) })
  } catch (error) {
    if (error.code === 11000) return response.status(409).json({ error: 'A discussion was created at the same time. Please try again.' })
    response.status(500).json({ error: 'Unable to create discussion.' })
  }
})

// Instructor or student posts a message to a discussion
app.post('/api/discussions/:discussionId/messages', async (request, response) => {
  const discussionId = Number(request.params.discussionId)
  const username = String(request.body.username || '').trim()
  const content = String(request.body.content || '').trim()
  if (!discussionId || !username || !content) {
    return response.status(400).json({ error: 'Discussion, username, and a message or picture are required.' })
  }

  try {
    if (!(await col('Dicussion').findOne({ DiscussionID: discussionId }))) {
      return response.status(404).json({ error: 'Discussion was not found.' })
    }
    if (await col('ArchivedDicussions').findOne({ DiscussionID: discussionId })) {
      return response.status(409).json({ error: 'Archived discussions cannot receive messages.' })
    }
    const messageId = await nextId('Message', 'MessageID')
    await col('Message').insertOne({ MessageID: messageId, DateAndTime: new Date(), Username: username, Contents: content })

    // entry number = discussion id + "." + (highest entry number so far + 1)
    const links = await col('DiscussionToMessage').find({ DicussionID: discussionId }).toArray()
    const highest = links.reduce((max, link) => Math.max(max, Number(String(link.EntryNo).split('.').pop()) || 0), 0)
    await col('DiscussionToMessage').insertOne({ DicussionID: discussionId, MessageID: messageId, EntryNo: `${discussionId}.${highest + 1}` })

    response.status(201).json({ id: String(messageId) })
  } catch {
    response.status(500).json({ error: 'Unable to post message.' })
  }
})

// Browse all discussions with their entries
app.get('/api/discussions', async (_request, response) => {
  try {
    const discussions = await col('Dicussion').find({}).sort({ DateAndTimeOfCreation: -1 }).toArray()
    const archived = new Set((await col('ArchivedDicussions').find({}).toArray()).map((item) => item.DiscussionID))
    const links = await col('DiscussionToMessage').find({}).toArray()
    const messages = await col('Message').find({ MessageID: { $in: links.map((link) => link.MessageID) } }).toArray()
    const messageById = new Map(messages.map((message) => [message.MessageID, message]))

    const result = discussions
      .filter((discussion) => !archived.has(discussion.DiscussionID))
      .map((discussion) => ({
        id: String(discussion.DiscussionID),
        courseTitle: discussion.CourseName,
        topic: discussion.Topic,
        createdAt: toKey(discussion.DateAndTimeOfCreation),
        archived: false,
        entries: links
          .filter((link) => link.DicussionID === discussion.DiscussionID && messageById.has(link.MessageID))
          .map((link) => ({ link, message: messageById.get(link.MessageID) }))
          .sort((a, b) => a.message.DateAndTime - b.message.DateAndTime || a.message.MessageID - b.message.MessageID)
          .map(({ link, message }) => ({
            id: String(message.MessageID),
            entryNo: link.EntryNo,
            username: message.Username,
            postedAt: toKey(message.DateAndTime),
            content: message.Contents,
            imageName: message.ImageName || null,
            imageUrl: null,
          })),
      }))
    response.json({ discussions: result })
  } catch {
    response.status(500).json({ error: 'Unable to load discussions.' })
  }
})

app.listen(port, () => {
  console.log(`MongoDB test API listening on http://localhost:${port}  (database: ${dbName})`)
})
