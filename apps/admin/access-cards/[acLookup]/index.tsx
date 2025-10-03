// deno-lint-ignore-file no-explicit-any
import { PageProps } from '@fathym/eac-applications/preact';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import type { EaCAccessConfigurationAsCode, EverythingAsCodeIdentity } from '@fathym/eac-identity';
import { JSX } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { createAdminRuntimeClient } from '../../../../src/client/AdminRuntimeAPIClient.ts';
import {
  Action,
  ActionStyleTypes,
  Badge,
  CheckboxRow,
  Input,
} from '@o-industrial/atomic/atoms';
import { LoadingIcon } from '@o-industrial/atomic/icons';
import { IntentTypes } from '@o-industrial/common/types';
import { merge } from '@fathym/common';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

export const IsIsland = true;

type AccessConfigurationPageData = {
  AccessConfiguration?: EaCAccessConfigurationAsCode;
  AcLookup: string;
  Username: string;
  ProviderOptions: Record<string, unknown>;
  AccessRightOptions: Record<string, unknown>;
};

export const handler: EaCRuntimeHandlerSet<
  OpenIndustrialWebState,
  AccessConfigurationPageData
> = {
  GET: async (_req, ctx) => {
    const { acLookup } = ctx.Params as { acLookup: string };
    const eac = await ctx.State.OIClient.Admin.GetEaC<EverythingAsCodeIdentity>();
    const ac = eac?.AccessConfigurations?.[acLookup];
    const providerOptions = (eac?.Providers || {}) as Record<string, unknown>;
    const accessRightOptions = (eac?.AccessRights || {}) as Record<
      string,
      unknown
    >;

    return ctx.Render({
      AccessConfiguration: ac,
      AcLookup: acLookup,
      Username: ctx.State.Username,
      ProviderOptions: providerOptions,
      AccessRightOptions: accessRightOptions,
    });
  },
  async POST(req, ctx) {
    const { acLookup } = ctx.Params as { acLookup: string };

    try {
      let payload: Record<string, string> = {};

      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        payload = (await req.json()) as Record<string, string>;
      } else {
        const fd = await req.formData();
        fd.forEach((v, k) => (payload[k] = String(v)));
      }

      const eac = await ctx.State.OIClient.Admin.GetEaC<EverythingAsCodeIdentity>();
      const current = (eac?.AccessConfigurations?.[acLookup] ||
        {}) as EaCAccessConfigurationAsCode;

      const providerLookups = (
        payload['ProviderLookups'] ||
        payload['Providers'] ||
        ''
      )
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const accessRightLookups = (
        payload['AccessRightLookups'] ||
        payload['AccessRights'] ||
        ''
      )
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const updateBody: Partial<EaCAccessConfigurationAsCode> = {
        Details: {
          Name: payload['Name']?.trim() || undefined,
          Description: payload['Description']?.trim() || undefined,
        } as any,
        ProviderLookups: providerLookups,
        AccessRightLookups: accessRightLookups,
      };

      const commit: EverythingAsCodeIdentity = {
        AccessConfigurations: {
          [acLookup]: merge(current ?? {}, updateBody ?? {}),
        },
      };

      await ctx.State.OIClient.Admin.CommitEaC(commit);

      return Response.redirect(
        ctx.Runtime.URLMatch.FromBase(`./access-cards/${acLookup}`),
        303,
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
  async DELETE(_req, ctx) {
    const { acLookup } = ctx.Params as { acLookup: string };

    try {
      await ctx.State.OIClient.Admin.DeleteEaC({
        AccessConfigurations: { [acLookup]: null },
      });

      // // force=true overrides cooldown and unchanged-hash skips
      // await ctx.State.Refresher.RefreshNow(true);

      return Response.json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(msg, { status: 500 });
    }
  },
};

export default function AccessConfigurationPage({
  Data: {
    AccessConfiguration,
    AcLookup,
    Username,
    ProviderOptions,
    AccessRightOptions,
  },
}: PageProps<AccessConfigurationPageData>) {
  const [name, setName] = useState(AccessConfiguration?.Details?.Name ?? '');
  const [description, setDescription] = useState(
    AccessConfiguration?.Details?.Description ?? '',
  );
  const initialProviderLookups = ((AccessConfiguration as any)
    ?.ProviderLookups ??
    (AccessConfiguration as any)?.Providers ??
    []) as string[];
  const initialAccessRightLookups = ((AccessConfiguration as any)
    ?.AccessRightLookups ??
    (AccessConfiguration as any)?.AccessRights ??
    []) as string[];

  const [providerSelections, setProviderSelections] = useState<Set<string>>(
    new Set<string>(initialProviderLookups),
  );
  const [accessRightSelections, setAccessRightSelections] = useState<
    Set<string>
  >(new Set<string>(initialAccessRightLookups));

  // Keep selections in sync if data from server changes (e.g., after save)
  useEffect(() => {
    const nextProv = ((AccessConfiguration as any)?.ProviderLookups ??
      (AccessConfiguration as any)?.Providers ??
      []) as string[];
    const nextAR = ((AccessConfiguration as any)?.AccessRightLookups ??
      (AccessConfiguration as any)?.AccessRights ??
      []) as string[];
    setProviderSelections(new Set<string>(nextProv));
    setAccessRightSelections(new Set<string>(nextAR));
    // Only when incoming data changes; not on user toggles
  }, [
    AcLookup,
    JSON.stringify(
      (AccessConfiguration as any)?.ProviderLookups ??
        (AccessConfiguration as any)?.Providers ??
        [],
    ),
    JSON.stringify(
      (AccessConfiguration as any)?.AccessRightLookups ??
        (AccessConfiguration as any)?.AccessRights ??
        [],
    ),
  ]);

  // Collect unique tags from access rights for filter controls
  const allAccessRightTags = new Set<string>();
  Object.values(AccessRightOptions || {}).forEach((ar: unknown) => {
    const tags = ((ar as any)?.Details?.Tags as string[] | undefined) ?? [];
    tags.forEach((t) => t && allAccessRightTags.add(t));
  });

  const initialActiveTags = new Set<string>(Array.from(allAccessRightTags));
  const [activeTags, setActiveTags] = useState<Set<string>>(initialActiveTags);
  const [busy, setBusy] = useState(false);
  const apiClient = useMemo(() => createAdminRuntimeClient(), []);

  const visibleAccessRightLookups = Object.keys(
    AccessRightOptions || {},
  ).filter((arl) => {
    const tags = ((AccessRightOptions as any)?.[arl]?.Details?.Tags as
      | string[]
      | undefined) ?? [];

    if (activeTags.size === 0) return false; // all filters off => show none
    if (tags.length === 0) return true; // untagged rights always visible

    // Show if any tag on the right is active
    return tags.some((t) => activeTags.has(t));
  });

  async function handleDeleteClick() {
    if (!confirm('Delete this access configuration? This cannot be undone.')) {
      return;
    }

    try {
      setBusy(true);
      const res = await apiClient.AccessCards.Delete(AcLookup);

      if (res.ok) {
        location.href = './access-cards';
      } else {
        setBusy(false);
        const msg = await res.text();
        alert(`Delete failed: ${msg || res.status}`);
      }
    } catch (err) {
      setBusy(false);
      alert(
        `Delete failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  function handleFormSubmit(_e: JSX.TargetedEvent<HTMLFormElement, Event>) {
    // Allow natural submission; show spinner until navigation or error
    setBusy(true);
  }

  return (
    <div class='-:-:p-6 -:-:space-y-6'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>
          Access Configuration
        </h1>
        {Username && <span class='-:-:text-sm -:-:text-neutral-400'>{Username}</span>}
      </div>

      <div class='-:-:rounded-xl -:-:border -:-:border-neutral-700 -:-:bg-neutral-900/60 -:-:p-4 -:-:space-y-4 -:-:shadow-neon'>
        <div class='-:-:flex -:-:items-start -:-:justify-between'>
          <div>
            <h3 class='-:-:text-base -:-:font-semibold -:-:text-neutral-100'>
              {AccessConfiguration?.Details?.Name || AcLookup}
            </h3>
            <p class='-:-:text-xs -:-:text-neutral-400'>Lookup: {AcLookup}</p>
          </div>
          <Action
            href='./access-cards'
            styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
          >
            Back
          </Action>
        </div>

        <form
          method='POST'
          onSubmit={handleFormSubmit as any}
          class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-2 -:-:gap-4'
        >
          <input
            type='hidden'
            name='ProviderLookups'
            value={[...providerSelections].join(',')}
          />
          <input
            type='hidden'
            name='AccessRightLookups'
            value={[...accessRightSelections].join(',')}
          />
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
              placeholder='Short description'
              multiline
              rows={3}
              value={description}
              onInput={(e: JSX.TargetedEvent<HTMLTextAreaElement, Event>) =>
                setDescription(e.currentTarget.value)}
            />
          </div>

          <div class='md:-:-:col-span-2 -:-:space-y-2'>
            <h4 class='-:-:text-sm -:-:font-semibold -:-:text-neutral-200'>
              Providers
            </h4>
            <div class='-:-:grid -:-:grid-cols-1 sm:-:-:grid-cols-2 -:-:gap-2'>
              {Object.keys(ProviderOptions || {}).map((pl) => {
                const checked = providerSelections.has(pl);
                return (
                  <CheckboxRow
                    key={pl}
                    label={pl}
                    checked={checked}
                    onToggle={((next: boolean) => {
                      const ns = new Set(providerSelections);
                      if (next) ns.add(pl);
                      else ns.delete(pl);
                      setProviderSelections(ns);
                    }) as any}
                  />
                );
              })}
            </div>
          </div>

          <div class='md:-:-:col-span-2 -:-:space-y-2'>
            <h4 class='-:-:text-sm -:-:font-semibold -:-:text-neutral-200'>
              Access Rights
            </h4>
            {allAccessRightTags.size > 0 && (
              <div class='-:-:flex -:-:flex-wrap -:-:gap-2 -:-:mb-2'>
                {Array.from(allAccessRightTags)
                  .sort((a, b) => a.localeCompare(b))
                  .map((tag) => {
                    const isActive = activeTags.has(tag);
                    return (
                      <Badge
                        key={tag}
                        intentType={isActive ? IntentTypes.Info : IntentTypes.None}
                        class={`-:-:cursor-pointer ${isActive ? '' : '-:-:opacity-60'}`}
                        onClick={() => {
                          const next = new Set(activeTags);
                          if (isActive) next.delete(tag);
                          else next.add(tag);
                          setActiveTags(next);
                        }}
                      >
                        {tag}
                      </Badge>
                    );
                  })}
              </div>
            )}
            <div class='-:-:grid -:-:grid-cols-1 sm:-:-:grid-cols-2 -:-:gap-2'>
              {visibleAccessRightLookups.map((arl) => {
                const checked = accessRightSelections.has(arl);
                return (
                  <CheckboxRow
                    key={arl}
                    label={arl}
                    checked={checked}
                    onToggle={((next: boolean) => {
                      const ns = new Set(accessRightSelections);
                      if (next) ns.add(arl);
                      else ns.delete(arl);
                      setAccessRightSelections(ns);
                    }) as any}
                  />
                );
              })}
            </div>
          </div>

          <div
            class='md:-:-:col-span-2 -:-:flex -:-:justify-end -:-:gap-2 -:-:items-center'
            aria-busy={busy ? 'true' : 'false'}
          >
            {busy
              ? <LoadingIcon class='-:-:w-5 -:-:h-5 -:-:animate-spin -:-:text-neon-blue-500' />
              : (
                <>
                  <Action type='submit'>Save</Action>
                  <Action
                    type='button'
                    intentType={IntentTypes.Error}
                    styleType={ActionStyleTypes.Outline | ActionStyleTypes.Rounded}
                    onClick={handleDeleteClick as any}
                  >
                    Delete
                  </Action>
                </>
              )}
          </div>
        </form>
      </div>
    </div>
  );
}
