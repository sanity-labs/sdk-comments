import {useDocument} from '@sanity/sdk-react'
import {useCallback, useMemo} from 'react'

import {patchComment} from './actions.js'
import {isCommentHandle, resolveCommentHandle, type CommentHandle} from './handles.js'
import type {CommentDocument} from './internal/core/index.js'
import {type AddonPatchOperation, useResolvedAddonRuntime} from './runtime.js'
import {useApplyCommentActions} from './useSanityCommentMutations.js'

interface UseEditCommentByIdArgs {
  addonDataset?: string
  commentId: string
  path?: string
  projectId?: string
}

type UseEditCommentArgs = CommentHandle | UseEditCommentByIdArgs

const IGNORED_KEYS = ['_createdAt', '_id', '_rev', '_type', '_updatedAt']

type Updater<TValue> = TValue | ((currentValue: TValue) => TValue)

export function useEditComment<TData = CommentDocument>(args: UseEditCommentArgs) {
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

  const path = isCommentHandle(args) ? undefined : args.path
  const documentOptions = useMemo(() => (path ? {...handle, path} : handle), [handle, path])
  const {data: currentValue} = useDocument<TData>(documentOptions)
  const applyCommentActions = useApplyCommentActions({
    addonDataset: runtime.addonDataset,
    projectId: runtime.projectId,
  })

  return useCallback(
    async (updater: Updater<TData>) => {
      const nextValue =
        typeof updater === 'function'
          ? (updater as (value: TData) => TData)(currentValue as TData)
          : updater

      if (path) {
        const operations: AddonPatchOperation[] =
          nextValue === undefined
            ? [{paths: [path], type: 'unset'}]
            : [{type: 'set', value: {[path]: nextValue}}]

        return await applyCommentActions(patchComment(handle, operations, {stampLastEditedAt: true}))
      }

      if (typeof nextValue !== 'object' || !nextValue) {
        throw new Error(
          'No path was provided to `useEditComment` and the value provided was not a document object.',
        )
      }

      const currentDocument = currentValue as Record<string, unknown> | null | undefined
      const nextDocument = nextValue as Record<string, unknown>
      const operations: AddonPatchOperation[] = []
      const setValues: Record<string, unknown> = {}
      const unsetPaths: string[] = []

      for (const key of Object.keys({...currentDocument, ...nextDocument})) {
        if (IGNORED_KEYS.includes(key)) continue

        const hasNextValue = key in nextDocument
        const previousValue = currentDocument?.[key]
        const candidateValue = nextDocument[key]

        if (previousValue === candidateValue) continue

        if (hasNextValue) {
          setValues[key] = candidateValue
        } else {
          unsetPaths.push(key)
        }
      }

      if (Object.keys(setValues).length > 0) {
        operations.push({type: 'set', value: setValues})
      }

      if (unsetPaths.length > 0) {
        operations.push({paths: unsetPaths, type: 'unset'})
      }

      if (operations.length === 0) {
        return undefined
      }

      return await applyCommentActions(
        patchComment(handle, operations, {stampLastEditedAt: true}),
      )
    },
    [applyCommentActions, currentValue, handle, path],
  )
}
