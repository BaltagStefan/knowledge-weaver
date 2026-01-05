import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';
import { getUserByUsername, setCurrentUser, getUserWorkspaces } from '@/db/repo';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { toast } from '@/hooks/use-toast';
import type { AuthUser } from '@/types/auth';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const { setCurrentWorkspace } = useWorkspaceStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const user = await getUserByUsername(username);
      
      if (!user) {
        toast({
          title: t('common.error'),
          description: t('auth.invalidCredentials'),
          variant: 'destructive',
        });
        setIsLoggingIn(false);
        return;
      }

      // Simple password check (in demo mode, password === username or stored hash)
      const isValidPassword = user.passwordHash === password || username === password;
      
      if (!isValidPassword) {
        toast({
          title: t('common.error'),
          description: t('auth.invalidCredentials'),
          variant: 'destructive',
        });
        setIsLoggingIn(false);
        return;
      }

      if (user.isDisabled) {
        toast({
          title: t('common.error'),
          description: t('auth.accountDisabled'),
          variant: 'destructive',
        });
        setIsLoggingIn(false);
        return;
      }

      // Set current user in cache
      await setCurrentUser(user.id);

      // Get user workspaces
      const workspaceIds = await getUserWorkspaces(user.id);

      // Create auth user
      const authUser: AuthUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        workspaceIds,
      };

      setUser(authUser);

      // Set first workspace as current
      if (workspaceIds.length > 0) {
        setCurrentWorkspace(workspaceIds[0]);
        navigate(`/w/${workspaceIds[0]}/chat`);
      } else {
        navigate('/');
      }

      toast({
        title: t('common.success'),
        description: t('auth.loginSuccess'),
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: t('common.error'),
        description: t('auth.loginError'),
        variant: 'destructive',
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
            </div>
          </div>
          <CardTitle>{t('auth.loginTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t('auth.username')}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t('auth.usernamePlaceholder')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn || !username || !password}>
              {isLoggingIn && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('auth.login')}
            </Button>
          </form>
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">{t('auth.demoCredentials')}:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li><strong>Admin:</strong> admin / admin</li>
              <li><strong>User+:</strong> user+ / user+</li>
              <li><strong>User:</strong> user / user</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}