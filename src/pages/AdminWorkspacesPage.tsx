import React, { useState, useEffect, useRef } from 'react';
import { Building2, Plus, Search, MoreHorizontal, Users, Settings, Trash2, X, UserPlus, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  listWorkspaces,
  listUsers,
  createWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  assignUserToWorkspace,
  removeUserFromWorkspace,
  createUser,
} from '@/db/repo';
import type { DBWorkspace, DBUser, UserRole } from '@/types/database';

export default function AdminWorkspacesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<DBWorkspace[]>([]);
  const [allUsers, setAllUsers] = useState<DBUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<DBWorkspace | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<DBUser[]>([]);
  
  // Create workspace form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Create user form state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'user_plus'>('user');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Drag state
  const [draggedUser, setDraggedUser] = useState<DBUser | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [workspacesData, usersData] = await Promise.all([
        listWorkspaces(),
        listUsers(),
      ]);
      setWorkspaces(workspacesData);
      setAllUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      const workspace = await createWorkspace(newName.trim(), newDescription.trim() || undefined);
      setWorkspaces((prev) => [...prev, workspace]);
      setShowCreateDialog(false);
      setNewName('');
      setNewDescription('');

      toast({
        title: 'Workspace creat',
        description: `${workspace.name} a fost creat cu succes.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut crea workspace-ul.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!selectedWorkspace) return;

    try {
      await deleteWorkspace(selectedWorkspace.id);
      setWorkspaces((prev) => prev.filter((w) => w.id !== selectedWorkspace.id));
      setShowDeleteDialog(false);
      setSelectedWorkspace(null);

      toast({
        title: 'Workspace șters',
        description: `${selectedWorkspace.name} a fost șters.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge workspace-ul.',
        variant: 'destructive',
      });
    }
  };

  const handleSelectWorkspace = async (workspace: DBWorkspace) => {
    if (selectedWorkspace?.id === workspace.id) {
      setSelectedWorkspace(null);
      setWorkspaceMembers([]);
      return;
    }
    
    setSelectedWorkspace(workspace);
    try {
      const members = await getWorkspaceMembers(workspace.id);
      setWorkspaceMembers(members);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleRemoveMember = async (user: DBUser) => {
    if (!selectedWorkspace) return;

    try {
      await removeUserFromWorkspace(user.id, selectedWorkspace.id);
      setWorkspaceMembers((prev) => prev.filter((m) => m.id !== user.id));
      toast({
        title: 'Membru eliminat',
        description: `${user.username} a fost eliminat din ${selectedWorkspace.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut elimina membrul.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim() || !selectedWorkspace) return;

    setIsCreatingUser(true);
    try {
      const user = await createUser(newUsername.trim(), newRole, newEmail.trim() || undefined, newPassword);
      await assignUserToWorkspace(user.id, selectedWorkspace.id);
      
      setAllUsers((prev) => [...prev, user]);
      setWorkspaceMembers((prev) => [...prev, user]);
      setShowCreateUserDialog(false);
      resetUserForm();

      toast({
        title: 'Utilizator creat',
        description: `${user.username} a fost creat și adăugat în ${selectedWorkspace.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut crea utilizatorul.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  const resetUserForm = () => {
    setNewUsername('');
    setNewPassword('');
    setNewEmail('');
    setNewRole('user');
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, user: DBUser) => {
    setDraggedUser(user);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (!draggedUser || !selectedWorkspace) return;
    
    // Check if already a member
    if (workspaceMembers.some(m => m.id === draggedUser.id)) {
      toast({
        title: 'Info',
        description: `${draggedUser.username} este deja membru.`,
      });
      setDraggedUser(null);
      return;
    }

    try {
      await assignUserToWorkspace(draggedUser.id, selectedWorkspace.id);
      setWorkspaceMembers((prev) => [...prev, draggedUser]);
      toast({
        title: 'Membru adăugat',
        description: `${draggedUser.username} a fost adăugat în ${selectedWorkspace.name}.`,
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut adăuga membrul.',
        variant: 'destructive',
      });
    }
    
    setDraggedUser(null);
  };

  const handleDragEnd = () => {
    setDraggedUser(null);
    setIsDraggingOver(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-600 text-white">Admin</Badge>;
      case 'user_plus':
        return <Badge className="bg-blue-600 text-white">User+</Badge>;
      default:
        return <Badge variant="secondary">User</Badge>;
    }
  };

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Users not in selected workspace
  const availableUsers = selectedWorkspace 
    ? allUsers.filter(u => !workspaceMembers.some(m => m.id === u.id))
    : [];

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h1 className="font-semibold">Gestionare Workspaces</h1>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Creează Workspace
        </Button>
      </header>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="h-full flex gap-6">
          {/* Left: Workspaces list */}
          <div className="w-80 flex flex-col gap-4 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută workspace-uri..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-2">
                {filteredWorkspaces.map((workspace) => (
                  <Card 
                    key={workspace.id} 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selectedWorkspace?.id === workspace.id && "ring-2 ring-primary"
                    )}
                    onClick={() => handleSelectWorkspace(workspace)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">{workspace.name}</CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/w/${workspace.id}/settings/prompt`)}>
                              <Settings className="h-4 w-4 mr-2" />
                              Setări
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => {
                                setSelectedWorkspace(workspace);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Șterge
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-muted-foreground">
                        Creat: {new Date(workspace.createdAt).toLocaleDateString('ro-RO')}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                {filteredWorkspaces.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Niciun workspace</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Selected workspace details with drag & drop */}
          <div className="flex-1 min-w-0">
            {selectedWorkspace ? (
              <Card className="h-full flex flex-col">
                <CardHeader className="border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        {selectedWorkspace.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {selectedWorkspace.description || 'Fără descriere'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={() => setShowCreateUserDialog(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adaugă User Nou
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => {
                          setSelectedWorkspace(null);
                          setWorkspaceMembers([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <div className="flex-1 flex min-h-0">
                  {/* Members list */}
                  <div className="flex-1 p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-sm">
                        Membri ({workspaceMembers.length})
                      </h3>
                    </div>
                    
                    <div
                      className={cn(
                        "flex-1 rounded-lg border-2 border-dashed p-4 transition-colors overflow-auto",
                        isDraggingOver ? "border-primary bg-primary/5" : "border-muted"
                      )}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      {workspaceMembers.length > 0 ? (
                        <div className="space-y-2">
                          {workspaceMembers.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between p-3 rounded-lg bg-card border hover:shadow-sm transition-shadow"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-sm font-medium text-primary">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{user.username}</p>
                                  <div className="flex items-center gap-2">
                                    {getRoleBadge(user.role)}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveMember(user)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-center">
                          <div>
                            <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Trage useri aici pentru a-i adăuga
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Available users for drag */}
                  <div className="w-72 border-l p-4 flex flex-col shrink-0">
                    <h3 className="font-medium text-sm mb-3">
                      Useri disponibili ({availableUsers.length})
                    </h3>
                    
                    <ScrollArea className="flex-1">
                      <div className="space-y-2 pr-2">
                        {availableUsers.map((user) => (
                          <div
                            key={user.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, user)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing hover:shadow-sm transition-all",
                              draggedUser?.id === user.id && "opacity-50"
                            )}
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <span className="text-xs font-medium text-primary">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate">{user.username}</p>
                              {getRoleBadge(user.role)}
                            </div>
                          </div>
                        ))}

                        {availableUsers.length === 0 && (
                          <div className="text-center py-6">
                            <p className="text-sm text-muted-foreground">
                              Toți userii sunt adăugați
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Building2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-1">
                    Selectează un workspace
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Click pe un workspace din stânga pentru a gestiona membrii
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Workspace Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creează Workspace Nou</DialogTitle>
            <DialogDescription>
              Un workspace organizează utilizatori, fișiere și setări.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ws-name">Nume *</Label>
              <Input
                id="ws-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Numele workspace-ului"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ws-desc">Descriere (opțional)</Label>
              <Textarea
                id="ws-desc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descrierea workspace-ului"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Anulează
            </Button>
            <Button onClick={handleCreateWorkspace} disabled={isCreating || !newName.trim()}>
              {isCreating ? 'Se creează...' : 'Creează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Utilizator Nou</DialogTitle>
            <DialogDescription>
              Creează un utilizator nou și îl adaugă automat în {selectedWorkspace?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-username">Nume utilizator *</Label>
              <Input
                id="new-username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="ex: john.doe"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Parolă *</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Parola utilizatorului"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">Email (opțional)</Label>
              <Input
                id="new-email"
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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateUserDialog(false);
              resetUserForm();
            }}>
              Anulează
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={isCreatingUser || !newUsername.trim() || !newPassword.trim()}
            >
              {isCreatingUser ? 'Se creează...' : 'Creează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge workspace-ul?</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi „{selectedWorkspace?.name}"? Toate fișierele
              și setările asociate vor fi șterse. Această acțiune nu poate fi anulată.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWorkspace}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}