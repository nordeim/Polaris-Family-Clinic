/**
 * Tailwind CSS Configuration for Gabriel Family Clinic MVP
 * Lightweight utility layer alongside Mantine.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3B82F6'
        },
        secondary: {
          DEFAULT: '#10B981'
        },
        danger: {
          DEFAULT: '#EF4444'
        }
      },
      fontSize: {
        base: ['1rem', { lineHeight: '1.6' }],
        lg: ['1.125rem', { lineHeight: '1.6' }],
        xl: ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }]
      }
    }
  },
  plugins: []
};
