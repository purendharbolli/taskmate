/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        taskYellow: "#FFD84D",
        taskBlue: "#8DD8FF",
        taskPink: "#FF8FB8",
        taskBlack: "#111111",
        taskOffWhite: "#FFFDF5",
        taskMutedGray: "#E8E5DD",
        taskGreen: "#74E4A2",
        taskOrange: "#FF9F43",
      },
      boxShadow: {
        brutal: "4px 4px 0px #111111",
        "brutal-sm": "2px 2px 0px #111111",
        "brutal-lg": "6px 6px 0px #111111",
        "brutal-xl": "8px 8px 0px #111111",
        "brutal-hover": "2px 2px 0px #111111",
      },
      borderWidth: {
        '3': '3px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Plus Jakarta Sans',
          'Inter',
          'sans-serif',
        ]
      }
    },
  },
  plugins: [],
};
