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
<<<<<<< HEAD
    // Configure these targets with your real service URLs
    proxy: {
      // LLM API proxy (your GPT model)
      "/api/llm": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/llm/, ""),
        configure: (proxy) => {
          proxy.on("error", (err) => {
            console.log("LLM proxy error:", err);
          });
        }
      },
      // Vector DB proxy (configure with your vector DB URL)
      "/api/vectordb": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/vectordb/, "")
      },
      // Embedding API proxy
      "/api/embed": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/embed/, "")
      },
      // Generic API proxy for other services
      "/api": {
        target: "http://gpt-oss-120b.kubeflow-dcpd.kubeflow.int.stscloud.ro/v1",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "")
      }
    }
=======
    // Configure these targets with your local service URLs
    proxy: {
      // LLM API proxy (e.g., Ollama, LM Studio, vLLM)
      '/api/llm': {
        target: 'http://localhost:11434', // Default: Ollama
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llm/, ''),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('LLM proxy error:', err);
          });
        },
      },
      // Vector DB proxy (e.g., Qdrant, Milvus, ChromaDB)
      '/api/vectordb': {
        target: 'http://localhost:6333', // Default: Qdrant
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/vectordb/, ''),
      },
      // Embedding API proxy
      '/api/embed': {
        target: 'http://localhost:11434', // Default: Ollama embeddings
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/embed/, ''),
      },
      // Generic local API proxy
      '/api/local': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/local/, ''),
      },
    },
>>>>>>> d43d05630a6db9376c9f6b56cf321d7dd06dfcc6
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
}));
