/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { ink: "#182039", muted: "#727995", lavender: "#7067e8", cream: "#f7f6f2" },
      boxShadow: { soft: "0 12px 36px rgba(45, 48, 78, .08)", glow: "0 8px 30px rgba(112, 103, 232, .22)" },
      animation: { "float-in": "floatIn .45s ease-out both", pulseDot: "pulseDot 1.8s ease-in-out infinite" },
      keyframes: {
        floatIn: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        pulseDot: { "0%,100%": { opacity: "1", transform: "scale(1)" }, "50%": { opacity: ".45", transform: "scale(.8)" } },
      },
    },
  },
  plugins: [],
};
