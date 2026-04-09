import {useDocuments} from '@sanity/sdk-react'
import {useMemo} from 'react'

import {createCommentHandle, type CommentHandle} from './handles.js'
import {requireRuntimeValue, useResolvedAddonRuntime} from './runtime.js'

interface UseCommentsArgs {
  addonDataset?: string
  batchSize?: number
  documentId?: string
  filter?: string
  orderings?: Array<{direction: 'asc' | 'desc'; field: string}>
  params?: Record<string, unknown>
  projectId?: string
  search?: string
  taskId?: string
}

export function useComments({
  addonDataset: addonDatasetOverride,
  batchSize,
  documentId,
  filter,
  orderings = [{field: '_createdAt', direction: 'desc'}],
  params,
  projectId: projectIdOverride,
  search,
  taskId,
}: UseCommentsArgs = {}) {
  const {addonDataset, projectId} = useResolvedAddonRuntime({
    addonDataset: addonDatasetOverride,
    projectId: projectIdOverride,
  })

  const cleanDocumentId = documentId?.replace(/^drafts\./, '')

  const combinedFilter = useMemo(() => {
    const clauses = ['!defined(parentCommentId)']
    if (cleanDocumentId) {
      clauses.push('target.document._ref == $documentId')
      clauses.push('target.documentType != "tasks.task"')
    }
    if (taskId) {
      clauses.push('target.documentType == "tasks.task"')
      clauses.push('target.document._ref == $taskId')
    }
    if (filter) {
      clauses.push(`(${filter})`)
    }
    return clauses.join(' && ')
  }, [cleanDocumentId, filter, taskId])

  const combinedParams = useMemo(
    () => ({
      ...params,
      ...(cleanDocumentId ? {documentId: cleanDocumentId} : {}),
      ...(taskId ? {taskId} : {}),
    }),
    [cleanDocumentId, params, taskId],
  )

  const response = useDocuments({
    batchSize,
    dataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
    documentType: 'comment',
    filter: combinedFilter,
    orderings,
    params: combinedParams,
    projectId: requireRuntimeValue(projectId, 'Project ID'),
    search,
  })

  const data = useMemo<CommentHandle[]>(
    () =>
      response.data.map((comment) =>
        createCommentHandle({
          addonDataset: comment.dataset ?? addonDataset,
          commentId: comment.documentId,
          projectId: comment.projectId ?? projectId,
        }),
      ),
    [addonDataset, projectId, response.data],
  )

  return {
    ...response,
    data,
  }
}
