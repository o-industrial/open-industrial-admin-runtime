# Agents Guide � Admin App

Authenticated portal for managing licenses, access rights, users, and workspace provisioning. Routes assume the admin runtime is fronted by MSAL/ADB2C auth and licensed via EaC services.

## Scope

- CRUD flows for licenses, plans, prices, access rights/cards, users, and workspace metadata.
- Diagnostics surfaces under `debug/` for authorized operators.
- Server mutations implemented via colocated `api/` handlers that call `ctx.State.OIClient.Admin` and redirect on completion.

## Project Map

- `_layout.tsx` � Shell component wiring navigation (`AdminNav`) and enforcing auth context.
- `_middleware.ts` � Issues JWT + client instantiation via `buildOpenIndustrialAdminMiddleware`; ensure access rights remain intact.
- `index.tsx` � Dashboard landing with key metrics.
- Feature directories: `licenses/`, `access-rights/`, `access-cards/`, `users/`, `workspaces/`, each with UI + API handlers.
- `debug/` � Admin-only diagnostics; keep feature-flagged when exposing sensitive data.

## Commands

- `deno task dev` � Run runtime locally; sign in with admin role to validate flows.
- `deno task test` � Execute runtime tests (add coverage for new admin workflows).
- `deno task build` � Full validation prior to release.

## Patterns

- Pair UI routes with `api/` handlers; use `Response.redirect(..., 303)` after successful writes.
- Atomic UI comes from `@o-industrial/common/atomic/*`; avoid bespoke markup.
- Access control flows depend on `OpenIndustrialLicensingPlugin` + `OpenIndustrialMSALPlugin` wired in `src/plugins/RuntimePlugin.ts`; update those plugins when scopes change.
- Logging available through the shared runtime logging provider; redact sensitive fields.

## Review & Test Checklist

- Confirm `_middleware.ts` still issues JWTs and resolves access rights for new routes.
- Validate Stripe/licensing mutations in staging before production rollout.
- Update Playwright (or equivalent) specs that cover license/access workflows.
- Document new environment variables in `.env*` and deployment notes.

## Safety & Guardrails

- Never log PII or secrets; rely on structured logging with redaction.
- Ensure mutation endpoints are idempotent; handle EaC errors gracefully and surface readable messages.
- Keep debug utilities behind strict auth/feature flags.

## Ownership

- **Squad:** Admin Experience Squad.
- **Contact:** `#oi-admin-runtime` Slack.
- **Escalation:** Licensing Platform Lead (Priya Desai).

## Dependencies & Integrations

- Requires EaC Admin/Licensing APIs via `ctx.State.OIClient`.
- Uses Azure AD B2C + MSAL session storage provided by the runtime plugin.
- Stripe integration for subscription management is configured through environment variables consumed by `OpenIndustrialLicensingPlugin`.

## Related Docs

- Apps overview: [../Agents.md](../Agents.md).
- Runtime overview: [../../AGENTS.md](../../AGENTS.md).
- Reference architecture documentation: shared atomic components & runtime helpers in sibling repo.

## Changelog Expectations

- Update after major workflow changes (license issuance, workspace provisioning) or auth adjustments.
- Maintain release notes for administrators and support teams.
