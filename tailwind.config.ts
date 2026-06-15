// Source - https://stackoverflow.com/q/77533294
// Posted by Nuwan Chamikara, modified by community. See post 'Timeline' for change history
// Retrieved 2026-05-12, License - CC BY-SA 4.0

import type { Config } from "tailwindcss";
import withMT from "@material-tailwind/react/utils/withMT";

const config: Config = withMT({
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
});
export default config;
