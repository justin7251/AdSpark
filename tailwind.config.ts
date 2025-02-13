import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'adspark-primary': '#YOUR_PRIMARY_COLOR',
        'adspark-secondary': '#YOUR_SECONDARY_COLOR',
      },
    },
  },
  plugins: [],
} satisfies Config;
