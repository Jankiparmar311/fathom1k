import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      awaitWriteFinish: true,
    },
    port: 3000,
    host: true,
    allowedHosts: [
      "928b-123-201-85-146.ngrok-free.app",
      "8f67-123-201-85-146.ngrok-free.app",
      "007a-123-201-85-146.ngrok-free.app",
      "1c5d-123-201-85-146.ngrok-free.app",
      "b899-123-201-85-146.ngrok-free.app",
    ],

    // https: {
    //   key: fs.readFileSync("localhost-key.pem"),
    //   cert: fs.readFileSync("localhost.pem"),
    // },
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src/" }],
  },
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
});
