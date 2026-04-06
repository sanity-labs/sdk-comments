import {
  buildCommentDocument,
  buildCommentTarget,
  buildMessageFromPlainText,
} from '../src/internal/core'
import {act, renderHook} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

import {useCommentsState} from '../src/useCommentsState'

function createComment(commentId: string, text: string) {
  return buildCommentDocument({
    authorId: 'user-1',
    commentId,
    message: buildMessageFromPlainText(text),
    target: buildCommentTarget({
      contentDataset: 'content',
      documentId: 'doc-1',
      documentType: 'article',
      projectId: 'project-1',
    }),
  })
}

describe('useCommentsState', () => {
  it('merges optimistic comments with server comments', () => {
    const serverComment = createComment('server-comment', 'Server comment')
    const optimisticComment = createComment('optimistic-comment', 'Optimistic comment')

    const {result} = renderHook(() => useCommentsState([serverComment], {isPending: false}))

    act(() => {
      result.current.addOptimisticComment(optimisticComment)
    })

    expect(result.current.comments.map((comment) => comment._id)).toEqual([
      'server-comment',
      'optimistic-comment',
    ])
  })

  it('applies optimistic edits until the server catches up', () => {
    const serverComment = createComment('comment-1', 'Before')
    const editedMessage = buildMessageFromPlainText('After')
    const editedAt = '2026-04-06T12:00:00.000Z'

    const {result, rerender} = renderHook(
      ({comments}) => useCommentsState(comments, {isPending: false}),
      {
        initialProps: {comments: [serverComment]},
      },
    )

    act(() => {
      result.current.editOptimisticComment(serverComment._id, editedMessage, editedAt)
    })

    expect(result.current.comments[0]?.message).toEqual(editedMessage)

    rerender({
      comments: [{...serverComment, lastEditedAt: editedAt, message: editedMessage}],
    })

    expect(result.current.comments[0]?.message).toEqual(editedMessage)
  })
})
