import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` matches the GitHub Pages URL: https://akrambgh1.github.io/ecommerce-store/
export default defineConfig({
  plugins: [react()],
  base: "/ecommerce-store/",
});
