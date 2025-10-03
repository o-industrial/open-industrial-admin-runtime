import type { Config } from 'npm:tailwindcss@3.4.1';
import openIndustrialTailwindPreset from '@o-industrial/atomic/tailwind/preset';

const config = {
  content: ['./**/*.tsx'],
  presets: [openIndustrialTailwindPreset],
} satisfies Config;

export default config;

