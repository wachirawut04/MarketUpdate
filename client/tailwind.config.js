/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6",   
        secondary: "#f97316", 
        background: "#FAFAFA",
        card: "#ffffff",
      },
    },
  },
  plugins: [],
}
