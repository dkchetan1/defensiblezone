module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        background: "#ECEAE3",
        foreground: "#1C1917",
        primary: {
          DEFAULT: "#2C5F5F",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#E5E2DB",
          foreground: "#1C1917",
        },
        muted: {
          DEFAULT: "#F5F2EE",
          foreground: "#6B6560",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1917",
        },
        border: "#DDD9D3",
        accent: {
          DEFAULT: "#2C5F5F",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        heading: ["DM Serif Display", "Georgia", "serif"],
        mono: ["DM Mono", "Courier New", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
