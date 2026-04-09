import {useQuery} from '@sanity/sdk-react'
import {useMemo} from 'react'

import {
  buildCommentThreads,
  type CommentDocument,
  type CommentThread,
} from './internal/core/index.js'
import {COMMENTS_BY_THREAD_QUERY} from './queries.js'
import {requireRuntimeValue, useResolvedAddonRuntime} from './runtime.js'

interface UseCommentThreadArgs {
  addonDataset?: string
  commentId?: string
  projectId?: string
  query?: string
  threadId?: string
}

export function useCommentThread({
  addonDataset: addonDatasetOverride,
  commentId,
  projectId: projectIdOverride,
  query = COMMENTS_BY_THREAD_QUERY,
  threadId,
}: UseCommentThreadArgs) {
  const {addonDataset, projectId} = useResolvedAddonRuntime({
    addonDataset: addonDatasetOverride,
    projectId: projectIdOverride,
  })

  const resolvedThreadId = threadId ?? commentId

  const {data, isPending} = useQuery<CommentDocument[]>({
    dataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
    params: {threadId: requireRuntimeValue(resolvedThreadId, 'Thread ID')},
    projectId: requireRuntimeValue(projectId, 'Project ID'),
    query,
  })

  const thread = useMemo<CommentThread | null>(() => {
    const threads = buildCommentThreads(data ?? [])
    return threads[0] ?? null
  }, [data])

  return {
    data: thread,
    isPending,
  }
}
