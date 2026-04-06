import type {CommentDocument} from './internal/core'
import {useQuery} from '@sanity/sdk-react'

interface UseSanityCommentsQueryArgs {
  dataset: string
  params: Record<string, unknown>
  projectId: string
  query: string
}

export function useSanityCommentsQuery({
  dataset,
  params,
  projectId,
  query,
}: UseSanityCommentsQueryArgs) {
  const {data, isPending} = useQuery<CommentDocument[]>({
    dataset,
    params,
    projectId,
    query,
  })

  return {
    isPending,
    serverComments: data ?? [],
  }
}
