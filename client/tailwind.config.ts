import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"],
        body: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#14141f",
          hover: "#1c1c2e",
          elevated: "#1a1a2e",
        },
        border: {
          subtle: "#1e1e32",
          DEFAULT: "#2a2a44",
        },
        primary: {
          DEFAULT: "#8b5cf6",
          hover: "#a78bfa",
          dark: "#7c3aed",
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out both",
        "slide-up": "slide-up 0.4s ease-out both",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
