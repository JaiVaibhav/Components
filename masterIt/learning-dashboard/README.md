# Learning Dashboard

A local-first learning workspace for building career-focused learning paths, tracking topic progress, and keeping notes, code snippets, and resources together.

## Features

- Create and organise learning paths with nested topics
- Track topic status from not started through interview ready
- Calculate progress from leaf topics in each path
- Keep Markdown notes with a live preview
- Save code snippets in an embedded editor
- Attach external learning resources to topics
- Search topics, notes, snippets, and resources
- Prioritise dashboard paths using a role and seniority profile
- Export and restore the complete workspace as JSON

## Tech stack

- React 19 and TypeScript
- Vite
- React Router
- Dexie / IndexedDB for browser-local persistence
- Monaco Editor for code snippets
- Vitest and ESLint

## Getting started

Prerequisites: Node.js 20 or newer and npm.

```bash
npm install
npm run dev
```

Vite will print the local development URL, normally `http://localhost:5173`.

## Available scripts

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run preview  # Serve the production build locally
npm run lint     # Run ESLint
npm test         # Run the Vitest test suite
```

## Data and backups

All workspace data stays in the browser's IndexedDB database, named `learning-dashboard`. No server or account is required.

Use **Settings → Export database** to download a complete JSON backup. Importing a backup replaces the current local workspace, so export first if you want to keep the existing data.

On a new browser database, the app creates a sample **Staff Frontend** learning path to demonstrate the workspace.

## Project structure

```text
src/
├── app/           # Application routes and global styles
├── db/            # Dexie schema, seed data, backup helpers
├── features/      # Dashboard, explorer, topic, search, settings views
├── layouts/       # Shared application shell and navigation
├── models/        # Domain types and constants
└── utils/         # Progress calculation and related tests
```

## Notes

- The workspace is local to the current browser profile. Clearing browser site data also clears the workspace unless it has been exported.
- External resources open in a new browser tab.
