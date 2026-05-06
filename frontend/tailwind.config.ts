import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ["'Space Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      colors: {
        bg:      "#080b14",
        surface: "#161d2e",
        accent:  "#00d4aa",
        accent2: "#0099ff",
      },
      animation: {
        "pulse-dot": "pulse 2s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-up":  "slideUp 0.4s ease forwards",
        "fade-in":   "fadeIn 0.35s ease forwards",
      },
      keyframes: {
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
