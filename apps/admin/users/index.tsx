import { JSX } from 'preact';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/preact';
import { useState } from 'preact/hooks';
import { Action, ActionStyleTypes, Input } from '@o-industrial/atomic/atoms';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

export const IsIsland = true;

type UsersPageData = {
  Users: { Username?: string; EnterpriseName?: string }[];
  Query: string;
  Invited?: string;
  Deleted?: string;
  Username: string;
};

export const handler: EaCRuntimeHandlerSet<
  OpenIndustrialWebState,
  UsersPageData
> = {
  GET: async (req, ctx) => {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const users = await ctx.State.OIClient.Admin.ListUsers(q || undefined);
    const invited = url.searchParams.get('invited') || undefined;
    const deleted = url.searchParams.get('deleted') || undefined;
    return ctx.Render({
      Users: users,
      Query: q,
      Invited: invited || undefined,
      Deleted: deleted || undefined,
      Username: ctx.State.Username,
    });
  },
  async POST(req, ctx) {
    try {
      const ct = req.headers.get('content-type') || '';
      let payload: Record<string, string> = {};
      if (ct.includes('application/json')) {
        payload = (await req.json()) as Record<string, string>;
      } else {
        const fd = await req.formData();
        fd.forEach((v, k) => (payload[k] = String(v)));
      }
      const action = (payload['action'] || '').trim();
      if (action === 'deleteUser') {
        const delUser = (payload['Username'] || '').trim();
        if (!delUser) return new Response('Username is required', { status: 400 });
        await ctx.State.OIClient.Admin.DeleteUser(delUser);
        const redirect = new URL(ctx.Runtime.URLMatch.FromBase('./users'));
        redirect.searchParams.set('deleted', delUser);
        return Response.redirect(redirect, 303);
      } else {
        const email = (payload['Email'] || payload['Username'] || '').trim();
        if (!email) return new Response('Email is required', { status: 400 });

        await ctx.State.OIClient.Admin.InviteUser(email);

        const redirect = new URL(ctx.Runtime.URLMatch.FromBase('./users'));
        redirect.searchParams.set('invited', email);
        return Response.redirect(redirect, 303);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(msg, { status: 500 });
    }
  },
};

export default function AdminUsersPage({
  Data: { Users, Query, Invited, Deleted, Username },
}: PageProps<UsersPageData>) {
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState(Query || '');

  return (
    <div class='-:-:p-6 -:-:space-y-6 -:-:pb-28'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>
          Users
        </h1>
        {Username && <span class='-:-:text-sm -:-:text-neutral-400'>{Username}</span>}
      </div>

      {Invited && (
        <div class='-:-:rounded-md -:-:border -:-:border-green-700 -:-:bg-green-950/70 -:-:text-green-200 -:-:px-3 -:-:py-2'>
          Invited {Invited} to admin.
        </div>
      )}
      {Deleted && (
        <div class='-:-:rounded-md -:-:border -:-:border-red-700 -:-:bg-red-950/70 -:-:text-red-200 -:-:px-3 -:-:py-2'>
          Deleted {Deleted} from admin.
        </div>
      )}

      <form method='GET' class='-:-:flex -:-:gap-2 -:-:items-end'>
        <div class='-:-:flex-1'>
          <Input
            label='Search'
            name='q'
            placeholder='Search users'
            value={search}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              setSearch(e.currentTarget.value)}
          />
        </div>
        <Action
          type='submit'
          styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
        >
          Search
        </Action>
      </form>

      <div class='-:-:grid -:-:grid-cols-1 sm:-:-:grid-cols-2 lg:-:-:grid-cols-3 -:-:gap-4'>
        {Users.map((u) => (
          <div
            key={`${u.Username || 'unknown'}-${u.EnterpriseName || 'workspace'}`}
            class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4 -:-:space-y-3 -:-:hover:-:-:border-neon-blue-500 -:-:transition-default'
          >
            <div class='-:-:flex -:-:items-start -:-:justify-between'>
              <div>
                <h3 class='-:-:text-base -:-:font-semibold -:-:text-neutral-100'>
                  {u.Username || '—'}
                </h3>
                <p class='-:-:text-xs -:-:text-neutral-400'>
                  Workspace: {u.EnterpriseName || '—'}
                </p>
              </div>
              {u.Username && (
                <div class='-:-:flex -:-:gap-2'>
                  <Action
                    href={`./users/${encodeURIComponent(u.Username)}`}
                    styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
                  >
                    Manage
                  </Action>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {/* Sticky invite bar pinned to bottom */}
      <div class='-:-:fixed -:-:bottom-0 -:-:left-0 -:-:right-0 -:-:z-40'>
        <div class='-:-:mx-auto -:-:max-w-6xl -:-:px-4 -:-:pb-4'>
          <div class='-:-:rounded-t-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/80 -:-:backdrop-blur -:-:px-4 -:-:py-3 -:-:shadow-neon'>
            <form
              method='POST'
              class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-3 -:-:gap-3 -:-:items-end'
            >
              <input type='hidden' name='action' value='inviteUser' />
              <div class='md:-:-:col-span-2'>
                <Input
                  label='Invite Admin (Email)'
                  type='email'
                  name='Email'
                  placeholder='user@example.com'
                  required
                  value={email}
                  onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                    setEmail(e.currentTarget.value)}
                />
              </div>
              <div class='md:-:-:col-span-1 -:-:flex -:-:justify-end'>
                <Action
                  type='submit'
                  styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
                >
                  Invite
                </Action>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

