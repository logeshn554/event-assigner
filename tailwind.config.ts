import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './frontend/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0fe',
          200: '#d6e0fd',
          300: '#b3c7fc',
          400: '#8ba7f9',
          500: '#6384f5',
          600: '#4361ee',
          700: '#3047d1',
          800: '#283aa9',
          900: '#243486',
          950: '#172052'
        }
      },
      screens: {
        print: { raw: 'print' }
      }
    }
  },
  plugins: []
};

export default config;
