/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    screens: {
      notebook: "480px",
      tablet: "640px",
      tala: "860px",
      laptop: "1024px",
      desktop: "1280px",
    },
    extend: {
      opacity: {
        fade: 0.6,
      },
      fontSize: {
        ms: "10px",
      },
      colors: {
        background: {
          dark: "#0b0f19",
          obsidian: "#060911",
        },
        typography: {
          light: "#f1f5f9",
          muted: "#94a3b8",
        },
        card: {
          dark: "#141b2b",
          elevated: "#1a2338",
        },
        action: {
          brand: "#2563eb",
          dark: "#1e293b",
        },
        rated: {
          dark: "#334155",
        },
      },
      boxShadow: {
        'cinematic': '0 20px 40px -15px rgba(0, 0, 0, 0.7)',
        'card-elevated': '0 8px 24px -4px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [require("tailwind-scrollbar"), require("tailwind-scrollbar-hide")],
};
