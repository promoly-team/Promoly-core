/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        /* =========================
           PROMOLY BRAND SYSTEM
        ========================== */

        primary: {
          DEFAULT: "#2563eb",
          hover: "#1d4ed8",
        },

        success: {
          DEFAULT: "#22c177",
        },

        accent: {
          DEFAULT: "#facc15",
        },

        danger: {
          DEFAULT: "#dc2626",
        },

        muted: {
          DEFAULT: "#6b7280",
        },

        surface: {
          DEFAULT: "#ffffff",
          subtle: "#f3f4f6",
        },
      },

      boxShadow: {
        soft: "0 4px 12px rgba(0,0,0,0.05)",
        medium: "0 8px 20px rgba(0,0,0,0.08)",
      },

      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
      },
    },
  },
  plugins: [],
};
