import {useDocumentProjection} from '@sanity/sdk-react'
import {useMemo, type RefObject} from 'react'

import {isCommentHandle, resolveCommentHandle, type CommentHandle} from './handles.js'
import {useResolvedAddonRuntime} from './runtime.js'

interface UseCommentProjectionByIdArgs {
  addonDataset?: string
  commentId: string
  projectId?: string
}

type UseCommentProjectionArgs = (CommentHandle | UseCommentProjectionByIdArgs) & {
  projection: string
  ref?: RefObject<Element | null>
}

export function useCommentProjection<TData extends object>(args: UseCommentProjectionArgs) {
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

  return useDocumentProjection<TData>({
    ...handle,
    projection: args.projection,
    ref: args.ref,
  })
}
