/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3942DE',
          dark: '#22289C',
          soft: '#EEF0FF',
        },
        bg: '#F2F3F8',
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1E1E2E',
          soft: '#6B6B80',
        },
        accent: {
          orange: '#AC5923',
          gold: '#B29A6B',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(57,66,222,0.08)',
        fab: '0 8px 24px rgba(57,66,222,0.35)',
      },
      borderRadius: {
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
