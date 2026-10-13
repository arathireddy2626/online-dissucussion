-- Fill file data for archived discussions created before migration 008.
USE discussion_tool;

UPDATE ArchivedDicussions
SET FileName = CONCAT('discussion-', DiscussionID, '.txt'),
    FileType = 'txt',
    FileData = CAST(CONCAT('Archived discussion ', DiscussionID) AS BINARY)
WHERE FileData IS NULL;
