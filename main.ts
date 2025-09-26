import { start } from '@fathym/eac/runtime/server';
import { config, configure } from './configs/eac-runtime.config.ts';

await start(await config, { configure });
