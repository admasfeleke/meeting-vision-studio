# Meeting Vision Studio - AI Project Brief

## Purpose

Meeting Vision Studio is a playful but portfolio-grade computer vision studio for analyzing meetings from live cameras and uploaded videos. The product should feel like a real multi-camera control room with a humorous interpretation layer on top.

The humor should come from detected behavior and generated labels, while the technical foundation should remain serious: real-time video input, multi-camera stream handling, object/person/face detection, event timelines, overlays, analytics, and exportable summaries.

## Product Positioning

Build this as a usable computer vision application, not a joke landing page.

The best first impression is:

- A live studio dashboard.
- One or more camera feeds.
- Detection overlays.
- Per-camera metrics.
- A shared meeting timeline.
- Funny but credible labels such as "confusion spike", "mug shield active", or "this could have been an email".

The app should demonstrate engineering depth while being memorable and fun in a portfolio review.

## Primary Input Modes

Support these modes consistently across the application:

1. Single live camera
   - Use a laptop webcam or connected USB camera.
   - Display real-time overlays and metrics.
   - Make this the easiest demo path.

2. Multiple live cameras
   - Allow several camera feeds at once when available.
   - Show feeds in a grid.
   - Let users label cameras, for example: Presenter, Audience, Whiteboard, Desk.
   - Each camera should have independent analysis and contribute to a global meeting summary.

3. Uploaded video
   - Allow upload for demos, testing, and reviewers without multiple cameras.
   - Use the same analysis pipeline where possible.
   - Treat uploaded video as a fallback/demo mode, not the only product experience.

## Core Features

### Camera Studio

- Camera discovery and selection.
- Single-camera and multi-camera layouts.
- Camera labels.
- Start, pause, stop, and reset controls.
- Focus mode for enlarging one feed.
- Grid mode for monitoring all feeds.
- Clear empty states when no camera is available.

### Real-Time Visual Analysis

Prioritize browser-friendly and demo-friendly analysis first.

Recommended detection categories:

- People count.
- Face detection where feasible.
- Basic expression or attention states if reliable enough.
- Pose or gesture signals where feasible.
- Object detection for meeting-relevant items:
  - phone
  - laptop
  - mug or cup
  - notebook
  - headphones
  - keyboard or mouse

If a model is unavailable or too heavy, use graceful fallback states and keep the UI useful.

### Funny Annotation Layer

Humor should be optional and toggleable.

Examples:

- "Confusion spike"
- "Mug shield active"
- "Phone temptation detected"
- "Silent question forming"
- "Nod agreement score rising"
- "Camera avoidance level increased"
- "Presenter energy detected"
- "This could have been an email"

Avoid mean, insulting, invasive, or identity-based humor. The tone should be playful, workplace-safe, and opt-in.

### Metrics

Each camera can show:

- People visible.
- Attention estimate.
- Detected objects.
- Recent events.
- Confidence or quality indicator.
- Frame rate or processing status.

Global meeting metrics can include:

- Engagement heat.
- Confusion index.
- Object distraction count.
- Camera coverage.
- "Could have been an email" score.

These metrics can be heuristic at first. Make that clear in naming and code comments where needed.

### Event Timeline

Maintain a chronological event log from all sources.

Each event should include:

- Timestamp.
- Camera/source id.
- Event type.
- Human-readable label.
- Optional confidence.
- Optional snapshot/frame reference if implemented.

Example events:

- `00:42 - Audience: confusion spike`
- `01:18 - Presenter: dramatic hand gesture`
- `02:05 - Desk: phone temptation detected`

### Reports And Export

Generate a post-session report with:

- Session duration.
- Sources used.
- Top events.
- Per-camera summary.
- Global meeting score.
- Detected objects.
- Funny recap text.

Useful export targets:

- JSON first.
- Screenshot/image later.
- PDF later if the stack supports it naturally.

## Suggested MVP

The best MVP should include:

1. Single live camera input.
2. Optional uploaded video input.
3. A camera feed with real-time overlays.
4. At least one lightweight detection pipeline.
5. Funny annotation toggle.
6. Event timeline.
7. Session summary/report.

After the MVP works, extend to multiple live cameras.

## Multi-Camera Architecture Guidance

Represent every source as a common `VisionSource` or equivalent concept.

Suggested fields:

- `id`
- `kind`: `camera` or `upload`
- `label`
- `status`: `idle`, `starting`, `running`, `paused`, `error`, `ended`
- `stream` or media reference
- `metrics`
- `events`
- `lastFrame`
- `error`

Keep analysis output separate from UI rendering where practical.

Suggested pipeline:

1. Source manager discovers or loads media.
2. Frame sampler extracts frames at a controlled interval.
3. Analyzer runs model or heuristic detection.
4. Event classifier converts raw detections into user-facing events.
5. Store updates per-source metrics and global summary.
6. UI renders overlays, timeline, and reports.

This separation helps future AI tools add models without rewriting the UI.

## UX Direction

The application should feel like a polished studio tool:

- Dense but readable dashboard.
- Practical controls.
- Clear camera grid.
- Minimal marketing copy.
- No oversized landing-page hero as the main screen.
- Use the product experience as the first screen.
- Prefer icons for common controls.
- Keep humor in annotations, event labels, and reports, not in intrusive instructions.

Important views:

- Studio dashboard.
- Camera/source setup.
- Focus view for one feed.
- Timeline/report view.
- Settings or toggles for analysis layers.

## Visual Design Notes

Aim for a modern control-room interface without becoming visually heavy.

Good patterns:

- Camera tiles.
- Subtle overlays.
- Compact metric chips.
- Timeline rail.
- Inspector side panel.
- Status indicators.
- Toggleable layers.

Avoid:

- A pure marketing page as the main app.
- Decorative blobs/orbs.
- One-note color palettes.
- Nested cards.
- Text that explains obvious UI behavior inside the app.
- Humor that makes the app feel unserious or mean.

## Privacy And Safety

Computer vision apps can feel sensitive. Build with privacy-forward defaults.

Recommended principles:

- Do not upload camera frames to a server unless explicitly required and disclosed.
- Prefer local/browser processing for demos when possible.
- Make recording/export actions explicit.
- Do not infer protected attributes.
- Do not identify people by name unless the user explicitly adds labels.
- Do not make medical, hiring, legal, or psychological claims.
- Treat metrics as playful heuristics, not objective judgments.

## Technical Priorities

Prefer incremental, demonstrable progress:

1. Get camera/video input working reliably.
2. Add a unified source abstraction.
3. Add basic frame sampling.
4. Add a simple analysis layer.
5. Add overlays.
6. Add timeline events.
7. Add reports.
8. Add multi-camera support.
9. Improve models and performance.

For browser-based implementations, consider:

- MediaDevices API for live cameras.
- Canvas for frame sampling and overlays.
- Web workers for heavier analysis.
- TensorFlow.js, MediaPipe, ONNX Runtime Web, or another proven library if appropriate.

For backend-assisted implementations, consider:

- A clear API boundary for frame or video analysis.
- Streaming only when necessary.
- Job-based processing for uploaded videos.
- Keeping live local processing available for privacy and demo reliability.

## Naming Conventions

Use consistent product language:

- "source" for any camera or uploaded video.
- "camera" for live hardware input.
- "session" for one analysis run.
- "event" for a meaningful detected moment.
- "overlay" for visual annotations on a feed.
- "metric" for numeric or categorical summaries.
- "report" for the post-session summary.

Suggested analysis layer names:

- People
- Faces
- Objects
- Attention
- Gestures
- Humor

## Example User Stories

- As a portfolio reviewer, I can open the app and immediately run a webcam demo.
- As a user with multiple cameras, I can monitor several feeds in a grid.
- As a user, I can label cameras so events are easier to understand.
- As a user, I can toggle humor off and see a more serious CV studio.
- As a user, I can upload a meeting clip and get the same style of analysis.
- As a user, I can inspect a timeline of detected events.
- As a user, I can export a JSON summary of the session.

## Definition Of Done For New Features

Before considering a feature complete:

- It works for at least one camera or one uploaded video.
- It has a clear empty/loading/error state.
- It does not break the main studio flow.
- It updates the timeline or report if relevant.
- It handles unavailable permissions or missing devices gracefully.
- It keeps humor optional and workplace-safe.
- It is tested manually in the browser or with the project test command when available.

## Future Enhancements

Potential later additions:

- Snapshot capture for timeline events.
- Side-by-side camera comparison.
- Heatmaps over time.
- Session replay.
- PDF report export.
- Local session history.
- Whiteboard detection.
- Speaker/presenter mode.
- Calibration step for room cameras.
- Custom rule builder for humorous alerts.

## AI Collaboration Notes

When another AI tool continues this project:

- Preserve the live multi-camera studio concept.
- Do not reduce the project to only uploaded video analysis.
- Keep uploaded videos as a supported demo path.
- Prefer real functionality over static mockups.
- Keep implementation choices aligned with the existing codebase.
- Make small, working increments.
- Use proven CV/media libraries for complex detection when possible.
- Keep privacy implications visible in design and code.
- Keep the product funny, but technically credible.
