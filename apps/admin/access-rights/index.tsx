import { PageProps } from '@fathym/eac-applications/preact';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { EaCAccessRightAsCode, EverythingAsCodeIdentity } from '@fathym/eac-identity';
import { Action, ActionStyleTypes, Input } from '@o-industrial/common/atomic/atoms';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

export const IsIsland = true;

// Types now provided by @fathym/eac-identity

type AccessRightsPageData = {
  AccessRights: Record<string, EaCAccessRightAsCode>;
  Username: string;
};

export const handler: EaCRuntimeHandlerSet<
  OpenIndustrialWebState,
  AccessRightsPageData
> = {
  GET: async (_req, ctx) => {
    const eac = await ctx.State.OIClient.Admin.GetEaC<
      { AccessRights?: Record<string, EaCAccessRightAsCode> }
    >();

    return ctx.Render({
      AccessRights: eac?.AccessRights || {},
      Username: ctx.State.Username,
    });
  },
  async POST(req, ctx) {
    try {
      const ct = req.headers.get('content-type') || '';
      const payload: Record<string, string> = {};
      if (ct.includes('application/json')) {
        Object.assign(payload, await req.json());
      } else {
        const fd = await req.formData();
        fd.forEach((v, k) => (payload[k] = String(v)));
      }

      const arLookup = (payload['arLookup'] || '').trim();
      if (!arLookup) throw new Error('arLookup is required');

      const details: NonNullable<EaCAccessRightAsCode['Details']> = {
        Name: payload['Name']?.trim() || undefined,
        Description: payload['Description']?.trim() || undefined,
        Tags: (payload['Tags'] || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        Enabled: false,
      } as NonNullable<EaCAccessRightAsCode['Details']>;

      const commit: EverythingAsCodeIdentity = {
        AccessRights: {
          [arLookup]: {
            Details: details,
          } as EaCAccessRightAsCode,
        },
      } as EverythingAsCodeIdentity;

      await ctx.State.OIClient.Admin.CommitEaC(commit);

      return Response.redirect(
        ctx.Runtime.URLMatch.FromOrigin(`/admin/access-rights/${arLookup}`),
        303,
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
};

export default function AccessRightsPage({
  Data: { AccessRights, Username },
}: PageProps<AccessRightsPageData>) {
  const [showCreate, setShowCreate] = useState(false);
  const [arLookup, setArLookup] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // form posts plain fields; server builds structure

  return (
    <div class='-:-:p-6 -:-:space-y-6'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>
          Access Rights
        </h1>
        {Username && <span class='-:-:text-sm -:-:text-neutral-400'>{Username}</span>}
      </div>

      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <p class='-:-:text-sm -:-:text-neutral-300'>
          Organize and manage identity access rights.
        </p>
        <Action
          onClick={() => setShowCreate((s) => !s)}
          intentType={1}
          styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
        >
          {showCreate ? 'Close' : 'New Access Right'}
        </Action>
      </div>

      {showCreate && (
        <div class='-:-:rounded-xl -:-:border -:-:border-neutral-700 -:-:bg-neutral-900/60 -:-:p-4 -:-:space-y-4 -:-:shadow-neon'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Create Access Right
          </h2>
          <form
            method='POST'
            action='/admin/access-rights'
            class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-2 -:-:gap-4'
          >
            <div>
              <Input
                label='Access Right Lookup'
                name='arLookup'
                placeholder='unique-access-right-key'
                value={arLookup}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setArLookup(e.currentTarget.value)}
              />
            </div>
            <div>
              <Input
                label='Display Name'
                name='Name'
                placeholder='Access Right Name'
                value={name}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setName(e.currentTarget.value)}
              />
            </div>
            <div class='md:-:-:col-span-2'>
              <Input
                label='Description'
                name='Description'
                placeholder='Short description for this access right'
                multiline
                rows={3}
                value={description}
                onInput={(e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) =>
                  setDescription(e.currentTarget.value)}
              />
            </div>
            <div class='md:-:-:col-span-2'>
              <Input
                label='Tags (comma-separated)'
                name='Tags'
                placeholder='e.g. admin, billing, read-only'
                value={tags}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setTags(e.currentTarget.value)}
              />
            </div>
            {/* Server-side builds structure; no JSON hidden field */}

            <div class='md:-:-:col-span-2 -:-:flex -:-:justify-end -:-:gap-2'>
              <Action type='submit'>Create</Action>
              <Action
                type='button'
                intentType={2}
                styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Action>
            </div>
          </form>
        </div>
      )}

      <div class='-:-:grid -:-:grid-cols-1 sm:-:-:grid-cols-2 lg:-:-:grid-cols-3 -:-:gap-4'>
        {Object.entries(AccessRights).map(([lookup, ar]) => (
          <div
            key={lookup}
            class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4 -:-:space-y-3 -:-:hover:-:-:border-neon-blue-500 -:-:transition-default'
          >
            <div class='-:-:flex -:-:items-start -:-:justify-between'>
              <div>
                <h3 class='-:-:text-base -:-:font-semibold -:-:text-neutral-100'>
                  {ar.Details?.Name || lookup}
                </h3>
                <p class='-:-:text-xs -:-:text-neutral-400'>Lookup: {lookup}</p>
              </div>
              <Action
                href={`/admin/access-rights/${lookup}`}
                data-eac-bypass-base
                styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
              >
                Manage
              </Action>
            </div>

            {ar.Details?.Description && (
              <p class='-:-:text-sm -:-:text-neutral-300'>
                {ar.Details.Description}
              </p>
            )}

            {ar.Details?.Tags && ar.Details.Tags.length > 0 && (
              <p class='-:-:text-xs -:-:text-neutral-400'>
                Tags: {ar.Details.Tags.join(', ')}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
