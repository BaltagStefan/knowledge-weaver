import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Lock
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Documentație Tehnică</h1>
          <p className="text-muted-foreground text-lg">
            Ghid complet pentru arhitectura și implementarea aplicației RAG Chat
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2">
            <TabsTrigger value="overview">Prezentare</TabsTrigger>
            <TabsTrigger value="structure">Structură</TabsTrigger>
            <TabsTrigger value="database">Bază de Date</TabsTrigger>
            <TabsTrigger value="auth">Autentificare</TabsTrigger>
            <TabsTrigger value="api">API & n8n</TabsTrigger>
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
                
                <div className="grid md:grid-cols-2 gap-4 mt-4">
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
                      Backend
                    </h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• n8n Workflows (API endpoints)</li>
                      <li>• Keycloak (autentificare admin)</li>
                      <li>• IndexedDB/Dexie (cache local)</li>
                      <li>• LLM Endpoints (configurabile)</li>
                      <li>• Vector DB (RAG retrieval)</li>
                    </ul>
                  </div>
                </div>

                <Separator className="my-4" />

                <h4 className="font-semibold">Flux de Date</h4>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                  <pre>{`
User Input → ChatComposer → useChatStore → n8nClient.streamChat()
                                              ↓
                                     n8n Webhook (POST)
                                              ↓
                                     LLM + Vector DB
                                              ↓
                                     SSE Stream Response
                                              ↓
                              useChatStore.addStreamToken() → UI Update
                  `}</pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Tehnologii Folosite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">React 18</Badge>
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Vite</Badge>
                  <Badge variant="outline">Tailwind CSS</Badge>
                  <Badge variant="outline">shadcn/ui</Badge>
                  <Badge variant="outline">Zustand</Badge>
                  <Badge variant="outline">TanStack Query</Badge>
                  <Badge variant="outline">Dexie.js</Badge>
                  <Badge variant="outline">Keycloak</Badge>
                  <Badge variant="outline">n8n</Badge>
                  <Badge variant="outline">React Router</Badge>
                  <Badge variant="outline">Lucide Icons</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderTree className="h-5 w-5" />
                  Structura Proiectului
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="font-mono text-sm space-y-4">
                    <FileStructure />
                  </div>
                </ScrollArea>
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
                  Baza de date locală pentru cache și persistență
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Locație: <code className="bg-muted px-2 py-1 rounded">src/db/dexie.ts</code></h4>
                  <p className="text-muted-foreground">
                    Aplicația folosește <strong>IndexedDB</strong> prin biblioteca Dexie.js pentru a stoca 
                    date local în browser. Aceasta oferă persistență offline și cache pentru performanță.
                  </p>
                  
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`// src/db/dexie.ts
export class RAGChatDatabase extends Dexie {
  users!: Table<DBUser, string>;
  workspaces!: Table<DBWorkspace, string>;
  memberships!: Table<DBMembership, string>;
  files!: Table<DBFile, string>;
  fileIndexState!: Table<DBFileIndexState, string>;
  workspaceSettings!: Table<DBWorkspaceSettings, string>;
  promptVersions!: Table<DBPromptVersion, string>;
  appCache!: Table<DBAppCache, string>;
}`}</pre>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Tabele Definite</h4>
                  <div className="grid gap-4">
                    {databaseTables.map((table) => (
                      <div key={table.name} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrive className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{table.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{table.description}</p>
                        <div className="bg-muted p-2 rounded text-xs font-mono">
                          Indecși: {table.indexes}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Repository Pattern: <code className="bg-muted px-2 py-1 rounded">src/db/repo.ts</code></h4>
                  <p className="text-muted-foreground">
                    Funcții utilitare pentru CRUD operations pe baza de date:
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`// Funcții principale din repo.ts
getCurrentUser()           // Obține userul curent din cache
setCurrentUser(userId)     // Setează userul curent
createUser(username, role) // Creează un user nou
createWorkspace(name)      // Creează un workspace nou
assignUserToWorkspace()    // Atribuie user la workspace
listFiles(workspaceId)     // Listează fișierele unui workspace
saveWorkspaceSettings()    // Salvează setările workspace-ului
getKeycloakToken()         // Obține token-ul Keycloak din cache
setKeycloakToken(token)    // Salvează token-ul Keycloak`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auth Tab */}
          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Autentificare Keycloak
                </CardTitle>
                <CardDescription>
                  Sistem de autentificare pentru admin și roluri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Locație: <code className="bg-muted px-2 py-1 rounded">src/auth/keycloak.ts</code></h4>
                  <p className="text-muted-foreground">
                    Integrarea cu Keycloak pentru autentificare admin. Folosește biblioteca <code>keycloak-js</code>.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      Configurare
                    </h5>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      <p>VITE_KEYCLOAK_URL</p>
                      <p>VITE_KEYCLOAK_REALM</p>
                      <p>VITE_KEYCLOAK_CLIENT_ID</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Roluri
                    </h5>
                    <ul className="text-sm space-y-1">
                      <li><Badge>admin</Badge> - Acces complet</li>
                      <li><Badge variant="secondary">user_plus</Badge> - Acces extins</li>
                      <li><Badge variant="outline">user</Badge> - Acces basic</li>
                    </ul>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Funcții Principale</h4>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`// src/auth/keycloak.ts

initKeycloak()              // Inițializează clientul Keycloak
keycloakLogin()             // Declanșează flow-ul de login
keycloakLogout()            // Logout și curăță token-ul
isKeycloakAuthenticated()   // Verifică dacă e autentificat
getKeycloakToken()          // Returnează access token-ul
hasKeycloakRole(role)       // Verifică un rol specific
isKeycloakAdmin()           // Verifică dacă e admin
refreshToken(minValidity)   // Reîmprospătează token-ul
ensureTokenValid()          // Asigură validitatea token-ului`}</pre>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Flux de Autentificare</h4>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <pre>{`
1. User accesează rută protejată (/admin/*)
          ↓
2. ProtectedRoute verifică autentificarea
          ↓
3. Dacă nu e autentificat → redirect la Keycloak
          ↓
4. Keycloak autentifică și returnează token
          ↓
5. Token salvat în IndexedDB (repo.setKeycloakToken)
          ↓
6. Verificare rol din token claims
          ↓
7. Acces acordat sau redirect la /login
                    `}</pre>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Protected Routes</h4>
                  <p className="text-muted-foreground">
                    Componentă: <code className="bg-muted px-2 py-1 rounded">src/components/auth/ProtectedRoute.tsx</code>
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`// Utilizare în App.tsx
<Route path="/admin" element={
  <ProtectedRoute requireAdmin>
    <AdminDashboard />
  </ProtectedRoute>
} />

<Route path="/w/:workspaceId/files" element={
  <ProtectedRoute requireUserPlus>
    <FilesPage />
  </ProtectedRoute>
} />`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Sistem de Permisiuni
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Locație: <code className="bg-muted px-2 py-1 rounded">src/types/auth.ts</code>
                </p>
                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// Permisiuni definite
type Permission =
  | 'chat:read' | 'chat:write'
  | 'files:read' | 'files:upload' | 'files:delete'
  | 'settings:read' | 'settings:write'
  | 'users:read' | 'users:manage'
  | 'admin:access';

// Mapare roluri -> permisiuni
const ROLE_PERMISSIONS = {
  user: ['chat:read', 'chat:write'],
  user_plus: ['chat:*', 'files:*', 'settings:read'],
  admin: ['*'] // Toate permisiunile
};`}</pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Integrare n8n
                </CardTitle>
                <CardDescription>
                  Toate apelurile API sunt făcute către n8n workflows
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Locație: <code className="bg-muted px-2 py-1 rounded">src/api/n8nClient.ts</code></h4>
                  <p className="text-muted-foreground">
                    Clientul principal pentru comunicarea cu backend-ul n8n. Toate request-urile 
                    sunt POST către webhook-uri n8n.
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">{`// Configurare
const N8N_WEBHOOK_BASE = import.meta.env.VITE_N8N_WEBHOOK_URL;

// Structura request-ului
interface N8NRequestPayload {
  action: string;           // Tipul acțiunii
  userId?: string;          // ID-ul userului
  workspaceId?: string;     // ID-ul workspace-ului
  data?: Record<string, unknown>;  // Date adiționale
}`}</pre>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">API Groups</h4>
                  <div className="grid gap-4">
                    {apiGroups.map((group) => (
                      <div key={group.name} className="border rounded-lg p-4">
                        <h5 className="font-semibold mb-2">{group.name}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{group.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {group.methods.map((method) => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Streaming Chat (SSE)</h4>
                  <p className="text-muted-foreground">
                    Chat-ul folosește Server-Sent Events pentru streaming în timp real:
                  </p>
                  <div className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">{`// streamChat() din n8nClient.ts
const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

const reader = response.body.getReader();
// Procesare evenimente SSE:
// - token: fragment de text
// - citations: surse/referințe
// - status: stare streaming
// - reasoning: pași de raționament
// - done: finalizare
// - error: eroare`}</pre>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Endpoints Configurabile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Din pagina Settings → Models, poți configura:
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">LLM Endpoints</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Endpoint URL</li>
                      <li>• API Key</li>
                      <li>• Context Window</li>
                      <li>• Max Tokens</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">Vector Database</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Endpoint URL</li>
                      <li>• API Key</li>
                      <li>• Collection Name</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h5 className="font-semibold mb-2">Reranker</h5>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Enable/Disable</li>
                      <li>• Endpoint URL</li>
                      <li>• API Key</li>
                    </ul>
                  </div>
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
                    <div className="mt-2 flex flex-wrap gap-1">
                      {store.keys.map((key) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key}
                        </Badge>
                      ))}
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
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {components.map((component) => (
                      <div key={component.name} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          <span className="font-semibold">{component.name}</span>
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
                  <Settings className="h-5 w-5" />
                  Pagini Disponibile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {routes.map((route) => (
                    <div key={route.path} className="flex items-center justify-between p-2 border rounded">
                      <code className="text-sm">{route.path}</code>
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          route.access === 'admin' ? 'destructive' : 
                          route.access === 'user_plus' ? 'default' : 'secondary'
                        }>
                          {route.access}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Data definitions
const databaseTables = [
  { 
    name: 'users', 
    description: 'Utilizatorii aplicației cu roluri și stare', 
    indexes: 'id, &username, role, isDisabled' 
  },
  { 
    name: 'workspaces', 
    description: 'Workspace-urile pentru organizare', 
    indexes: 'id, name' 
  },
  { 
    name: 'memberships', 
    description: 'Relația user-workspace', 
    indexes: 'id, [userId+workspaceId], userId, workspaceId' 
  },
  { 
    name: 'files', 
    description: 'Fișierele încărcate pentru RAG', 
    indexes: 'docId, workspaceId, [workspaceId+filename], sha256' 
  },
  { 
    name: 'fileIndexState', 
    description: 'Starea de indexare a fișierelor', 
    indexes: 'docId, workspaceId, [workspaceId+status]' 
  },
  { 
    name: 'workspaceSettings', 
    description: 'Setările per workspace (prompt, model, RAG)', 
    indexes: 'workspaceId, updatedAt' 
  },
  { 
    name: 'promptVersions', 
    description: 'Istoricul versiunilor de prompt', 
    indexes: 'id, workspaceId, [workspaceId+createdAt]' 
  },
  { 
    name: 'appCache', 
    description: 'Cache general pentru aplicație', 
    indexes: 'key, updatedAt' 
  },
];

const apiGroups = [
  { 
    name: 'authApi', 
    description: 'Autentificare și sesiune', 
    methods: ['me()', 'login()'] 
  },
  { 
    name: 'workspacesApi', 
    description: 'Gestionare workspace-uri', 
    methods: ['list()', 'create()', 'update()', 'delete()', 'getMembers()', 'addMember()'] 
  },
  { 
    name: 'usersApi', 
    description: 'Gestionare utilizatori', 
    methods: ['list()', 'create()', 'update()', 'disable()', 'resetPassword()'] 
  },
  { 
    name: 'filesApi', 
    description: 'Upload și indexare fișiere', 
    methods: ['list()', 'upload()', 'delete()', 'index()', 'reindex()'] 
  },
  { 
    name: 'settingsApi', 
    description: 'Setări workspace', 
    methods: ['get()', 'save()'] 
  },
  { 
    name: 'streamChat', 
    description: 'Chat cu streaming SSE', 
    methods: ['streamChat()'] 
  },
];

const stores = [
  { 
    name: 'useAuthStore', 
    file: 'src/store/authStore.ts', 
    description: 'Starea de autentificare și roluri', 
    persisted: false,
    keys: ['user', 'isAuthenticated', 'isKeycloakAuth', 'hasPermission()']
  },
  { 
    name: 'useWorkspaceStore', 
    file: 'src/store/workspaceStore.ts', 
    description: 'Workspace-uri și setări curente', 
    persisted: true,
    keys: ['workspaces', 'currentWorkspaceId', 'workspaceSettings']
  },
  { 
    name: 'useChatStore', 
    file: 'src/store/appStore.ts', 
    description: 'Mesaje, streaming, citări', 
    persisted: true,
    keys: ['messages', 'isStreaming', 'citations', 'reasoning']
  },
  { 
    name: 'useConversationsStore', 
    file: 'src/store/appStore.ts', 
    description: 'Lista de conversații', 
    persisted: true,
    keys: ['conversations', 'currentConversationId']
  },
  { 
    name: 'useProjectsStore', 
    file: 'src/store/appStore.ts', 
    description: 'Proiecte și organizare', 
    persisted: true,
    keys: ['projects', 'currentProjectId']
  },
  { 
    name: 'useUIStore', 
    file: 'src/store/appStore.ts', 
    description: 'Preferințe UI (limbă, temă)', 
    persisted: true,
    keys: ['language', 'theme', 'sidebarOpen']
  },
];

const components = [
  { name: 'MainLayout', path: 'src/components/layout/MainLayout.tsx', description: 'Layout principal cu sidebar și navigare' },
  { name: 'ChatPage', path: 'src/pages/ChatPage.tsx', description: 'Pagina de chat cu streaming' },
  { name: 'ChatComposer', path: 'src/components/chat/ChatComposer.tsx', description: 'Input pentru mesaje' },
  { name: 'ChatMessage', path: 'src/components/chat/ChatMessage.tsx', description: 'Afișare mesaj cu markdown' },
  { name: 'ProtectedRoute', path: 'src/components/auth/ProtectedRoute.tsx', description: 'Wrapper pentru rute protejate' },
  { name: 'WorkspaceSwitcher', path: 'src/components/workspace/WorkspaceSwitcher.tsx', description: 'Selector workspace' },
  { name: 'ReasoningPanel', path: 'src/components/layout/ReasoningPanel.tsx', description: 'Panel pentru reasoning și citări' },
  { name: 'PDFPreviewModal', path: 'src/components/files/PDFPreviewModal.tsx', description: 'Vizualizare PDF' },
];

const routes = [
  { path: '/w/:workspaceId/chat', access: 'all' },
  { path: '/w/:workspaceId/conversations', access: 'all' },
  { path: '/w/:workspaceId/files', access: 'user_plus' },
  { path: '/w/:workspaceId/settings/models', access: 'admin' },
  { path: '/w/:workspaceId/settings/prompt', access: 'user_plus' },
  { path: '/w/:workspaceId/settings/rag', access: 'admin' },
  { path: '/admin', access: 'admin' },
  { path: '/admin/workspaces', access: 'admin' },
  { path: '/admin/users', access: 'admin' },
  { path: '/admin/memory', access: 'admin' },
  { path: '/docs', access: 'all' },
];

function FileStructure() {
  return (
    <div className="text-muted-foreground">
      <div className="text-foreground font-bold">src/</div>
      <div className="ml-4">
        <div className="text-foreground font-semibold">api/</div>
        <div className="ml-4">
          <div>├── client.ts <span className="text-xs">(HTTP client generic)</span></div>
          <div>├── n8nClient.ts <span className="text-xs">(Client n8n + streaming)</span></div>
          <div>└── index.ts <span className="text-xs">(Re-exports)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">auth/</div>
        <div className="ml-4">
          <div>└── keycloak.ts <span className="text-xs">(Integrare Keycloak)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">components/</div>
        <div className="ml-4">
          <div>├── auth/ <span className="text-xs">(ProtectedRoute, PermissionGate)</span></div>
          <div>├── chat/ <span className="text-xs">(ChatComposer, ChatMessage, etc.)</span></div>
          <div>├── layout/ <span className="text-xs">(MainLayout, ReasoningPanel)</span></div>
          <div>├── workspace/ <span className="text-xs">(WorkspaceSwitcher)</span></div>
          <div>└── ui/ <span className="text-xs">(shadcn components)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">db/</div>
        <div className="ml-4">
          <div>├── dexie.ts <span className="text-xs">(Definiție IndexedDB)</span></div>
          <div>└── repo.ts <span className="text-xs">(Funcții CRUD)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">hooks/</div>
        <div className="ml-4">
          <div>├── useAuth.ts <span className="text-xs">(Hook autentificare)</span></div>
          <div>├── useAppInit.ts <span className="text-xs">(Inițializare app)</span></div>
          <div>├── useTheme.ts <span className="text-xs">(Dark/Light mode)</span></div>
          <div>└── useTranslation.ts <span className="text-xs">(i18n)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">lib/</div>
        <div className="ml-4">
          <div>├── utils.ts <span className="text-xs">(cn() și utilități)</span></div>
          <div>├── i18n.ts <span className="text-xs">(Traduceri)</span></div>
          <div>├── validation.ts <span className="text-xs">(Zod schemas)</span></div>
          <div>└── export.ts <span className="text-xs">(Export conversații)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">pages/</div>
        <div className="ml-4">
          <div>├── ChatPage.tsx <span className="text-xs">(Chat principal)</span></div>
          <div>├── FilesPage.tsx <span className="text-xs">(Upload fișiere)</span></div>
          <div>├── ConversationsPage.tsx <span className="text-xs">(Istoric conversații)</span></div>
          <div>├── WorkspaceModelsPage.tsx <span className="text-xs">(Config LLM/VectorDB)</span></div>
          <div>├── WorkspacePromptPage.tsx <span className="text-xs">(System prompt)</span></div>
          <div>├── WorkspaceRagPage.tsx <span className="text-xs">(Config RAG)</span></div>
          <div>├── AdminDashboard.tsx <span className="text-xs">(Dashboard admin)</span></div>
          <div>├── AdminUsersPage.tsx <span className="text-xs">(Gestionare useri)</span></div>
          <div>├── AdminWorkspacesPage.tsx <span className="text-xs">(Gestionare workspaces)</span></div>
          <div>└── DocsPage.tsx <span className="text-xs">(Această pagină)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">store/</div>
        <div className="ml-4">
          <div>├── appStore.ts <span className="text-xs">(Chat, UI, Projects, Conversations)</span></div>
          <div>├── authStore.ts <span className="text-xs">(Auth state)</span></div>
          <div>├── workspaceStore.ts <span className="text-xs">(Workspaces state)</span></div>
          <div>└── filesStore.ts <span className="text-xs">(Files state)</span></div>
        </div>
        
        <div className="text-foreground font-semibold mt-2">types/</div>
        <div className="ml-4">
          <div>├── api.ts <span className="text-xs">(Tipuri API)</span></div>
          <div>├── auth.ts <span className="text-xs">(Tipuri autentificare)</span></div>
          <div>├── database.ts <span className="text-xs">(Tipuri DB)</span></div>
          <div>└── index.ts <span className="text-xs">(Re-exports)</span></div>
        </div>
      </div>
    </div>
  );
}
