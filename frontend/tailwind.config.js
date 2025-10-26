/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/App.tsx"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        purple: {
          600: "#9333ea",
          700: "#7c3aed",
        },
        cyan: {
          500: "#06b6d4",
        },
        pink: {
          400: "#f472b6",
        },
        zinc: {
          800: "#27272a",
        },
      },
    },
  },
  plugins: [],
};
