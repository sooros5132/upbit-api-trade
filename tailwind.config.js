/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    screens: {
      xs: '425px',
      sm: '600px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    extend: {
      height: {
        'dvh-100': '100dvh'
      },
      maxHeight: {
        'dvh-100': '100dvh'
      },
      minHeight: {
        'dvh-100': '100dvh'
      },
      fontFamily: {
        sans: ['Noto Sans KR', ...defaultTheme.fontFamily.sans],
        mono: ['Roboto Mono', ...defaultTheme.fontFamily.mono]
      }
    }
  },
  daisyui: {
    themes: ['light', 'dark', 'black']
  },
  safelist: ['btn-order', 'btn-order-ask', 'btn-order-bid'],
  plugins: [require('daisyui')]
};
