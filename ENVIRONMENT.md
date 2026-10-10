# Environment Setup

## Stack

- Vite
- React
- TypeScript
- ESLint
- Prettier
- TensorFlow.js
- COCO-SSD object detection model
- Lucide React icons

## Requirements

- Node.js `>=20.19`
- npm
- A Chromium-based browser is recommended for camera testing.

## Commands

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

Format files:

```bash
npm run format
```

Check formatting:

```bash
npm run format:check
```

## Environment Variables

Copy `.env.example` to `.env` when local overrides are needed.

Current default:

```bash
VITE_APP_NAME="Meeting Vision Studio"
VITE_ENABLE_REMOTE_ANALYSIS=false
```

Keep camera and video frame processing local by default. Only enable remote analysis when the app explicitly adds and discloses a backend analysis flow.

## Current Verification

The setup has been verified with:

```bash
npm run build
npm run lint
```

## Known Audit Note

`npm audit` currently reports moderate vulnerabilities through the TensorFlow.js dependency chain:

- `@tensorflow/tfjs`
- `argparse`
- `sprintf-js`

npm suggests `npm audit fix --force`, but that would install an old breaking TensorFlow.js version. Do not apply the forced fix casually. Revisit this when selecting the final browser vision model stack.
