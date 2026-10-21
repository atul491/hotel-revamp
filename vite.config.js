import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// BASE is set by the deploy workflow (e.g. "/hotel-revamp/" on GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE || "/",
});
