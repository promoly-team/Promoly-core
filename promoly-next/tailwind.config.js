/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}", // 👈 ADICIONE ISSO
  ],

  theme: {
    extend: {
      colors: {
        /* =========================
           PROMOLY BRAND SYSTEM
        ========================== */

        primary: {
          DEFAULT: "#3b82f6",
          hover: "#2563eb",
        },

        success: {
          DEFAULT: "#22c55e",
          glow: "#34d399",
        },

        accent: {
          DEFAULT: "#fbbf24",
        },

        danger: {
          DEFAULT: "#ef4444",
        },

        muted: {
          DEFAULT: "#6b7280",
        },

        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f3f4f6",
        },

        /* =========================
           DARK PREMIUM SYSTEM
        ========================== */
        base: "#0a0e1a",
        panel: {
          DEFAULT: "#111726",
          elevated: "#161d2e",
          subtle: "#1c2435",
        },
        ink: {
          DEFAULT: "#f1f5f9",
          muted: "#94a3b8",
          faint: "#64748b",
        },
        line: "#1f2a3d",
      },

      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.05)",
        medium: "0 8px 20px rgba(0,0,0,0.08)",
        glow: "0 0 0 1px rgba(34,197,94,0.25), 0 8px 30px rgba(34,197,94,0.12)",
        elevated: "0 10px 40px rgba(0,0,0,0.45)",
      },

      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
    },
  },
  plugins: [],
};
