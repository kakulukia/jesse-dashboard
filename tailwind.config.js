const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: ['./index.html', './src/**/*.vue'],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: '1rem'
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: colors.black,
      green: colors.green,
      red: colors.red,
      white: colors.white,
      gray: colors.coolGray,
      indigo: colors.indigo,
      primary: {
        DEFAULT: '#4f46e5',
        dark: '#f9b537'
      },
      main: {
        DEFAULT: '#1f2937',
        dark: '#ffffff'
      }
    },
    extend: {
      fontSize: {
        xl: ['30px', '36px'], // H1
        lg: ['24px', '32px'], // H2
        base: ['16px', '24px'],
        sm: ['14px', '20px'],
        caption: ['12px', '16px']
      },
      fontFamily: {
        sans: [
          '"Proxima Nova"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'
        ]
      }
    }
  },
  variants: {
    extend: {}
  },
  plugins: [],
  corePlugins: {}
}
