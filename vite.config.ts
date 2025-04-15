import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // server: {
  //   host: "192.168.1.53", // or use your specific local IP like '192.168.1.100'
  //   port: 3000, // change this to any port you like
  // },
})
