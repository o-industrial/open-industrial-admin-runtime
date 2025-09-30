# Agents Guide � open-industrial-admin-runtime

Dedicated runtime for Open Industrial administrator experiences. Hosts secure dashboards and APIs for licensing, access management, user administration, and workspace provisioning, independently deployed from the marketing/workspace runtime.

## Scope
- Serve authenticated admin UI under `apps/admin/**` and supporting assets/tailwind bundles.
- Compose runtime plugins for MSAL, licensing, and atomic icon infrastructure.
- Proxy or integrate with downstream API/EaC services required by admin workflows.
- Exclude public marketing surfaces or general workspace UX (handled by web/runtime repos).

## Project Map
- `apps/admin/**` � core admin routes, detail pages, and colocated API handlers.
- `apps/assets` � static assets consumed by the admin runtime.
- `apps/tailwind` � compiled CSS template consumed by the Tailwind processor.
- `src/plugins` � runtime plugin composition (`RuntimePlugin.ts`, shared handler resolver).
- `configs/eac-runtime.config.ts` � EaC runtime configuration entrypoint.
- `deno.jsonc` � tooling imports/tasks, including tailwind/npm dependencies.
- `.env*` � environment templates for local/dev/docker/prod.

## Commands
- `deno task dev` � launch runtime in watch mode (default port 5415).
- `deno task check` � format check, lint, and type-check (run before PRs).
- `deno task test` � execute admin runtime tests.
- `deno task build` � full validation (fmt + lint + publish dry-run + tests).
- Docker helpers: `deno task build:docker`, `deno task refresh:docker`.

## Patterns
- Each admin route pairs UI with a server handler (`api/`) that performs EaC commits and redirects via HTTP 303.
- Auth flows rely on MSAL + ADB2C plugins defined in `src/plugins/RuntimePlugin.ts`; ensure middleware `_middleware.ts` preserves state expectations.
- Shared UI comes from `@o-industrial/common` atomic exports; avoid duplicating components locally.
- Tailwind styles are generated via the runtime Tailwind processor; keep CSS changes compatible with the shared config.

## Review & Test Checklist
- Verify `_middleware.ts` continues to issue JWTs/access rights needed by downstream APIs.
- Validate licensing/access rights flows with `deno task test` (and Playwright if available) before release.
- Ensure new env vars are documented in `.env*` and reflected in deployment secrets.
- Confirm navigation updates (AdminNav) remain consistent and accessible.

## Safety & Guardrails
- Do not log sensitive license or user data; rely on existing structured logging helpers.
- Mutation endpoints must be idempotent and redirect on success/failure.
- Keep secrets out of the repo; only placeholder/sample values belong in `.env*`.
- Coordinate with API/runtime teams when adjusting EaC schemas or required scopes.

## Ownership & Contacts
- **Primary squad:** Admin Experience Squad.
- **Slack channel:** `#oi-admin-runtime`.
- **Escalation:** Licensing Platform Lead (Priya Desai) / Runtime Architecture Guild.

## Dependencies & Integrations
- Consumes shared runtime helpers via `@o-industrial/common/runtimes` exports (state, access resolvers).
- Requires EaC Admin + Licensing services, Azure AD B2C/MSAL configuration, and Stripe licensing webhooks.
- Proxied/embedded within the Core runtime via the new `/admin` proxy (see `open-industrial-core-runtime`).

## Related Docs
- Parent repo inventory: [Agents.inventory.md](../Agents.inventory.md).
- Web runtime guide: [open-industrial-web-runtime/AGENTS.md](../open-industrial-web-runtime/AGENTS.md).
- Admin app details: [apps/Agents.md](apps/Agents.md) and [apps/admin/Agents.md](apps/admin/Agents.md).

## Changelog Expectations
- Update this guide whenever major admin workflows, auth requirements, or deployment steps change.
- Keep env templates and documentation in sync with infrastructure updates.
