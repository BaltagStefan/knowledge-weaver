import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  Copy,
  Zap,
  Code,
  FileJson,
  ArrowRight,
  Info,
  BookOpen
} from 'lucide-react';

export default function DocsPage() {
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

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2">
            <TabsTrigger value="overview">Prezentare</TabsTrigger>
            <TabsTrigger value="setup">Setup & Config</TabsTrigger>
            <TabsTrigger value="n8n">n8n Workflows</TabsTrigger>
            <TabsTrigger value="keycloak">Keycloak</TabsTrigger>
            <TabsTrigger value="database">Bază de Date</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="stores">State Management</TabsTrigger>
            <TabsTrigger value="components">Componente</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
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
                <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{`
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FLOW DE DATE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. USER INPUT                                                               │
│     └─> ChatComposer.tsx (input mesaj)                                       │
│           └─> useChatStore.sendMessage()                                     │
│                 └─> n8nClient.streamChat()                                   │
│                                                                              │
│  2. API CALL                                                                 │
│     └─> POST {BASE_URL}/chat/stream                                          │
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
└─────────────────────────────────────────────────────────────────────────────┘
                  `}</pre>
                </div>
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
          </TabsContent>

          {/* Setup & Config Tab */}
          <TabsContent value="setup" className="space-y-6">
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
                  Creează un fișier <code>.env</code> în rădăcina proiectului
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`# ============================================
# CONFIGURARE COMPLETĂ .env
# ============================================

# n8n Webhook Base URL
# URL-ul de bază pentru toate endpoint-urile n8n
# Exemplu local: http://localhost:5678/webhook
# Exemplu producție: https://n8n.compania.ro/webhook
VITE_N8N_WEBHOOK_BASE_URL=https://your-n8n-instance.com/webhook

# Keycloak Configuration
# URL-ul instanței Keycloak (fără /auth la final pentru versiuni noi)
VITE_KEYCLOAK_URL=https://keycloak.compania.ro
# Numele realm-ului configurat în Keycloak
VITE_KEYCLOAK_REALM=rag-chat
# Client ID configurat în Keycloak (trebuie să fie public)
VITE_KEYCLOAK_CLIENT_ID=rag-chat-app

# ============================================
# OPȚIONAL - Defaults
# ============================================
# Limba implicită (ro sau en)
VITE_DEFAULT_LANGUAGE=ro
# Tema implicită (light, dark, system)
VITE_DEFAULT_THEME=system`}</pre>
                </div>

                <Separator />

                <h4 className="font-semibold">Explicații Detaliate</h4>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Workflow className="h-4 w-4 text-primary" />
                      <span className="font-semibold">VITE_N8N_WEBHOOK_BASE_URL</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      URL-ul de bază pentru toate apelurile către n8n. Frontend-ul va adăuga 
                      endpoint-urile la acest URL (ex: <code>/chat/stream</code>, <code>/files/list</code>).
                    </p>
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      <p className="text-green-600">✓ https://n8n.compania.ro/webhook</p>
                      <p className="text-green-600">✓ http://localhost:5678/webhook</p>
                      <p className="text-red-600">✗ https://n8n.compania.ro/webhook/ (fără slash final!)</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-semibold">VITE_KEYCLOAK_URL</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      URL-ul instanței Keycloak. Pentru versiuni Keycloak 17+ nu mai este nevoie de <code>/auth</code>.
                    </p>
                    <div className="bg-muted p-2 rounded text-xs font-mono">
                      <p className="text-green-600">Keycloak 17+: https://keycloak.compania.ro</p>
                      <p className="text-yellow-600">Keycloak &lt;17: https://keycloak.compania.ro/auth</p>
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
                      <div className="bg-muted p-3 rounded mt-2 font-mono text-sm">
                        <p>git clone [repository-url]</p>
                        <p>cd rag-chat</p>
                        <p>npm install</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Configurează .env</h5>
                      <div className="bg-muted p-3 rounded mt-2 font-mono text-sm">
                        <p>cp .env.example .env</p>
                        <p># Editează .env cu valorile tale</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Configurează Keycloak</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vezi secțiunea "Keycloak" pentru configurare detaliată
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Configurează n8n Workflows</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Vezi secțiunea "n8n Workflows" pentru exemple complete
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Pornește aplicația</h5>
                      <div className="bg-muted p-3 rounded mt-2 font-mono text-sm">
                        <p>npm run dev</p>
                        <p># Deschide http://localhost:5173</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* n8n Workflows Tab - NEW DETAILED SECTION */}
          <TabsContent value="n8n" className="space-y-6">
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
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// STRUCTURA STANDARD PENTRU TOATE REQUEST-URILE
// Fișier: src/api/n8nClient.ts

interface N8NRequestPayload {
  // Identificator unic pentru request (pentru tracking/debugging)
  clientRequestId: string;  // UUID v4, generat automat
  
  // Informații despre utilizatorul care face request-ul
  actor: {
    userId: string;      // ID-ul userului din IndexedDB
    username: string;    // Username-ul afișat
    role: string;        // "user" | "user_plus" | "admin"
  };
  
  // ID-ul workspace-ului curent (opțional pentru unele endpoint-uri)
  workspaceId?: string;
  
  // Token-ul Keycloak pentru autentificare admin (opțional)
  keycloakToken?: string;
  
  // Date specifice endpoint-ului
  [key: string]: unknown;
}

// Exemplu payload real:
{
  "clientRequestId": "550e8400-e29b-41d4-a716-446655440000",
  "actor": {
    "userId": "user-123",
    "username": "ion.popescu",
    "role": "user_plus"
  },
  "workspaceId": "ws-456",
  "keycloakToken": "eyJhbGciOiJSUzI1NiIsInR5cCI...",
  // + date specifice endpoint-ului
}`}</pre>
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important pentru n8n</AlertTitle>
                  <AlertDescription>
                    Toate request-urile sunt <strong>POST</strong>. În n8n, folosește nodul "Webhook" cu metoda POST 
                    și "Respond to Webhook" pentru răspuns.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Endpoints & Exemple Complete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Auth Endpoints */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500">AUTH</Badge>
                    <h4 className="font-semibold">Autentificare</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /auth/me - Obține informații user curent</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/auth/me
Content-Type: application/json

{
  "clientRequestId": "uuid",
  "actor": { "userId": "", "username": "", "role": "user" }
}

// RESPONSE
{
  "success": true,
  "data": {
    "id": "user-123",
    "username": "ion.popescu",
    "email": "ion@compania.ro",
    "role": "user_plus",
    "isDisabled": false,
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  }
}`}</pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /auth/login - Login cu username/password</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/auth/login
Content-Type: application/json

{
  "clientRequestId": "uuid",
  "actor": { "userId": "", "username": "ion.popescu", "role": "user" },
  "username": "ion.popescu",
  "password": "parola123"
}

// RESPONSE (success)
{
  "success": true,
  "data": {
    "user": { "id": "user-123", "username": "ion.popescu", "role": "user" },
    "token": "optional-session-token"
  }
}

// RESPONSE (error)
{
  "success": false,
  "error": "Invalid credentials"
}`}</pre>
                    </div>
                  </div>
                </div>

                {/* Workspaces Endpoints */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">WORKSPACES</Badge>
                    <h4 className="font-semibold">Gestionare Workspace-uri</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /workspaces/list - Lista workspace-urilor</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/workspaces/list
{
  "clientRequestId": "uuid",
  "actor": { "userId": "user-123", "username": "ion", "role": "admin" }
}

// RESPONSE
{
  "success": true,
  "data": [
    {
      "id": "ws-1",
      "name": "Departament IT",
      "description": "Documente IT",
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    },
    {
      "id": "ws-2",
      "name": "HR",
      "description": "Politici și proceduri HR",
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    }
  ]
}`}</pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /workspaces/create - Creare workspace nou</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/workspaces/create
{
  "clientRequestId": "uuid",
  "actor": { "userId": "admin-1", "username": "admin", "role": "admin" },
  "name": "Departament Juridic",
  "description": "Contracte și documente legale"
}

// RESPONSE
{
  "success": true,
  "data": {
    "id": "ws-new-uuid",
    "name": "Departament Juridic",
    "description": "Contracte și documente legale",
    "createdAt": 1704067200000,
    "updatedAt": 1704067200000
  }
}`}</pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /workspaces/assign-user - Atribuie user la workspace</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/workspaces/assign-user
{
  "clientRequestId": "uuid",
  "actor": { "userId": "admin-1", "username": "admin", "role": "admin" },
  "workspaceId": "ws-1",
  "userId": "user-123"
}

// RESPONSE
{
  "success": true
}`}</pre>
                    </div>
                  </div>
                </div>

                {/* Files Endpoints */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500">FILES</Badge>
                    <h4 className="font-semibold">Gestionare Fișiere PDF</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /files/list - Lista fișierelor din workspace</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/files/list
{
  "clientRequestId": "uuid",
  "actor": { "userId": "user-123", "username": "ion", "role": "user_plus" },
  "workspaceId": "ws-1"
}

// RESPONSE
{
  "success": true,
  "data": [
    {
      "docId": "doc-uuid-1",
      "workspaceId": "ws-1",
      "filename": "Manual_Utilizare.pdf",
      "mimeType": "application/pdf",
      "size": 2048576,  // bytes
      "sha256": "abc123...",
      "uploadedAt": 1704067200000,
      "updatedAt": 1704067200000,
      "source": "local",
      "indexState": {
        "docId": "doc-uuid-1",
        "workspaceId": "ws-1",
        "status": "ready",  // "not_indexed" | "indexing" | "ready" | "failed"
        "indexedAt": 1704067200000,
        "indexVersion": "v1"
      }
    }
  ]
}`}</pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /files/upload - Upload fișier PDF</p>
                      <pre className="text-sm">{`// REQUEST (multipart/form-data)
POST ${"{BASE_URL}"}/files/upload
Content-Type: multipart/form-data

FormData:
  - file: [PDF File Binary]
  - workspaceId: "ws-1"
  - actor: '{"userId":"user-123","username":"ion","role":"user_plus"}'
  - clientRequestId: "uuid"
  - keycloakToken: "eyJ..." (opțional)

// RESPONSE
{
  "success": true,
  "data": {
    "docId": "doc-new-uuid",
    "workspaceId": "ws-1",
    "filename": "Document_Nou.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "uploadedAt": 1704067200000,
    "source": "local"
  }
}`}</pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /files/index - Indexare documente pentru RAG</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/files/index
{
  "clientRequestId": "uuid",
  "actor": { "userId": "user-123", "username": "ion", "role": "user_plus" },
  "workspaceId": "ws-1",
  "docIds": ["doc-1", "doc-2"]  // array de documente de indexat
}

// RESPONSE
{
  "success": true,
  "data": {
    "indexed": ["doc-1", "doc-2"],  // documente indexate cu succes
    "failed": []  // documente care au eșuat
  }
}

// Notă: În n8n workflow-ul de indexare trebuie să:
// 1. Extragă textul din PDF (PyMuPDF, pdf.js, etc.)
// 2. Împartă în chunks (dimensiune configurabilă)
// 3. Genereze embeddings (OpenAI, local model, etc.)
// 4. Salveze în Vector Database (Qdrant, Pinecone, etc.)`}</pre>
                    </div>
                  </div>
                </div>

                {/* Users Endpoints */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-500">USERS</Badge>
                    <h4 className="font-semibold">Gestionare Utilizatori</h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /users/list - Lista tuturor utilizatorilor</p>
                      <pre className="text-sm">{`// REQUEST (necesită rol admin)
POST ${"{BASE_URL}"}/users/list
{
  "clientRequestId": "uuid",
  "actor": { "userId": "admin-1", "username": "admin", "role": "admin" },
  "keycloakToken": "eyJhbGci..."
}

// RESPONSE
{
  "success": true,
  "data": [
    {
      "id": "user-1",
      "username": "ion.popescu",
      "email": "ion@compania.ro",
      "role": "user_plus",
      "isDisabled": false,
      "createdAt": 1704067200000,
      "updatedAt": 1704067200000
    }
  ]
}`}</pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /users/create - Creare utilizator nou</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/users/create
{
  "clientRequestId": "uuid",
  "actor": { "userId": "admin-1", "username": "admin", "role": "admin" },
  "username": "maria.ionescu",
  "email": "maria@compania.ro",
  "role": "user",  // "user" | "user_plus"
  "workspaceIds": ["ws-1", "ws-2"]  // workspace-uri inițiale
}

// RESPONSE
{
  "success": true,
  "data": {
    "id": "user-new-uuid",
    "username": "maria.ionescu",
    "email": "maria@compania.ro",
    "role": "user",
    "isDisabled": false,
    "createdAt": 1704067200000
  }
}`}</pre>
                    </div>

                    <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                      <p className="text-xs text-muted-foreground mb-2">POST /users/assign-workspaces - Atribuie workspace-uri la user</p>
                      <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/users/assign-workspaces
{
  "clientRequestId": "uuid",
  "actor": { "userId": "admin-1", "username": "admin", "role": "admin" },
  "userId": "user-123",
  "workspaceIds": ["ws-1", "ws-2", "ws-3"]
}

// RESPONSE
{
  "success": true
}`}</pre>
                    </div>
                  </div>
                </div>

                {/* Settings Endpoints */}
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-gray-500">SETTINGS</Badge>
                    <h4 className="font-semibold">Setări Workspace</h4>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <p className="text-xs text-muted-foreground mb-2">POST /settings/get & /settings/save</p>
                    <pre className="text-sm">{`// GET SETTINGS REQUEST
POST ${"{BASE_URL}"}/settings/get
{
  "clientRequestId": "uuid",
  "actor": { ... },
  "workspaceId": "ws-1"
}

// SAVE SETTINGS REQUEST
POST ${"{BASE_URL}"}/settings/save
{
  "clientRequestId": "uuid",
  "actor": { ... },
  "workspaceId": "ws-1",
  "settings": {
    "systemPrompt": "Ești un asistent AI...",
    "modelSettings": {
      "llmEndpoints": [
        {
          "id": "llm-1",
          "name": "GPT-4",
          "endpoint": "https://api.openai.com/v1/chat/completions",
          "apiKey": "sk-...",
          "contextWindow": 8192,
          "maxTokens": 2048
        }
      ],
      "selectedLlmId": "llm-1",
      "vectorDbEndpoints": [...],
      "rerankerEnabled": true,
      "reasoningMode": "medium"
    },
    "ragSettings": {
      "chatHistoryCount": 10,
      "chunksCount": 5,
      "chunkSize": 512,
      "chunkOverlap": 50
    }
  }
}`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chat Streaming - Most Important */}
            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Streaming (SSE) - Cel Mai Important Endpoint
                </CardTitle>
                <CardDescription>
                  Endpoint-ul principal pentru conversații RAG cu streaming
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <p className="text-xs text-muted-foreground mb-2">POST /chat/stream - Chat cu Server-Sent Events</p>
                  <pre className="text-sm">{`// REQUEST
POST ${"{BASE_URL}"}/chat/stream
Content-Type: application/json
Accept: text/event-stream
Authorization: Bearer <keycloak_token>  // opțional

{
  "clientRequestId": "550e8400-e29b-41d4-a716-446655440000",
  "actor": {
    "userId": "user-123",
    "username": "ion.popescu",
    "role": "user_plus"
  },
  "workspaceId": "ws-1",
  
  // MESAJUL UTILIZATORULUI
  "message": "Care sunt pașii pentru a solicita concediu?",
  
  // ID CONVERSAȚIE (opțional, pentru continuare)
  "conversationId": "conv-uuid",
  
  // SURSE DE DATE
  "usePdfs": true,      // Caută în documente PDF
  "useMemory": false,   // Caută în memory entries
  "docIds": ["doc-1", "doc-2"]  // Opțional: doar anumite documente
}`}</pre>
                </div>

                <Separator />

                <h4 className="font-semibold">Format Evenimente SSE</h4>
                <p className="text-sm text-muted-foreground">
                  Răspunsul este un stream de evenimente SSE. Fiecare eveniment are formatul:
                </p>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// FORMATUL SSE
data: {"type": "event_type", ...payload}

// ============================================
// TIPURI DE EVENIMENTE
// ============================================

// 1. STATUS - Indică etapa curentă
data: {"type": "status", "status": "searching_pdfs"}
data: {"type": "status", "status": "searching_memory"}
data: {"type": "status", "status": "generating"}

// 2. CITATIONS - Surse găsite (înainte de generare)
data: {"type": "citations", "citations": [
  {
    "docId": "doc-1",
    "filename": "Manual_HR.pdf",
    "page": 42,
    "text": "Pentru a solicita concediu, angajatul trebuie...",
    "score": 0.89
  },
  {
    "docId": "doc-2",
    "filename": "Regulament.pdf",
    "page": 15,
    "text": "Cererea de concediu se depune cu...",
    "score": 0.76
  }
]}

// 3. TOKEN - Fragment de text generat
data: {"type": "token", "content": "Pentru"}
data: {"type": "token", "content": " a"}
data: {"type": "token", "content": " solicita"}
data: {"type": "token", "content": " concediu"}
// ... continua token cu token

// 4. REASONING - Pași de raționament (opțional)
data: {"type": "reasoning", "content": "Analizez documentele HR..."}
data: {"type": "reasoning", "content": "Am găsit procedura în Manual_HR.pdf..."}

// 5. ERROR - Eroare
data: {"type": "error", "message": "Rate limit exceeded"}

// 6. DONE - Finalizare
data: {"type": "done"}
// SAU
data: [DONE]`}</pre>
                </div>

                <Separator />

                <h4 className="font-semibold">Exemplu n8n Workflow pentru Chat</h4>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// STRUCTURA WORKFLOW N8N PENTRU /chat/stream
// ============================================

[1] Webhook Trigger
    └─ Metoda: POST
    └─ Path: /chat/stream
    └─ Response Mode: "Respond immediately" cu headers SSE
    └─ Headers:
        Content-Type: text/event-stream
        Cache-Control: no-cache
        Connection: keep-alive

[2] Extract Data (Code Node)
    └─ const { message, workspaceId, docIds, usePdfs } = $input.first().json;

[3] Search Vector DB (HTTP Request sau Python)
    └─ Query: message embedding
    └─ Filter: workspaceId, docIds
    └─ Top K: ragSettings.chunksCount

[4] Send Status Event
    └─ Respond to Webhook: data: {"type": "status", "status": "searching_pdfs"}

[5] Send Citations Event
    └─ Respond to Webhook: data: {"type": "citations", "citations": [...]}

[6] Call LLM (cu Streaming)
    └─ System Prompt: din workspaceSettings.systemPrompt
    └─ User Message: message + context din citations
    └─ Stream: true

[7] Pentru fiecare token:
    └─ Respond to Webhook: data: {"type": "token", "content": "..."}

[8] Final
    └─ Respond to Webhook: data: {"type": "done"}
    
// IMPORTANT: n8n trebuie să trimită fiecare event 
// imediat (flush) pentru a avea streaming real-time`}</pre>
                </div>

                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Fallback Non-Streaming</AlertTitle>
                  <AlertDescription>
                    Dacă streaming-ul nu este suportat, endpoint-ul <code>/chat</code> (fără /stream) 
                    returnează răspunsul complet într-un singur JSON.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* n8n Workflow Examples */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Exemplu Complet Workflow n8n
                </CardTitle>
                <CardDescription>
                  Template pentru workflow-ul de chat cu RAG
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// ============================================
// PSEUDO-COD WORKFLOW N8N - CHAT/STREAM
// ============================================

// Node 1: Webhook Trigger
{
  "parameters": {
    "httpMethod": "POST",
    "path": "chat/stream",
    "responseMode": "responseNode",
    "options": {
      "rawBody": true
    }
  }
}

// Node 2: Parse Request (Code Node)
const body = JSON.parse($input.first().json.body);
const { 
  message, 
  workspaceId, 
  actor,
  docIds,
  usePdfs = true,
  useMemory = false 
} = body;

// Validare
if (!message || !workspaceId) {
  return { error: "Missing required fields" };
}

return { message, workspaceId, actor, docIds, usePdfs, useMemory };

// Node 3: Get Workspace Settings (HTTP/DB)
const settings = await getWorkspaceSettings(workspaceId);
const { systemPrompt, ragSettings, modelSettings } = settings;

// Node 4: Generate Query Embedding (HTTP Request)
const embedding = await fetch(modelSettings.embedEndpoint, {
  method: 'POST',
  body: JSON.stringify({ text: message })
});

// Node 5: Search Vector Database
const searchResults = await fetch(modelSettings.vectorDbEndpoint, {
  method: 'POST',
  body: JSON.stringify({
    vector: embedding,
    filter: { 
      workspaceId,
      ...(docIds && { docId: { $in: docIds } })
    },
    limit: ragSettings.chunksCount
  })
});

// Node 6: Format Citations
const citations = searchResults.map(r => ({
  docId: r.metadata.docId,
  filename: r.metadata.filename,
  page: r.metadata.page,
  text: r.content,
  score: r.score
}));

// Node 7: Respond with Citations (Respond to Webhook - Streaming)
// Headers: Content-Type: text/event-stream
await sendSSE({ type: 'status', status: 'generating' });
await sendSSE({ type: 'citations', citations });

// Node 8: Build LLM Prompt
const contextText = citations.map(c => 
  \`[Sursa: \${c.filename}, Pagina \${c.page}]\\n\${c.text}\`
).join('\\n\\n');

const llmMessages = [
  { role: 'system', content: systemPrompt },
  { role: 'user', content: \`Context:\\n\${contextText}\\n\\nÎntrebare: \${message}\` }
];

// Node 9: Stream LLM Response
const llmStream = await fetch(modelSettings.llmEndpoint, {
  method: 'POST',
  headers: { 'Authorization': \`Bearer \${modelSettings.apiKey}\` },
  body: JSON.stringify({
    messages: llmMessages,
    stream: true,
    max_tokens: modelSettings.maxTokens
  })
});

// Node 10: Forward Tokens
for await (const chunk of llmStream) {
  const token = parseStreamChunk(chunk);
  await sendSSE({ type: 'token', content: token });
}

// Node 11: Done
await sendSSE({ type: 'done' });

// ============================================
// HELPER: Send SSE Event
// ============================================
async function sendSSE(event) {
  const data = \`data: \${JSON.stringify(event)}\\n\\n\`;
  // În n8n: Respond to Webhook cu output-ul
  await $respondToWebhook(data);
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Keycloak Tab */}
          <TabsContent value="keycloak" className="space-y-6">
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
                    Keycloak este un server de identity și access management open-source. 
                    În această aplicație, Keycloak gestionează autentificarea admin și rolurile utilizatorilor.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Creează un Realm</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        În Keycloak Admin Console, creează un realm nou (ex: <code>rag-chat</code>)
                      </p>
                      <div className="bg-muted p-3 rounded mt-2 text-sm">
                        <p>1. Login în Keycloak Admin Console</p>
                        <p>2. Click pe dropdown-ul de realm → Add Realm</p>
                        <p>3. Name: <code>rag-chat</code></p>
                        <p>4. Click Create</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Creează un Client</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Clientul reprezintă aplicația frontend
                      </p>
                      <div className="bg-muted p-3 rounded mt-2 text-sm space-y-2">
                        <p><strong>Client ID:</strong> <code>rag-chat-app</code></p>
                        <p><strong>Client Type:</strong> OpenID Connect</p>
                        <p><strong>Client authentication:</strong> OFF (public client)</p>
                        <p><strong>Standard flow:</strong> ON</p>
                        <p><strong>Direct access grants:</strong> ON</p>
                        <p><strong>Valid Redirect URIs:</strong></p>
                        <code className="block ml-4">http://localhost:5173/*</code>
                        <code className="block ml-4">https://your-app-domain.com/*</code>
                        <p><strong>Web Origins:</strong></p>
                        <code className="block ml-4">http://localhost:5173</code>
                        <code className="block ml-4">https://your-app-domain.com</code>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Creează Roluri</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Definește rolurile pentru controlul accesului
                      </p>
                      <div className="bg-muted p-3 rounded mt-2 text-sm">
                        <p>În Realm Settings → Roles → Create Role:</p>
                        <div className="mt-2 space-y-1">
                          <p><Badge variant="outline">user</Badge> - Acces doar la chat</p>
                          <p><Badge variant="secondary">user_plus</Badge> - Chat + upload fișiere + setări prompt</p>
                          <p><Badge>admin</Badge> - Acces complet la toate funcționalitățile</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Creează Utilizatori</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Adaugă utilizatori și asignează-le roluri
                      </p>
                      <div className="bg-muted p-3 rounded mt-2 text-sm">
                        <p>Users → Add User:</p>
                        <div className="mt-2 space-y-1">
                          <p>1. Username: <code>admin</code></p>
                          <p>2. Email: <code>admin@compania.ro</code></p>
                          <p>3. Email Verified: ON</p>
                          <p>4. Credentials → Set Password</p>
                          <p>5. Role Mapping → Assign <code>admin</code> role</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                    <div className="flex-1">
                      <h5 className="font-semibold">Configurare Silent SSO (Opțional)</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Pentru verificare silențioasă a sesiunii
                      </p>
                      <div className="bg-muted p-3 rounded mt-2 text-sm">
                        <p>Creează fișierul <code>public/silent-check-sso.html</code>:</p>
                        <pre className="mt-2 text-xs">{`<!DOCTYPE html>
<html>
<head>
  <script>
    parent.postMessage(location.href, location.origin);
  </script>
</head>
<body></body>
</html>`}</pre>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <h4 className="font-semibold">Cod Relevant din Aplicație</h4>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// src/auth/keycloak.ts - Funcții Principale
// ============================================

import Keycloak from 'keycloak-js';

// Configurare din variabile de mediu
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;

// Inițializare Keycloak
export async function initKeycloak(): Promise<boolean> {
  const keycloak = new Keycloak({
    url: KEYCLOAK_URL,
    realm: KEYCLOAK_REALM,
    clientId: KEYCLOAK_CLIENT_ID,
  });
  
  const authenticated = await keycloak.init({
    onLoad: 'check-sso',  // Verifică sesiunea fără redirect
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256',   // Securitate îmbunătățită
    checkLoginIframe: false,
  });
  
  if (authenticated) {
    // Token salvat în IndexedDB pentru persistență
    await setKeycloakToken(keycloak.token);
    
    // Auto-refresh la expirare
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30);
    };
  }
  
  return authenticated;
}

// Login - redirectează la Keycloak
export async function keycloakLogin(): Promise<void> {
  await keycloak.login({
    redirectUri: window.location.origin + '/admin',
  });
}

// Verificare rol
export function hasKeycloakRole(role: string): boolean {
  // Verifică în realm roles și client roles
  return keycloak.hasRealmRole(role) || 
         keycloak.hasResourceRole(role, KEYCLOAK_CLIENT_ID);
}

// Obține token valid (cu refresh dacă e necesar)
export async function ensureTokenValid(): Promise<string | null> {
  if (!keycloak.authenticated) return null;
  await keycloak.updateToken(30);  // Refresh dacă expiră în 30s
  return keycloak.token;
}`}</pre>
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Securitate</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                      <li>Nu expune niciodată client secret în frontend (folosește public client)</li>
                      <li>Configurează CORS corect în Keycloak (Web Origins)</li>
                      <li>Folosește HTTPS în producție</li>
                      <li>Setează lifetime-uri scurte pentru token-uri</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Sistem de Permisiuni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// src/types/auth.ts - Definirea Permisiunilor
// ============================================

// Roluri disponibile
type UserRole = 'user' | 'user_plus' | 'admin';

// Permisiuni granulare
type Permission =
  | 'chat:read' | 'chat:write'
  | 'files:read' | 'files:upload' | 'files:delete'
  | 'settings:read' | 'settings:write'
  | 'users:read' | 'users:manage'
  | 'admin:access';

// Mapare rol -> permisiuni
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    'chat:read', 
    'chat:write'
  ],
  user_plus: [
    'chat:read', 'chat:write',
    'files:read', 'files:upload', 'files:delete',
    'settings:read'
  ],
  admin: [
    // Toate permisiunile
    'chat:read', 'chat:write',
    'files:read', 'files:upload', 'files:delete',
    'settings:read', 'settings:write',
    'users:read', 'users:manage',
    'admin:access'
  ]
};

// src/components/auth/PermissionGate.tsx - Utilizare
// ============================================

// Afișează conținut doar dacă userul are permisiunea
<PermissionGate permission="files:upload">
  <Button>Upload PDF</Button>
</PermissionGate>

// src/components/auth/ProtectedRoute.tsx - Rute Protejate
// ============================================

// Necesită autentificare Keycloak și rol admin
<Route path="/admin/*" element={
  <ProtectedRoute requireAdmin>
    <AdminDashboard />
  </ProtectedRoute>
} />

// Necesită cel puțin rol user_plus
<Route path="/w/:id/files" element={
  <ProtectedRoute requireUserPlus>
    <FilesPage />
  </ProtectedRoute>
} />`}</pre>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <Badge variant="outline" className="mb-2">user</Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ Chat read/write</li>
                      <li>✗ File upload</li>
                      <li>✗ Settings</li>
                      <li>✗ Admin</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge variant="secondary" className="mb-2">user_plus</Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ Chat read/write</li>
                      <li>✓ File upload/delete</li>
                      <li>✓ Settings read</li>
                      <li>✗ Admin</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge className="mb-2">admin</Badge>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>✓ Toate permisiunile</li>
                      <li>✓ Gestionare users</li>
                      <li>✓ Gestionare workspaces</li>
                      <li>✓ Setări complete</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-6">
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
                    IndexedDB este o bază de date NoSQL în browser. Oferă persistență locală 
                    pentru cache, funcționare offline și performanță îmbunătățită. Dexie.js 
                    este un wrapper care simplifică API-ul IndexedDB.
                  </AlertDescription>
                </Alert>

                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// src/db/dexie.ts - Definirea Bazei de Date
// ============================================

import Dexie, { Table } from 'dexie';

export class RAGChatDatabase extends Dexie {
  // Tabele definite
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
    
    // Schema versiunea 1
    this.version(1).stores({
      // Format: 'primaryKey, &uniqueIndex, normalIndex, [compoundIndex]'
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

// Instanță singleton
export const db = new RAGChatDatabase();`}</pre>
                </div>

                <Separator />

                <h4 className="font-semibold">Structura Tabelelor</h4>
                <div className="grid gap-4">
                  {databaseTables.map((table) => (
                    <div key={table.name} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <HardDrive className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{table.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{table.description}</p>
                      <div className="bg-muted p-2 rounded text-xs font-mono mb-2">
                        Indecși: {table.indexes}
                      </div>
                      <div className="bg-muted p-3 rounded text-xs overflow-x-auto">
                        <pre>{table.schema}</pre>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                <h4 className="font-semibold">Repository Pattern</h4>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// src/db/repo.ts - Funcții CRUD
// ============================================

import { db } from './dexie';

// ============================================
// USER OPERATIONS
// ============================================

// Obține userul curent din cache
export async function getCurrentUser(): Promise<DBUser | null> {
  const cache = await db.appCache.get('currentUserId');
  if (!cache?.value) return null;
  return db.users.get(cache.value as string);
}

// Setează userul curent
export async function setCurrentUser(userId: string): Promise<void> {
  await db.appCache.put({
    key: 'currentUserId',
    value: userId,
    updatedAt: Date.now()
  });
}

// Creează un user nou
export async function createUser(
  username: string, 
  role: UserRole
): Promise<DBUser> {
  const user: DBUser = {
    id: crypto.randomUUID(),
    username,
    role,
    isDisabled: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await db.users.add(user);
  return user;
}

// ============================================
// WORKSPACE OPERATIONS
// ============================================

export async function createWorkspace(name: string): Promise<DBWorkspace> {
  const workspace: DBWorkspace = {
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await db.workspaces.add(workspace);
  return workspace;
}

export async function getUserWorkspaces(userId: string): Promise<DBWorkspace[]> {
  const memberships = await db.memberships
    .where('userId')
    .equals(userId)
    .toArray();
  
  const workspaceIds = memberships.map(m => m.workspaceId);
  return db.workspaces.where('id').anyOf(workspaceIds).toArray();
}

// ============================================
// FILES OPERATIONS
// ============================================

export async function listFiles(workspaceId: string): Promise<DBFile[]> {
  return db.files.where('workspaceId').equals(workspaceId).toArray();
}

export async function getFileWithIndexState(docId: string) {
  const [file, indexState] = await Promise.all([
    db.files.get(docId),
    db.fileIndexState.get(docId)
  ]);
  return { ...file, indexState };
}

// ============================================
// SETTINGS OPERATIONS
// ============================================

export async function getWorkspaceSettings(
  workspaceId: string
): Promise<DBWorkspaceSettings | null> {
  return db.workspaceSettings.get(workspaceId) || null;
}

export async function saveWorkspaceSettings(
  settings: DBWorkspaceSettings
): Promise<void> {
  await db.workspaceSettings.put({
    ...settings,
    updatedAt: Date.now()
  });
}

// ============================================
// TOKEN OPERATIONS
// ============================================

export async function getKeycloakToken(): Promise<string | null> {
  const cache = await db.appCache.get('keycloakToken');
  return (cache?.value as string) || null;
}

export async function setKeycloakToken(token: string): Promise<void> {
  await db.appCache.put({
    key: 'keycloakToken',
    value: token,
    updatedAt: Date.now()
  });
}

export async function clearKeycloakToken(): Promise<void> {
  await db.appCache.delete('keycloakToken');
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Reference Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Referință API Completă
                </CardTitle>
                <CardDescription>
                  Toate endpoint-urile și tipurile de date
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Endpoint</th>
                        <th className="text-left p-2">Descriere</th>
                        <th className="text-left p-2">Auth</th>
                        <th className="text-left p-2">Rol Minim</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiEndpoints.map((endpoint) => (
                        <tr key={endpoint.path} className="border-b">
                          <td className="p-2 font-mono text-xs">{endpoint.path}</td>
                          <td className="p-2">{endpoint.description}</td>
                          <td className="p-2">
                            {endpoint.auth ? (
                              <Badge variant="default" className="text-xs">Required</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">Optional</Badge>
                            )}
                          </td>
                          <td className="p-2">
                            <Badge variant="outline" className="text-xs">{endpoint.role}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Tipuri de Date (TypeScript)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// src/types/database.ts - Tipuri Principale
// ============================================

// Roluri
type UserRole = 'user' | 'user_plus' | 'admin';
type WorkspaceRole = 'member' | 'manager';
type IndexStatus = 'not_indexed' | 'indexing' | 'ready' | 'failed';
type ReasoningMode = 'off' | 'low' | 'medium' | 'high';

// User
interface DBUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  isDisabled: boolean;
  createdAt: number;  // epoch ms
  updatedAt: number;
}

// Workspace
interface DBWorkspace {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

// File
interface DBFile {
  docId: string;          // primary key
  workspaceId: string;
  filename: string;
  mimeType: 'application/pdf';
  size: number;           // bytes
  sha256?: string;        // hash pentru deduplicare
  uploadedAt: number;
  source: 'local' | 'remote';
}

// File Index State
interface DBFileIndexState {
  docId: string;
  workspaceId: string;
  status: IndexStatus;
  indexedAt?: number;
  indexVersion?: string;
  lastError?: string;
}

// Workspace Settings
interface DBWorkspaceSettings {
  workspaceId: string;
  systemPrompt: string;
  modelSettings: ModelSettings;
  ragSettings: RAGSettings;
  updatedAt: number;
}

// Model Settings
interface ModelSettings {
  llmEndpoints: EndpointConfig[];
  selectedLlmId?: string;
  vectorDbEndpoints: EndpointConfig[];
  selectedVectorDbId?: string;
  rerankerEnabled: boolean;
  rerankerEndpoints: EndpointConfig[];
  reasoningMode: ReasoningMode;
  reasoningBudget?: number;
}

// RAG Settings
interface RAGSettings {
  chatHistoryCount: number;  // Câte mesaje anterioare să includă
  chunksCount: number;       // Câte chunks să returneze din vector DB
  chunkSize: number;         // Dimensiunea chunks la indexare
  chunkOverlap: number;      // Overlap între chunks
}

// Endpoint Config (LLM, VectorDB, Reranker)
interface EndpointConfig {
  id: string;
  name: string;
  endpoint: string;
  apiKey?: string;
  contextWindow?: number;
  temperature?: number;
  maxTokens?: number;
}`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stores Tab */}
          <TabsContent value="stores" className="space-y-6">
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
                      <h5 className="font-semibold">{store.name}</h5>
                      <Badge variant={store.persisted ? 'default' : 'secondary'}>
                        {store.persisted ? 'Persisted' : 'Memory Only'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{store.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">{store.file}</code>
                    <div className="mt-3 bg-muted p-3 rounded overflow-x-auto">
                      <pre className="text-xs">{store.code}</pre>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-6">
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
                          <span className="font-semibold">{component.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{component.description}</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{component.path}</code>
                        {component.props && (
                          <div className="mt-3 bg-muted p-3 rounded overflow-x-auto">
                            <p className="text-xs font-semibold mb-1">Props:</p>
                            <pre className="text-xs">{component.props}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Pagini și Rute
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {routes.map((route) => (
                    <div key={route.path} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <code className="text-sm">{route.path}</code>
                        <p className="text-xs text-muted-foreground mt-1">{route.description}</p>
                      </div>
                      <Badge variant={
                        route.access === 'admin' ? 'destructive' : 
                        route.access === 'user_plus' ? 'default' : 'secondary'
                      }>
                        {route.access}
                      </Badge>
                    </div>
                  ))}
                </div>
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
                <ScrollArea className="h-[400px]">
                  <FileStructure />
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================
// DATA DEFINITIONS
// ============================================

const databaseTables = [
  { 
    name: 'users', 
    description: 'Utilizatorii aplicației cu roluri și stare', 
    indexes: 'id, &username, role, isDisabled',
    schema: `{
  id: string;          // UUID
  username: string;    // Unic
  email?: string;
  role: 'user' | 'user_plus' | 'admin';
  isDisabled: boolean;
  createdAt: number;   // Epoch ms
  updatedAt: number;
}`
  },
  { 
    name: 'workspaces', 
    description: 'Workspace-urile pentru organizarea documentelor', 
    indexes: 'id, name',
    schema: `{
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
}`
  },
  { 
    name: 'memberships', 
    description: 'Relația user ↔ workspace (many-to-many)', 
    indexes: 'id, [userId+workspaceId], userId, workspaceId',
    schema: `{
  id: string;          // \${userId}:\${workspaceId}
  userId: string;
  workspaceId: string;
  roleInWorkspace?: 'member' | 'manager';
  createdAt: number;
}`
  },
  { 
    name: 'files', 
    description: 'Fișierele PDF încărcate pentru RAG', 
    indexes: 'docId, workspaceId, [workspaceId+filename], sha256',
    schema: `{
  docId: string;       // Primary key
  workspaceId: string;
  filename: string;
  mimeType: 'application/pdf';
  size: number;        // Bytes
  sha256?: string;     // Pentru deduplicare
  uploadedAt: number;
  source: 'local' | 'remote';
  fileBlob?: Blob;     // Opțional: blob local
}`
  },
  { 
    name: 'fileIndexState', 
    description: 'Starea de indexare a fișierelor în vector DB', 
    indexes: 'docId, workspaceId, [workspaceId+status]',
    schema: `{
  docId: string;
  workspaceId: string;
  status: 'not_indexed' | 'indexing' | 'ready' | 'failed';
  indexedAt?: number;
  indexVersion?: string;
  lastError?: string;
  lastAttemptAt?: number;
}`
  },
  { 
    name: 'workspaceSettings', 
    description: 'Setările per workspace (prompt, model, RAG)', 
    indexes: 'workspaceId, updatedAt',
    schema: `{
  workspaceId: string;  // Primary key
  systemPrompt: string;
  modelSettings: ModelSettings;
  ragSettings: RAGSettings;
  updatedAt: number;
}`
  },
  { 
    name: 'promptVersions', 
    description: 'Istoricul versiunilor de system prompt', 
    indexes: 'id, workspaceId, [workspaceId+createdAt]',
    schema: `{
  id: string;
  workspaceId: string;
  prompt: string;
  note?: string;
  createdAt: number;
  createdBy?: string;
}`
  },
  { 
    name: 'appCache', 
    description: 'Cache general (KV store) pentru aplicație', 
    indexes: 'key, updatedAt',
    schema: `{
  key: string;         // Primary key
  value: unknown;      // Orice valoare JSON
  updatedAt: number;
}`
  },
];

const apiEndpoints = [
  { path: '/auth/me', description: 'Informații user curent', auth: false, role: 'any' },
  { path: '/auth/login', description: 'Login cu username/password', auth: false, role: 'any' },
  { path: '/workspaces/list', description: 'Lista workspace-urilor', auth: true, role: 'user' },
  { path: '/workspaces/create', description: 'Creare workspace', auth: true, role: 'admin' },
  { path: '/workspaces/update', description: 'Actualizare workspace', auth: true, role: 'admin' },
  { path: '/workspaces/delete', description: 'Ștergere workspace', auth: true, role: 'admin' },
  { path: '/workspaces/assign-user', description: 'Atribuie user la workspace', auth: true, role: 'admin' },
  { path: '/workspaces/remove-user', description: 'Elimină user din workspace', auth: true, role: 'admin' },
  { path: '/workspaces/members', description: 'Lista membrilor workspace', auth: true, role: 'user_plus' },
  { path: '/users/list', description: 'Lista tuturor utilizatorilor', auth: true, role: 'admin' },
  { path: '/users/create', description: 'Creare utilizator', auth: true, role: 'admin' },
  { path: '/users/update', description: 'Actualizare utilizator', auth: true, role: 'admin' },
  { path: '/users/disable', description: 'Dezactivare utilizator', auth: true, role: 'admin' },
  { path: '/users/reset-password', description: 'Reset parolă', auth: true, role: 'admin' },
  { path: '/users/assign-workspaces', description: 'Atribuie workspace-uri la user', auth: true, role: 'admin' },
  { path: '/files/list', description: 'Lista fișierelor din workspace', auth: true, role: 'user' },
  { path: '/files/upload', description: 'Upload fișier PDF', auth: true, role: 'user_plus' },
  { path: '/files/delete', description: 'Ștergere fișier', auth: true, role: 'user_plus' },
  { path: '/files/index', description: 'Indexare documente', auth: true, role: 'user_plus' },
  { path: '/files/reindex', description: 'Re-indexare document', auth: true, role: 'user_plus' },
  { path: '/settings/get', description: 'Obține setări workspace', auth: true, role: 'user' },
  { path: '/settings/save', description: 'Salvează setări workspace', auth: true, role: 'admin' },
  { path: '/chat/stream', description: 'Chat cu streaming SSE', auth: true, role: 'user' },
  { path: '/chat', description: 'Chat non-streaming (fallback)', auth: true, role: 'user' },
];

const stores = [
  { 
    name: 'useAuthStore', 
    file: 'src/store/authStore.ts', 
    description: 'Starea de autentificare, user curent și permisiuni', 
    persisted: false,
    code: `interface AuthState {
  user: DBUser | null;
  isAuthenticated: boolean;
  isKeycloakAuth: boolean;
  hasPermission: (permission: Permission) => boolean;
  login: (user: DBUser) => void;
  logout: () => void;
}`
  },
  { 
    name: 'useWorkspaceStore', 
    file: 'src/store/workspaceStore.ts', 
    description: 'Workspace-uri, workspace curent și setări', 
    persisted: true,
    code: `interface WorkspaceState {
  workspaces: DBWorkspace[];
  currentWorkspaceId: string | null;
  workspaceSettings: DBWorkspaceSettings | null;
  setCurrentWorkspace: (id: string) => void;
  loadWorkspaces: () => Promise<void>;
  saveSettings: (settings: Partial<DBWorkspaceSettings>) => Promise<void>;
}`
  },
  { 
    name: 'useChatStore', 
    file: 'src/store/appStore.ts', 
    description: 'Mesaje, streaming, citări și reasoning', 
    persisted: true,
    code: `interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  citations: Citation[];
  reasoning: string;
  sendMessage: (content: string) => Promise<void>;
  addStreamToken: (token: string) => void;
  setCitations: (citations: Citation[]) => void;
  clearChat: () => void;
}`
  },
  { 
    name: 'useFilesStore', 
    file: 'src/store/filesStore.ts', 
    description: 'Fișiere încărcate și starea de indexare', 
    persisted: true,
    code: `interface FilesState {
  files: DBFile[];
  uploadProgress: Record<string, number>;
  uploadFile: (file: File) => Promise<void>;
  deleteFile: (docId: string) => Promise<void>;
  indexFiles: (docIds: string[]) => Promise<void>;
  loadFiles: () => Promise<void>;
}`
  },
  { 
    name: 'useUIStore', 
    file: 'src/store/appStore.ts', 
    description: 'Preferințe UI (limbă, temă, sidebar)', 
    persisted: true,
    code: `interface UIState {
  language: 'ro' | 'en';
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  setLanguage: (lang: 'ro' | 'en') => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  toggleSidebar: () => void;
}`
  },
];

const components = [
  { 
    name: 'MainLayout', 
    path: 'src/components/layout/MainLayout.tsx', 
    description: 'Layout principal cu sidebar, header și navigare. Wrapper pentru toate paginile.',
    props: `{
  children: ReactNode;
  showSidebar?: boolean;
}`
  },
  { 
    name: 'ChatPage', 
    path: 'src/pages/ChatPage.tsx', 
    description: 'Pagina principală de chat. Gestionează streaming, citări și afișarea mesajelor.',
    props: 'Route params: { workspaceId: string }'
  },
  { 
    name: 'ChatComposer', 
    path: 'src/components/chat/ChatComposer.tsx', 
    description: 'Input pentru mesaje cu butoane pentru PDF-uri și funcționalități.',
    props: `{
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}`
  },
  { 
    name: 'ChatMessage', 
    path: 'src/components/chat/ChatMessage.tsx', 
    description: 'Afișare mesaj individual cu markdown rendering și acțiuni.',
    props: `{
  message: Message;
  isStreaming?: boolean;
}`
  },
  { 
    name: 'ProtectedRoute', 
    path: 'src/components/auth/ProtectedRoute.tsx', 
    description: 'Wrapper pentru rute protejate. Verifică autentificare și rol.',
    props: `{
  children: ReactNode;
  requireAdmin?: boolean;
  requireUserPlus?: boolean;
  fallback?: ReactNode;
}`
  },
  { 
    name: 'PermissionGate', 
    path: 'src/components/auth/PermissionGate.tsx', 
    description: 'Afișează copiii doar dacă userul are permisiunea specificată.',
    props: `{
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}`
  },
  { 
    name: 'WorkspaceSwitcher', 
    path: 'src/components/workspace/WorkspaceSwitcher.tsx', 
    description: 'Dropdown pentru selectarea workspace-ului curent.',
    props: 'Folosește useWorkspaceStore intern'
  },
  { 
    name: 'ReasoningPanel', 
    path: 'src/components/layout/ReasoningPanel.tsx', 
    description: 'Panel lateral pentru afișarea reasoning-ului AI și citărilor.',
    props: `{
  reasoning: string;
  citations: Citation[];
  isVisible?: boolean;
}`
  },
  { 
    name: 'PDFPreviewModal', 
    path: 'src/components/files/PDFPreviewModal.tsx', 
    description: 'Modal pentru vizualizarea PDF-urilor cu navigare pagini.',
    props: `{
  docId: string;
  initialPage?: number;
  onClose: () => void;
}`
  },
];

const routes = [
  { path: '/', access: 'all', description: 'Redirect la workspace default' },
  { path: '/w/:workspaceId/chat', access: 'all', description: 'Chat principal cu AI' },
  { path: '/w/:workspaceId/conversations', access: 'all', description: 'Istoric conversații' },
  { path: '/w/:workspaceId/library', access: 'all', description: 'Biblioteca de proiecte' },
  { path: '/w/:workspaceId/files', access: 'user_plus', description: 'Upload și gestionare PDF-uri' },
  { path: '/w/:workspaceId/settings/models', access: 'admin', description: 'Configurare LLM/VectorDB/Reranker' },
  { path: '/w/:workspaceId/settings/prompt', access: 'user_plus', description: 'Editare System Prompt' },
  { path: '/w/:workspaceId/settings/rag', access: 'admin', description: 'Configurare RAG' },
  { path: '/w/:workspaceId/settings/users', access: 'admin', description: 'Utilizatori workspace' },
  { path: '/admin', access: 'admin', description: 'Dashboard administrativ' },
  { path: '/admin/workspaces', access: 'admin', description: 'Gestionare workspace-uri' },
  { path: '/admin/users', access: 'admin', description: 'Gestionare utilizatori globali' },
  { path: '/admin/memory', access: 'admin', description: 'Memory entries pentru RAG' },
  { path: '/admin/prompt', access: 'admin', description: 'System prompt global' },
  { path: '/admin/rag', access: 'admin', description: 'Setări RAG globale' },
  { path: '/docs', access: 'all', description: 'Această documentație' },
  { path: '/login', access: 'all', description: 'Pagina de autentificare' },
];

function FileStructure() {
  return (
    <div className="text-muted-foreground font-mono text-sm">
      <div className="text-foreground font-bold">src/</div>
      <div className="ml-4 space-y-2">
        <div>
          <div className="text-foreground font-semibold">api/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── client.ts <span className="text-muted-foreground/70"># HTTP client generic</span></div>
            <div>├── n8nClient.ts <span className="text-muted-foreground/70"># Client n8n + streaming SSE</span></div>
            <div>└── index.ts <span className="text-muted-foreground/70"># Re-exports</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">auth/</div>
          <div className="ml-4 text-xs">
            <div>└── keycloak.ts <span className="text-muted-foreground/70"># Integrare Keycloak completa</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">components/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── auth/ <span className="text-muted-foreground/70"># ProtectedRoute, PermissionGate</span></div>
            <div>├── chat/ <span className="text-muted-foreground/70"># ChatComposer, ChatMessage, Citations</span></div>
            <div>├── layout/ <span className="text-muted-foreground/70"># MainLayout, ReasoningPanel, Sidebar</span></div>
            <div>├── workspace/ <span className="text-muted-foreground/70"># WorkspaceSwitcher</span></div>
            <div>├── files/ <span className="text-muted-foreground/70"># PDFPreviewModal, FileUploader</span></div>
            <div>├── export/ <span className="text-muted-foreground/70"># ExportButton pentru conversații</span></div>
            <div>└── ui/ <span className="text-muted-foreground/70"># shadcn/ui components</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">db/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── dexie.ts <span className="text-muted-foreground/70"># Schema IndexedDB cu Dexie</span></div>
            <div>└── repo.ts <span className="text-muted-foreground/70"># Funcții CRUD pentru toate tabelele</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">hooks/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── useAuth.ts <span className="text-muted-foreground/70"># Hook pentru autentificare</span></div>
            <div>├── useAppInit.ts <span className="text-muted-foreground/70"># Inițializare aplicație</span></div>
            <div>├── useTheme.ts <span className="text-muted-foreground/70"># Dark/Light/System mode</span></div>
            <div>├── useTranslation.ts <span className="text-muted-foreground/70"># i18n (ro/en)</span></div>
            <div>└── use-mobile.tsx <span className="text-muted-foreground/70"># Detectare mobile</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">lib/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── utils.ts <span className="text-muted-foreground/70"># cn() și utilități generale</span></div>
            <div>├── i18n.ts <span className="text-muted-foreground/70"># Dicționar traduceri ro/en</span></div>
            <div>├── validation.ts <span className="text-muted-foreground/70"># Zod schemas pentru validare</span></div>
            <div>└── export.ts <span className="text-muted-foreground/70"># Export conversații (PDF, JSON, MD)</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">pages/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── ChatPage.tsx <span className="text-muted-foreground/70"># Pagina principală de chat</span></div>
            <div>├── ConversationsPage.tsx <span className="text-muted-foreground/70"># Istoric conversații</span></div>
            <div>├── FilesPage.tsx <span className="text-muted-foreground/70"># Upload și gestionare PDF-uri</span></div>
            <div>├── LibraryPage.tsx <span className="text-muted-foreground/70"># Proiecte și organizare</span></div>
            <div>├── WorkspaceModelsPage.tsx <span className="text-muted-foreground/70"># Config LLM/VectorDB</span></div>
            <div>├── WorkspacePromptPage.tsx <span className="text-muted-foreground/70"># System prompt + temperature</span></div>
            <div>├── WorkspaceRagPage.tsx <span className="text-muted-foreground/70"># Config RAG (chunks, etc.)</span></div>
            <div>├── WorkspaceUsersPage.tsx <span className="text-muted-foreground/70"># Utilizatori workspace</span></div>
            <div>├── AdminDashboard.tsx <span className="text-muted-foreground/70"># Dashboard admin</span></div>
            <div>├── AdminUsersPage.tsx <span className="text-muted-foreground/70"># Gestionare useri globali</span></div>
            <div>├── AdminWorkspacesPage.tsx <span className="text-muted-foreground/70"># Gestionare workspaces</span></div>
            <div>├── AdminMemoryPage.tsx <span className="text-muted-foreground/70"># Memory entries</span></div>
            <div>├── AdminPromptPage.tsx <span className="text-muted-foreground/70"># System prompt global</span></div>
            <div>├── AdminRagPage.tsx <span className="text-muted-foreground/70"># Setări RAG globale</span></div>
            <div>├── DocsPage.tsx <span className="text-muted-foreground/70"># Această documentație</span></div>
            <div>├── LoginPage.tsx <span className="text-muted-foreground/70"># Autentificare</span></div>
            <div>└── NotFound.tsx <span className="text-muted-foreground/70"># 404 page</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">store/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── appStore.ts <span className="text-muted-foreground/70"># Chat, UI, Projects, Conversations stores</span></div>
            <div>├── authStore.ts <span className="text-muted-foreground/70"># Auth state și permisiuni</span></div>
            <div>├── workspaceStore.ts <span className="text-muted-foreground/70"># Workspaces și setări</span></div>
            <div>└── filesStore.ts <span className="text-muted-foreground/70"># Files și upload state</span></div>
          </div>
        </div>
        
        <div>
          <div className="text-foreground font-semibold">types/</div>
          <div className="ml-4 text-xs space-y-1">
            <div>├── api.ts <span className="text-muted-foreground/70"># Tipuri pentru API responses</span></div>
            <div>├── auth.ts <span className="text-muted-foreground/70"># Roluri și permisiuni</span></div>
            <div>├── database.ts <span className="text-muted-foreground/70"># Tipuri DB (users, files, etc.)</span></div>
            <div>└── index.ts <span className="text-muted-foreground/70"># Re-exports</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
