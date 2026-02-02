import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#d4af35",
        "primary-hover": "#b89628",
        "background-dark": "#050505",
        "surface-dark": "#0f0f0f",
        "surface-light": "#1a1a1a",
        "card-dark": "#1F1F22",
        "text-grey": "#A1A1AA",
        "text-muted": "#71717A",
        "accent-green": "#10B981",
        "accent-purple": "#8B5CF6",
        "dark-panel-l": "#0a0a0a",
        "dark-panel-r": "#0f0f0f",
        "input-bg": "#1a1a1a",
      },
      fontFamily: {
        display: ["Inter", "Lexend", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(212, 175, 53, 0.3)",
        glow: "0 0 30px -5px rgba(212, 175, 55, 0.25)",
      },
    },
  },
  plugins: [],
} satisfies Config;
