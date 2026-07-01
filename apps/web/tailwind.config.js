/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 20px 40px rgba(91, 64, 61, 0.06)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      colors: {
        "primary": "#a20513",
        "primary-focus": "#c62828",
        "secondary": "#2b6954",
        "secondary-focus": "#1e4d3d",
        "secondary-container": "#adedd3",
        "accent": "#735c00",
        "tertiary-container": "#cca730",
        "neutral": "#1a1c1c",
        "surface": "#faf9f8",
        "surface-low": "#f4f3f2",
        "surface-lowest": "#ffffff",
        "surface-container": "#eeeeed",
        "surface-container-high": "#e9e8e7",
        "surface-container-highest": "#e3e2e1",
        "surface-variant": "#e3e2e1",
        "on-surface-variant": "#5b403d",
        "outline": "#8f706c",
        "outline-variant": "#e4beba",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
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
          "primary": "#a20513",
          "primary-focus": "#c62828",
          "secondary": "#2b6954",
          "accent": "#735c00",
          "neutral": "#1a1c1c",
          "base-100": "#ffffff",
          "info": "#3ABFF8",
          "success": "#36D399",
          "warning": "#FBBD23",
          "error": "#ba1a1a",
          "--rounded-box": "1.5rem",
          "--rounded-btn": "1.5rem",
          "--rounded-badge": "1.9rem",
          "--tab-radius": "0.7rem",
        },
      },
    ],
  },
}
