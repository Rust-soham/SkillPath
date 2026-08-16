# Skillpath

Skillpath is a responsive course-discovery landing page built for Framer. It
combines an editorial “Field Guide” visual system with a live course catalogue
that adapts pricing to the visitor’s country.

**Live site:** https://moody-partners-114745.framer.app/

## What it does

- Fetches a variable-length course catalogue from the provided API.
- Detects `IN` or `US` independently and formats prices from paise or cents.
- Validates external data at runtime before rendering it.
- Supports loading, recovery, empty, filtered-empty, and working states.
- Keeps course and regional-pricing failures visually independent.
- Provides course search, price sorting, and refundable-course details.
- Responds from three columns on desktop to two on tablet and one on mobile.
- Exposes the section heading and accent colour as Framer property controls.

## Architecture

The repository keeps transport, validation, query policy, and presentation as
separate concerns:

```text
src/
├── course.ts                       # Zod schemas, domain types, price formatting
├── course-api.ts                   # Typed Better Result HTTP adapter and errors
├── course-query.ts                 # TanStack Query keys and retry policy
├── course-runtime.ts               # Live API wiring
├── SkillpathCourses.tsx            # Modular catalogue component
├── SkillpathCourses.framer.tsx     # Self-contained Framer deployment entry
├── SkillpathLandingPages.tsx       # Local landing-page compositions
└── preview.tsx                     # Vite preview entry
```

The modular implementation defines five explicit failure types:
`NetworkError`, `RequestAbortedError`, `HttpResponseError`,
`InvalidJsonError`, and `SchemaMismatchError`. Only observed transient failures
(network errors and HTTP 404/500 responses) receive one automatic retry.
Contract failures are surfaced immediately rather than repeatedly requesting
data that cannot be decoded.

`SkillpathCourses.framer.tsx` is the exact source copied into Framer. It is
self-contained because Framer code files have stricter module-resolution
constraints than the local Vite project. The page hero and footer are native
Framer layers; the dynamic catalogue remains the code-component boundary.

## Interface behaviour

- A failed course request without cached data produces a full catalogue recovery
  state.
- A failed regional lookup keeps courses usable and displays both currencies.
- A successful empty course array is treated as an empty state, not an error.
- Search and sort controls appear only after catalogue data is available.
- Reduced-motion preferences disable non-essential animation.

## Run locally

Requires Node.js and pnpm.

```bash
pnpm install
pnpm dev
```

The preview runs through Vite. The production checks are:

```bash
pnpm typecheck
pnpm test
pnpm build
```

The test suite covers runtime schemas and currency conversion, error
classification, retry policy, independent recovery states, variable course
counts, filtering, and the responsive landing-page compositions.

## Technology

- React and TypeScript
- Framer code components and native canvas layers
- TanStack Query
- Zod
- Better Result
- Vite and Vitest

