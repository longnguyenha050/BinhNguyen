import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  //alow connect from *
  server: {
    allowedHosts: true, // Cho phép tất cả các host
  },
});
