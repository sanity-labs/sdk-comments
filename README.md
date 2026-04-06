# `@sanity-labs/sdk-comments`

React hooks and action APIs for Sanetti comments.

This is the public comments package for apps that already use
[`@sanity/sdk-react`](https://reference.sanity.io/_sanity/sdk-react).

For a minimal end-to-end SDK app setup that combines runtime config, tasks, and
comments, see [`docs/sdk-comments-tasks-app-quickstart.md`](../../docs/sdk-comments-tasks-app-quickstart.md).

## Installation

```bash
pnpm add @sanity-labs/sdk-addon-dataset-runtime @sanity-labs/sdk-comments @sanity/sdk-react react react-dom
```

Peer dependencies:

- `@sanity/sdk-react`
- `react`
- `react-dom`

## Quick Start

### Provider-Based Runtime

```tsx
import {AddonDatasetRuntimeProvider} from '@sanity-labs/sdk-addon-dataset-runtime'
import {useApplyCommentActions, useDocumentComments, useTaskComments} from '@sanity-labs/sdk-comments'

function CommentsPanel() {
  const documentComments = useDocumentComments({documentId: 'article-123'})
  const taskComments = useTaskComments({taskId: 'task-123'})
  const applyCommentActions = useApplyCommentActions({
    currentUserId: 'resource-user-1',
    studioBaseUrl: 'https://www.sanity.io/your-studio-base',
  })

  return (
    <button
      onClick={() =>
        applyCommentActions.createTaskComment({
          message: [
            {
              _key: 'b1',
              _type: 'block',
              children: [{_key: 's1', _type: 'span', text: 'Looks good'}],
            },
          ],
          taskId: 'task-123',
          taskStudioUrl: '/intent/edit/id=task-123',
          taskTitle: 'Review homepage headline',
        })
      }
    >
      {documentComments.comments.length + taskComments.comments.length} comments
    </button>
  )
}

<AddonDatasetRuntimeProvider
  addonDataset="production-comments"
  contentDataset="production"
  projectId="myProjectId"
  workspaceId="news_and_media"
  workspaceTitle="News and Media"
>
  <CommentsPanel />
</AddonDatasetRuntimeProvider>
```

### Direct Configuration

The runtime provider is recommended when multiple components share the same addon
runtime values, but it is not required. You can pass runtime values directly to
the hooks instead:

```ts
import {useApplyCommentActions, useDocumentComments, useTaskComments} from '@sanity-labs/sdk-comments'

const documentComments = useDocumentComments({
  addonDataset: 'production-comments',
  documentId: 'article-123',
  projectId: 'myProjectId',
})

const taskComments = useTaskComments({
  addonDataset: 'production-comments',
  projectId: 'myProjectId',
  taskId: 'task-123',
})

const applyCommentActions = useApplyCommentActions({
  addonDataset: 'production-comments',
  contentDataset: 'production',
  currentUserId: 'resource-user-1',
  projectId: 'myProjectId',
  studioBaseUrl: 'https://www.sanity.io/your-studio-base',
  workspaceId: 'news_and_media',
  workspaceTitle: 'News and Media',
})
```

`currentUserId` should be your app's resource-user identifier, not just any
arbitrary string. In an SDK app, you will usually derive it from the current
Sanity user plus the project user memberships exposed by `useUsers()`.

## Primary Exports

- `useDocumentComments()`
- `useTaskComments()`
- `useApplyCommentActions()`
- `CommentDocument`
- `CommentMessage`
- `CommentReaction`
- `CommentStatus`
- `CommentThread`
- `CommentThreadGroup`
- `buildCommentThreads()`
- `getCommentThreadsForField()`
- `groupUnresolvedCommentsByField()`
- `buildMessageFromPlainText()`
- `toPlainText()`

## Action API

`useApplyCommentActions()` returns the comment-domain write API:

- `createComment(args)` for document-scoped comments
- `createTaskComment(args)` for task-scoped comments
- `editComment(commentId, message)`
- `setCommentStatus(commentId, status)`
- `deleteComment(commentId)`
- `toggleReaction(commentId, shortName, currentReactions)`

Task comments are intentionally part of the comments package. If the thing being
created or updated is a comment, including a comment attached to a task, use
`@sanity-labs/sdk-comments`.

To build message payloads from plain text, use `buildMessageFromPlainText()`:

```ts
const message = buildMessageFromPlainText('Looks good to me')

await applyCommentActions.createTaskComment({
  message,
  taskId: 'task-123',
  taskTitle: 'Review homepage headline',
})
```

## Studio URL Configuration

External consumers can supply their own Studio URL configuration without changing internals.

- Use `studioBaseUrl` when creating document comments through `useApplyCommentActions()`.
- Use `taskStudioUrl` when creating task comments if your task route differs from the default task route.
- Use `workspaceId` / `workspaceTitle` when your Studio URLs are workspace-specific.
  These values are optional and mainly matter when comment links need to point
  back into a specific Studio workspace.

## What Is Not Included

This package intentionally does not ship:

- a UI comments panel
- comment editor components
- table cell comment decorators
- task reads or task action hooks

Use `@sanity-labs/sdk-addon-dataset-runtime` for shared runtime config and `@sanity-labs/sdk-tasks`
for task reads and task mutations.

## Migration Notes

Existing internal callers can migrate gradually:

- `useAddonComments()` -> `useDocumentComments()`
- `useTaskComments()` -> `useTaskComments()`
- `useAddonCommentMutations()` -> `useApplyCommentActions()`
- pure helper imports from `addonCommentUtils.ts` -> imports from `@sanity-labs/sdk-comments`

## Repository Note

This package currently lives in the repo folder
[`packages/comments-sdk-react/`](.) but publishes as `@sanity-labs/sdk-comments`.
