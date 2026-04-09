import type {CommentsState} from './internal/core/index.js'

import {COMMENTS_BY_DOCUMENT_QUERY} from './queries.js'
import {requireRuntimeValue, useResolvedAddonRuntime} from './runtime.js'
import {useCommentsState} from './useCommentsState.js'
import {useSanityCommentsQuery} from './useSanityCommentsQuery.js'

interface UseDocumentCommentsArgs {
  documentId: string
  addonDataset?: string
  projectId?: string
  query?: string
}

export function useDocumentComments({
  documentId,
  addonDataset: addonDatasetOverride,
  projectId: projectIdOverride,
  query = COMMENTS_BY_DOCUMENT_QUERY,
}: UseDocumentCommentsArgs): CommentsState {
  const {addonDataset, projectId} = useResolvedAddonRuntime({
    addonDataset: addonDatasetOverride,
    projectId: projectIdOverride,
  })
  const cleanId = documentId.replace('drafts.', '')
  const {isPending, serverComments} = useSanityCommentsQuery({
    dataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
    params: {documentId: cleanId},
    projectId: requireRuntimeValue(projectId, 'Project ID'),
    query,
  })

  return useCommentsState(serverComments, {isPending})
}
