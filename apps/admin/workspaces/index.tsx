// deno-lint-ignore-file no-explicit-any
import { JSX } from 'preact';
import { useEffect, useMemo, useState } from 'preact/hooks';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { PageProps } from '@fathym/eac-applications/preact';
import { OpenIndustrialAPIClient } from '@o-industrial/common/api';
import { SearchInput } from '@o-industrial/atomic/atoms';
import { WorkspaceList } from '@o-industrial/atomic/molecules';
import { OpenIndustrialWebState } from '@o-industrial/common/runtimes';

type WorkspacesPageData = {
  OIAPIRoot: string;
  OIAPIToken: string;
  Username: string;
};

export const IsIsland = true;

export const handler: EaCRuntimeHandlerSet<OpenIndustrialWebState> = {
  GET: (_req, ctx) => {
    return ctx.Render({
      OIAPIRoot: '/api/',
      OIAPIToken: ctx.State.OIJWT,
      Username: ctx.State.Username,
    });
  },
};

export default function WorkspacesPage({
  Data: { OIAPIRoot, OIAPIToken },
}: PageProps<WorkspacesPageData>) {
  const origin = typeof location !== 'undefined' && location?.origin
    ? location.origin
    : 'https://server.com';
  const root = `${origin}${OIAPIRoot}`;

  const oiSvc = useMemo(
    () => new OpenIndustrialAPIClient(new URL(root), OIAPIToken),
    [root, OIAPIToken],
  );

  const [search, setSearch] = useState('');
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const ents = await oiSvc.Admin.ListWorkspaces(search);
        setWorkspaces(ents);
      } catch (err) {
        console.error('Failed to load workspaces', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [search]);

  return (
    <div class='-:-:p-4 -:-:space-y-4'>
      <h1 class='-:-:text-xl -:-:font-semibold text-white'>Workspaces</h1>
      <SearchInput
        value={search}
        onInput={(e: JSX.TargetedEvent<HTMLInputElement, Event>) =>
          setSearch((e.target as HTMLInputElement).value)}
        placeholder='Search workspaces…'
      />
      {loading ? <div class='-:-:text-slate-400'>Loading…</div> : (
        <WorkspaceList
          workspaces={workspaces}
          onSelect={(eac) => {
            const lookup = eac.EnterpriseLookup || '';
            if (lookup) {
              location.href = `./workspaces/${encodeURIComponent(lookup)}`;
            }
          }}
        />
      )}
    </div>
  );
}


