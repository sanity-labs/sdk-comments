import {buildSanityDocumentComment, buildSanityTaskComment} from './builders.js'
import type {CommentHandle} from './handles.js'
import type {
  CommentMessage,
  CommentReaction,
  CommentStatus,
} from './internal/core/index.js'
import type {CommentDocument} from './internal/core/index.js'
import type {AddonCreateMutation, AddonDeleteMutation, AddonPatchOperation} from './runtime.js'

export interface CreateCommentActionArgs {
  authorId: string
  contentDataset: string
  documentId: string
  documentTitle: string
  documentType: string
  fieldPath?: string
  message: CommentMessage
  parentCommentId?: string
  projectId: string
  studioBaseUrl?: string
  threadId?: string
  workspaceId?: string
  workspaceTitle?: string
}

export interface CreateTaskCommentActionArgs {
  authorId: string
  message: CommentMessage
  parentCommentId?: string
  subscribers?: string[]
  taskId: string
  taskStudioUrl?: string
  taskTitle?: string
  threadId?: string
  workspaceId?: string
  workspaceTitle?: string
}

interface ToggleReactionActionArgs {
  currentReactions: CommentReaction[]
  currentUserId: string
  shortName: string
}

type CommentCreateDocument = Omit<CommentDocument, '_createdAt' | '_rev' | '_updatedAt'>

interface CommentActionBase {
  handle: CommentHandle
}

interface CreateCommentAction extends AddonCreateMutation<CommentCreateDocument>, CommentActionBase {
  actionType: 'createComment'
}

interface DeleteCommentAction extends AddonDeleteMutation, CommentActionBase {
  actionType: 'deleteComment'
}

interface PatchCommentAction extends CommentActionBase {
  actionType: 'patchComment'
  documentId: string
  mutationType: 'patch'
  operations: AddonPatchOperation[]
}

export function createComment(handle: CommentHandle, args: CreateCommentActionArgs) {
  return {
    actionType: 'createComment' as const,
    document: toCommentCreateDocument(
      buildSanityDocumentComment({
        authorId: args.authorId,
        commentId: handle.documentId,
        contentDataset: args.contentDataset,
        documentId: args.documentId,
        documentTitle: args.documentTitle,
        documentType: args.documentType,
        fieldPath: args.fieldPath,
        message: args.message,
        parentCommentId: args.parentCommentId,
        projectId: args.projectId,
        studioBaseUrl: args.studioBaseUrl,
        threadId: args.threadId,
        workspaceId: args.workspaceId,
        workspaceTitle: args.workspaceTitle,
      }),
    ),
    handle,
    mutationType: 'create' as const,
  } satisfies CreateCommentAction
}

export function createTaskComment(handle: CommentHandle, args: CreateTaskCommentActionArgs) {
  return {
    actionType: 'createComment' as const,
    document: toCommentCreateDocument(
      buildSanityTaskComment({
        authorId: args.authorId,
        commentId: handle.documentId,
        message: args.message,
        parentCommentId: args.parentCommentId,
        subscribers: args.subscribers,
        taskId: args.taskId,
        taskStudioUrl: args.taskStudioUrl,
        taskTitle: args.taskTitle,
        threadId: args.threadId,
        workspaceId: args.workspaceId,
        workspaceTitle: args.workspaceTitle,
      }),
    ),
    handle,
    mutationType: 'create' as const,
  } satisfies CreateCommentAction
}

export function editComment(handle: CommentHandle, message: CommentMessage) {
  return patchComment(
    handle,
    [
      {
        type: 'set',
        value: {message},
      },
    ],
    {
      stampLastEditedAt: true,
    },
  )
}

export function setCommentStatus(handle: CommentHandle, status: CommentStatus) {
  return patchComment(handle, [
    {
      type: 'set',
      value: {status},
    },
  ])
}

export function deleteComment(handle: CommentHandle) {
  return {
    actionType: 'deleteComment' as const,
    documentId: handle.documentId,
    handle,
    mutationType: 'delete' as const,
  } satisfies DeleteCommentAction
}

export function patchComment(
  handle: CommentHandle,
  operations: AddonPatchOperation[],
  {stampLastEditedAt = false}: {stampLastEditedAt?: boolean} = {},
) {
  return {
    actionType: 'patchComment' as const,
    documentId: handle.documentId,
    handle,
    mutationType: 'patch' as const,
    operations: stampLastEditedAt
      ? [
          ...operations,
          {
            type: 'set',
            value: {lastEditedAt: new Date().toISOString()},
          },
        ]
      : operations,
  } satisfies PatchCommentAction
}

export function toggleReaction(handle: CommentHandle, args: ToggleReactionActionArgs) {
  const existingReaction = args.currentReactions.find(
    (reaction) =>
      reaction.shortName === args.shortName && reaction.userId === args.currentUserId,
  )

  if (existingReaction) {
    return patchComment(handle, [
      {
        paths: [`reactions[_key=="${existingReaction._key}"]`],
        type: 'unset',
      },
    ])
  }

  const reaction: CommentReaction = {
    _key: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
    addedAt: new Date().toISOString(),
    shortName: args.shortName,
    userId: args.currentUserId,
  }

  return patchComment(handle, [
    {
      type: 'setIfMissing',
      value: {reactions: []},
    },
    {
      items: [reaction],
      position: 'after',
      selector: 'reactions[-1]',
      type: 'insert',
    },
  ])
}

export type CommentAction = CreateCommentAction | DeleteCommentAction | PatchCommentAction

function toCommentCreateDocument(document: CommentDocument): CommentCreateDocument {
  const {_createdAt: _ignoredCreatedAt, _rev: _ignoredRev, _updatedAt: _ignoredUpdatedAt, ...next} =
    document
  return next
}
