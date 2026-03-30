import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // --- Material Design 3 Color Tokens ---
      colors: {
        'primary':                    '#553722',
        'primary-container':          '#6F4E37',
        'on-primary':                 '#FFFFFF',
        'on-primary-container':       '#EEC1A4',

        'secondary':                  '#6D5B4F',
        'secondary-container':        '#F7DECF',
        'on-secondary':               '#FFFFFF',
        'on-secondary-container':     '#736155',

        'tertiary':                   '#24434B',
        'tertiary-container':         '#3C5A63',
        'on-tertiary':                '#FFFFFF',
        'on-tertiary-container':      '#B0D0DB',

        'error':                      '#BA1A1A',
        'error-container':            '#FFDAD6',
        'on-error':                   '#FFFFFF',
        'on-error-container':         '#93000A',

        'surface':                    '#FCF9F7',
        'surface-bright':             '#FCF9F7',
        'surface-dim':                '#DCD9D8',
        'surface-container-lowest':   '#FFFBF8',
        'surface-container-low':      '#F6F3F1',
        'surface-container':          '#F0EDEB',
        'surface-container-high':     '#EAE8E6',
        'surface-container-highest':  '#E5E2E0',
        'surface-variant':            '#E5E2E0',
        'surface-tint':               '#79573F',

        'on-surface':                 '#1B1C1B',
        'on-surface-variant':         '#50453E',
        'on-background':              '#1B1C1B',

        'outline':                    '#82746D',
        'outline-variant':            '#D4C3BA',

        'inverse-surface':            '#30302F',
        'inverse-on-surface':         '#F3F0EE',
        'inverse-primary':            '#EABDA0',

        'primary-fixed':              '#FFDCC6',
        'primary-fixed-dim':          '#EABDA0',
        'on-primary-fixed':           '#2D1604',
        'on-primary-fixed-variant':   '#5F402A',

        'secondary-fixed':            '#F7DECF',
        'secondary-fixed-dim':        '#DAC2B4',
        'on-secondary-fixed':         '#261910',
        'on-secondary-fixed-variant': '#544339',

        'tertiary-fixed':             '#C8E8F3',
        'tertiary-fixed-dim':         '#ACCCD6',
        'on-tertiary-fixed':          '#001F27',
        'on-tertiary-fixed-variant':  '#2D4B54',

        'background':                 '#FCF9F7',
      },

      fontFamily: {
        'headline': ['"Noto Serif"', 'Georgia', 'serif'],
        'body':     ['"Manrope"', 'system-ui', 'sans-serif'],
        'label':    ['"Manrope"', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-lg':  ['3.5rem',   { lineHeight: '1.1',  fontWeight: '700', letterSpacing: '-0.025em' }],
        'display-md':  ['3rem',     { lineHeight: '1.1',  fontWeight: '700', letterSpacing: '-0.025em' }],
        'headline-lg': ['2.5rem',   { lineHeight: '1.2',  fontWeight: '700', letterSpacing: '-0.025em' }],
        'headline-md': ['1.75rem',  { lineHeight: '1.3',  fontWeight: '700' }],
        'headline-sm': ['1.25rem',  { lineHeight: '1.4',  fontWeight: '700' }],
        'title-lg':    ['1.375rem', { lineHeight: '1.4',  fontWeight: '600' }],
        'title-md':    ['1rem',     { lineHeight: '1.5',  fontWeight: '600' }],
        'body-lg':     ['1.125rem', { lineHeight: '1.6',  fontWeight: '400' }],
        'body-md':     ['1rem',     { lineHeight: '1.5',  fontWeight: '400' }],
        'body-sm':     ['0.875rem', { lineHeight: '1.5',  fontWeight: '400' }],
        'label-lg':    ['0.75rem',  { lineHeight: '1.3',  fontWeight: '700', letterSpacing: '0.1em' }],
        'label-md':    ['0.625rem', { lineHeight: '1.3',  fontWeight: '700', letterSpacing: '0.1em' }],
        'label-sm':    ['0.6rem',   { lineHeight: '1.3',  fontWeight: '700', letterSpacing: '0.2em' }],
      },

      borderRadius: {
        'DEFAULT': '0.125rem',
        'sm':      '0.125rem',
        'md':      '0.25rem',
        'lg':      '0.25rem',
        'xl':      '0.5rem',
        '2xl':     '1rem',
        '3xl':     '1.5rem',
        'full':    '0.75rem',
      },

      boxShadow: {
        'ambient':       '0 24px 48px rgba(85, 55, 34, 0.06)',
        'ambient-sm':    '0 12px 24px rgba(85, 55, 34, 0.04)',
        'ambient-lg':    '0 32px 64px rgba(85, 55, 34, 0.08)',
        'ambient-up':    '0 -4px 24px rgba(85, 55, 34, 0.06)',
        'hero-cta':      '0 20px 40px rgba(85, 55, 34, 0.20)',
        'testimonial':   '0 24px 48px rgba(85, 55, 34, 0.06)',
        'bottom-nav':    '0 -4px 24px rgba(85, 55, 34, 0.06)',
      },

      maxWidth: {
        'content': '80rem',
        'bleed':   '1920px',
      },

      letterSpacing: {
        'label-wide': '0.2em',
        'label-wider': '0.3em',
      },

      transitionDuration: {
        '400': '400ms',
      },

      keyframes: {
        'custom-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%':      { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'widget-pulse': 'custom-pulse 3s infinite ease-in-out',
      },

      aspectRatio: {
        '4/5': '4 / 5',
        '3/4': '3 / 4',
      },
    },
  },
  plugins: [],
}

export default config
