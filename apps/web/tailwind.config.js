/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--p)",
        secondary: "var(--s)",
        accent: "var(--a)",
        neutral: "var(--n)",
        "base-100": "var(--b1)",
        info: "var(--in)",
        success: "var(--su)",
        warning: "var(--wa)",
        error: "var(--er)",
      }
    },
  },
  plugins: [
    require("daisyui"),
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["light"],
          "primary": "#C62828",
          "secondary": "#064E3B",
          "accent": "#D4AF37",
          "neutral": "#FDFCFB",
          "base-100": "#ffffff",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#F87272",
        },
      },
    ],
  },
}
