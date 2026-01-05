import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, MoreHorizontal, Users, Settings, Trash2 } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  listWorkspaces,
  listUsers,
  createWorkspace,
  deleteWorkspace,
  getWorkspaceMembers,
  assignUserToWorkspace,
  removeUserFromWorkspace,
} from '@/db/repo';
import type { DBWorkspace, DBUser } from '@/types/database';

export default function AdminWorkspacesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<DBWorkspace[]>([]);
  const [allUsers, setAllUsers] = useState<DBUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showMembersDialog, setShowMembersDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<DBWorkspace | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<DBUser[]>([]);
  
  // Create form state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  const handleOpenMembers = async (workspace: DBWorkspace) => {
    setSelectedWorkspace(workspace);
    try {
      const members = await getWorkspaceMembers(workspace.id);
      setWorkspaceMembers(members);
      setShowMembersDialog(true);
    } catch (error) {
      console.error('Failed to load members:', error);
    }
  };

  const handleToggleMember = async (user: DBUser, isMember: boolean) => {
    if (!selectedWorkspace) return;

    try {
      if (isMember) {
        await removeUserFromWorkspace(user.id, selectedWorkspace.id);
        setWorkspaceMembers((prev) => prev.filter((m) => m.id !== user.id));
      } else {
        await assignUserToWorkspace(user.id, selectedWorkspace.id);
        setWorkspaceMembers((prev) => [...prev, user]);
      }
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza membership-ul.',
        variant: 'destructive',
      });
    }
  };

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="max-w-4xl mx-auto h-full flex flex-col gap-6">
          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Caută workspace-uri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Workspaces Grid */}
          <ScrollArea className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkspaces.map((workspace) => (
                <Card key={workspace.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{workspace.name}</CardTitle>
                          <CardDescription className="text-xs">
                            Creat: {new Date(workspace.createdAt).toLocaleDateString('ro-RO')}
                          </CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenMembers(workspace)}>
                            <Users className="h-4 w-4 mr-2" />
                            Gestionează membri
                          </DropdownMenuItem>
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
                  <CardContent>
                    {workspace.description && (
                      <p className="text-sm text-muted-foreground mb-3">{workspace.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0"
                        onClick={() => handleOpenMembers(workspace)}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        Vezi membri
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredWorkspaces.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">
                    {workspaces.length === 0
                      ? 'Niciun workspace creat'
                      : 'Niciun workspace găsit'}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Create Dialog */}
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

      {/* Members Dialog */}
      <Dialog open={showMembersDialog} onOpenChange={setShowMembersDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Membri - {selectedWorkspace?.name}</DialogTitle>
            <DialogDescription>
              Gestionează utilizatorii din acest workspace.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[300px] py-4">
            <div className="space-y-2">
              {allUsers.map((user) => {
                const isMember = workspaceMembers.some((m) => m.id === user.id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isMember}
                        onCheckedChange={() => handleToggleMember(user, isMember)}
                      />
                      <div>
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    {isMember && <Badge variant="secondary">Membru</Badge>}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button onClick={() => setShowMembersDialog(false)}>Închide</Button>
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
