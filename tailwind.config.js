/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
      colors: {
        'bmi-bg': '#050a09', // Very dark green/black
        'bmi-card': '#0c1614', // Slightly lighter for cards
        'bmi-accent': '#2ebd5e', // Bright green for actions
        'bmi-accent-hover': '#249a4c',
        'bmi-text': '#e2e8f0', // Light text
        'bmi-muted': '#94a3b8', // Muted text
        'bmi-input': '#13201b', // Input backgrounds
      }
    },
    },
    plugins: [],
}
