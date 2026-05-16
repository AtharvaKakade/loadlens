/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "cyber-bg": "#07070f",
        "cyber-card": "#0c0c1e",
        "cyber-card2": "#10102a",
        "cyber-border": "#1c1c3e",
        "cyber-accent": "#4f9cf9",
        "cyber-cyan": "#00d4ff",
        "cyber-green": "#00e878",
        "cyber-amber": "#f59e0b",
        "cyber-red": "#ef4444",
        "cyber-purple": "#8b5cf6",
        "cyber-muted": "#4a4a72",
        "cyber-text": "#c8c8e8",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "Consolas", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-fast": "pulse 0.75s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-cyan": "glowCyan 2s ease-in-out infinite alternate",
        "glow-green": "glowGreen 2s ease-in-out infinite alternate",
        "glow-red": "glowRed 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "scan-line": "scanLine 3s linear infinite",
      },
      keyframes: {
        glowCyan: {
          "0%": { boxShadow: "0 0 4px rgba(0,212,255,0.3)" },
          "100%": {
            boxShadow:
              "0 0 16px rgba(0,212,255,0.7), 0 0 32px rgba(0,212,255,0.2)",
          },
        },
        glowGreen: {
          "0%": { boxShadow: "0 0 4px rgba(0,232,120,0.3)" },
          "100%": {
            boxShadow:
              "0 0 16px rgba(0,232,120,0.7), 0 0 32px rgba(0,232,120,0.2)",
          },
        },
        glowRed: {
          "0%": { boxShadow: "0 0 4px rgba(239,68,68,0.3)" },
          "100%": {
            boxShadow:
              "0 0 16px rgba(239,68,68,0.8), 0 0 32px rgba(239,68,68,0.3)",
          },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        scanLine: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
      },
    },
  },
  plugins: [],
};
