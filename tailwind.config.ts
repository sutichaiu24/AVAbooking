import type { Config } from "tailwindcss";

/**
 * AirAsia Crimson, restated in a full-service carrier register.
 *
 * The palette keeps the airline's red, but demotes it from background to
 * accent: surfaces are paper-white, separation comes from hairline rules
 * rather than filled cards, and the red is spent on the few elements that
 * genuinely need to be found. Corner radii are near-square and elevation is
 * almost flat, so the page reads as printed matter rather than as chrome.
 *
 * Every value lives here; no component hard-codes a hex.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        aa: {
          /* Brand accent — used sparingly. */
          red: "#E60000",
          crimson: "#A50E0E",
          "crimson-dark": "#7A0000",
          wine: "#3D0A0A",

          /* Neutrals, biased a few degrees toward the accent so the greys
             read as chosen rather than inherited. */
          paper: "#FFFFFF",
          tint: "#FAF8F8",
          mist: "#F3EFEF",
          border: "#E8E2E3",
          rule: "#D8D0D1",

          ink: "#1A1618",
          graphite: "#4A4247",
          muted: "#8A8085",

          success: "#0F7A55",
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
      /**
       * Weights are remapped one to two steps lighter than Tailwind's defaults.
       * The components still say `font-bold` where emphasis is meant; the scale
       * simply resolves that emphasis with restraint.
       */
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "500",
        bold: "600",
        extrabold: "600",
        black: "700",
      },
      /** Near-square throughout. `full` survives for dots and pills. */
      borderRadius: {
        none: "0",
        sm: "1px",
        DEFAULT: "2px",
        md: "2px",
        lg: "3px",
        xl: "3px",
        "2xl": "4px",
        "3xl": "6px",
        full: "9999px",
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.06em",
        wider: "0.12em",
        widest: "0.2em",
      },
      backgroundImage: {
        "aa-hero": "linear-gradient(160deg, #5E0A0A 0%, #3D0A0A 58%, #240606 100%)",
        "aa-cta": "linear-gradient(180deg, #E60000 0%, #C40000 100%)",
      },
      boxShadow: {
        /** The single piece of elevation: the booking panel over the hero. */
        "aa-float": "0 24px 60px -32px rgba(26,22,24,0.45)",
        "aa-card": "none",
        "aa-lift": "0 12px 32px -20px rgba(61,10,10,0.5)",
      },
      keyframes: {
        "aa-pulse-ring": {
          "0%": { transform: "scale(0.92)", opacity: "0.7" },
          "70%": { transform: "scale(1.18)", opacity: "0" },
          "100%": { transform: "scale(1.18)", opacity: "0" },
        },
        "aa-rise": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "aa-scan": {
          "0%": { transform: "translateY(-4%)" },
          "100%": { transform: "translateY(104%)" },
        },
      },
      animation: {
        "aa-pulse-ring": "aa-pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        "aa-rise": "aa-rise 0.4s cubic-bezier(0.16,1,0.3,1) both",
        "aa-scan": "aa-scan 2.4s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};

export default config;
