/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
     "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", 

  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A', // Deep blue
        secondary: '#2563EB', // Blue
        accent: '#38BDF8', // Sky blue
      },
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
],
}