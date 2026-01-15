import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

const resolveN8nProxyTarget = (env: Record<string, string>): string => {
  const candidates = [
    env.VITE_N8N_CHAT_WEBHOOK_URL,
    env.VITE_N8N_WEBHOOK_BASE_URL,
  ];

  for (const value of candidates) {
    if (!value) continue;
    try {
      return new URL(value.trim()).origin;
    } catch {
      // Ignore non-URL values (relative paths).
    }
  }

  return "http://localhost:5678";
};

const resolveN8nReceiverProxyTarget = (env: Record<string, string>): string => {
  return env.VITE_N8N_RECEIVER_URL || "http://localhost:8788";
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const n8nProxyTarget = resolveN8nProxyTarget(env);
  const n8nReceiverProxyTarget = resolveN8nReceiverProxyTarget(env);

  return {
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
        // n8n webhook proxy (dev CORS)
        "/webhook": {
          target: n8nProxyTarget,
          changeOrigin: true,
          secure: false
        },
        "/webhook-test": {
          target: n8nProxyTarget,
          changeOrigin: true,
          secure: false
        },
        // n8n callback receiver proxy (frontend -> backend)
        "/api/n8n": {
          target: n8nReceiverProxyTarget,
          changeOrigin: true,
          secure: false
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
  };
});
