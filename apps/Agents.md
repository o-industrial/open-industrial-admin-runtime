# Agents Guide – Admin Runtime Apps

Overview of app surfaces hosted by `open-industrial-admin-runtime`.

## Directories
- `admin/` – primary administrator application (dashboards, licenses, users, workspaces). See [admin guide](admin/Agents.md).
- `assets/` – static assets (favicons, illustrations) served by the admin runtime.
- `tailwind/` – compiled CSS (`styles.css`) consumed by the Tailwind processor.

## Notes
- All additional admin surfaces should live inside `admin/` with colocated `api/` handlers for mutations.
- Asset additions require marketing/design review; keep files optimized and licensed.
- Tailwind changes should stay aligned with the shared config (`tailwind.config.ts`).

## Ownership
- **Primary owner:** Admin Experience Squad.
- **Contact:** `#oi-admin-runtime` Slack channel.
- **Escalation:** Licensing Platform Lead / Runtime Architecture Guild.

## Changelog
- Update this doc when new app directories are added or ownership shifts.
