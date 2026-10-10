# Meeting Vision Studio

A playful but portfolio-grade, browser-first computer vision studio for analyzing
meetings (and classrooms, labs, presentations) from live cameras and uploaded
video. It runs entirely in the browser — no frames ever leave the device.

Built by [@admasfeleke](https://github.com/admasfeleke).

[![CI](https://github.com/admasfeleke/meeting-vision-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/admasfeleke/meeting-vision-studio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-66d9c7.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite&logoColor=white)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-COCO--SSD-ff6f00?logo=tensorflow&logoColor=white)

## Highlights

- **Live multi-camera control room.** Add one or many webcams, label them, and
  monitor every feed in a responsive grid with a shared session summary.
- **Real object detection.** Uses TensorFlow.js + COCO-SSD (lazy-loaded so the
  initial bundle stays small) to detect people and meeting objects, drawn as
  live bounding-box overlays.
- **Measured, honest metrics.** People count, attention/interaction heuristics,
  email score, per-source FPS, and real inference latency — all derived from the
  actual frame, never hardcoded or randomized.
- **Scenario modes.** Classroom, Exam, Lab Safety, Presentation Coach, and
  Meeting each relabel the metrics and configure policy objects to watch for.
- **Playful interpretation layer.** Opt-in, workplace-safe humor on top of a
  serious CV pipeline.
- **Event timeline + snapshots.** Meaningful moments are logged with a captured
  thumbnail, and the whole session exports to JSON.

## Getting started

```bash
npm install
npm run dev        # start the dev server (http://127.0.0.1:5173)
```

Requires Node.js `>=20.19`. A Chromium-based browser is recommended for camera
access.

## Scripts

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the Vite dev server                      |
| `npm run build`   | Type-check (`tsc -b`) and build for production |
| `npm run preview` | Preview the production build                   |
| `npm run lint`    | Run ESLint                                     |
| `npm run format`  | Format the codebase with Prettier              |
| `npm test`        | Run unit tests with Vitest                     |

## Architecture

```
src/
  App.tsx                 # thin composition root
  hooks/
    useVisionStudio.ts    # all studio state + the real detection loop
  lib/                    # pure, unit-tested logic (no React)
    types.ts              # shared domain types
    scenarios.ts          # scenario + policy-object configuration
    analysis.ts           # metrics + event derivation from detections
    aggregate.ts          # session-level metric rollup
    events.ts             # event creation + frame snapshot
    report.ts             # JSON report building/download
    util.ts               # small numeric helpers
  components/             # presentational React components
```

The `lib/` layer is intentionally free of React so the analytics logic can be
unit-tested directly (see `*.test.ts`).

## Privacy

Camera and video processing is local by default. See `ENVIRONMENT.md` for
environment details and `AI_PROJECT_BRIEF.md` for the full product brief and
collaboration guidelines.

## Contributing & License

Contributions are welcome — see [CONTRIBUTING.md](CONTRIBUTING.md) and our
[Code of Conduct](CODE_OF_CONDUCT.md). Security concerns are described in
[SECURITY.md](SECURITY.md).

Released under the [MIT License](LICENSE).
