import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CodeBlock, CodeWithConfig } from '@/components/docs/CodeBlock';
import { apiEndpoints, components, databaseTables, stores } from './docs/data';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Database, 
  Server, 
  Shield, 
  FileCode, 
  Workflow, 
  Layers, 
  FolderTree,
  Key,
  Users,
  HardDrive,
  Globe,
  Cpu,
  MessageSquare,
  Settings,
  Lock,
  AlertTriangle,
  CheckCircle,
  Zap,
  Code,
  FileJson,
  Info,
  BookOpen,
  GitCompare
} from 'lucide-react';

export default function DocsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Documentație Tehnică Completă</h1>
          <p className="text-muted-foreground text-lg">
            Ghid complet pentru configurarea și integrarea aplicației RAG Chat
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">v1.0</Badge>
            <Badge variant="secondary">React 18</Badge>
            <Badge variant="secondary">TypeScript</Badge>
            <Badge variant="secondary">n8n</Badge>
            <Badge variant="secondary">Keycloak</Badge>
          </div>
        </div>

        <Tabs defaultValue="migration" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2">
            <TabsTrigger value="migration" className="flex items-center gap-1">
              <GitCompare className="h-3.5 w-3.5" />
              {t('docs.tabs.migration')}
            </TabsTrigger>
            <TabsTrigger value="overview">{t('docs.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="setup">{t('docs.tabs.setup')}</TabsTrigger>
            <TabsTrigger value="n8n">{t('docs.tabs.n8n')}</TabsTrigger>
            <TabsTrigger value="keycloak">{t('docs.tabs.keycloak')}</TabsTrigger>
            <TabsTrigger value="database">{t('docs.tabs.database')}</TabsTrigger>
            <TabsTrigger value="api">{t('docs.tabs.api')}</TabsTrigger>
            <TabsTrigger value="stores">{t('docs.tabs.stores')}</TabsTrigger>
            <TabsTrigger value="components">{t('docs.tabs.components')}</TabsTrigger>
          </TabsList>

          {/* Migration Tab - Default */}
          <TabsContent value="migration" className="space-y-6">
            <MigrationChecker />
            <MigrationGuide />
          </TabsContent>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <OverviewSection />
          </TabsContent>

          {/* Setup & Config Tab */}
          <TabsContent value="setup" className="space-y-6">
            <SetupSection />
          </TabsContent>

          {/* n8n Workflows Tab */}
          <TabsContent value="n8n" className="space-y-6">
            <N8nSection />
          </TabsContent>

          {/* Keycloak Tab */}
          <TabsContent value="keycloak" className="space-y-6">
            <KeycloakSection />
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
            <DatabaseSection />
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-6">
            <ApiReferenceSection />
          </TabsContent>

          {/* Stores Tab */}
          <TabsContent value="stores" className="space-y-6">
            <StoresSection />
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
            <ComponentsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================
// OVERVIEW SECTION
// ============================================
function OverviewSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Arhitectura Generală
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Aplicația este un client <strong>RAG Chat</strong> (Retrieval-Augmented Generation) 
            construit cu React + TypeScript + Vite. Funcționează ca un frontend care comunică 
            cu backend-ul prin <strong>n8n workflows</strong>.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Frontend
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• React 18 + TypeScript</li>
                <li>• Vite (build tool)</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• React Router v6</li>
                <li>• Zustand (state management)</li>
                <li>• TanStack Query (data fetching)</li>
              </ul>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Backend (n8n)
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• n8n Workflows ca API</li>
                <li>• Webhook endpoints (POST)</li>
                <li>• SSE pentru chat streaming</li>
                <li>• Procesare fișiere PDF</li>
                <li>• Integrare cu LLM</li>
              </ul>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Autentificare
              </h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Keycloak (admin auth)</li>
                <li>• IndexedDB (cache local)</li>
                <li>• Token-based auth</li>
                <li>• RBAC (role-based access)</li>
                <li>• SSO support</li>
              </ul>
            </div>
          </div>

          <Separator className="my-6" />

          <h4 className="font-semibold text-lg">Flux de Date Complet</h4>
          <CodeBlock 
            code={`┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLOW DE DATE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. USER INPUT                                                               │
│     └─> ChatComposer.tsx (input mesaj)                                       │
│           └─> useChatStore.sendMessage()                                     │
│                 └─> n8nClient.streamChat()                                   │
│                                                                              │
│  2. API CALL                                                                 │
│     └─> POST {YOUR_N8N_URL}/chat/stream                                      │
│           Headers: { Authorization: Bearer <keycloak_token> }                │
│           Body: { message, workspaceId, actor, docIds, ... }                 │
│                                                                              │
│  3. N8N WORKFLOW                                                             │
│     └─> Webhook Trigger                                                      │
│           └─> Validate Token (optional)                                      │
│                 └─> Query Vector DB                                          │
│                       └─> Retrieve relevant chunks                           │
│                             └─> Call LLM API                                 │
│                                   └─> Stream response via SSE                │
│                                                                              │
│  4. SSE EVENTS (Server-Sent Events)                                          │
│     └─> { type: 'status', status: 'searching_pdfs' }                         │
│     └─> { type: 'citations', citations: [...] }                              │
│     └─> { type: 'token', content: '...' }                                    │
│     └─> { type: 'reasoning', content: '...' }                                │
│     └─> { type: 'done' } sau { type: 'error', message: '...' }               │
│                                                                              │
│  5. UI UPDATE                                                                │
│     └─> useChatStore.addStreamToken()                                        │
│           └─> ChatMessage.tsx (afișare cu markdown)                          │
│                 └─> ReasoningPanel.tsx (citări și reasoning)                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘`}
            language="text"
            title="architecture-flow.txt"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Termeni și Concepte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <h5 className="font-semibold">RAG (Retrieval-Augmented Generation)</h5>
                <p className="text-sm text-muted-foreground">
                  Tehnică AI care combină căutarea în documente cu generarea de text. 
                  Întâi caută informații relevante în baza de vectori, apoi le trimite la LLM pentru răspuns.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h5 className="font-semibold">Workspace</h5>
                <p className="text-sm text-muted-foreground">
                  Container izolat pentru documente, setări și conversații. 
                  Fiecare workspace are propria configurație LLM, RAG și utilizatori.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h5 className="font-semibold">Vector Database</h5>
                <p className="text-sm text-muted-foreground">
                  Bază de date specializată pentru stocarea embedding-urilor (vectori numerici) 
                  care reprezintă semantic conținutul documentelor.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="border-l-4 border-secondary pl-4">
                <h5 className="font-semibold">Chunk</h5>
                <p className="text-sm text-muted-foreground">
                  Fragment de document (ex: 512 tokeni). Documentele sunt împărțite în chunks 
                  pentru indexare și căutare eficientă.
                </p>
              </div>
              <div className="border-l-4 border-secondary pl-4">
                <h5 className="font-semibold">Reranker</h5>
                <p className="text-sm text-muted-foreground">
                  Model AI secundar care reordonează rezultatele căutării pentru relevanță 
                  mai bună înainte de a le trimite la LLM.
                </p>
              </div>
              <div className="border-l-4 border-secondary pl-4">
                <h5 className="font-semibold">SSE (Server-Sent Events)</h5>
                <p className="text-sm text-muted-foreground">
                  Protocol HTTP pentru streaming unidirecțional. Serverul trimite evenimente 
                  (tokens) pe măsură ce LLM-ul generează răspunsul.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ============================================
// SETUP SECTION
// ============================================
function SetupSection() {
  return (
    <>
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Ghid de Configurare</AlertTitle>
        <AlertDescription>
          Urmează pașii în ordine pentru o configurare corectă a aplicației.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Variabile de Mediu (.env)
          </CardTitle>
          <CardDescription>
            Creează un fișier <code className="bg-muted px-1 rounded">.env</code> în rădăcina proiectului
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CodeWithConfig
            code={`# ============================================
# CONFIGURARE COMPLETĂ .env
# ============================================

# n8n Webhook Base URL
# URL-ul de bază pentru toate endpoint-urile n8n
VITE_N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook

# Keycloak Configuration
VITE_KEYCLOAK_URL=https://your-keycloak.com
VITE_KEYCLOAK_REALM=your-realm-name
VITE_KEYCLOAK_CLIENT_ID=your-client-id

# ============================================
# OPȚIONAL - Defaults
# ============================================
VITE_DEFAULT_LANGUAGE=ro
VITE_DEFAULT_THEME=system`}
            language="bash"
            title=".env"
            configs={[
              { placeholder: 'https://your-n8n-instance.com/webhook', description: 'URL-ul instanței tale n8n (ex: https://n8n.compania.ro/webhook)' },
              { placeholder: 'https://your-keycloak.com', description: 'URL-ul instanței Keycloak (ex: https://auth.compania.ro)' },
              { placeholder: 'your-realm-name', description: 'Numele realm-ului creat în Keycloak (ex: rag-chat)' },
              { placeholder: 'your-client-id', description: 'Client ID din Keycloak (ex: rag-chat-app)' },
            ]}
          />

          <Separator />

          <h4 className="font-semibold">Explicații Detaliate</h4>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Workflow className="h-4 w-4 text-primary" />
                <span className="font-bold">VITE_N8N_WEBHOOK_BASE_URL</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                URL-ul de bază pentru toate apelurile către n8n. Frontend-ul va adăuga 
                endpoint-urile la acest URL.
              </p>
              <div className="bg-muted p-2 rounded text-xs font-mono">
                <p className="text-green-500">✓ https://n8n.compania.ro/webhook</p>
                <p className="text-green-500">✓ http://localhost:5678/webhook</p>
                <p className="text-red-500">✗ https://n8n.compania.ro/webhook/ (fără slash final!)</p>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="font-bold">VITE_KEYCLOAK_URL</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                URL-ul instanței Keycloak.
              </p>
              <div className="bg-muted p-2 rounded text-xs font-mono">
                <p className="text-green-500">Keycloak 17+: https://keycloak.compania.ro</p>
                <p className="text-yellow-500">Keycloak &lt;17: https://keycloak.compania.ro/auth</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Pași de Instalare
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <div className="flex-1">
                <h5 className="font-semibold">Clonează și instalează dependențele</h5>
                <CodeBlock 
                  code={`git clone https://github.com/your-org/rag-chat.git
cd rag-chat
npm install`}
                  language="bash"
                  title="terminal"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <div className="flex-1">
                <h5 className="font-semibold">Configurează .env</h5>
                <CodeBlock 
                  code={`cp .env.example .env
# Editează .env cu valorile tale`}
                  language="bash"
                  title="terminal"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
              <div className="flex-1">
                <h5 className="font-semibold">Pornește aplicația</h5>
                <CodeBlock 
                  code={`npm run dev
# Deschide http://localhost:5173`}
                  language="bash"
                  title="terminal"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ============================================
// N8N SECTION
// ============================================
function N8nSection() {
  return (
    <>
      <Alert>
        <Workflow className="h-4 w-4" />
        <AlertTitle>n8n ca Backend API</AlertTitle>
        <AlertDescription>
          Toate apelurile API sunt POST către webhook-uri n8n. Fiecare endpoint corespunde unui workflow separat.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Structura Request-ului Standard
          </CardTitle>
          <CardDescription>
            Toate request-urile includ aceste câmpuri obligatorii
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CodeWithConfig
            code={`// STRUCTURA STANDARD PENTRU TOATE REQUEST-URILE
// Fișier: src/api/n8nClient.ts

interface N8NRequestPayload {
  // Identificator unic pentru request (generat automat)
  clientRequestId: string;  // UUID v4
  
  // Informații despre utilizatorul care face request-ul
  actor: {
    userId: string;      // ID-ul userului din IndexedDB
    username: string;    // Username-ul afișat
    role: string;        // "user" | "user_plus" | "admin"
  };
  
  // ID-ul workspace-ului curent
  workspaceId?: string;
  
  // Token-ul Keycloak pentru autentificare admin
  keycloakToken?: string;
  
  // Date specifice endpoint-ului
  [key: string]: unknown;
}`}
            language="typescript"
            title="src/api/n8nClient.ts"
            configs={[]}
          />

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Important pentru n8n</AlertTitle>
            <AlertDescription>
              Toate request-urile sunt <strong>POST</strong>. În n8n, folosește nodul "Webhook" cu metoda POST.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Chat Streaming - Most Important */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            🔥 Chat Streaming (SSE) - Cel Mai Important Endpoint
          </CardTitle>
          <CardDescription>
            Endpoint-ul principal pentru conversații RAG cu streaming
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <CodeWithConfig
            code={`// REQUEST
POST https://your-n8n-url.com/webhook/chat/stream
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <keycloak_token>

{
  "clientRequestId": "550e8400-e29b-41d4-a716-446655440000",
  "actor": {
    "userId": "user-123",
    "username": "ion.popescu",
    "role": "user_plus"
  },
  "workspaceId": "ws-1",
  "message": "Care sunt pașii pentru a solicita concediu?",
  "conversationId": "conv-uuid",
  "usePdfs": true,
  "useMemory": false,
  "docIds": ["doc-1", "doc-2"]
}`}
            language="json"
            title="POST /chat/stream"
            configs={[
              { placeholder: 'https://your-n8n-url.com/webhook', description: 'URL-ul webhook-ului tău n8n' },
              { placeholder: 'user-123', description: 'ID-ul utilizatorului curent' },
              { placeholder: 'ws-1', description: 'ID-ul workspace-ului activ' },
            ]}
          />

          <h4 className="font-semibold">Format Evenimente SSE (răspuns)</h4>
          <CodeBlock
            code={`// EVENIMENTE SSE TRIMISE DE SERVER

// 1. STATUS - Indică etapa curentă
data: {"type": "status", "status": "searching_pdfs"}
data: {"type": "status", "status": "generating"}

// 2. CITATIONS - Surse găsite
data: {"type": "citations", "citations": [
  {
    "docId": "doc-1",
    "filename": "Manual_HR.pdf",
    "page": 42,
    "text": "Pentru a solicita concediu...",
    "score": 0.89
  }
]}

// 3. TOKEN - Fragment de text generat (streaming)
data: {"type": "token", "content": "Pentru"}
data: {"type": "token", "content": " a"}
data: {"type": "token", "content": " solicita"}

// 4. REASONING - Pași de raționament (opțional)
data: {"type": "reasoning", "content": "Analizez documentele..."}

// 5. ERROR - Eroare
data: {"type": "error", "message": "Rate limit exceeded"}

// 6. DONE - Finalizare
data: {"type": "done"}
// SAU
data: [DONE]`}
            language="javascript"
            title="SSE Response Events"
          />

          <Separator />

          <h4 className="font-semibold">Exemplu Workflow n8n pentru Chat</h4>
          <CodeWithConfig
            code={`// PSEUDO-COD WORKFLOW N8N - /chat/stream
// ============================================

// Node 1: Webhook Trigger
{
  "httpMethod": "POST",
  "path": "chat/stream",
  "responseMode": "responseNode"
}

// Node 2: Parse Request (Code Node)
const { message, workspaceId, docIds, usePdfs } = $input.first().json;

// Node 3: Get Workspace Settings
const settings = await getWorkspaceSettings(workspaceId);

// Node 4: Generate Query Embedding
const embedding = await fetch("YOUR_EMBEDDING_ENDPOINT", {
  method: 'POST',
  body: JSON.stringify({ text: message })
});

// Node 5: Search Vector Database
const results = await fetch("YOUR_VECTOR_DB_ENDPOINT", {
  method: 'POST',
  body: JSON.stringify({
    vector: embedding,
    filter: { workspaceId },
    limit: settings.ragSettings.chunksCount
  })
});

// Node 6: Call LLM with Streaming
const response = await fetch("YOUR_LLM_ENDPOINT", {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_LLM_API_KEY' },
  body: JSON.stringify({
    messages: [
      { role: 'system', content: settings.systemPrompt },
      { role: 'user', content: message + context }
    ],
    stream: true
  })
});

// Node 7: Stream tokens to client
for await (const chunk of response) {
  await sendSSE({ type: 'token', content: chunk });
}

await sendSSE({ type: 'done' });`}
            language="javascript"
            title="n8n-chat-workflow.js"
            configs={[
              { placeholder: 'YOUR_EMBEDDING_ENDPOINT', description: 'Endpoint pentru generare embeddings (ex: OpenAI, Cohere)' },
              { placeholder: 'YOUR_VECTOR_DB_ENDPOINT', description: 'Endpoint Vector DB (ex: Qdrant, Pinecone, Weaviate)' },
              { placeholder: 'YOUR_LLM_ENDPOINT', description: 'Endpoint LLM (ex: OpenAI, Anthropic, local)' },
              { placeholder: 'YOUR_LLM_API_KEY', description: 'API Key pentru LLM' },
            ]}
          />
        </CardContent>
      </Card>

      {/* Other Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Alte Endpoint-uri API
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Files */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500">FILES</Badge>
              <h4 className="font-semibold">Gestionare Fișiere PDF</h4>
            </div>
            
            <CodeWithConfig
              code={`// POST /files/upload - Upload fișier PDF
// Content-Type: multipart/form-data

FormData:
  - file: [PDF File Binary]
  - workspaceId: "ws-1"
  - actor: '{"userId":"user-123","username":"ion","role":"user_plus"}'
  - clientRequestId: "uuid"

// RESPONSE
{
  "success": true,
  "data": {
    "docId": "doc-new-uuid",
    "filename": "Document.pdf",
    "size": 1024000,
    "status": "uploaded"
  }
}`}
              language="javascript"
              title="POST /files/upload"
              configs={[
                { placeholder: 'ws-1', description: 'ID-ul workspace-ului în care încarci' },
              ]}
            />

            <CodeWithConfig
              code={`// POST /files/index - Indexare documente pentru RAG
{
  "clientRequestId": "uuid",
  "actor": { "userId": "user-123", "username": "ion", "role": "user_plus" },
  "workspaceId": "ws-1",
  "docIds": ["doc-1", "doc-2"]
}

// În n8n trebuie să:
// 1. Extragi textul din PDF (PyMuPDF, pdf.js)
// 2. Împarți în chunks (chunk_size: 512, overlap: 50)
// 3. Generezi embeddings
// 4. Salvezi în Vector Database`}
              language="javascript"
              title="POST /files/index"
              configs={[]}
            />
          </div>

          {/* Users */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500">USERS</Badge>
              <h4 className="font-semibold">Gestionare Utilizatori</h4>
            </div>
            
            <CodeWithConfig
              code={`// POST /users/create - Creare utilizator nou
{
  "clientRequestId": "uuid",
  "actor": { "userId": "admin-1", "username": "admin", "role": "admin" },
  "keycloakToken": "eyJhbGci...",
  "username": "maria.ionescu",
  "email": "maria@compania.ro",
  "role": "user_plus",
  "workspaceIds": ["ws-1", "ws-2"]
}

// RESPONSE
{
  "success": true,
  "data": {
    "id": "user-new-uuid",
    "username": "maria.ionescu",
    "role": "user_plus"
  }
}`}
              language="json"
              title="POST /users/create"
              configs={[
                { placeholder: 'maria.ionescu', description: 'Username-ul noului utilizator' },
                { placeholder: 'maria@compania.ro', description: 'Email-ul utilizatorului' },
                { placeholder: 'user_plus', description: 'Rol: user, user_plus, sau admin' },
              ]}
            />
          </div>

          {/* Settings */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-500">SETTINGS</Badge>
              <h4 className="font-semibold">Setări Workspace</h4>
            </div>
            
            <CodeWithConfig
              code={`// POST /settings/save - Salvează setări workspace
{
  "clientRequestId": "uuid",
  "actor": { ... },
  "workspaceId": "ws-1",
  "settings": {
    "systemPrompt": "Ești un asistent AI pentru departamentul HR...",
    "modelSettings": {
      "llmEndpoints": [{
        "id": "llm-1",
        "name": "GPT-4",
        "endpoint": "https://api.openai.com/v1/chat/completions",
        "apiKey": "sk-...",
        "maxTokens": 2048
      }],
      "vectorDbEndpoints": [{
        "id": "vdb-1",
        "name": "Qdrant",
        "endpoint": "https://your-qdrant.com:6333",
        "apiKey": "..."
      }],
      "rerankerEnabled": true
    },
    "ragSettings": {
      "chunksCount": 5,
      "chunkSize": 512,
      "chunkOverlap": 50
    }
  }
}`}
              language="json"
              title="POST /settings/save"
              configs={[
                { placeholder: 'Ești un asistent AI...', description: 'System prompt personalizat' },
                { placeholder: 'https://api.openai.com/v1/chat/completions', description: 'Endpoint-ul LLM-ului tău' },
                { placeholder: 'sk-...', description: 'API Key pentru LLM' },
                { placeholder: 'https://your-qdrant.com:6333', description: 'Endpoint Vector Database' },
              ]}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ============================================
// KEYCLOAK SECTION
// ============================================
function KeycloakSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configurare Keycloak
          </CardTitle>
          <CardDescription>
            Ghid pas cu pas pentru configurarea Keycloak
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Ce este Keycloak?</AlertTitle>
            <AlertDescription>
              Keycloak este un server de identity management open-source. 
              În această aplicație, gestionează autentificarea admin și rolurile utilizatorilor.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <div className="flex-1">
                <h5 className="font-semibold">Creează un Realm</h5>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  În Keycloak Admin Console, creează un realm nou
                </p>
                <CodeBlock
                  code={`Realm Name: rag-chat
# sau numele dorit pentru aplicația ta`}
                  language="text"
                  title="Keycloak Admin Console → Create Realm"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <div className="flex-1">
                <h5 className="font-semibold">Creează un Client</h5>
                <CodeWithConfig
                  code={`Client ID: rag-chat-app
Client Type: OpenID Connect
Client authentication: OFF (public client)
Standard flow: ON
Direct access grants: ON

Valid Redirect URIs:
  - http://localhost:5173/*
  - https://your-app-domain.com/*

Web Origins:
  - http://localhost:5173
  - https://your-app-domain.com`}
                  language="yaml"
                  title="Clients → Create Client"
                  configs={[
                    { placeholder: 'rag-chat-app', description: 'Client ID - folosit în VITE_KEYCLOAK_CLIENT_ID' },
                    { placeholder: 'https://your-app-domain.com', description: 'Domeniul aplicației tale în producție' },
                  ]}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
              <div className="flex-1">
                <h5 className="font-semibold">Creează Roluri</h5>
                <CodeBlock
                  code={`Realm Roles → Create Role:

- user        → Acces doar la chat
- user_plus   → Chat + upload fișiere + setări prompt  
- admin       → Acces complet la toate funcționalitățile`}
                  language="text"
                  title="Realm Settings → Roles"
                />
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="border rounded p-2 text-center">
                    <Badge variant="outline">user</Badge>
                    <p className="text-xs mt-1">Chat only</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <Badge variant="secondary">user_plus</Badge>
                    <p className="text-xs mt-1">+ Files, Prompt</p>
                  </div>
                  <div className="border rounded p-2 text-center">
                    <Badge>admin</Badge>
                    <p className="text-xs mt-1">Full access</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
              <div className="flex-1">
                <h5 className="font-semibold">Creează Utilizatori</h5>
                <CodeWithConfig
                  code={`Users → Add User:

Username: admin
Email: admin@your-company.com
Email Verified: ON

Credentials → Set Password:
  Password: [your-secure-password]
  Temporary: OFF

Role Mapping → Assign Roles:
  - admin`}
                  language="yaml"
                  title="Users → Create User"
                  configs={[
                    { placeholder: 'admin@your-company.com', description: 'Email-ul adminului' },
                    { placeholder: '[your-secure-password]', description: 'Parola sigură pentru admin' },
                  ]}
                />
              </div>
            </div>
          </div>

          <Separator />

          <h4 className="font-semibold">Cod Relevant din Aplicație</h4>
          <CodeBlock
            code={`// src/auth/keycloak.ts - Funcții Principale

import Keycloak from 'keycloak-js';

// Configurare din variabile de mediu
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

// Inițializare
export async function initKeycloak(): Promise<boolean> {
  const keycloak = new Keycloak({
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID,
  });
  
  const authenticated = await keycloak.init({
    onLoad: 'check-sso',
    pkceMethod: 'S256',
  });
  
  return authenticated;
}

// Verificare rol
export function hasKeycloakRole(role: string): boolean {
  return keycloak.hasRealmRole(role);
}

// Obține token valid
export async function ensureTokenValid(): Promise<string | null> {
  await keycloak.updateToken(30);
  return keycloak.token;
}`}
            language="typescript"
            title="src/auth/keycloak.ts"
          />

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Securitate</AlertTitle>
            <AlertDescription>
              <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
                <li>Nu expune client secret în frontend (folosește public client)</li>
                <li>Configurează CORS corect în Keycloak (Web Origins)</li>
                <li>Folosește HTTPS în producție</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </>
  );
}

// ============================================
// DATABASE SECTION
// ============================================
function DatabaseSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            IndexedDB cu Dexie.js
          </CardTitle>
          <CardDescription>
            Baza de date locală pentru cache și persistență offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>De ce IndexedDB?</AlertTitle>
            <AlertDescription>
              IndexedDB oferă persistență locală în browser pentru cache, funcționare offline și performanță.
              Dexie.js simplifică API-ul IndexedDB.
            </AlertDescription>
          </Alert>

          <CodeBlock
            code={`// src/db/dexie.ts - Definirea Bazei de Date

import Dexie, { Table } from 'dexie';

export class RAGChatDatabase extends Dexie {
  users!: Table<DBUser, string>;
  workspaces!: Table<DBWorkspace, string>;
  memberships!: Table<DBMembership, string>;
  files!: Table<DBFile, string>;
  fileIndexState!: Table<DBFileIndexState, string>;
  workspaceSettings!: Table<DBWorkspaceSettings, string>;
  promptVersions!: Table<DBPromptVersion, string>;
  appCache!: Table<DBAppCache, string>;

  constructor() {
    super('RAGChatDB');
    
    this.version(1).stores({
      users: 'id, &username, role, isDisabled',
      workspaces: 'id, name',
      memberships: 'id, [userId+workspaceId], userId, workspaceId',
      files: 'docId, workspaceId, [workspaceId+filename], sha256',
      fileIndexState: 'docId, workspaceId, [workspaceId+status]',
      workspaceSettings: 'workspaceId, updatedAt',
      promptVersions: 'id, workspaceId, [workspaceId+createdAt]',
      appCache: 'key, updatedAt'
    });
  }
}

export const db = new RAGChatDatabase();`}
            language="typescript"
            title="src/db/dexie.ts"
          />

          <Separator />

          <h4 className="font-semibold">Structura Tabelelor</h4>
          <div className="grid gap-4">
            {databaseTables.map((table) => (
              <div key={table.name} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4 text-primary" />
                  <span className="font-bold">{table.name}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{table.description}</p>
                <CodeBlock code={table.schema} language="typescript" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// ============================================
// API REFERENCE SECTION
// ============================================
function ApiReferenceSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Referință API Completă
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Endpoint</th>
                  <th className="text-left p-2">Descriere</th>
                  <th className="text-left p-2">Rol Minim</th>
                </tr>
              </thead>
              <tbody>
                {apiEndpoints.map((endpoint) => (
                  <tr key={endpoint.path} className="border-b">
                    <td className="p-2 font-mono text-xs">{endpoint.path}</td>
                    <td className="p-2">{endpoint.description}</td>
                    <td className="p-2">
                      <Badge variant="outline" className="text-xs">{endpoint.role}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Separator />

          <h4 className="font-semibold">Tipuri de Date</h4>
          <CodeBlock
            code={`// src/types/database.ts

type UserRole = 'user' | 'user_plus' | 'admin';
type IndexStatus = 'not_indexed' | 'indexing' | 'ready' | 'failed';
type ReasoningMode = 'off' | 'low' | 'medium' | 'high';

interface DBUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  isDisabled: boolean;
  createdAt: number;  // epoch ms
  updatedAt: number;
}

interface DBWorkspaceSettings {
  workspaceId: string;
  systemPrompt: string;
  modelSettings: ModelSettings;
  ragSettings: RAGSettings;
  updatedAt: number;
}

interface RAGSettings {
  chatHistoryCount: number;  // Mesaje anterioare
  chunksCount: number;       // Chunks din vector DB
  chunkSize: number;         // Dimensiune chunks
  chunkOverlap: number;      // Overlap
}`}
            language="typescript"
            title="src/types/database.ts"
          />
        </CardContent>
      </Card>
    </>
  );
}

// ============================================
// STORES SECTION
// ============================================
function StoresSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Zustand Stores
          </CardTitle>
          <CardDescription>
            State management cu Zustand + persist middleware
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {stores.map((store) => (
            <div key={store.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold">{store.name}</h5>
                <Badge variant={store.persisted ? 'default' : 'secondary'}>
                  {store.persisted ? 'Persisted' : 'Memory Only'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{store.description}</p>
              <CodeBlock code={store.code} language="typescript" title={store.file} />
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}

// ============================================
// COMPONENTS SECTION
// ============================================
function ComponentsSection() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Componente Principale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {components.map((component) => (
                <div key={component.name} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <span className="font-bold">{component.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{component.path}</code>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Structura Proiectului
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CodeBlock
            code={`src/
├── api/
│   ├── client.ts          # HTTP client generic
│   ├── n8nClient.ts       # Client n8n + streaming SSE
│   └── index.ts
├── auth/
│   └── keycloak.ts        # Integrare Keycloak
├── components/
│   ├── auth/              # ProtectedRoute, PermissionGate
│   ├── chat/              # ChatComposer, ChatMessage
│   ├── layout/            # MainLayout, ReasoningPanel
│   ├── workspace/         # WorkspaceSwitcher
│   └── ui/                # shadcn components
├── db/
│   ├── dexie.ts           # Schema IndexedDB
│   └── repo.ts            # Funcții CRUD
├── hooks/
│   ├── useAuth.ts
│   ├── useAppInit.ts
│   └── useTranslation.ts
├── pages/
│   ├── ChatPage.tsx       # Chat principal
│   ├── FilesPage.tsx      # Upload PDFs
│   ├── AdminDashboard.tsx
│   └── ...
├── store/
│   ├── appStore.ts        # Chat, UI, Projects
│   ├── authStore.ts       # Auth state
│   └── workspaceStore.ts
└── types/
    ├── api.ts
    ├── auth.ts
    └── database.ts`}
            language="text"
            title="Project Structure"
          />
        </CardContent>
      </Card>
    </>
  );
}

