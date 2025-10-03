// deno-lint-ignore-file no-explicit-any
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/preact';
import { Action, ActionStyleTypes } from '@o-industrial/atomic/atoms';
import { WorkspaceList } from '@o-industrial/atomic/molecules';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

export const IsIsland = true;

type UserAccessCard = { AccessConfigurationLookup: string; Username: string };

type UserManagePageData = {
  Username: string;
  Licenses: Record<string, any>;
  Cards: UserAccessCard[];
  AvailableConfigs: { lookup: string; name: string }[];
  Workspaces: any[];
};

export const handler: EaCRuntimeHandlerSet<OpenIndustrialWebState, UserManagePageData> = {
  GET: async (_req, ctx) => {
    const { username: rawUsername } = ctx.Params as { username: string };
    const username = decodeURIComponent(rawUsername || '');
    const [lics, acs, eac, wss] = await Promise.all([
      ctx.State.OIClient.Admin.ListUserLicenses(username),
      ctx.State.OIClient.Admin.ListUserAccessCards(username),
      ctx.State.OIClient.Admin.GetEaC<any>(),
      ctx.State.OIClient.Admin.ListUserWorkspaces(username),
    ]);
    const acMap: Record<string, { Details?: { Name?: string } }> = eac?.AccessConfigurations || {};
    const allCfgs = Object.entries(acMap).map(([lookup, ac]) => ({
      lookup,
      name: ac?.Details?.Name ?? lookup,
    }));
    const assigned = new Set(acs.map((c) => c.AccessConfigurationLookup));
    const available = allCfgs.filter((c) => !assigned.has(c.lookup));
    return ctx.Render({
      Username: username,
      Licenses: lics,
      Cards: acs,
      AvailableConfigs: available,
      Workspaces: wss,
    });
  },
  POST: async (req, ctx) => {
    const { username: rawUsername } = ctx.Params as { username: string };
    const username = decodeURIComponent(rawUsername || '');
    const ct = req.headers.get('content-type') || '';
    let body: Record<string, string> = {};
    if (ct.includes('application/json')) {
      body = await req.json() as Record<string, string>;
    } else {
      const fd = await req.formData();
      fd.forEach((v, k) => (body[k] = String(v)));
    }
    const action = (body['action'] || '').trim();
    try {
      if (action === 'addCard') {
        const ac = (body['AccessConfigurationLookup'] || '').trim();
        if (!ac) throw new Error('AccessConfigurationLookup required');
        await ctx.State.OIClient.Admin.AddUserAccessCard(username, ac);
      } else if (action === 'removeCard') {
        const ac = (body['AccessConfigurationLookup'] || '').trim();
        if (!ac) throw new Error('AccessConfigurationLookup required');
        await ctx.State.OIClient.Admin.RemoveUserAccessCard(username, ac);
      } else if (action === 'cancelLicense') {
        const lic = (body['licLookup'] || '').trim();
        if (!lic) throw new Error('licLookup required');
        await ctx.State.OIClient.Admin.CancelUserLicense(username, lic);
      } else if (action === 'deleteUser') {
        await ctx.State.OIClient.Admin.DeleteUser(username);
        return Response.redirect(
          ctx.Runtime.URLMatch.FromBase(
            `./users?deleted=${encodeURIComponent(username)}`,
          ),
          303,
        );
      }
      return Response.redirect(
        ctx.Runtime.URLMatch.FromBase(`./users/${encodeURIComponent(username)}`),
        303,
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
};

export default function AdminUserManagePage(
  { Data: { Username, Licenses, Cards, AvailableConfigs, Workspaces } }: PageProps<
    UserManagePageData
  >,
) {
  return (
    <div class='-:-:p-6 -:-:space-y-6'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>User</h1>
        <div class='-:-:flex -:-:items-center -:-:gap-3'>
          <span class='-:-:text-sm -:-:text-neutral-400'>{Username}</span>
          <form
            method='POST'
            onSubmit={(e) => {
              if (!confirm('Delete this user? This cannot be undone.')) {
                e.preventDefault();
              }
            }}
          >
            <input type='hidden' name='action' value='deleteUser' />
            <Action
              type='submit'
              intentType={2}
              styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
            >
              Delete
            </Action>
          </form>
        </div>
      </div>

      <div class='-:-:grid -:-:grid-cols-1 lg:-:-:grid-cols-2 -:-:gap-6'>
        <div class='-:-:space-y-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>Licenses</h2>
          <div class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:divide-y -:-:divide-neutral-800'>
            {Object.keys(Licenses).length === 0 && (
              <div class='-:-:p-4 -:-:text-neutral-400'>No active licenses.</div>
            )}
            {Object.entries(Licenses).map(([lookup, lic]) => (
              <div class='-:-:p-4 -:-:flex -:-:items-center -:-:justify-between' key={lookup}>
                <div>
                  <div class='-:-:text-neutral-100 -:-:font-medium'>
                    {(lic as any)?.Details?.Name || lookup}
                  </div>
                  <div class='-:-:text-neutral-400 -:-:text-xs'>Lookup: {lookup}</div>
                </div>
                <form method='POST'>
                  <input type='hidden' name='action' value='cancelLicense' />
                  <input type='hidden' name='licLookup' value={lookup} />
                  <Action
                    type='submit'
                    intentType={2}
                    styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
                  >
                    Cancel
                  </Action>
                </form>
              </div>
            ))}
          </div>
        </div>

        <div class='-:-:space-y-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>Access Cards</h2>
          <form method='POST' class='-:-:flex -:-:gap-2'>
            <input type='hidden' name='action' value='addCard' />
            <div class='-:-:flex-1'>
              <label class='-:-:block -:-:text-sm -:-:text-neutral-300'>
                Access Configuration
              </label>
              <select
                name='AccessConfigurationLookup'
                class='-:-:mt-1 -:-:w-full -:-:rounded-md -:-:border -:-:border-neutral-700 -:-:bg-neutral-900 -:-:p-2 -:-:text-neutral-100'
                required
              >
                <option value=''>Select an access configuration</option>
                {AvailableConfigs.map((c) => (
                  <option value={c.lookup} key={c.lookup}>
                    {c.name}
                    {c.name !== c.lookup ? ` (${c.lookup})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div class='-:-:self-end'>
              <Action type='submit'>Add</Action>
            </div>
          </form>

          <div class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:divide-y -:-:divide-neutral-800'>
            {Cards.length === 0 && (
              <div class='-:-:p-4 -:-:text-neutral-400'>No access cards assigned.</div>
            )}
            {Cards.map((c) => (
              <div
                class='-:-:p-4 -:-:flex -:-:items-center -:-:justify-between'
                key={c.AccessConfigurationLookup}
              >
                <div>
                  <div class='-:-:text-neutral-100 -:-:font-medium'>
                    {c.AccessConfigurationLookup}
                  </div>
                  <div class='-:-:text-neutral-400 -:-:text-xs'>Direct assignment</div>
                </div>
                <form method='POST'>
                  <input type='hidden' name='action' value='removeCard' />
                  <input
                    type='hidden'
                    name='AccessConfigurationLookup'
                    value={c.AccessConfigurationLookup}
                  />
                  <Action
                    type='submit'
                    intentType={2}
                    styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
                  >
                    Remove
                  </Action>
                </form>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Workspaces */}
      <div class='-:-:space-y-3'>
        <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>Workspaces</h2>
        {Workspaces.length === 0
          ? <div class='-:-:text-neutral-400'>No workspaces found.</div>
          : (
            <WorkspaceList
              workspaces={Workspaces}
              onSelect={(eac) => {
                const lookup = eac.EnterpriseLookup || '';
                if (lookup) {
                  location.href = `./workspaces/${encodeURIComponent(lookup)}`;
                }
              }}
            />
          )}
      </div>
    </div>
  );
}
