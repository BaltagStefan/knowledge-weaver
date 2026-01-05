import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronsUpDown, Plus, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/hooks/useTranslation';
import { createWorkspace } from '@/db/repo';
import { toast } from '@/hooks/use-toast';

export function WorkspaceSwitcher() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { workspaces, currentWorkspace, currentWorkspaceId, setCurrentWorkspace, addWorkspace } =
    useWorkspaceStore();
  const { isAdmin, user } = useAuthStore();

  // Filter workspaces to only show those the user is assigned to
  // Admins can see all workspaces
  const userWorkspaces = isAdmin()
    ? workspaces
    : workspaces.filter((ws) => user?.workspaceIds?.includes(ws.id));

  const handleSelect = (workspaceId: string) => {
    setCurrentWorkspace(workspaceId);
    setOpen(false);
    navigate(`/w/${workspaceId}/chat`);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    setIsCreating(true);
    try {
      const workspace = await createWorkspace(newName.trim(), newDescription.trim() || undefined);
      addWorkspace(workspace);
      setCurrentWorkspace(workspace.id);
      setShowCreateDialog(false);
      setNewName('');
      setNewDescription('');
      toast({
        title: t('common.success'),
        description: `Workspace "${workspace.name}" a fost creat.`,
      });
      navigate(`/w/${workspace.id}/chat`);
    } catch (error) {
      toast({
        title: t('common.error'),
        description: 'Nu s-a putut crea workspace-ul.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Selectează workspace"
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">
                {currentWorkspace?.name || 'Selectează workspace'}
              </span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[240px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Caută workspace..." />
            <CommandList>
              <CommandEmpty>Niciun workspace găsit.</CommandEmpty>
              <CommandGroup heading="Workspaces">
                {userWorkspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    value={workspace.name}
                    onSelect={() => handleSelect(workspace.id)}
                    className="cursor-pointer"
                  >
                    <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{workspace.name}</span>
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        currentWorkspaceId === workspace.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
              {isAdmin() && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setOpen(false);
                        setShowCreateDialog(true);
                      }}
                      className="cursor-pointer"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Creează workspace nou
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Creează workspace nou</DialogTitle>
            <DialogDescription>
              Adaugă un nou workspace pentru organizarea proiectelor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nume</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Numele workspace-ului"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descriere (opțional)</Label>
              <Textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Descrierea workspace-ului"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Anulează
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !newName.trim()}>
              {isCreating ? 'Se creează...' : 'Creează'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
