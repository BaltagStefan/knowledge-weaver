import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, MoreHorizontal, Shield, UserPlus, Ban, KeyRound } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { listUsers, listWorkspaces, createUser, assignUserToWorkspace, disableUser } from '@/db/repo';
import type { DBUser, DBWorkspace, UserRole } from '@/types/database';

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<DBUser[]>([]);
  const [workspaces, setWorkspaces] = useState<DBWorkspace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create form state
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'user_plus'>('user');
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, workspacesData] = await Promise.all([
        listUsers(),
        listWorkspaces(),
      ]);
      setUsers(usersData);
      setWorkspaces(workspacesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim()) return;

    setIsCreating(true);
    try {
      const user = await createUser(newUsername.trim(), newRole, newEmail.trim() || undefined);
      
      // Assign to selected workspaces
      for (const workspaceId of selectedWorkspaces) {
        await assignUserToWorkspace(user.id, workspaceId);
      }

      setUsers((prev) => [...prev, user]);
      setShowCreateDialog(false);
      resetForm();

      toast({
        title: 'Utilizator creat',
        description: `${user.username} a fost creat cu succes.`,
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

  const handleDisableUser = async (user: DBUser) => {
    try {
      await disableUser(user.id);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isDisabled: true } : u))
      );
      toast({
        title: 'Utilizator dezactivat',
        description: `${user.username} a fost dezactivat.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut dezactiva utilizatorul.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setNewUsername('');
    setNewEmail('');
    setNewRole('user');
    setSelectedWorkspaces([]);
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
          <h1 className="font-semibold">Gestionare Utilizatori</h1>
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
                  Total Utilizatori
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

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Creat: {new Date(user.createdAt).toLocaleDateString('ro-RO')}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Shield className="h-4 w-4 mr-2" />
                            Schimbă rolul
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <KeyRound className="h-4 w-4 mr-2" />
                            Resetează parola
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDisableUser(user)}
                            disabled={user.isDisabled}
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Dezactivează
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
              Creează un cont nou pentru un utilizator.
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
              <Label htmlFor="email">Email (opțional)</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

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
                User+ poate încărca și gestiona fișiere PDF.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Workspace-uri</Label>
              <div className="space-y-2 max-h-32 overflow-auto">
                {workspaces.map((ws) => (
                  <div key={ws.id} className="flex items-center gap-2">
                    <Checkbox
                      id={ws.id}
                      checked={selectedWorkspaces.includes(ws.id)}
                      onCheckedChange={(checked) => {
                        setSelectedWorkspaces((prev) =>
                          checked
                            ? [...prev, ws.id]
                            : prev.filter((id) => id !== ws.id)
                        );
                      }}
                    />
                    <Label htmlFor={ws.id} className="font-normal cursor-pointer">
                      {ws.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Anulează
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating || !newUsername.trim()}>
              {isCreating ? 'Se creează...' : 'Creează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
