/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#408dfb",
        secondary: "#2ecc71",
        accent: "#e74c3c",
        navBg: "rgba(64, 141, 251, 0.2)",
      },
    },
  },
  plugins: [],
};
