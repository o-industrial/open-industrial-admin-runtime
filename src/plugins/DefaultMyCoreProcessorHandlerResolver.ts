import { IoCContainer } from '@fathym/ioc';
import { DefaultAtomicIconsProcessorHandlerResolver } from '@fathym/atomic-icons/plugin';
import {
  DefaultProcessorHandlerResolver,
  ProcessorHandlerResolver,
} from '@fathym/eac-applications/runtime/processors';
import { EaCApplicationProcessorConfig } from '@fathym/eac-applications/processors';
import { EverythingAsCode } from '@fathym/eac';
import { EverythingAsCodeApplications } from '@fathym/eac-applications';
import { DefaultMSALProcessorHandlerResolver } from '@fathym/msal';

export class DefaultMyCoreProcessorHandlerResolver implements ProcessorHandlerResolver {
  public async Resolve(
    ioc: IoCContainer,
    appProcCfg: EaCApplicationProcessorConfig,
    eac: EverythingAsCode & EverythingAsCodeApplications,
  ) {
    const atomicIconResolver = new DefaultAtomicIconsProcessorHandlerResolver();

    let resolver = await atomicIconResolver.Resolve(ioc, appProcCfg, eac);

    if (!resolver) {
      const defaultResolver = new DefaultMSALProcessorHandlerResolver();

      resolver = await defaultResolver.Resolve(ioc, appProcCfg, eac);
    }

    if (!resolver) {
      const defaultResolver = new DefaultProcessorHandlerResolver();

      resolver = await defaultResolver.Resolve(ioc, appProcCfg, eac);
    }

    return resolver;
  }
}
