/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gti: {
          red: "#ff2800",
          "red-dark": "#b31c00",
          black: "#111111",
          charcoal: "#1c1c1e",
          silver: "#c9cdd1",
          steel: "#6b7280",
        },
      },
      fontFamily: {
        dash: ['"Segoe UI"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
