import type {CommentsState} from './internal/core'

import {COMMENTS_BY_DOCUMENT_QUERY} from './queries'
import {requireRuntimeValue, useResolvedAddonRuntime} from './runtime'
import {useCommentsState} from './useCommentsState'
import {useSanityCommentsQuery} from './useSanityCommentsQuery'

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
