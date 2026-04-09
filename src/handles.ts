import type {DocumentHandle} from '@sanity/sdk-react'

export type CommentHandle<TDataset extends string = string, TProjectId extends string = string> =
  DocumentHandle<'comment', TDataset, TProjectId>

interface CreateCommentHandleArgs<TDataset extends string = string, TProjectId extends string = string> {
  addonDataset?: TDataset
  commentId: string
  projectId?: TProjectId
}

interface CommentHandleLookupArgs<TDataset extends string = string, TProjectId extends string = string> {
  addonDataset?: TDataset
  commentId: string
  projectId?: TProjectId
}

export function createCommentHandle<
  TDataset extends string = string,
  TProjectId extends string = string,
>({addonDataset, commentId, projectId}: CreateCommentHandleArgs<TDataset, TProjectId>) {
  return {
    dataset: addonDataset,
    documentId: commentId,
    documentType: 'comment' as const,
    liveEdit: true,
    projectId,
  } satisfies CommentHandle<TDataset, TProjectId>
}

export function isCommentHandle(
  value: CommentHandle | CommentHandleLookupArgs,
): value is CommentHandle<string, string> {
  return (
    typeof (value as CommentHandle).documentId === 'string' &&
    (value as CommentHandle).documentType === 'comment'
  )
}

export function resolveCommentHandle(
  value: CommentHandle | CommentHandleLookupArgs,
  fallback?: {addonDataset?: string; projectId?: string},
): CommentHandle<string, string> {
  if (isCommentHandle(value)) {
    return {
      ...value,
      liveEdit: value.liveEdit ?? true,
    }
  }

  return createCommentHandle({
    addonDataset: value.addonDataset ?? fallback?.addonDataset,
    commentId: value.commentId,
    projectId: value.projectId ?? fallback?.projectId,
  })
}
