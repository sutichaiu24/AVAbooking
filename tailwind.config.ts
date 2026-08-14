import type { Config } from "tailwindcss";

/**
 * AirAsia Crimson Design System.
 * Palette is defined once here and consumed as `aa-*` utility classes so that
 * no component hard-codes a hex value.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        aa: {
          red: "#E60000",
          crimson: "#990000",
          "crimson-dark": "#7A0000",
          wine: "#4A0000",
          tint: "#FFF5F5",
          border: "#F5C2C2",
          ink: "#1E1E1E",
          muted: "#666666",
          success: "#059669",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Noto Sans Thai",
          "Sarabun",
          "Kanit",
          "Prompt",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      backgroundImage: {
        "aa-hero": "linear-gradient(135deg, #990000 0%, #7A0000 55%, #4A0000 100%)",
        "aa-cta": "linear-gradient(135deg, #E60000 0%, #990000 100%)",
      },
      boxShadow: {
        "aa-card": "0 1px 2px rgba(74,0,0,0.05), 0 8px 24px -12px rgba(74,0,0,0.18)",
        "aa-lift": "0 12px 40px -14px rgba(122,0,0,0.45)",
      },
      keyframes: {
        "aa-pulse-ring": {
          "0%": { transform: "scale(0.92)", opacity: "0.7" },
          "70%": { transform: "scale(1.18)", opacity: "0" },
          "100%": { transform: "scale(1.18)", opacity: "0" },
        },
        "aa-rise": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "aa-scan": {
          "0%": { transform: "translateY(-4%)" },
          "100%": { transform: "translateY(104%)" },
        },
        "aa-marquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "aa-pulse-ring": "aa-pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        "aa-rise": "aa-rise 0.35s ease-out both",
        "aa-scan": "aa-scan 2.4s ease-in-out infinite alternate",
        "aa-marquee": "aa-marquee 32s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
