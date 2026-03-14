/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./components/**/*.{js,jsx,ts,tsx}",
  "./app/**/*.{js,jsx,ts,tsx,*.ios.js,*.android.js}"
],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#f7f7ff",
        "primary-foreground": "#0f0f1a",

        secondary: "#2718fe",
        "secondary-hover": "#1e13c9",
        "secondary-light": "#e7e6ff",

        surface: "#ffffff",
        muted: "#eef0ff",
        border: "#d9dcff",

        text: {
          primary: "#0f0f1a",
          secondary: "#4b4b63",
          muted: "#8b8ba3",
        },

        success: "#22c55e",
        warning: "#f59e0b",
        error: "#ef4444",
        info: "#3b82f6",
      },
    },
  },
  plugins: [],
}