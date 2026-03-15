/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        tea: {
          50:  '#f7f3ee',
          100: '#ede4d4',
          200: '#d9c9a8',
          300: '#c5ae7c',
          400: '#b49358',
          500: '#9a7a3e',
          600: '#7d6232',
          700: '#614b27',
          800: '#46361d',
          900: '#2e2212',
        },
        sage: {
          50:  '#f2f5f0',
          100: '#e0e9da',
          200: '#bfd4b5',
          300: '#97b88a',
          400: '#709e64',
          500: '#538349',
          600: '#40683a',
          700: '#315030',
          800: '#253b25',
          900: '#172618',
        },
        cream: '#faf7f2',
        dark:  '#1a1208',
      },
      fontFamily: {
        display:     ['"Playfair Display"', 'Georgia', 'serif'],
        body:        ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:        ['"JetBrains Mono"', 'monospace'],
        montserrat:  ['"Montserrat"', 'sans-serif'],
      },
      backgroundImage: {
        'tea-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239a7a3e' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};