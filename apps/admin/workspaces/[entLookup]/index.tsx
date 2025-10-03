// deno-lint-ignore-file no-explicit-any
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/preact';
import { Action, ActionStyleTypes } from '@o-industrial/atomic/atoms';
import { PanelShell, SummaryRowWithAction } from '@o-industrial/atomic/molecules';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';
import { useState } from 'preact/hooks';
import { EverythingAsCodeOIWorkspace } from '@o-industrial/common/eac';
import { EaCCloudAzureDetails } from '@fathym/eac-azure';

type WorkspaceManageData = {
  Workspace: EverythingAsCodeOIWorkspace;
};

export const IsIsland = true;

export const handler: EaCRuntimeHandlerSet<
  OpenIndustrialWebState,
  WorkspaceManageData
> = {
  GET: async (_req, ctx) => {
    const { entLookup: raw } = ctx.Params as { entLookup: string };
    const entLookup = decodeURIComponent(raw || '');
    const ws = await ctx.State.OIClient.Admin.GetWorkspace(entLookup);
    return ctx.Render({ Workspace: ws });
  },
};

export default function AdminWorkspaceManagePage({
  Data: { Workspace },
}: PageProps<WorkspaceManageData>) {
  const eac = Workspace || {};
  const name = eac?.Details?.Name || eac?.EnterpriseLookup || 'Workspace';
  const lookup = eac?.EnterpriseLookup || '';
  const owner = (eac as any)?.$Owner?.Username as string | undefined;

  const [showSurfaces, setShowSurfaces] = useState(false);
  const [showSchemas, setShowSchemas] = useState(false);
  const [showDataConns, setShowDataConns] = useState(false);
  const [showWarmQueries, setShowWarmQueries] = useState(false);

  const surfaces = Object.entries(eac.Surfaces || {});
  const schemas = Object.entries(eac.Schemas || {});
  const dataConns = Object.entries(eac.DataConnections || {});
  const warmQueries = Object.entries(eac.WarmQueries || {});

  const clouds = Object.entries(eac.Clouds || {});
  const azureClouds = clouds.filter(([, c]) => c?.Details?.Type === 'Azure');

  return (
    <div class='-:-:p-6 -:-:space-y-6 -:-:pb-28'>
      <div class='-:-:flex -:-:items-center -:-:justify-between'>
        <h1 class='-:-:text-2xl -:-:font-semibold -:-:text-neutral-100'>
          {name}
        </h1>
        <div class='-:-:flex -:-:items-center -:-:gap-2'>
          {owner && (
            <Action
              href={`./users/${encodeURIComponent(owner)}`}
              styleType={ActionStyleTypes.Outline |
                ActionStyleTypes.Rounded |
                ActionStyleTypes.UltraThin}
            >
              Owner: {owner}
            </Action>
          )}
          {lookup && (
            <span class='-:-:text-xs -:-:text-neutral-500'>
              Lookup: {lookup}
            </span>
          )}
        </div>
      </div>

      <div class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-2 -:-:gap-4'>
        <PanelShell class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Overview
          </h2>
          <div class='-:-:mt-3 -:-:space-y-2'>
            <SummaryRowWithAction
              label={`Surfaces: ${surfaces.length}`}
              actionLabel={showSurfaces ? 'Hide' : 'Manage'}
              onActionClick={() => setShowSurfaces((s) => !s)}
            />
            <SummaryRowWithAction
              label={`Schemas: ${schemas.length}`}
              actionLabel={showSchemas ? 'Hide' : 'Manage'}
              onActionClick={() => setShowSchemas((s) => !s)}
            />
            <SummaryRowWithAction
              label={`Data Connections: ${dataConns.length}`}
              actionLabel={showDataConns ? 'Hide' : 'Manage'}
              onActionClick={() => setShowDataConns((s) => !s)}
            />
            <SummaryRowWithAction
              label={`Warm Queries: ${warmQueries.length}`}
              actionLabel={showWarmQueries ? 'Hide' : 'Manage'}
              onActionClick={() => setShowWarmQueries((s) => !s)}
            />
          </div>
        </PanelShell>

        <PanelShell class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Azure Clouds
          </h2>
          {azureClouds.length === 0 && (
            <div class='-:-:mt-3 -:-:text-neutral-400'>
              No Azure clouds configured.
            </div>
          )}
          <div class='-:-:mt-3 -:-:space-y-3'>
            {azureClouds.map(([cloudLookup, cloud]) => {
              const azureDetails = cloud?.Details as EaCCloudAzureDetails;

              const tenantId = azureDetails?.TenantID || '';
              const subId = azureDetails?.SubscriptionID || '';
              const appId = azureDetails?.ApplicationID || '';
              const rgEntries = Object.entries(cloud?.ResourceGroups || {});

              const ResourceGroupName = 'ResourceGroupName';

              const subUrl = tenantId && subId
                ? `https://portal.azure.com/#@${tenantId}/resource/subscriptions/${subId}/overview`
                : '';
              const rgUrl = tenantId && subId && ResourceGroupName
                ? `https://portal.azure.com/#@${tenantId}/resource/subscriptions/${subId}/resourceGroups/${ResourceGroupName}/overview`
                : '';
              const appUrl = appId
                ? `https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${appId}/isMSAApp~/false`
                : '';

              return (
                <div
                  class='-:-:rounded-md -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-3 -:-:space-y-2'
                  key={cloudLookup}
                >
                  <div class='-:-:flex -:-:items-start -:-:justify-between'>
                    <div>
                      <div class='-:-:font-semibold -:-:text-neutral-100'>
                        {cloud?.Details?.Name || cloudLookup}
                      </div>
                      {cloud?.Details?.Description && (
                        <div class='-:-:text-xs -:-:text-neutral-400'>
                          {cloud.Details.Description}
                        </div>
                      )}
                    </div>
                    <div class='-:-:flex -:-:gap-2'>
                      {subUrl && (
                        <Action
                          href={subUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.Rounded |
                            ActionStyleTypes.UltraThin}
                        >
                          Subscription
                        </Action>
                      )}
                      {appUrl && (
                        <Action
                          href={appUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.Rounded |
                            ActionStyleTypes.UltraThin}
                        >
                          App Reg
                        </Action>
                      )}
                    </div>
                  </div>

                  <div class='-:-:grid -:-:grid-cols-1 md:-:-:grid-cols-2 -:-:gap-2'>
                    <SummaryRowWithAction
                      label={`Tenant: ${tenantId || '—'}`}
                      actionLabel='Copy'
                      onActionClick={() => navigator.clipboard?.writeText(tenantId)}
                    />
                    <SummaryRowWithAction
                      label={`Subscription: ${subId || '—'}`}
                      actionLabel='Copy'
                      onActionClick={() => navigator.clipboard?.writeText(subId)}
                    />
                    <SummaryRowWithAction
                      label={`Application: ${appId || '—'}`}
                      actionLabel='Copy'
                      onActionClick={() => navigator.clipboard?.writeText(appId)}
                    />
                    <SummaryRowWithAction
                      label={`Resource Groups: ${rgEntries.length}`}
                      actionLabel='Open'
                      onActionClick={() => (location.href = rgUrl)}
                    />
                  </div>

                  {rgEntries.length > 0 && (
                    <div class='-:-:pt-2 -:-:space-y-1'>
                      {rgEntries.map(([rgName, rg]) => {
                        const rgUrl = tenantId && subId && rgName
                          ? `https://portal.azure.com/#@${tenantId}/resource/subscriptions/${subId}/resourceGroups/${rgName}/overview`
                          : '';
                        return (
                          <SummaryRowWithAction
                            key={rgName}
                            label={`${rg?.Details?.Name || rgName} ${
                              rg?.Details?.Location ? `(${rg.Details.Location})` : ''
                            }`}
                            actionLabel='Open'
                            onActionClick={() => (location.href = rgUrl)}
                            class='-:-:text-xs'
                          />
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PanelShell>
      </div>

      {/* Expanded management sections */}
      {showSurfaces && (
        <PanelShell class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Surfaces
          </h2>
          {surfaces.length === 0 && (
            <div class='-:-:mt-2 -:-:text-neutral-400'>
              No surfaces defined.
            </div>
          )}
          <div class='-:-:mt-3 -:-:space-y-2'>
            {surfaces.map(([lookup, s]: [string, any]) => {
              const dcCount = Object.keys(s?.DataConnections || {}).length;
              const agCount = Object.keys(s?.Agents || {}).length;
              const scCount = Object.keys(s?.Schemas || {}).length;
              const wqCount = Object.keys(s?.WarmQueries || {}).length;
              const parent = s?.ParentSurfaceLookup || '';
              return (
                <div
                  key={lookup}
                  class='-:-:rounded -:-:border -:-:border-neutral-800 -:-:p-3'
                >
                  <div class='-:-:flex -:-:items-start -:-:justify-between -:-:gap-3'>
                    <div class='-:-:text-sm -:-:text-neutral-200 -:-:min-w-0'>
                      <div class='-:-:font-medium -:-:truncate'>
                        {s?.Details?.Name || lookup}
                      </div>
                      {s?.Details?.Description && (
                        <div class='-:-:text-xs -:-:text-neutral-400 -:-:truncate'>
                          {s.Details.Description}
                        </div>
                      )}
                      <div class='-:-:mt-1 -:-:flex -:-:flex-wrap -:-:gap-1'>
                        {parent && (
                          <Action
                            styleType={ActionStyleTypes.Outline |
                              ActionStyleTypes.UltraThin |
                              ActionStyleTypes.Rounded}
                            title='Parent Surface'
                          >
                            Parent: {parent}
                          </Action>
                        )}
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.UltraThin |
                            ActionStyleTypes.Rounded}
                        >
                          DCs: {dcCount}
                        </Action>
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.UltraThin |
                            ActionStyleTypes.Rounded}
                        >
                          Agents: {agCount}
                        </Action>
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.UltraThin |
                            ActionStyleTypes.Rounded}
                        >
                          Schemas: {scCount}
                        </Action>
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.UltraThin |
                            ActionStyleTypes.Rounded}
                        >
                          WQs: {wqCount}
                        </Action>
                      </div>
                    </div>
                    <div class='-:-:shrink-0 -:-:flex -:-:gap-2'>
                      <Action
                        styleType={ActionStyleTypes.Outline |
                          ActionStyleTypes.Rounded |
                          ActionStyleTypes.UltraThin}
                        onClick={() => navigator.clipboard?.writeText(lookup)}
                        title='Copy surface lookup'
                      >
                        Copy Lookup
                      </Action>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelShell>
      )}

      {showSchemas && (
        <PanelShell class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Schemas
          </h2>
          {schemas.length === 0 && (
            <div class='-:-:mt-2 -:-:text-neutral-400'>No schemas defined.</div>
          )}
          <div class='-:-:mt-3 -:-:space-y-2'>
            {schemas.map(([lookup, s]: [string, any]) => {
              const type = s?.Details?.Type || '—';
              const version = s?.Details?.Version || '';
              const dc = s?.DataConnection?.Lookup || '';
              const refs = Object.keys(s?.SchemaLookups || {}).length;
              return (
                <div
                  key={lookup}
                  class='-:-:rounded -:-:border -:-:border-neutral-800 -:-:p-3'
                >
                  <div class='-:-:flex -:-:items-start -:-:justify-between -:-:gap-3'>
                    <div class='-:-:text-sm -:-:text-neutral-200 -:-:min-w-0'>
                      <div class='-:-:font-medium -:-:truncate'>
                        {s?.Details?.Name || lookup}
                      </div>
                      {s?.Details?.Description && (
                        <div class='-:-:text-xs -:-:text-neutral-400 -:-:truncate'>
                          {s.Details.Description}
                        </div>
                      )}
                      <div class='-:-:mt-1 -:-:flex -:-:flex-wrap -:-:gap-1'>
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.UltraThin |
                            ActionStyleTypes.Rounded}
                        >
                          Type: {type}
                        </Action>
                        {version && (
                          <Action
                            styleType={ActionStyleTypes.Outline |
                              ActionStyleTypes.UltraThin |
                              ActionStyleTypes.Rounded}
                          >
                            v{version}
                          </Action>
                        )}
                        {dc && (
                          <Action
                            styleType={ActionStyleTypes.Outline |
                              ActionStyleTypes.UltraThin |
                              ActionStyleTypes.Rounded}
                            title='Bound data connection'
                          >
                            DC: {dc}
                          </Action>
                        )}
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.UltraThin |
                            ActionStyleTypes.Rounded}
                        >
                          Refs: {refs}
                        </Action>
                      </div>
                    </div>
                    <div class='-:-:shrink-0 -:-:flex -:-:gap-2'>
                      <Action
                        styleType={ActionStyleTypes.Outline |
                          ActionStyleTypes.Rounded |
                          ActionStyleTypes.UltraThin}
                        onClick={() => navigator.clipboard?.writeText(lookup)}
                        title='Copy schema lookup'
                      >
                        Copy Lookup
                      </Action>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelShell>
      )}

      {showDataConns && (
        <PanelShell class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Data Connections
          </h2>
          {dataConns.length === 0 && (
            <div class='-:-:mt-2 -:-:text-neutral-400'>
              No data connections defined.
            </div>
          )}
          <div class='-:-:mt-3 -:-:space-y-2'>
            {dataConns.map(([lookup, c]: [string, any]) => {
              const type = c?.Details?.Type || '—';
              const mp = (c?.Details?.MultiProtocolIngest || []) as string[];
              const sim = c?.SimulatorLookup || '';
              return (
                <div
                  key={lookup}
                  class='-:-:rounded -:-:border -:-:border-neutral-800 -:-:p-3'
                >
                  <div class='-:-:flex -:-:items-start -:-:justify-between -:-:gap-3'>
                    <div class='-:-:text-sm -:-:text-neutral-200 -:-:min-w-0'>
                      <div class='-:-:font-medium -:-:truncate'>
                        {c?.Details?.Name || lookup}
                      </div>
                      {c?.Details?.Description && (
                        <div class='-:-:text-xs -:-:text-neutral-400 -:-:truncate'>
                          {c.Details.Description}
                        </div>
                      )}
                      <div class='-:-:mt-1 -:-:flex -:-:flex-wrap -:-:gap-1'>
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.UltraThin |
                            ActionStyleTypes.Rounded}
                        >
                          Type: {type}
                        </Action>
                        {sim && (
                          <Action
                            styleType={ActionStyleTypes.Outline |
                              ActionStyleTypes.UltraThin |
                              ActionStyleTypes.Rounded}
                          >
                            Sim: {sim}
                          </Action>
                        )}
                        {mp.length > 0 && (
                          <Action
                            styleType={ActionStyleTypes.Outline |
                              ActionStyleTypes.UltraThin |
                              ActionStyleTypes.Rounded}
                            title='Multi-protocol ingest modes'
                          >
                            Modes: {mp.join(', ')}
                          </Action>
                        )}
                      </div>
                    </div>
                    <div class='-:-:shrink-0 -:-:flex -:-:gap-2'>
                      <Action
                        styleType={ActionStyleTypes.Outline |
                          ActionStyleTypes.Rounded |
                          ActionStyleTypes.UltraThin}
                        onClick={() => navigator.clipboard?.writeText(lookup)}
                        title='Copy data connection lookup'
                      >
                        Copy Lookup
                      </Action>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelShell>
      )}

      {showWarmQueries && (
        <PanelShell class='-:-:rounded-xl -:-:border -:-:border-neutral-800 -:-:bg-neutral-900/50 -:-:p-4'>
          <h2 class='-:-:text-lg -:-:font-semibold -:-:text-neutral-100'>
            Warm Queries
          </h2>
          {warmQueries.length === 0 && (
            <div class='-:-:mt-2 -:-:text-neutral-400'>
              No warm queries defined.
            </div>
          )}
          <div class='-:-:mt-3 -:-:space-y-2'>
            {warmQueries.map(([lookup, wq]: [string, any]) => {
              const version = wq?.Details?.Version;
              const apiPath = wq?.Details?.ApiPath || '';
              const query = wq?.Details?.Query || '';
              const qPreview = (query || '').slice(0, 80) +
                (query && query.length > 80 ? '…' : '');
              return (
                <div
                  key={lookup}
                  class='-:-:rounded -:-:border -:-:border-neutral-800 -:-:p-3'
                >
                  <div class='-:-:flex -:-:items-start -:-:justify-between -:-:gap-3'>
                    <div class='-:-:text-sm -:-:text-neutral-200 -:-:min-w-0'>
                      <div class='-:-:font-medium -:-:truncate'>
                        {wq?.Details?.Name || lookup}
                      </div>
                      {wq?.Details?.Description && (
                        <div class='-:-:text-xs -:-:text-neutral-400 -:-:truncate'>
                          {wq.Details.Description}
                        </div>
                      )}
                      <div class='-:-:mt-1 -:-:flex -:-:flex-wrap -:-:gap-1'>
                        {typeof version !== 'undefined' && (
                          <Action
                            styleType={ActionStyleTypes.Outline |
                              ActionStyleTypes.UltraThin |
                              ActionStyleTypes.Rounded}
                          >
                            v{version}
                          </Action>
                        )}
                        {apiPath && (
                          <Action
                            styleType={ActionStyleTypes.Outline |
                              ActionStyleTypes.UltraThin |
                              ActionStyleTypes.Rounded}
                          >
                            ApiPath: {apiPath}
                          </Action>
                        )}
                      </div>
                      {qPreview && (
                        <div
                          class='-:-:mt-1 -:-:text-xs -:-:text-neutral-400 -:-:truncate'
                          title={query}
                        >
                          {qPreview}
                        </div>
                      )}
                    </div>
                    <div class='-:-:shrink-0 -:-:flex -:-:gap-2'>
                      <Action
                        styleType={ActionStyleTypes.Outline |
                          ActionStyleTypes.Rounded |
                          ActionStyleTypes.UltraThin}
                        onClick={() => navigator.clipboard?.writeText(lookup)}
                        title='Copy warm query lookup'
                      >
                        Copy Lookup
                      </Action>
                      {query && (
                        <Action
                          styleType={ActionStyleTypes.Outline |
                            ActionStyleTypes.Rounded |
                            ActionStyleTypes.UltraThin}
                          onClick={() => navigator.clipboard?.writeText(query)}
                          title='Copy query body'
                        >
                          Copy Query
                        </Action>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelShell>
      )}
    </div>
  );
}
