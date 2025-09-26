# Agents Guide - Admin App

Authenticated portal for managing licenses, access rights, users, and workspace provisioning. Admin routes require secure integrations with EaC identity and licensing services.

## Scope

- Support CRUD flows for licenses, access cards, users, and workspace metadata.
- House debugging utilities for administrators under `debug/`.
- Handle server actions via colocated `api/` routes using `ctx.State.OIClient.Admin` clients.
- Exclude public marketing content or workspace runtime experiences.

## Project Map

- `_layout.tsx` - Shell for admin routes; wires navigation, breadcrumbs, and auth guards.
- `_middleware.ts` - Enforces admin authentication (MSAL + EaC claims); review before auth changes.
- `index.tsx` - Dashboard landing page.
- `licenses/`, `access-rights/`, `access-cards/`, `users/`, `workspaces/` - Feature dirs with route + action handlers.
- `debug/` - Diagnostics screens; ensure they remain behind strict auth and feature flags.

## Commands

- `deno task dev` - Launch full runtime; log in with admin role to test changes.
- `deno task test --filter admin` - Targeted tests or Playwright suites for admin paths.
- `deno task test:e2e` (if configured) - Run full end-to-end coverage before releasing sensitive features.

## Patterns

- Pair every route with an `api/` handler for mutations; redirect with HTTP 303 after write operations.
- Use atomic organisms/templates to ensure consistent layout; avoid bespoke markup.
- Respect feature-flag boundaries when rolling out new admin capabilities; use shared gating utilities.
- Log critical actions (license changes, workspace provisioning) via existing telemetry hooks.

## Review & Test Checklist

- Verify admin-only middleware and access checks for every new route.
- Ensure forms validate inputs both client-side (atoms/molecules) and server-side (API handlers).
- Update Playwright specs covering new workflows; include regression tests for license issuance.
- Coordinate with API/runtime teams for schema changes; confirm types align across repos.

## Safety & Guardrails

- Never expose PII in logs or debug UIs; use redaction helpers.
- Mutation handlers must be idempotent; rely on EaC commit confirmation before user feedback.
- Guard feature toggles for experimental paths; disable by default in production configs.

## Ownership Signals

- **Primary owner:** Admin Experience Squad.
- **Point of contact:** #oi-admin-runtime Slack channel.
- **Escalation:** Licensing Platform Lead (Priya Desai).

## Dependencies & Integrations

- Depends on EaC Admin client (`ctx.State.OIClient.Admin`), licensing services, and audit logging APIs.
- Uses MSAL plugin from `src/plugins/msal.ts` for authentication context.
- Consumes atomic components for tables, forms, and cards; coordinate updates with design system team.

## Related Docs

- Parent: [Apps overview](../Agents.md).
- Backend guidance: [Runtime guide](../../AGENTS.md) and repo-level [Agents](../../Agents.md).
- Cross-feature references: upcoming `src/plugins/Agents.md` for shared auth/licensing behavior.

## Changelog Expectations

- Update after major flow changes (e.g., license issuance redesign) or auth model revisions.
- Maintain release notes for administrators in the workspace change log.
