import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // CORS Proxy for local development
    // Configure these targets with your real service URLs
    proxy: {
      // LLM API proxy (your GPT model)
      "/api/llm": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/llm(\/v1)?/, ""),
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("LLM proxy error:", err);
          });
        }
      },
      "/api/chat": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/chat(\/v1)?/, "")
      },
      // Vector DB proxy (configure with your vector DB URL)
      "/api/vectordb": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/vectordb(\/v1)?/, "")
      },
      // Embedding API proxy
      "/api/embed": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/embed(\/v1)?/, "")
      },
      // Generic API proxy for other services
      "/api": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api(\/v1)?/, "")
      }
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));
