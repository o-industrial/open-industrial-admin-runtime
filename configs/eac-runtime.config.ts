import { EaCRuntime } from '@fathym/eac/runtime';
import { defineEaCApplicationsConfig } from '@fathym/eac-applications/runtime';
import RuntimePlugin from '../src/plugins/RuntimePlugin.ts';
import { RuntimeLoggingProvider } from '../src/logging/RuntimeLoggingProvider.ts';
import { EaCRuntimeHandlerRouteGroup } from '@fathym/eac/runtime/pipelines';

export const config = defineEaCApplicationsConfig(
  {
    Plugins: [new RuntimePlugin()],
  },
  new RuntimeLoggingProvider(),
);

export function configure(
  _rt: EaCRuntime,
): Promise<EaCRuntimeHandlerRouteGroup[] | undefined> {
  return Promise.resolve([]);
}
