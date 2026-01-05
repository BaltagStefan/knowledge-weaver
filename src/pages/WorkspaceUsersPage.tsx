import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/use-toast';
import { listUsers, createUser, assignUserToWorkspace, getWorkspaceMembers } from '@/db/repo';
import type { DBUser, UserRole } from '@/types/database';

export default function WorkspaceUsersPage() {
  const { t } = useTranslation();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user: currentUser, isAdmin } = useAuthStore();
  
  const [users, setUsers] = useState<DBUser[]>([]);
  const [workspaceUserIds, setWorkspaceUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'user_plus'>('user');
  const [isCreating, setIsCreating] = useState(false);

  // Check if current user is admin
  const isCurrentUserAdmin = isAdmin();

  useEffect(() => {
    if (workspaceId) {
      loadData();
    }
  }, [workspaceId]);

  const loadData = async () => {
    if (!workspaceId) return;
    
    setIsLoading(true);
    try {
      const [allUsers, members] = await Promise.all([
        listUsers(),
        getWorkspaceMembers(workspaceId),
      ]);
      
      const memberUserIds = members.map(m => m.id);
      setWorkspaceUserIds(memberUserIds);
      
      // Filter users to only show those in this workspace
      const workspaceUsers = allUsers.filter(u => memberUserIds.includes(u.id));
      setUsers(workspaceUsers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) return;

    setIsCreating(true);
    try {
      // User+ can only create 'user' role, Admin can create 'user' or 'user_plus'
      const roleToCreate = isCurrentUserAdmin ? newRole : 'user';
      
      // Create user WITHOUT assigning to any workspace
      const user = await createUser(newUsername.trim(), roleToCreate, newEmail.trim() || undefined, newPassword);
      
      // NOTE: User is NOT assigned to any workspace automatically
      // An admin must explicitly add them to a workspace later

      setShowCreateDialog(false);
      resetForm();

      toast({
        title: 'Utilizator creat',
        description: `${user.username} a fost creat. Trebuie atribuit manual la un workspace.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut crea utilizatorul.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setNewUsername('');
    setNewPassword('');
    setNewEmail('');
    setNewRole('user');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-600">Admin</Badge>;
      case 'user_plus':
        return <Badge className="bg-blue-600">User+</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="font-semibold">Utilizatori Workspace</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Adaugă Utilizator
        </Button>
      </header>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută utilizatori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Utilizatori în Workspace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Activi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter((u) => !u.isDisabled).length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  User+
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">
                  {users.filter((u) => u.role === 'user_plus').length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Info banner for User+ */}
          {!isCurrentUserAdmin && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Ca User+, poți adăuga doar utilizatori cu rolul "User" în acest workspace.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <ScrollArea className="flex-1">
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <Card key={user.id} className={user.isDisabled ? 'opacity-50' : ''}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{user.username}</p>
                          {getRoleBadge(user.role)}
                          {user.isDisabled && (
                            <Badge variant="outline" className="text-destructive">
                              Dezactivat
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {user.email || 'Fără email'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      Creat: {new Date(user.createdAt).toLocaleDateString('ro-RO')}
                    </span>
                  </CardContent>
                </Card>
              ))}

              {filteredUsers.length === 0 && !isLoading && (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? 'Niciun utilizator găsit.' : 'Niciun utilizator în acest workspace.'}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Utilizator Nou</DialogTitle>
            <DialogDescription>
              Creează un cont nou pentru un utilizator în acest workspace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nume utilizator *</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="john.doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Parolă *</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Parola utilizatorului"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email (opțional)</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            {/* Only show role selector for Admin */}
            {isCurrentUserAdmin ? (
              <div className="space-y-2">
                <Label>Rol</Label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as 'user' | 'user_plus')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="user_plus">User+</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  User+ poate încărca și gestiona fișiere PDF și poate modifica prompt-ul.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Rol</Label>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <Badge variant="secondary">User</Badge>
                  <span className="text-sm text-muted-foreground">
                    (singurul rol disponibil pentru User+)
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Anulează
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating || !newUsername.trim() || !newPassword.trim()}>
              {isCreating ? 'Se creează...' : 'Creează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
