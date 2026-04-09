export {
  buildMessageFromPlainText,
  buildCommentThreads,
  getCommentThreadsForField,
  groupUnresolvedCommentsByField,
  toPlainText,
} from './internal/core/index.js'
export type {
  CommentDocument,
  CommentMessage,
  CommentReaction,
  CommentStatus,
  CommentThread,
  CommentThreadGroup,
} from './internal/core/index.js'

export type {CommentHandle} from './handles.js'
export {createCommentHandle} from './handles.js'
export {
  createComment,
  createTaskComment,
  deleteComment,
  editComment,
  setCommentStatus,
  toggleReaction,
} from './actions.js'
export type {CommentAction, CreateCommentActionArgs, CreateTaskCommentActionArgs} from './actions.js'
export {useComment} from './useComment.js'
export {useCommentProjection} from './useCommentProjection.js'
export {useComments} from './useComments.js'
export {useDocumentComments} from './useDocumentComments.js'
export {useEditComment} from './useEditComment.js'
export {useCommentThread} from './useCommentThread.js'
export {useTaskComments} from './useTaskComments.js'
export {useApplyCommentActions} from './useSanityCommentMutations.js'
