import {useDocument} from '@sanity/sdk-react'
import {useMemo} from 'react'

import {isCommentHandle, resolveCommentHandle, type CommentHandle} from './handles.js'
import type {CommentDocument} from './internal/core/index.js'
import {useResolvedAddonRuntime} from './runtime.js'

interface UseCommentByIdArgs {
  addonDataset?: string
  commentId: string
  projectId?: string
}

type UseCommentArgs = CommentHandle | UseCommentByIdArgs

export function useComment<TData = CommentDocument>(args: UseCommentArgs) {
  const runtime = useResolvedAddonRuntime({
    addonDataset: isCommentHandle(args) ? args.dataset : args.addonDataset,
    projectId: isCommentHandle(args) ? args.projectId : args.projectId,
  })

  const handle = useMemo(
    () =>
      resolveCommentHandle(args, {
        addonDataset: runtime.addonDataset,
        projectId: runtime.projectId,
      }),
    [args, runtime.addonDataset, runtime.projectId],
  )

  return useDocument<TData>(handle)
}
