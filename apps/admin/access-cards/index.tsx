import { PageProps } from '@fathym/eac-applications/preact';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { JSX } from 'preact';
import { useState } from 'preact/hooks';
import type { EaCAccessConfigurationAsCode, EverythingAsCodeIdentity } from '@fathym/eac-identity';
import { Action, ActionStyleTypes, Input } from '@o-industrial/atomic/atoms';
import type { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

export const IsIsland = true;

type AccessConfigsPageData = {
  AccessConfigurations: Record<string, EaCAccessConfigurationAsCode>;
  Username: string;
};

export const handler: EaCRuntimeHandlerSet<
  OpenIndustrialWebState,
  AccessConfigsPageData
> = {
  GET: async (_req, ctx) => {
    const eac = await ctx.State.OIClient.Admin.GetEaC<EverythingAsCodeIdentity>();

    return ctx.Render({
      AccessConfigurations: eac?.AccessConfigurations || {},
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

      const acLookup = (payload['acLookup'] || '').trim();
      if (!acLookup) throw new Error('acLookup is required');

      const details: NonNullable<EaCAccessConfigurationAsCode['Details']> = {
        Name: payload['Name']?.trim() || undefined,
        Description: payload['Description']?.trim() || undefined,
      } as NonNullable<EaCAccessConfigurationAsCode['Details']>;

      const commit: EverythingAsCodeIdentity = {
        AccessConfigurations: {
          [acLookup]: {
            Details: details,
          } as EaCAccessConfigurationAsCode,
        },
      };

      const _resp = await ctx.State.OIClient.Admin.CommitEaC(commit);

      return Response.redirect(
        ctx.Runtime.URLMatch.FromBase(`./access-cards/${acLookup}`),
        303,
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
};

export default function AccessConfigurationsPage({
  Data: { AccessConfigurations, Username },
}: PageProps<AccessConfigsPageData>) {
  const [showCreate, setShowCreate] = useState(false);
  const [acLookup, setAcLookup] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div class='-:-:p-6 -:-:space-y-6'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>
          Access Configurations
        </h1>
        {Username && <span class='-:-:text-sm -:-:text-neutral-400'>{Username}</span>}
      </div>

      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <p class='-:-:text-sm -:-:text-neutral-300'>
          Configure access before issuing as access cards.
        </p>
        <Action
          onClick={() => setShowCreate((s) => !s)}
          intentType={1}
          styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
        >
          {showCreate ? 'Close' : 'New Access Configuration'}
        </Action>
      </div>

      {showCreate && (
        <div class='-:-:rounded-xl -:-:border -:-:border-neutral-700 -:-:bg-neutral-900/60 -:-:p-4 -:-:space-y-4 -:-:shadow-neon'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Create Access Configuration
          </h2>
          <form
            method='POST'
            class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-2 -:-:gap-4'
          >
            <div>
              <Input
                label='Access Configuration Lookup'
                name='acLookup'
                placeholder='unique-access-config-key'
                value={acLookup}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setAcLookup(e.currentTarget.value)}
              />
            </div>
            <div>
              <Input
                label='Display Name'
                name='Name'
                placeholder='Access Configuration Name'
                value={name}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setName(e.currentTarget.value)}
              />
            </div>
            <div class='md:-:-:col-span-2'>
              <Input
                label='Description'
                name='Description'
                placeholder='Short description for this access configuration'
                multiline
                rows={3}
                value={description}
                onInput={(e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) =>
                  setDescription(e.currentTarget.value)}
              />
            </div>

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
        {Object.entries(AccessConfigurations).map(([lookup, ac]) => (
          <div
            key={lookup}
            class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4 -:-:space-y-3 -:-:hover:-:-:border-neon-blue-500 -:-:transition-default'
          >
            <div class='-:-:flex -:-:items-start -:-:justify-between'>
              <div>
                <h3 class='-:-:text-base -:-:font-semibold -:-:text-neutral-100'>
                  {ac?.Details?.Name || lookup}
                </h3>
                <p class='-:-:text-xs -:-:text-neutral-400'>Lookup: {lookup}</p>
              </div>
              <Action
                href={`./access-cards/${lookup}`}
                styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
              >
                Manage
              </Action>
            </div>

            {ac?.Details?.Description && (
              <p class='-:-:text-sm -:-:text-neutral-300'>{ac.Details.Description}</p>
            )}

            {/* Relationships (providers, access rights) will be managed on the detail page */}
          </div>
        ))}
      </div>
    </div>
  );
}
