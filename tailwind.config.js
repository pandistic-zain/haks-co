/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        obsidian: "#050505",
        ember: "#8b2038",
        emberLight: "#b82f4b",
        bone: "#f5efe6",
        pewter: "#b9b0a6"
      },
      fontFamily: {
        serif: ["Bodoni Moda", "Georgia", "serif"],
        sans: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        ember: "0 30px 90px rgba(139, 32, 56, 0.18)",
        soft: "0 28px 80px rgba(0, 0, 0, 0.36)"
      },
      backgroundImage: {
        grain:
          "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 22%), radial-gradient(circle at 80% 10%, rgba(139,32,56,0.12), transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.04), transparent)"
      }
    }
  },
  plugins: []
};
