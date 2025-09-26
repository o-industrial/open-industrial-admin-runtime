import { EaCRuntimeConfig, EaCRuntimePluginConfig } from '@fathym/eac/runtime/config';
import { EaCRuntimePlugin } from '@fathym/eac/runtime/plugins';
import { EverythingAsCode } from '@fathym/eac';
import { EverythingAsCodeApplications } from '@fathym/eac-applications';

export default class RuntimePlugin implements EaCRuntimePlugin {
  constructor() {}

  public Setup(config: EaCRuntimeConfig) {
    const pluginConfig: EaCRuntimePluginConfig<
      EverythingAsCode & EverythingAsCodeApplications
    > = {
      Name: RuntimePlugin.name,
      Plugins: [],
      EaC: {
        Projects: {
          core: {
            Details: {
              Name: 'Core Micro Applications',
              Description: 'The Core Micro Applications to use.',
              Priority: 100,
            },
            ResolverConfigs: {
              localhost: {
                Hostname: 'localhost',
                Port: config.Servers![0].port || 8000,
              },
              '127.0.0.1': {
                Hostname: '127.0.0.1',
                Port: config.Servers![0].port || 8000,
              },
              'host.docker.internal': {
                Hostname: 'host.docker.internal',
                Port: config.Servers![0].port || 8000,
              },
            },
            ModifierResolvers: {},
            ApplicationResolvers: {},
          },
        },
        $GlobalOptions: {
          DFSs: {
            PreventWorkers: true
          }
        }
      },
    };

    return Promise.resolve(pluginConfig);
  }
}
