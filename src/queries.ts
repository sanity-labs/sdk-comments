export const COMMENTS_BY_DOCUMENT_QUERY = `*[
  _type == "comment"
  && target.document._ref == $documentId
]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  authorId,
  message,
  status,
  threadId,
  parentCommentId,
  lastEditedAt,
  reactions,
  target
} | order(_createdAt asc)`

export const COMMENTS_BY_DOC_QUERY = COMMENTS_BY_DOCUMENT_QUERY

export const TASK_COMMENTS_QUERY = `*[
  _type == "comment"
  && target.documentType == "tasks.task"
  && target.document._ref == $taskId
]{
  _id,
  _type,
  _createdAt,
  _updatedAt,
  authorId,
  message,
  status,
  threadId,
  parentCommentId,
  lastEditedAt,
  reactions,
  subscribers,
  context,
  target
} | order(_createdAt asc)`
