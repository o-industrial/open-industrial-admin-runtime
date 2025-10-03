import { PageProps } from '@fathym/eac-applications/preact';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import type {
  EaCLicenseAsCode,
  EaCLicenseStripeDetails,
  EverythingAsCodeLicensing,
} from '@fathym/eac-licensing';
import type { EverythingAsCode } from '@fathym/eac';
import { useState } from 'preact/hooks';
import { JSX } from 'preact';
import { Action, ActionStyleTypes, Input } from '@o-industrial/atomic/atoms';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

export const IsIsland = true;

type LicensesPageData = {
  Licenses: Record<string, EaCLicenseAsCode>;
  Username: string;
};

export const handler: EaCRuntimeHandlerSet<OpenIndustrialWebState, LicensesPageData> = {
  GET: async (_req, ctx) => {
    const eac = await ctx.State.OIClient.Admin.GetEaC<EverythingAsCodeLicensing>();

    return ctx.Render({
      Licenses: eac.Licenses || {},
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

      const licLookup = (payload['licLookup'] || '').trim();
      if (!licLookup) throw new Error('licLookup is required');

      const details: EaCLicenseStripeDetails = {
        Name: payload['Name'] ?? '',
        Description: payload['Description'] ?? '',
        Enabled: false,
        PublishableKey: '',
        SecretKey: '',
        WebhookSecret: '',
      };

      const commit: EverythingAsCode = {
        Licenses: {
          [licLookup]: {
            Details: details,
            Plans: {},
          } as EaCLicenseAsCode,
        },
      } as EverythingAsCode;

      await ctx.State.OIClient.Admin.CommitEaC(commit);

      return Response.redirect(
        ctx.Runtime.URLMatch.FromBase(`./licenses/${licLookup}`),
        303,
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
};

export default function LicensesPage(
  { Data: { Licenses, Username } }: PageProps<LicensesPageData>,
) {
  const [showCreate, setShowCreate] = useState(false);
  const [licLookup, setLicLookup] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // form posts plain fields; server builds structure

  return (
    <div class='-:-:p-6 -:-:space-y-6'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>Licenses</h1>
        {Username && <span class='-:-:text-sm -:-:text-neutral-400'>👤 {Username}</span>}
      </div>

      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <p class='-:-:text-sm -:-:text-neutral-300'>Manage product licenses, plans, and pricing.</p>
        <Action
          onClick={() => setShowCreate((s) => !s)}
          intentType={1}
          styleType={ActionStyleTypes.Solid | ActionStyleTypes.Rounded}
        >
          {showCreate ? 'Close' : 'New License'}
        </Action>
      </div>

      {showCreate && (
        <div class='-:-:rounded-xl -:-:border -:-:border-neutral-700 -:-:bg-neutral-900/60 -:-:p-4 -:-:space-y-4 -:-:shadow-neon'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>Create License</h2>
          <form
            method='POST'
            class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-2 -:-:gap-4'
          >
            <div>
              <Input
                label='License Lookup'
                name='licLookup'
                placeholder='unique-license-key'
                value={licLookup}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setLicLookup(e.currentTarget.value)}
              />
            </div>
            <div>
              <Input
                label='Display Name'
                name='Name'
                placeholder='Product License Name'
                value={name}
                onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                  setName(e.currentTarget.value)}
              />
            </div>
            <div class='md:-:-:col-span-2'>
              <Input
                label='Description'
                name='Description'
                placeholder='Short description for this license'
                multiline
                rows={3}
                value={description}
                onInput={(e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) =>
                  setDescription(e.currentTarget.value)}
              />
            </div>

            {/* Server builds structure; no JSON hidden field */}

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
        {Object.entries(Licenses).map(([lookup, lic]) => (
          <div
            key={lookup}
            class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4 -:-:space-y-3 -:-:hover:-:-:border-neon-blue-500 -:-:transition-default'
          >
            <div class='-:-:flex -:-:items-start -:-:justify-between'>
              <div>
                <h3 class='-:-:text-base -:-:font-semibold -:-:text-neutral-100'>
                  {lic.Details?.Name || lookup}
                </h3>
                <p class='-:-:text-xs -:-:text-neutral-400'>Lookup: {lookup}</p>
              </div>
              <Action
                href={`./licenses/${lookup}`}
                styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
              >
                Manage
              </Action>
            </div>
            {lic.Details?.Description && (
              <p class='-:-:text-sm -:-:text-neutral-300'>{lic.Details.Description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
