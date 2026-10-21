/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Figtree", "system-ui", "sans-serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        hand: ["Caveat", "cursive"],
      },
      colors: {
        // 30 Sundays app
        p: { 900: "#89123E", 600: "#E31B53", 300: "#FEA3B4", 100: "#FFE4E8" },
        fuchsia: "#FD014F",
        head: "#181D27", sub: "#535862", inact: "#A4A7AE", divider: "#E9EAEB", surface: "#F5F5F5",
        // Itinerary builder
        ib: { teal: "#00A898", blue: "#333C6A", yellow: "#FDA201", pink: "#FE6795", dpink: "#FD3472", muted: "#848aa5" },
      },
    },
  },
  plugins: [],
};
