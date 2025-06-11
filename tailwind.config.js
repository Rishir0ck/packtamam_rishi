/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'rotate3d': 'rotate3d 20s linear infinite',
        'pulse3d': 'pulse3d 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotateY(0deg)' },
          '50%': { transform: 'translateY(-20px) rotateY(180deg)' },
        },
        rotate3d: {
          '0%': { transform: 'rotateX(0deg) rotateY(0deg)' },
          '100%': { transform: 'rotateX(360deg) rotateY(360deg)' },
        },
        pulse3d: {
          '0%, 100%': { transform: 'scale(1) rotateY(0deg)' },
          '50%': { transform: 'scale(1.05) rotateY(180deg)' },
        },
      },
    },
  },
  plugins: [],
}