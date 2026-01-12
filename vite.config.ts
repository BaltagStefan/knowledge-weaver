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
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
