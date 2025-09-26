import { NullableArrayOrObject } from '@fathym/common';
import { EverythingAsCode } from '@fathym/eac';
import type { EaCRuntimeHandlerSet } from '@fathym/eac/runtime/pipelines';
import { OpenIndustrialWebState } from '../../@o-industrial/common/runtimes';

export const handler: EaCRuntimeHandlerSet<OpenIndustrialWebState> = {
  async DELETE(req, ctx) {
    try {
      let licLookup = '';
      const ct = req.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const body = (await req.json()) as NullableArrayOrObject<EverythingAsCode> & {
          licLookup?: string;
        };
        licLookup = String(body.licLookup ?? '').trim();
      } else {
        const fd = await req.formData();
        licLookup = String(fd.get('licLookup') ?? '').trim();
      }

      if (!licLookup) throw new Error('licLookup is required');

      await ctx.State.OIClient.Admin.DeleteEaC({ Licenses: [licLookup] });
      return Response.redirect(
        ctx.Runtime.URLMatch.FromOrigin('/admin/licenses'),
        303,
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error(String(err));
    }
  },
};
