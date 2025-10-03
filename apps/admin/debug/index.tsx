import { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import type { OpenIndustrialWebState } from '@o-industrial/common/runtimes';
import { EverythingAsCodeIdentity } from '@fathym/eac-identity';

export const handler: EaCRuntimeHandlerSet<OpenIndustrialWebState> = {
  GET: async (_req, ctx) => {
    return Response.json(await ctx.State.OIClient.Admin.GetEaC<EverythingAsCodeIdentity>());
  },
};
