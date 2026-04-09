# `@sanity-labs/sdk-comments`

React hooks and action APIs for CRUD actions with Sanity comments inside of a Sanity SDK app.

This is the public comments package for apps that already use
[`@sanity/sdk-react`](https://reference.sanity.io/_sanity/sdk-react).

## Installation

```bash
pnpm add @sanity-labs/sdk-addon-dataset-runtime @sanity-labs/sdk-comments
```

Peer dependencies:

- `@sanity/sdk-react`
- `react`
- `react-dom`

## Quick Start

### Provider-Based Runtime

```tsx
import { AddonDatasetRuntimeProvider } from "@sanity-labs/sdk-addon-dataset-runtime";
import {
  useApplyCommentActions,
  useDocumentComments,
  useTaskComments,
} from "@sanity-labs/sdk-comments";

function CommentsPanel() {
  const documentComments = useDocumentComments({ documentId: "article-123" });
  const taskComments = useTaskComments({ taskId: "task-123" });
  const applyCommentActions = useApplyCommentActions({
    currentUserId: "resource-user-1",
    studioBaseUrl: "https://www.sanity.io/your-studio-base",
  });

  return (
    <button
      onClick={() =>
        applyCommentActions.createTaskComment({
          message: [
            {
              _key: "b1",
              _type: "block",
              children: [{ _key: "s1", _type: "span", text: "Looks good" }],
            },
          ],
          taskId: "task-123",
          taskStudioUrl: "/intent/edit/id=task-123",
          taskTitle: "Review homepage headline",
        })
      }
    >
      {documentComments.comments.length + taskComments.comments.length} comments
    </button>
  );
}

<AddonDatasetRuntimeProvider
  addonDataset="production-comments"
  contentDataset="production"
  projectId="myProjectId"
  workspaceId="news_and_media"
  workspaceTitle="News and Media"
>
  <CommentsPanel />
</AddonDatasetRuntimeProvider>;
```

### Direct Configuration

The runtime provider is recommended when multiple components share the same addon
runtime values, but it is not required. You can pass runtime values directly to
the hooks instead:

```ts
import {
  useApplyCommentActions,
  useDocumentComments,
  useTaskComments,
} from "@sanity-labs/sdk-comments";

const documentComments = useDocumentComments({
  addonDataset: "production-comments",
  documentId: "article-123",
  projectId: "myProjectId",
});

const taskComments = useTaskComments({
  addonDataset: "production-comments",
  projectId: "myProjectId",
  taskId: "task-123",
});

const applyCommentActions = useApplyCommentActions({
  addonDataset: "production-comments",
  contentDataset: "production",
  currentUserId: "resource-user-1",
  projectId: "myProjectId",
  studioBaseUrl: "https://www.sanity.io/your-studio-base",
  workspaceId: "news_and_media",
  workspaceTitle: "News and Media",
});
```

`currentUserId` should be your app's resource-user identifier, not just any
arbitrary string. In an SDK app, you will usually derive it from the current
Sanity user plus the project user memberships exposed by `useUsers()`.

## Primary Exports

- `createCommentHandle()`
- `createComment()`
- `createTaskComment()`
- `editComment()`
- `setCommentStatus()`
- `deleteComment()`
- `toggleReaction()`
- `CommentAction`
- `CreateCommentActionArgs`
- `CreateTaskCommentActionArgs`
- `useComments()`
- `useCommentProjection()`
- `useComment()`
- `useCommentThread()`
- `useEditComment()`
- `useDocumentComments()`
- `useTaskComments()`
- `useApplyCommentActions()`
- `CommentHandle`
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

## Canonical Read Hooks

The preferred SDK-shaped read path is:

- `useComments()` for lightweight root-comment handles
- `useCommentProjection()` for thread preview metadata
- `useComment()` for one root comment document
- `useCommentThread()` for the full thread when the UI expands it
- `useEditComment()` for scoped message editing

`useDocumentComments()` and `useTaskComments()` remain available as compatibility helpers for existing thread-first UIs.

## Scoped Edit Hooks

`useEditComment()` mirrors the SDK edit-hook ergonomics for comment documents
while keeping comment writes scoped to the addon dataset.

```ts
import {
  buildMessageFromPlainText,
  type CommentMessage,
  useEditComment,
} from '@sanity-labs/sdk-comments'

const editCommentMessage = useEditComment<CommentMessage>({
  commentId: 'comment-123',
  path: 'message',
})

await editCommentMessage(buildMessageFromPlainText('Updated message'))
```

Omit `path` to edit the full comment document. The hook diffs top-level comment
fields, ignores system keys such as `_id` / `_updatedAt`, stamps
`lastEditedAt`, and unsets the targeted path if you pass `undefined`.

## Action API

`useApplyCommentActions()` returns a callable dispatcher, analogous to
`useApplyDocumentActions()` in `@sanity/sdk-react`, with the existing
imperative helpers attached for convenience and migration.

Canonical usage:

```ts
import {
  createComment,
  createCommentHandle,
  useApplyCommentActions,
} from '@sanity-labs/sdk-comments'

const applyCommentActions = useApplyCommentActions()

await applyCommentActions(
  createComment(
    createCommentHandle({
      addonDataset: 'production-comments',
      commentId: crypto.randomUUID(),
      projectId: 'myProjectId',
    }),
    {
      authorId: 'resource-user-1',
      contentDataset: 'production',
      documentId: 'article-123',
      documentTitle: 'Homepage headline',
      documentType: 'article',
      message: buildMessageFromPlainText('Looks good to me'),
      projectId: 'myProjectId',
    },
  ),
)
```

For migration, the hook still exposes the existing imperative helpers:

- `createComment(args)` for document-scoped comments
- `createTaskComment(args)` for task-scoped comments
- `editComment(commentId, message)`
- `setCommentStatus(commentId, status)`
- `deleteComment(commentId)`
- `toggleReaction(commentId, shortName, currentReactions)`

The dispatcher accepts either one action or an array of actions. The attached
helper methods build the action descriptors for you and then dispatch them.

## SDK Alignment

This package intentionally keeps the same root-handle, projection, thread,
dispatcher, and edit-hook shape as the Sanity SDK. Under the hood, comment
writes execute direct live-edit client mutations instead of the SDK draft
document action pipeline, because comments live in the addon dataset as
live-edit records rather than draftable content documents. That keeps the
public API SDK-shaped while making comment persistence correct for addon
documents.

Task comments are intentionally part of the comments package. If the thing being
created or updated is a comment, including a comment attached to a task, use
`@sanity-labs/sdk-comments`.

To build message payloads from plain text, use `buildMessageFromPlainText()`:

```ts
const message = buildMessageFromPlainText("Looks good to me");

await applyCommentActions.createTaskComment({
  message,
  taskId: "task-123",
  taskTitle: "Review homepage headline",
});
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
