import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      colors: {
        'brand-100': '#FCF9F5',
        'brand-300': '#EEECE9',
        'brand-500': '#C4BFB8',
        'brand-900': '#1D1D1B',
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      gridTemplateRows: {
        // Complex site-specific row configuration
        'layout': 'var(--height-2) 1fr',
        'columns': '1fr var(--height-2)',
      }
    },
  },
  plugins: [],
} satisfies Config;
