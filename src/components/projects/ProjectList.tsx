import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useProjectsStore, useConversationsStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FolderOpen,
  ChevronRight,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import type { Project } from '@/types';

const PROJECT_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

interface ProjectListProps {
  onConversationClick?: (conversationId: string) => void;
}

export function ProjectList({ onConversationClick }: ProjectListProps) {
  const { t } = useTranslation();
  const { projects, currentProjectId, setCurrentProject, addProject, updateProject, removeProject, getProjectsForUser } = useProjectsStore();
  const { conversations, getConversationsForUser } = useConversationsStore();
  const { user } = useAuthStore();
  
  // Filter projects and conversations for current user
  const userProjects = user ? getProjectsForUser(user.id) : [];
  const userConversations = user ? getConversationsForUser(user.id) : [];
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: PROJECT_COLORS[0],
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', color: PROJECT_COLORS[0] });
  };

  const handleCreate = () => {
    if (!formData.name.trim() || !user) return;

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      userId: user.id,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      conversationIds: [],
    };

    addProject(newProject);
    resetForm();
    setIsCreateOpen(false);
  };

  const handleEdit = () => {
    if (!editingProject || !formData.name.trim()) return;

    updateProject(editingProject.id, {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      color: formData.color,
      updatedAt: new Date().toISOString(),
    });

    setEditingProject(null);
    resetForm();
  };

  const handleDelete = (projectId: string) => {
    if (window.confirm(t('projects.deleteConfirm'))) {
      removeProject(projectId);
    }
  };

  const openEditDialog = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || PROJECT_COLORS[0],
    });
    setEditingProject(project);
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getProjectConversations = (projectId: string) => {
    return userConversations.filter((c) => c.projectId === projectId);
  };

  if (userProjects.length === 0) {
    return (
      <div className="px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-gray-400 hover:text-gray-200 hover:bg-white/5"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          {t('nav.newProject')}
        </Button>

        <CreateEditDialog
          isOpen={isCreateOpen}
          onClose={() => {
            setIsCreateOpen(false);
            resetForm();
          }}
          onSubmit={handleCreate}
          formData={formData}
          setFormData={setFormData}
          isEditing={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Create button */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 text-gray-400 hover:text-gray-200 hover:bg-white/5 mb-2"
        onClick={() => setIsCreateOpen(true)}
      >
        <Plus className="h-4 w-4" />
        {t('nav.newProject')}
      </Button>

      {/* Projects list */}
      {userProjects.map((project) => {
        const projectConversations = getProjectConversations(project.id);
        const isExpanded = expandedProjects.has(project.id);

        return (
          <Collapsible
            key={project.id}
            open={isExpanded}
            onOpenChange={() => toggleProject(project.id)}
          >
            <div className={cn(
              "group flex items-center gap-1 px-2 rounded-md transition-colors",
              currentProjectId === project.id && "bg-primary/20 ring-1 ring-primary/30"
            )}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 justify-start gap-2 h-9",
                    currentProjectId === project.id 
                      ? "text-primary-foreground hover:text-primary-foreground hover:bg-transparent" 
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  )}
                  onClick={() => setCurrentProject(currentProjectId === project.id ? null : project.id)}
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )}
                  />
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <span className="truncate text-sm">{project.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {projectConversations.length}
                  </span>
                </Button>
              </CollapsibleTrigger>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => openEditDialog(project)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" />
                    {t('projects.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDelete(project.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    {t('projects.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <CollapsibleContent>
              <div className="ml-6 mt-1 space-y-0.5">
                {projectConversations.length === 0 ? (
                  <p className="text-xs text-gray-500 px-3 py-2">
                    {t('projects.noConversations')}
                  </p>
                ) : (
                  projectConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => onConversationClick?.(conv.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 hover:bg-white/5 rounded-md transition-colors text-left"
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{conv.title}</span>
                    </button>
                  ))
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}

      {/* Create/Edit Dialog */}
      <CreateEditDialog
        isOpen={isCreateOpen || !!editingProject}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingProject(null);
          resetForm();
        }}
        onSubmit={editingProject ? handleEdit : handleCreate}
        formData={formData}
        setFormData={setFormData}
        isEditing={!!editingProject}
      />
    </div>
  );
}

interface CreateEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: { name: string; description: string; color: string };
  setFormData: (data: { name: string; description: string; color: string }) => void;
  isEditing: boolean;
}

function CreateEditDialog({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEditing,
}: CreateEditDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t('projects.edit') : t('projects.create')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">{t('projects.name')}</Label>
            <Input
              id="project-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('projects.namePlaceholder')}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">{t('projects.description')}</Label>
            <Textarea
              id="project-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('projects.descriptionPlaceholder')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('projects.color')}</Label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    "h-8 w-8 rounded-full transition-all",
                    formData.color === color
                      ? "ring-2 ring-offset-2 ring-primary"
                      : "hover:scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={!formData.name.trim()}>
            {isEditing ? t('common.save') : t('common.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
