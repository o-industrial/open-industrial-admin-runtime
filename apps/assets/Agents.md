# Agents Guide - Runtime Assets

Central repository of static assets (images, diagrams, icons) used by the web runtime apps.

## Scope

- Store marketing imagery, diagrams, and downloadable resources referenced across apps.
- Manage favicon and branding assets required for deployments.
- Exclude dynamic assets generated at runtime or stored in external CDNs.

## Project Map

- `agreements/`, `logos/`, `marketing/`, `mock-ups/`, `screenshots/` - Category folders for organizing assets.
- Root PNGs correspond to frequently referenced diagrams; keep filenames descriptive.
- `favicon.ico` - Shared favicon for the runtime; update in coordination with branding.

## Commands

- `deno task lint:assets` (planned) - Placeholder for future asset linting/compression checks.
- `deno task build` - Confirms assets bundle correctly during production build.

## Patterns

- Optimize images (WebP/AVIF where possible) before committing; maintain source files in design tooling.
- Reference assets via relative imports or the `static/` pipeline rather than external URLs where appropriate.
- Keep naming consistent (kebab-case) and append version suffixes when replacing key diagrams to avoid cache issues.

## Review & Test Checklist

- Verify new assets meet performance budget (<1 MB unless justified).
- Confirm licensing/usage rights before adding third-party media.
- Update any hard-coded dimensions or alt text in consuming components.

## Safety & Guardrails

- Do not store secrets or config files here.
- Large video/audio assets should reside in external storage/CDN and be referenced via URL.
- Remove unused assets during quarterly audits to reduce bundle size.

## Ownership Signals

- **Primary owner:** Growth Marketing & Web Platform.
- **Point of contact:** #oi-marketing-site Slack channel.
- **Escalation:** Web Platform Lead (Mika Ito).

## Dependencies & Integrations

- Assets consumed by marketing, docs, and blog apps; coordinate updates with content owners.
- Build pipeline may optimize images; validate output after build to ensure fidelity.

## Related Docs

- Parent: [Apps overview](../Agents.md).
- Branding guidelines (link TBD) for acceptable usage.

## Changelog Expectations

- Note significant asset additions/removals, especially those tied to campaigns or branding refreshes.
- Review quarterly in sync with marketing updates.
