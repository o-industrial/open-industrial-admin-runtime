// deno-lint-ignore-file no-explicit-any
import { useMemo, useState } from 'preact/hooks';
import { JSX } from 'preact';
import { PageProps } from '@fathym/eac-applications/preact';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import type {
  EaCLicenseAsCode,
  EaCLicensePlanAsCode,
  EaCLicensePriceAsCode,
  EaCLicensePriceDetails,
  EverythingAsCodeLicensing,
} from '@fathym/eac-licensing';
import { Action, ActionStyleTypes, Input } from '@o-industrial/common/atomic/atoms';
import { LoadingIcon } from '@o-industrial/common/atomic/icons';
import type { EverythingAsCode } from '@fathym/eac';
import { merge } from '@fathym/common';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';
import { IntentTypes } from '@o-industrial/common/types';
import { createAdminRuntimeClient } from '../../../../../../src/client/AdminRuntimeAPIClient.ts';

export const IsIsland = true;

type PricePageData = {
  LicLookup: string;
  PlanLookup: string;
  PriceLookup: string;
  Price?: EaCLicensePriceAsCode;
  Username?: string;
  Error?: string;
};

export const handler: EaCRuntimeHandlerSet<OpenIndustrialWebState, PricePageData> = {
  GET: async (req, ctx) => {
    const { licLookup, planLookup, priceLookup } = ctx.Params as {
      licLookup: string;
      planLookup: string;
      priceLookup: string;
    };
    const eac = await ctx.State.OIClient.Admin.GetEaC<EverythingAsCodeLicensing>();
    const error = new URL(req.url).searchParams.get('error') ?? undefined;

    const lic = eac.Licenses?.[licLookup] as EaCLicenseAsCode | undefined;
    const plan = lic?.Plans?.[planLookup] as EaCLicensePlanAsCode | undefined;
    const price = plan?.Prices?.[priceLookup] as EaCLicensePriceAsCode | undefined;

    return ctx.Render({
      LicLookup: licLookup,
      PlanLookup: planLookup,
      PriceLookup: priceLookup,
      Price: price,
      Username: ctx.State.Username,
      Error: error ?? undefined,
    });
  },
  async POST(req, ctx) {
    const { licLookup, planLookup, priceLookup } = ctx.Params as {
      licLookup: string;
      planLookup: string;
      priceLookup: string;
    };

    try {
      const eac = await ctx.State.OIClient.Admin.GetEaC<EverythingAsCodeLicensing>();
      const lic = (eac.Licenses?.[licLookup] || { Plans: {} }) as EaCLicenseAsCode;
      const plan = (lic.Plans?.[planLookup] || { Prices: {} }) as EaCLicensePlanAsCode;
      const price = (plan.Prices?.[priceLookup] || {}) as EaCLicensePriceAsCode;

      const ct = req.headers.get('content-type') || '';
      const data: Record<string, string> = {};
      if (ct.includes('application/json')) {
        Object.assign(data, await req.json());
      } else {
        const fd = await req.formData();
        fd.forEach((v, k) => (data[k] = String(v)));
      }

      const currentPriceDetails = price.Details as EaCLicensePriceDetails | undefined;
      const details: EaCLicensePriceDetails = {
        Name: data['Name'] ?? currentPriceDetails?.Name ?? '',
        Currency: data['Currency'] ?? currentPriceDetails?.Currency ?? 'usd',
        Interval: data['Interval'] ?? currentPriceDetails?.Interval ?? 'month',
        Value: data['Value'] ? Number(data['Value']) : currentPriceDetails?.Value ?? 0,
        Discount: data['Discount'] ? Number(data['Discount']) : currentPriceDetails?.Discount ?? 0,
      } as EaCLicensePriceDetails;

      const commit: EverythingAsCode = {
        Licenses: {
          [licLookup]: {
            ...lic,
            Plans: {
              ...(lic.Plans || {}),
              [planLookup]: {
                ...plan,
                Prices: {
                  ...(plan.Prices || {}),
                  [priceLookup]: merge(price, { Details: details }),
                },
              } as EaCLicensePlanAsCode,
            },
          } as EaCLicenseAsCode,
        },
      } as EverythingAsCode;

      await ctx.State.OIClient.Admin.CommitEaC(commit);
      return Response.redirect(
        ctx.Runtime.URLMatch.FromBase(
          `/licenses/${licLookup}/${planLookup}/${priceLookup}`,
        ),
        303,
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
  async DELETE(_req, ctx) {
    const { licLookup, planLookup, priceLookup } = ctx.Params as {
      licLookup: string;
      planLookup: string;
      priceLookup: string;
    };

    try {
      await ctx.State.OIClient.Admin.DeleteEaC({
        Licenses: {
          [licLookup]: ({
            Plans: {
              [planLookup]: ({
                Prices: { [priceLookup]: null },
              } as unknown as EaCLicensePlanAsCode),
            },
          } as unknown as EaCLicenseAsCode),
        },
      } as any);

      return Response.json({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return new Response(msg, { status: 500 });
    }
  },
};

export default function PricePage({
  Data: { Price, LicLookup, PlanLookup, PriceLookup, Username, Error: ErrorMsg },
}: PageProps<PricePageData>) {
  const defaultDetails: EaCLicensePriceDetails = useMemo(
    () => ({ Name: '', Currency: 'usd', Interval: 'month', Value: 0, Discount: 0 }),
    [],
  );

  type LocalPrice = Omit<EaCLicensePriceAsCode, 'Details'> & { Details: EaCLicensePriceDetails };
  const [local, setLocal] = useState<LocalPrice>(() =>
    Price
      ? {
        ...(Price as EaCLicensePriceAsCode),
        Details: { ...defaultDetails, ...(Price.Details as any || {}) },
      }
      : { Details: defaultDetails } as any
  );
  const [busy, setBusy] = useState(false);
  const apiClient = useMemo(() => createAdminRuntimeClient(), []);

  const update = (field: keyof EaCLicensePriceDetails, value: any) =>
    setLocal({ ...local, Details: { ...local.Details, [field]: value } });

  return (
    <div class='-:-:p-6 -:-:space-y-6'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>Price: {PriceLookup}</h1>
        {Username && <span class='-:-:text-sm -:-:text-neutral-400'>👤 {Username}</span>}
      </div>

      {ErrorMsg && (
        <div class='-:-:text-sm -:-:text-neon-red-400 -:-:border -:-:border-neon-red-700 -:-:rounded -:-:p-2'>
          {ErrorMsg}
        </div>
      )}

      <div class='-:-:rounded-xl -:-:border -:-:border-neutral-700 -:-:bg-neutral-900/60 -:-:p-4 -:-:space-y-4'>
        <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>Details</h2>
        <form
          method='POST'
          onSubmit={() => setBusy(true) as any}
          class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-2 -:-:gap-4'
        >
          <Input
            label='Name'
            name='Name'
            placeholder='Name'
            value={local.Details?.Name ?? ''}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              update('Name', e.currentTarget.value)}
          />
          <Input
            label='Currency'
            name='Currency'
            placeholder='Currency (e.g., usd)'
            value={local.Details?.Currency ?? ''}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              update('Currency', e.currentTarget.value)}
          />
          <Input
            label='Interval'
            name='Interval'
            placeholder='Interval (e.g., month)'
            value={local.Details?.Interval ?? ''}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              update('Interval', e.currentTarget.value)}
          />
          <Input
            label='Value'
            name='Value'
            type='number'
            placeholder='Value'
            value={String(local.Details?.Value ?? 0)}
            onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
              update('Value', Number(e.currentTarget.value) || 0)}
          />
          <div class='md:-:-:col-span-2'>
            <Input
              label='Discount'
              name='Discount'
              type='number'
              placeholder='Discount'
              value={String(local.Details?.Discount ?? 0)}
              onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
                update('Discount', Number(e.currentTarget.value) || 0)}
            />
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
                    onClick={async () => {
                      if (!confirm('Delete this price? This cannot be undone.')) return;
                      try {
                        setBusy(true);
                        const res = await apiClient.Licenses.DeletePlanPrice(
                          LicLookup,
                          PlanLookup,
                          PriceLookup,
                        );
                        if (res.ok) {
                          location.href = `/licenses/${LicLookup}/${PlanLookup}`;
                        } else {
                          setBusy(false);
                          const msg = await res.text();
                          alert(`Delete failed: ${msg || res.status}`);
                        }
                      } catch (err) {
                        setBusy(false);
                        const msg = err instanceof Error ? err.message : String(err);
                        alert(`Delete failed: ${msg}`);
                      }
                    }}
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
