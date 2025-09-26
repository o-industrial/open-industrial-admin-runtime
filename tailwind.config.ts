import { type Config } from 'tailwindcss';
import scrollbar from 'tailwind-scrollbar';
import typography from '@tailwindcss/typography';
import unimportant from 'tailwindcss/unimportant';
import { neonColors } from '@o-industrial/common/atomic/utils';

const keyframes = {
  driftShake: {
    '0%, 100%': { transform: 'translateX(0)' },
    '25%': { transform: 'translateX(-2px)' },
    '50%': { transform: 'translateX(2px)' },
    '75%': { transform: 'translateX(-2px)' },
  },
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
  glitch: {
    '0%': { transform: 'translate(0)' },
    '20%': { transform: 'translate(-2px, 2px)' },
    '40%': { transform: 'translate(-2px, -2px)' },
    '60%': { transform: 'translate(2px, 2px)' },
    '80%': { transform: 'translate(2px, -2px)' },
    '100%': { transform: 'translate(0)' },
  },
  pan: {
    '0%': { 'background-position': '20% 20%', transform: 'rotate(0deg)' },
    '20%': { 'background-position': '22% 18%', transform: 'rotate(0.3deg)' },
    '40%': { 'background-position': '18% 22%', transform: 'rotate(-0.2deg)' },
    '60%': { 'background-position': '23% 17%', transform: 'rotate(0.4deg)' },
    '80%': { 'background-position': '27% 23%', transform: 'rotate(-0.3deg)' },
    '100%': { 'background-position': '20% 20%', transform: 'rotate(0deg)' },
  },
  pulseSlow: {
    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
    '50%': { opacity: '0.8', transform: 'scale(1.02)' },
  },
  signalFlash: {
    '0%, 100%': { opacity: '0.6' },
    '50%': { opacity: '1' },
  },
  slideUp: {
    '0%': { opacity: '0', transform: 'translateY(20px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  surfacePulse: {
    '0%, 100%': { transform: 'scale(1)', opacity: '1' },
    '50%': { transform: 'scale(1.05)', opacity: '0.9' },
  },
};

const animations = {
  'bg-pan': 'pan 30s ease-in-out infinite',
  fadeIn: 'fadeIn 1s ease-in-out',
  slideUp: 'slideUp 0.6s ease-out',
  glitch: 'glitch 300ms infinite',
  pulseSlow: 'pulseSlow 4s ease-in-out infinite',
  signalFlash: 'signalFlash 2s ease-in-out infinite',
  surfacePulse: 'surfacePulse 6s ease-in-out infinite',
  driftShake: 'driftShake 300ms ease-in-out',
  'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
  'ping-fast': 'ping 0.8s cubic-bezier(0, 0, 0.2, 1) infinite',
};

const typoConfig = (theme: (path: string) => any) => ({
  DEFAULT: {
    css: {
      fontFamily: theme('fontFamily.sans').join(', '),
      color: theme('colors.neutral.700'),

      a: {
        color: theme('colors.neon-blue.600'),
        '&:hover': { color: theme('colors.neon-blue.700') },
      },

      strong: {
        color: theme('colors.neutral.900'),
        fontWeight: '700',
      },

      h1: {
        color: theme('colors.neutral.900'),
        fontWeight: '700',
      },
      h2: {
        color: theme('colors.neutral.900'),
        fontWeight: '600',
      },
      h3: {
        color: theme('colors.neutral.800'),
        fontWeight: '600',
      },
      h4: {
        color: theme('colors.neutral.800'),
      },
      h5: {
        color: theme('colors.neutral.700'),
      },
      h6: {
        color: theme('colors.neutral.700'),
      },

      blockquote: {
        fontStyle: 'italic',
        borderLeftColor: theme('colors.neon-violet.400'),
        color: theme('colors.neutral.800'),
      },
    },
  },

  dark: {
    css: {
      fontFamily: theme('fontFamily.sans').join(', '),
      color: theme('colors.neutral.300'),

      a: {
        color: theme('colors.neon-blue.400'),
        '&:hover': { color: theme('colors.neon-blue.300') },
      },

      strong: {
        color: theme('colors.white'),
        fontWeight: '700',
      },

      h1: {
        color: theme('colors.white'),
      },
      h2: {
        color: theme('colors.neutral.100'),
      },
      h3: {
        color: theme('colors.neutral.200'),
      },
      h4: {
        color: theme('colors.neutral.300'),
      },
      h5: {
        color: theme('colors.neutral.400'),
      },
      h6: {
        color: theme('colors.neutral.400'),
      },

      blockquote: {
        fontStyle: 'italic',
        borderLeftColor: theme('colors.neon-violet.300'),
        color: theme('colors.neutral.100'),
      },
    },
  },
});

const config: Config = {
  darkMode: ['class', ':root'],
  content: ['./**/*.tsx'],
  theme: {
    extend: {
      boxShadow: {
        neon: '0 0 8px #60A5FA', // neon-blue-400
      },
      colors: {
        ...neonColors,
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
        ['tech-sans']: ['IBM Plex Sans', 'sans-serif'],
      },
      gridTemplateColumns: {
        13: 'repeat(13, minmax(0, 1fr))',
        14: 'repeat(14, minmax(0, 1fr))',
        15: 'repeat(15, minmax(0, 1fr))',
        16: 'repeat(16, minmax(0, 1fr))',
        17: 'repeat(17, minmax(0, 1fr))',
        18: 'repeat(18, minmax(0, 1fr))',
        19: 'repeat(19, minmax(0, 1fr))',
        20: 'repeat(20, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        5: 'repeat(5, minmax(0, 1fr))',
        6: 'repeat(6, minmax(0, 1fr))',
        7: 'repeat(7, minmax(0, 1fr))',
        8: 'repeat(8, minmax(0, 1fr))',
        9: 'repeat(9, minmax(0, 1fr))',
        10: 'repeat(10, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
        'span-17': 'span 17 / span 17',
        'span-18': 'span 18 / span 18',
        'span-19': 'span 19 / span 19',
        'span-20': 'span 20 / span 20',
      },
      gridColumnStart: {
        13: '13',
        14: '14',
        15: '15',
        16: '16',
        17: '17',
        18: '18',
        19: '19',
        20: '20',
      },
      gridColumnEnd: {
        13: '13',
        14: '14',
        15: '15',
        16: '16',
        17: '17',
        18: '18',
        19: '19',
        20: '20',
      },
      outlineColor: {
        neon: '#93C5FD', // neon-blue-300
      },
      zIndex: {
        '-1': '-1',
      },

      keyframes: { ...keyframes },
      animation: { ...animations },
      transitionProperty: {
        default: 'all',
      },
      transitionTimingFunction: {
        'in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },

      // typography: typoConfig,
      typography: ['dark'],
    },
  },
  plugins: [scrollbar, typography, unimportant],
};

export default config;
