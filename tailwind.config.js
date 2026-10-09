/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Layout
        background: "#ECE3DE", // hovedbakgrunn
        backgroundAlt: "#DBD9CD", // litt mørkere, til kort, paneler osv.

        primary: "#6B5448", // mørk brun – header, tabbar, viktige elementer

        accent: "#758987", // primær-aksent – knapper, markering
        accentMuted: "#A5B5B3",

        text: "#2F2E2C",
        textOnPrimary: "#ECE3DE",
        textOnAccent: "#ECE3DE",
      },
      borderColor: {
        primary: "#6B5448",
        accent: "#758987",
      },
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};
