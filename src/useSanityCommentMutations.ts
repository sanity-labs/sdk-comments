import type {
  CommentMessage,
  CommentMutationApi,
  CommentReaction,
  CommentStatus,
} from './internal/core/index.js'
import {useCallback, useMemo} from 'react'

import {
  createComment as createCommentAction,
  createTaskComment as createTaskCommentAction,
  deleteComment as deleteCommentAction,
  editComment as editCommentAction,
  setCommentStatus as setCommentStatusAction,
  toggleReaction as toggleReactionAction,
  type CommentAction,
} from './actions.js'
import {createCommentHandle} from './handles.js'
import {requireRuntimeValue, useAddonMutationClient, useResolvedAddonRuntime} from './runtime.js'

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
  (action: CommentAction | CommentAction[]): Promise<unknown>
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
  const mutationClient = useAddonMutationClient({
    addonDataset,
    apiVersion,
    projectId,
  })

  const dispatch = useCallback(
    async (actionOrActions: CommentAction | CommentAction[]) => {
      const runtime = {
        addonDataset,
        contentDataset,
        currentUserId: currentUserId ?? 'unknown',
        projectId,
        studioBaseUrl,
        workspaceId,
        workspaceTitle,
      }

      console.debug('[sdk-comments/useApplyCommentActions] dispatch:start', {
        actions: Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions],
        runtime,
      })

      try {
        const result = await mutationClient.execute(actionOrActions)
        console.debug('[sdk-comments/useApplyCommentActions] dispatch:success', {
          actions: Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions],
          result,
          runtime,
        })
        return result
      } catch (error) {
        console.error('[sdk-comments/useApplyCommentActions] dispatch:failed', {
          actions: Array.isArray(actionOrActions) ? actionOrActions : [actionOrActions],
          error,
          runtime,
        })
        throw error
      }
    },
    [
      addonDataset,
      contentDataset,
      currentUserId,
      mutationClient,
      projectId,
      studioBaseUrl,
      workspaceId,
      workspaceTitle,
    ],
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

      const handle = createCommentHandle({
        addonDataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
        commentId: commentId ?? crypto.randomUUID(),
        projectId: requireRuntimeValue(projectId, 'Project ID'),
      })

      return await dispatch(
        createCommentAction(handle, {
          authorId: currentUserId ?? 'unknown',
          contentDataset: requireRuntimeValue(contentDataset, 'Content dataset'),
          documentId,
          documentTitle,
          documentType,
          fieldPath,
          message,
          parentCommentId,
          projectId: requireRuntimeValue(projectId, 'Project ID'),
          studioBaseUrl,
          threadId,
          workspaceId,
          workspaceTitle,
        }),
      )
    },
    [
      addonDataset,
      contentDataset,
      currentUserId,
      dispatch,
      projectId,
      studioBaseUrl,
      workspaceId,
      workspaceTitle,
    ],
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
      const handle = createCommentHandle({
        addonDataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
        commentId: commentId ?? crypto.randomUUID(),
        projectId: requireRuntimeValue(projectId, 'Project ID'),
      })

      return await dispatch(
        createTaskCommentAction(handle, {
          authorId: currentUserId ?? 'unknown',
          message,
          parentCommentId,
          subscribers,
          taskId,
          taskStudioUrl,
          taskTitle,
          threadId,
          workspaceId,
          workspaceTitle,
        }),
      )
    },
    [addonDataset, currentUserId, dispatch, projectId, workspaceId, workspaceTitle],
  )

  const deleteComment = useCallback(
    async (commentId: string) =>
      await dispatch(
        deleteCommentAction(
          createCommentHandle({
            addonDataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
            commentId,
            projectId: requireRuntimeValue(projectId, 'Project ID'),
          }),
        ),
      ),
    [addonDataset, dispatch, projectId],
  )

  const editComment = useCallback(
    async (commentId: string, message: CommentMessage) =>
      await dispatch(
        editCommentAction(
          createCommentHandle({
            addonDataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
            commentId,
            projectId: requireRuntimeValue(projectId, 'Project ID'),
          }),
          message,
        ),
      ),
    [addonDataset, dispatch, projectId],
  )

  const setCommentStatus = useCallback(
    async (commentId: string, status: CommentStatus) =>
      await dispatch(
        setCommentStatusAction(
          createCommentHandle({
            addonDataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
            commentId,
            projectId: requireRuntimeValue(projectId, 'Project ID'),
          }),
          status,
        ),
      ),
    [addonDataset, dispatch, projectId],
  )

  const toggleReaction = useCallback(
    async (commentId: string, shortName: string, currentReactions: CommentReaction[]) =>
      await dispatch(
        toggleReactionAction(
          createCommentHandle({
            addonDataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
            commentId,
            projectId: requireRuntimeValue(projectId, 'Project ID'),
          }),
          {
            currentReactions,
            currentUserId: currentUserId ?? 'unknown',
            shortName,
          },
        ),
      ),
    [addonDataset, currentUserId, dispatch, projectId],
  )

  return useMemo(
    () =>
      Object.assign(dispatch, {
        createComment,
        createTaskComment,
        deleteComment,
        editComment,
        setCommentStatus,
        toggleReaction,
      }),
    [
      createComment,
      createTaskComment,
      deleteComment,
      dispatch,
      editComment,
      setCommentStatus,
      toggleReaction,
    ],
  ) as ApplyCommentActionsApi
}
