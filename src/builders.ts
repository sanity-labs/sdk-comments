import {
  buildCommentDocument,
  buildCommentNotificationContext,
  buildCommentTarget,
  buildStudioCommentUrl,
  buildTaskCommentDocument,
} from './internal/core/index.js'

interface BuildSanityDocumentCommentArgs {
  authorId: string
  commentId?: string
  contentDataset: string
  currentThreadLength?: number
  documentId: string
  documentTitle?: string
  documentType: string
  fieldPath?: string
  message: Parameters<typeof buildCommentDocument>[0]['message']
  parentCommentId?: string
  projectId: string
  status?: 'open' | 'resolved'
  studioBaseUrl?: string
  threadId?: string
  workspaceId?: string
  workspaceTitle?: string
}

export function buildSanityDocumentComment({
  authorId,
  commentId,
  contentDataset,
  currentThreadLength,
  documentId,
  documentTitle,
  documentType,
  fieldPath,
  message,
  parentCommentId,
  projectId,
  status,
  studioBaseUrl,
  threadId,
  workspaceId,
  workspaceTitle,
}: BuildSanityDocumentCommentArgs) {
  const id = commentId ?? crypto.randomUUID()

  return buildCommentDocument({
    authorId,
    commentId: id,
    context: buildCommentNotificationContext({
      currentThreadLength: currentThreadLength ?? (parentCommentId ? 2 : 1),
      documentTitle: documentTitle ?? '',
      payload: {workspace: workspaceId ?? ''},
      url: studioBaseUrl
        ? buildStudioCommentUrl({
            commentId: id,
            documentId,
            documentType,
            studioBaseUrl,
            workspaceName: workspaceId,
          })
        : undefined,
      workspaceName: workspaceId ?? '',
      workspaceTitle: workspaceTitle ?? '',
    }),
    message,
    parentCommentId,
    status,
    target: buildCommentTarget({
      contentDataset,
      documentId,
      documentType,
      fieldPath,
      projectId,
    }),
    threadId,
  })
}

export {buildStudioCommentUrl, buildTaskCommentDocument as buildSanityTaskComment}
