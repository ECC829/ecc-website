/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#08070a",
          900: "#0d0c11",
          850: "#131118",
          800: "#1a1721",
          700: "#241f2e",
          600: "#332c40",
        },
        gold: {
          50: "#fdf8ec",
          100: "#faeecd",
          200: "#f5dc99",
          300: "#efc65f",
          400: "#e8b234",
          500: "#d99a1b",
          600: "#bb7714",
          700: "#955514",
          800: "#7b4417",
          900: "#683917",
        },
        pitch: "#1f8a5a",
      },
      fontFamily: {
        display: ["'Barlow Condensed'", "Oswald", "Impact", "sans-serif"],
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        ultra: "0.35em",
      },
      backgroundImage: {
        "gold-sheen":
          "linear-gradient(120deg, #955514 0%, #e8b234 35%, #faeecd 50%, #e8b234 65%, #955514 100%)",
        "field-glow":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232,178,52,0.22), transparent 60%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "sheen-slide": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        marquee: "marquee 38s linear infinite",
        sheen: "sheen-slide 6s linear infinite",
      },
    },
  },
  plugins: [],
};
