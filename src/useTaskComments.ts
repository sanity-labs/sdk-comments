import type {CommentsState} from './internal/core'

import {TASK_COMMENTS_QUERY} from './queries'
import {requireRuntimeValue, useResolvedAddonRuntime} from './runtime'
import {useCommentsState} from './useCommentsState'
import {useSanityCommentsQuery} from './useSanityCommentsQuery'

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
