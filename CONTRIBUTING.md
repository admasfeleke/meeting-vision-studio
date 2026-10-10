# Contributing to Meeting Vision Studio

Thanks for your interest in improving the project! This guide keeps contributions
consistent with the codebase.

## Development setup

```bash
npm install
npm run dev        # http://127.0.0.1:5173
```

Requirements: Node.js `>=20.19` and a Chromium-based browser for camera testing.

## Definition of done

Before opening a PR, make sure your change:

- Works for at least one camera or one uploaded video.
- Has a clear empty / loading / error state.
- Does not break the main studio flow.
- Updates the timeline or report if relevant.
- Handles unavailable permissions or missing devices gracefully.
- Keeps humor optional and workplace-safe.
- Passes all automated checks (below).

## Automated checks

Every PR is validated by CI, but run them locally first:

```bash
npm run lint        # ESLint
npx tsc -b          # Type-check
npm test            # Vitest unit tests
npm run build       # Production build
```

## Architecture conventions

- **`src/lib/`** — pure, React-free logic (metrics, events, aggregation, reports).
  Anything here should be deterministic and unit-testable.
- **`src/hooks/useVisionStudio.ts`** — all studio state and the detection loop.
- **`src/components/`** — presentational React components; keep them free of
  business logic.
- Prefer **real, measured values** (detection scores, inference latency, FPS) over
  hardcoded or randomized placeholders. If a model is unavailable, use graceful
  fallback states instead of fabricating data.

## Commit style

Use clear, conventional commit messages, e.g. `feat:`, `fix:`, `refactor:`,
`docs:`, `test:`, `chore:`.

## Privacy

Camera and video frames are processed locally by default. Do not add a remote
analysis path without explicit disclosure in the UI and documentation.
