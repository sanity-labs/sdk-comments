import type {CommentsState} from './internal/core/index.js'

import {TASK_COMMENTS_QUERY} from './queries.js'
import {requireRuntimeValue, useResolvedAddonRuntime} from './runtime.js'
import {useCommentsState} from './useCommentsState.js'
import {useSanityCommentsQuery} from './useSanityCommentsQuery.js'

interface UseTaskCommentsArgs {
  addonDataset?: string
  projectId?: string
  query?: string
  taskId: string
}

export function useTaskComments({
  addonDataset: addonDatasetOverride,
  projectId: projectIdOverride,
  query = TASK_COMMENTS_QUERY,
  taskId,
}: UseTaskCommentsArgs): CommentsState {
  const {addonDataset, projectId} = useResolvedAddonRuntime({
    addonDataset: addonDatasetOverride,
    projectId: projectIdOverride,
  })
  const {isPending, serverComments} = useSanityCommentsQuery({
    dataset: requireRuntimeValue(addonDataset, 'Addon dataset'),
    params: {taskId},
    projectId: requireRuntimeValue(projectId, 'Project ID'),
    query,
  })

  return useCommentsState(serverComments, {isPending})
}
