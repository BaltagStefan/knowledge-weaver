import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CodeBlock, CodeWithConfig } from '@/components/docs/CodeBlock';
import { 
  ArrowRight,
  CheckCircle2,
  Database,
  FileCode,
  GitCompare,
  HardDrive,
  Info,
  Layers,
  Server,
  Shield,
  Workflow,
  AlertTriangle,
  Zap,
  Download,
  Upload,
  Settings
} from 'lucide-react';

export function MigrationGuide() {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Migrare de la Kotaemon Original
          </CardTitle>
          <CardDescription>
            Ghid pas cu pas pentru înlocuirea frontend-ului Kotaemon cu acest proiect
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Ce este Kotaemon?</AlertTitle>
            <AlertDescription>
              <a href="https://github.com/Cinnamon/kotaemon" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                Kotaemon
              </a> este o aplicație RAG open-source dezvoltată de Cinnamon AI. 
              Acest proiect oferă un frontend modern React care se conectează la backend-ul Kotaemon prin n8n.
            </AlertDescription>
          </Alert>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-red-500 flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Kotaemon Original
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Frontend Gradio/Streamlit</li>
                <li>• Backend Python FastAPI</li>
                <li>• SQLite/PostgreSQL</li>
                <li>• UI monolitic</li>
                <li>• Autentificare custom</li>
              </ul>
            </div>
            
            <div className="border rounded-lg p-4 border-primary">
              <h4 className="font-semibold mb-2 text-primary flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Acest Frontend (Nou)
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• React 18 + TypeScript + Vite</li>
                <li>• n8n ca API Gateway</li>
                <li>• IndexedDB (cache local)</li>
                <li>• UI componentizat (shadcn)</li>
                <li>• Keycloak SSO</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center">
              <Server className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm mt-1">Kotaemon Backend</p>
            </div>
            <ArrowRight className="h-6 w-6 text-primary" />
            <div className="text-center">
              <Workflow className="h-8 w-8 mx-auto text-primary" />
              <p className="text-sm mt-1">n8n Workflows</p>
            </div>
            <ArrowRight className="h-6 w-6 text-primary" />
            <div className="text-center">
              <Layers className="h-8 w-8 mx-auto text-primary" />
              <p className="text-sm mt-1">React Frontend</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-requisites */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Cerințe Preliminare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="font-semibold">Necesare</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Node.js 18+ instalat</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>n8n instance (cloud sau self-hosted)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Vector Database (Qdrant, Pinecone, etc.)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>LLM API access (OpenAI, Anthropic, local)</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="font-semibold">Opționale</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Optional</Badge>
                  <span>Keycloak pentru SSO</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Optional</Badge>
                  <span>Embedding API dedicat</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">Optional</Badge>
                  <span>Reranker model</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step by Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Pași de Migrare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {/* Step 1 */}
            <AccordionItem value="step-1">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                  <span>Clonează și configurează proiectul</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pl-11">
                <CodeWithConfig
                  code={`# Clonează repository-ul
git clone https://github.com/your-org/kotaemon-react-frontend.git
cd kotaemon-react-frontend

# Instalează dependențele
npm install

# Copiază template-ul de configurare
cp .env.example .env`}
                  language="bash"
                  title="Terminal"
                  configs={[
                    { placeholder: 'your-org/kotaemon-react-frontend', description: 'URL-ul repository-ului tău' },
                  ]}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Step 2 */}
            <AccordionItem value="step-2">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                  <span>Configurează variabilele de mediu</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pl-11">
                <CodeWithConfig
                  code={`# .env - Configurație completă pentru migrare

# ============================================
# OBLIGATORIU - n8n Connection
# ============================================
# URL-ul unde ai n8n-ul instalat
VITE_N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook

# ============================================
# OPȚIONAL - Keycloak SSO
# ============================================
# Dacă folosești Keycloak pentru autentificare admin
VITE_KEYCLOAK_URL=https://your-keycloak.com
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=kotaemon-frontend

# ============================================
# OPȚIONAL - UI Defaults
# ============================================
VITE_DEFAULT_LANGUAGE=ro
VITE_DEFAULT_THEME=system`}
                  language="bash"
                  title=".env"
                  configs={[
                    { placeholder: 'https://your-n8n-instance.com/webhook', description: 'URL-ul instanței tale n8n (ex: https://n8n.compania.ro/webhook sau http://localhost:5678/webhook)' },
                    { placeholder: 'https://your-keycloak.com', description: 'URL-ul Keycloak (opțional, doar dacă folosești SSO)' },
                    { placeholder: 'your-realm', description: 'Numele realm-ului din Keycloak' },
                    { placeholder: 'kotaemon-frontend', description: 'Client ID configurat în Keycloak' },
                  ]}
                />

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Verificare rapidă</AlertTitle>
                  <AlertDescription>
                    După configurare, pornește aplicația cu <code className="bg-muted px-1 rounded">npm run dev</code> și 
                    accesează <code className="bg-muted px-1 rounded">/docs</code> pentru a verifica automat configurațiile.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            {/* Step 3 */}
            <AccordionItem value="step-3">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                  <span>Configurează workflow-urile n8n</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pl-11">
                <p className="text-sm text-muted-foreground">
                  n8n acționează ca un API Gateway între acest frontend și backend-ul existent Kotaemon.
                </p>

                <div className="border rounded-lg p-4 space-y-4">
                  <h5 className="font-semibold">Workflow principal: /chat/stream</h5>
                  <CodeWithConfig
                    code={`// n8n Workflow - Chat cu Streaming SSE
// Noduri necesare:

// 1. WEBHOOK TRIGGER
{
  "httpMethod": "POST",
  "path": "chat/stream",
  "responseMode": "responseNode",
  "options": {
    "rawBody": true
  }
}

// 2. CODE NODE - Parse Request
const body = JSON.parse($input.first().json.body);
const { 
  message,        // Mesajul utilizatorului
  workspaceId,    // ID workspace activ
  docIds,         // Array de documente pentru RAG
  conversationId, // ID conversație
  actor           // { userId, username, role }
} = body;

return { message, workspaceId, docIds, conversationId, actor };

// 3. HTTP REQUEST - Query Kotaemon Backend
// SAU conectare directă la Vector DB + LLM

// Opțiunea A: Proxy la Kotaemon existent
const response = await fetch("http://your-kotaemon-backend:7860/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    query: message,
    conversation_id: conversationId,
    doc_ids: docIds
  })
});

// Opțiunea B: Direct la Vector DB + LLM
// 3a. Query Vector DB (Qdrant/Pinecone)
// 3b. Rerank results
// 3c. Call LLM cu context

// 4. RESPOND TO WEBHOOK (SSE streaming)
// Trimite evenimente în format:
// data: {"type": "token", "content": "..."}
// data: {"type": "citations", "citations": [...]}
// data: {"type": "done"}`}
                    language="javascript"
                    title="n8n-chat-workflow.js"
                    configs={[
                      { placeholder: 'http://your-kotaemon-backend:7860', description: 'URL-ul backend-ului Kotaemon existent (dacă faci proxy)' },
                    ]}
                  />
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important pentru SSE</AlertTitle>
                  <AlertDescription>
                    Pentru streaming, n8n trebuie să returneze <code className="bg-muted px-1 rounded">Content-Type: text/event-stream</code>. 
                    Configurează Response Mode ca "Respond to Webhook" cu "Response Body" raw.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            {/* Step 4 */}
            <AccordionItem value="step-4">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">4</div>
                  <span>Migrare date existente (opțional)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pl-11">
                <p className="text-sm text-muted-foreground">
                  Dacă ai date în Kotaemon pe care vrei să le păstrezi, poți să le migrezi.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export din Kotaemon
                    </h5>
                    <CodeBlock
                      code={`# Din backend-ul Kotaemon
# Exportă utilizatori
python -c "
from kotaemon.db import get_users
import json
users = get_users()
print(json.dumps(users, indent=2))
" > users_export.json

# Exportă conversații
python -c "
from kotaemon.db import get_conversations
import json
convs = get_conversations()
print(json.dumps(convs, indent=2))
" > conversations_export.json`}
                      language="bash"
                      title="Export Kotaemon"
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Import în IndexedDB
                    </h5>
                    <CodeBlock
                      code={`// În browser console sau script de migrare
import { db } from '@/db/dexie';
import { createUser, createWorkspace } from '@/db/repo';

// Import users
const users = await fetch('/users_export.json')
  .then(r => r.json());
  
for (const user of users) {
  await createUser(
    user.username,
    user.role || 'user',
    user.email
  );
}

// Import workspaces
// ...similar pentru workspace-uri`}
                      language="typescript"
                      title="Import Script"
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Vector DB</AlertTitle>
                  <AlertDescription>
                    Dacă folosești aceeași Vector Database (ex: Qdrant) cu Kotaemon original, 
                    datele indexate se păstrează automat. Trebuie doar să configurezi același endpoint în n8n.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            {/* Step 5 */}
            <AccordionItem value="step-5">
              <AccordionTrigger>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">5</div>
                  <span>Testare și deployment</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pl-11">
                <CodeWithConfig
                  code={`# Testare locală
npm run dev
# Deschide http://localhost:5173

# Build pentru producție
npm run build

# Preview build
npm run preview

# Deployment (exemplu Nginx)
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/kotaemon-frontend/dist;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy pentru n8n (opțional)
    location /webhook/ {
        proxy_pass https://your-n8n-instance.com/webhook/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}`}
                  language="bash"
                  title="Deploy Commands"
                  configs={[
                    { placeholder: 'your-domain.com', description: 'Domeniul tău pentru frontend' },
                    { placeholder: 'https://your-n8n-instance.com/webhook/', description: 'URL-ul n8n pentru proxy (opțional)' },
                  ]}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* API Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Mapare API: Kotaemon → n8n
          </CardTitle>
          <CardDescription>
            Cum să conectezi endpoint-urile Kotaemon existente la n8n workflows
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-semibold">Kotaemon Original</th>
                  <th className="text-left p-3 font-semibold">n8n Workflow Path</th>
                  <th className="text-left p-3 font-semibold">Descriere</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-mono text-xs">/api/chat</td>
                  <td className="p-3 font-mono text-xs text-primary">/chat/stream</td>
                  <td className="p-3">Chat principal cu RAG și streaming</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-mono text-xs">/api/upload</td>
                  <td className="p-3 font-mono text-xs text-primary">/files/upload</td>
                  <td className="p-3">Upload documente PDF</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-mono text-xs">/api/index</td>
                  <td className="p-3 font-mono text-xs text-primary">/files/index</td>
                  <td className="p-3">Indexare în Vector DB</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-mono text-xs">/api/documents</td>
                  <td className="p-3 font-mono text-xs text-primary">/files/list</td>
                  <td className="p-3">Lista documente</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-mono text-xs">/api/conversations</td>
                  <td className="p-3 font-mono text-xs text-primary">/conversations/list</td>
                  <td className="p-3">Istoricul conversațiilor</td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-mono text-xs">/api/settings</td>
                  <td className="p-3 font-mono text-xs text-primary">/settings/get, /settings/save</td>
                  <td className="p-3">Configurări workspace</td>
                </tr>
                <tr className="border-b bg-yellow-50 dark:bg-yellow-950/20">
                  <td className="p-3 font-mono text-xs text-muted-foreground">/api/auth/*</td>
                  <td className="p-3 font-mono text-xs text-primary">/auth/*</td>
                  <td className="p-3">
                    <span className="text-yellow-600">Nou: Keycloak SSO sau local IndexedDB</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Probleme Comune la Migrare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="border-l-4 border-red-500 pl-4">
              <h5 className="font-semibold">CORS Errors</h5>
              <p className="text-sm text-muted-foreground mb-2">
                Frontend-ul nu poate accesa n8n din cauza politicilor CORS.
              </p>
              <CodeBlock
                code={`# În n8n, adaugă în environment variables:
N8N_CORS_ORIGINS=http://localhost:5173,https://your-domain.com

# Sau folosește proxy Nginx (recomandat pentru producție)`}
                language="bash"
              />
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <h5 className="font-semibold">SSE nu funcționează</h5>
              <p className="text-sm text-muted-foreground mb-2">
                Streaming-ul nu afișează text în timp real.
              </p>
              <CodeBlock
                code={`// În n8n Respond to Webhook node:
{
  "options": {
    "responseCode": 200,
    "responseHeaders": {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive"
    }
  }
}`}
                language="json"
              />
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-semibold">Keycloak redirect loop</h5>
              <p className="text-sm text-muted-foreground mb-2">
                După login, pagina face redirect la nesfârșit.
              </p>
              <CodeBlock
                code={`# Verifică în Keycloak Client Settings:
Valid Redirect URIs: 
  - http://localhost:5173/*
  - https://your-domain.com/*

Web Origins:
  - http://localhost:5173
  - https://your-domain.com`}
                language="yaml"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
