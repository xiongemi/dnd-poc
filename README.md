# DnD POC

Minimal React 19.2 workspace for comparing drag-and-drop libraries: **react-beautiful-dnd**, **@hello-pangea/dnd**, and **@atlaskit/pragmatic-drag-and-drop**.

## Setup

```bash
pnpm install
```

## Run

```bash
pnpm dev
```

Then open http://localhost:5173/

## What’s in the app

The app shows three columns, each with the same reorderable list implemented with a different library:

| Library | Notes |
|--------|--------|
| **react-beautiful-dnd** | Original Atlassian library; unmaintained and deprecated. Same API as Pangea. |
| **@hello-pangea/dnd** | Community fork of react-beautiful-dnd; maintained and drop-in API replacement. |
| **@atlaskit/pragmatic-drag-and-drop** | Newer Atlassian library; low-level primitives (`draggable`, `dropTargetForElements`), different API. |

You can drag items in any column to reorder and compare behavior and ergonomics.

## Scripts

- `pnpm dev` – start dev server
- `pnpm build` – type-check and build
- `pnpm prepare` – type-check only
