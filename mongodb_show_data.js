// Shows what is stored in MongoDB (use it during the demo and after the Postman test).
// Run:  mongosh "mongodb://localhost:27017" mongodb_show_data.js

db = db.getSiblingDB('discussion_tool')

print('\n=== 1. Collections and number of documents ===')
db.getCollectionNames().sort().forEach((name) => {
  print(name.padEnd(30) + db.getCollection(name).countDocuments())
})

print('\n=== 2. One document from each main collection ===')
;['StudentRecord', 'Dicussion', 'Message', 'DiscussionToMessage'].forEach((name) => {
  print('--- ' + name)
  printjson(db.getCollection(name).findOne({}, { _id: 0 }))
})

print('\n=== 3. The newest student (made by the Postman test) ===')
db.StudentRecord.find({}, { _id: 0 }).sort({ StudentID: -1 }).limit(1).forEach((s) => printjson(s))

print('\n=== 4. The two newest discussions ===')
const newest = db.Dicussion.find({}, { _id: 0 }).sort({ DiscussionID: -1 }).limit(2).toArray()
newest.forEach((d) => printjson(d))

print('\n=== 5. Every entry of those discussions: EntryNo, MessageID, user, text ===')
const ids = newest.map((d) => d.DiscussionID)
db.DiscussionToMessage.find({ DicussionID: { $in: ids } }).sort({ DicussionID: 1, MessageID: 1 }).forEach((link) => {
  const m = db.Message.findOne({ MessageID: link.MessageID })
  print(link.EntryNo.padEnd(7) + ' MessageID ' + String(link.MessageID).padEnd(5) + m.Username.padEnd(14) + m.Contents)
})

print('\n=== 6. Proof that Message IDs are distinct ===')
const total = db.Message.countDocuments()
const distinct = db.Message.distinct('MessageID').length
print(total + ' messages, ' + distinct + ' distinct MessageIDs  ->  ' + (total === distinct ? 'ALL DISTINCT' : 'PROBLEM'))
