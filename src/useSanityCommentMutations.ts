import type {
  CommentMessage,
  CommentMutationApi,
  CommentReaction,
  CommentStatus,
} from './internal/core'
import {useClient} from '@sanity/sdk-react'
import {useCallback, useMemo} from 'react'

import {buildSanityDocumentComment, buildSanityTaskComment} from './builders'
import {requireRuntimeValue, useResolvedAddonRuntime} from './runtime'

interface CreateDocumentCommentArgs {
  commentId?: string
  documentId: string
  documentTitle: string
  documentType: string
  fieldPath?: string
  message: CommentMessage
  parentCommentId?: string
  threadId?: string
}

interface CreateTaskCommentArgs {
  commentId?: string
  message: CommentMessage
  parentCommentId?: string
  subscribers?: string[]
  taskId: string
  taskStudioUrl?: string
  taskTitle?: string
  threadId?: string
}

interface UseApplyCommentActionsOptions {
  addonDataset?: string
  apiVersion?: string
  contentDataset?: string
  currentUserId?: string
  projectId?: string
  studioBaseUrl?: string
  workspaceId?: string
  workspaceTitle?: string
}

interface ApplyCommentActionsApi extends CommentMutationApi {
  createComment: (args: CreateDocumentCommentArgs) => Promise<unknown>
  createTaskComment: (args: CreateTaskCommentArgs) => Promise<unknown>
}

export function useApplyCommentActions({
  addonDataset: addonDatasetOverride,
  apiVersion = '2025-05-06',
  contentDataset: contentDatasetOverride,
  currentUserId,
  projectId: projectIdOverride,
  studioBaseUrl,
  workspaceId: workspaceIdOverride,
  workspaceTitle: workspaceTitleOverride,
}: UseApplyCommentActionsOptions = {}): ApplyCommentActionsApi {
  const {addonDataset, contentDataset, projectId, workspaceId, workspaceTitle} =
    useResolvedAddonRuntime({
      addonDataset: addonDatasetOverride,
      contentDataset: contentDatasetOverride,
      projectId: projectIdOverride,
      workspaceId: workspaceIdOverride,
      workspaceTitle: workspaceTitleOverride,
    })
  const baseClient = useClient({apiVersion})

  const client = useMemo(
    () =>
      baseClient.withConfig({
        dataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
        projectId: requireRuntimeValue(projectId, 'Project ID'),
      }),
    [addonDataset, baseClient, projectId],
  )

  const createComment = useCallback(
    async ({
      commentId,
      documentId,
      documentTitle,
      documentType,
      fieldPath,
      message,
      parentCommentId,
      threadId,
    }: CreateDocumentCommentArgs) => {
      if (!contentDataset) {
        throw new Error('Addon content dataset is not configured')
      }

      const resolvedProjectId = requireRuntimeValue(projectId, 'Project ID')
      const authorId = currentUserId ?? 'unknown'
      const comment = buildSanityDocumentComment({
        authorId,
        commentId,
        contentDataset,
        documentId,
        documentTitle,
        documentType,
        fieldPath,
        message,
        parentCommentId,
        projectId: resolvedProjectId,
        studioBaseUrl,
        threadId,
        workspaceId,
        workspaceTitle,
      })

      try {
        return await client.create(comment)
      } catch (error) {
        console.error('[useApplyCommentActions] createComment failed:', error)
        throw error
      }
    },
    [client, contentDataset, currentUserId, projectId, studioBaseUrl, workspaceId, workspaceTitle],
  )

  const createTaskComment = useCallback(
    async ({
      commentId,
      message,
      parentCommentId,
      subscribers,
      taskId,
      taskStudioUrl,
      taskTitle,
      threadId,
    }: CreateTaskCommentArgs) => {
      const authorId = currentUserId ?? 'unknown'
      const comment = buildSanityTaskComment({
        authorId,
        commentId,
        message,
        parentCommentId,
        subscribers,
        taskId,
        taskStudioUrl,
        taskTitle,
        threadId,
        workspaceId,
        workspaceTitle,
      })

      try {
        return await client.create(comment)
      } catch (error) {
        console.error('[useApplyCommentActions] createTaskComment failed:', error)
        throw error
      }
    },
    [client, currentUserId, workspaceId, workspaceTitle],
  )

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        return await client.delete(commentId)
      } catch (error) {
        console.error(`[useApplyCommentActions] deleteComment failed (${commentId}):`, error)
        throw error
      }
    },
    [client],
  )

  const editComment = useCallback(
    async (commentId: string, message: CommentMessage) => {
      try {
        return await client
          .patch(commentId)
          .set({lastEditedAt: new Date().toISOString(), message})
          .commit()
      } catch (error) {
        console.error(`[useApplyCommentActions] editComment failed (${commentId}):`, error)
        throw error
      }
    },
    [client],
  )

  const setCommentStatus = useCallback(
    async (commentId: string, status: CommentStatus) => {
      try {
        return await client.patch(commentId).set({status}).commit()
      } catch (error) {
        console.error(`[useApplyCommentActions] setCommentStatus failed (${commentId}):`, error)
        throw error
      }
    },
    [client],
  )

  const toggleReaction = useCallback(
    async (commentId: string, shortName: string, currentReactions: CommentReaction[]) => {
      const userId = currentUserId ?? 'unknown'
      const existing = currentReactions.find(
        (reaction) => reaction.shortName === shortName && reaction.userId === userId,
      )

      try {
        if (existing) {
          return await client
            .patch(commentId)
            .unset([`reactions[_key=="${existing._key}"]`])
            .commit()
        }

        const reaction: CommentReaction = {
          _key: crypto.randomUUID().replace(/-/g, '').slice(0, 12),
          addedAt: new Date().toISOString(),
          shortName,
          userId,
        }

        return await client
          .patch(commentId)
          .setIfMissing({reactions: []})
          .append('reactions', [reaction])
          .commit()
      } catch (error) {
        console.error(`[useApplyCommentActions] toggleReaction failed (${commentId}):`, error)
        throw error
      }
    },
    [client, currentUserId],
  )

  return {
    createComment,
    createTaskComment,
    deleteComment,
    editComment,
    setCommentStatus,
    toggleReaction,
  }
}
