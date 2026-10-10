# Security Policy

## Supported Versions

This project is a portfolio/demo application. The latest commit on `main` is the
only supported version.

## Privacy & Data

Meeting Vision Studio processes camera and video frames **entirely in the
browser**. No video, frames, or detection results are transmitted off the device.
The only network requests are the lazy-loaded TensorFlow.js / COCO-SSD model
assets fetched from their public CDN on first analysis.

## Reporting a Vulnerability

If you discover a security issue (for example, an unexpected outbound request or
a dependency with a known vulnerability), please report it privately rather than
opening a public issue:

- **Email:** admasu.feleke21@gmail.com

You can expect an initial response within 7 days. Please do not publicly disclose
the issue until it has been addressed.

## Dependency Notes

`npm audit` may report vulnerabilities through the TensorFlow.js dependency
chain (e.g. `argparse`, `sprintf-js`). Do not apply `npm audit fix --force`
casually — it can pull a breaking TensorFlow.js version. See `ENVIRONMENT.md`.
