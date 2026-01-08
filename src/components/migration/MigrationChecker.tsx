import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Database,
  Shield,
  Server,
  FileText,
  Settings,
  RefreshCw
} from 'lucide-react';

interface CheckResult {
  id: string;
  name: string;
  description: string;
  status: 'checking' | 'success' | 'warning' | 'error' | 'pending';
  message?: string;
  details?: string;
}

export function MigrationChecker() {
  const [checks, setChecks] = useState<CheckResult[]>([
    {
      id: 'env-n8n',
      name: 'n8n Webhook URL',
      description: 'VITE_N8N_WEBHOOK_BASE_URL configurat',
      status: 'pending',
    },
    {
      id: 'env-keycloak-url',
      name: 'Keycloak URL',
      description: 'VITE_KEYCLOAK_URL configurat',
      status: 'pending',
    },
    {
      id: 'env-keycloak-realm',
      name: 'Keycloak Realm',
      description: 'VITE_KEYCLOAK_REALM configurat',
      status: 'pending',
    },
    {
      id: 'env-keycloak-client',
      name: 'Keycloak Client ID',
      description: 'VITE_KEYCLOAK_CLIENT_ID configurat',
      status: 'pending',
    },
    {
      id: 'indexeddb',
      name: 'IndexedDB disponibil',
      description: 'Browser-ul suportă IndexedDB',
      status: 'pending',
    },
    {
      id: 'db-initialized',
      name: 'Baza de date inițializată',
      description: 'Tabelele sunt create în IndexedDB',
      status: 'pending',
    },
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runChecks = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const results = [...checks];
    const totalChecks = results.length;
    
    for (let i = 0; i < results.length; i++) {
      results[i].status = 'checking';
      setChecks([...results]);
      
      // Simulate async check
      await new Promise(resolve => setTimeout(resolve, 300));
      
      switch (results[i].id) {
        case 'env-n8n':
          const n8nUrl = import.meta.env.VITE_N8N_WEBHOOK_BASE_URL;
          if (n8nUrl && n8nUrl !== 'undefined') {
            results[i].status = 'success';
            results[i].message = `Configurat: ${n8nUrl.substring(0, 40)}...`;
          } else {
            results[i].status = 'error';
            results[i].message = 'Lipsește! Adaugă în .env';
            results[i].details = 'VITE_N8N_WEBHOOK_BASE_URL=https://your-n8n.com/webhook';
          }
          break;
          
        case 'env-keycloak-url':
          const kcUrl = import.meta.env.VITE_KEYCLOAK_URL;
          if (kcUrl && kcUrl !== 'undefined') {
            results[i].status = 'success';
            results[i].message = `Configurat: ${kcUrl}`;
          } else {
            results[i].status = 'warning';
            results[i].message = 'Opțional dacă nu folosești Keycloak';
            results[i].details = 'VITE_KEYCLOAK_URL=https://your-keycloak.com';
          }
          break;
          
        case 'env-keycloak-realm':
          const kcRealm = import.meta.env.VITE_KEYCLOAK_REALM;
          if (kcRealm && kcRealm !== 'undefined') {
            results[i].status = 'success';
            results[i].message = `Realm: ${kcRealm}`;
          } else {
            results[i].status = 'warning';
            results[i].message = 'Opțional dacă nu folosești Keycloak';
          }
          break;
          
        case 'env-keycloak-client':
          const kcClient = import.meta.env.VITE_KEYCLOAK_CLIENT_ID;
          if (kcClient && kcClient !== 'undefined') {
            results[i].status = 'success';
            results[i].message = `Client: ${kcClient}`;
          } else {
            results[i].status = 'warning';
            results[i].message = 'Opțional dacă nu folosești Keycloak';
          }
          break;
          
        case 'indexeddb':
          if ('indexedDB' in window) {
            results[i].status = 'success';
            results[i].message = 'IndexedDB este disponibil';
          } else {
            results[i].status = 'error';
            results[i].message = 'IndexedDB nu este suportat!';
            results[i].details = 'Folosește un browser modern (Chrome, Firefox, Safari, Edge)';
          }
          break;
          
        case 'db-initialized':
          try {
            const dbRequest = indexedDB.open('rag_chat_app_db');
            await new Promise((resolve, reject) => {
              dbRequest.onsuccess = () => {
                const db = dbRequest.result;
                const storeNames = Array.from(db.objectStoreNames);
                if (storeNames.length > 0) {
                  results[i].status = 'success';
                  results[i].message = `${storeNames.length} tabele create`;
                  results[i].details = storeNames.join(', ');
                } else {
                  results[i].status = 'warning';
                  results[i].message = 'DB există dar fără tabele';
                }
                db.close();
                resolve(true);
              };
              dbRequest.onerror = () => {
                results[i].status = 'warning';
                results[i].message = 'DB nu este încă creată';
                results[i].details = 'Se va crea automat la prima utilizare';
                resolve(false);
              };
            });
          } catch {
            results[i].status = 'warning';
            results[i].message = 'Nu s-a putut verifica';
          }
          break;
      }
      
      setProgress(((i + 1) / totalChecks) * 100);
      setChecks([...results]);
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-muted" />;
    }
  };

  const getStatusBadge = (status: CheckResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">OK</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-black">Atenție</Badge>;
      case 'error':
        return <Badge variant="destructive">Eroare</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const successCount = checks.filter(c => c.status === 'success').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Verificare Configurație Migrare
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runChecks}
            disabled={isRunning}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Reverificare
          </Button>
        </CardTitle>
        <CardDescription>
          Verifică automat dacă toate configurațiile necesare sunt prezente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isRunning && (
          <Progress value={progress} className="w-full h-2" />
        )}
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-sm">{successCount} OK</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-sm">{warningCount} Atenționări</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm">{errorCount} Erori</span>
          </div>
        </div>

        <div className="space-y-3">
          {checks.map((check) => (
            <div 
              key={check.id} 
              className={`border rounded-lg p-4 ${
                check.status === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
                check.status === 'warning' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' :
                check.status === 'success' ? 'border-green-300 bg-green-50 dark:bg-green-950/20' :
                ''
              }`}
            >
              <div className="flex items-start gap-3">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{check.name}</span>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{check.description}</p>
                  {check.message && (
                    <p className={`text-sm mt-1 ${
                      check.status === 'error' ? 'text-red-600 font-medium' :
                      check.status === 'warning' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {check.message}
                    </p>
                  )}
                  {check.details && (
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block font-mono">
                      {check.details}
                    </code>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {errorCount > 0 && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Configurații lipsă</AlertTitle>
            <AlertDescription>
              Rezolvă erorile marcate cu roșu înainte de a continua migrarea.
            </AlertDescription>
          </Alert>
        )}

        {errorCount === 0 && warningCount > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Configurare parțială</AlertTitle>
            <AlertDescription>
              Aplicația poate funcționa, dar unele funcții (ex: Keycloak) nu sunt configurate.
            </AlertDescription>
          </Alert>
        )}

        {errorCount === 0 && warningCount === 0 && !isRunning && (
          <Alert className="border-green-300 bg-green-50 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700 dark:text-green-400">Gata pentru migrare!</AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-500">
              Toate configurațiile sunt corecte. Poți începe să folosești aplicația.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
