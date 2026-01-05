import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useConversationsStore, useChatStore, useProjectsStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { History, MessageSquare, Trash2, FolderOpen, GripVertical, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

export default function ConversationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const { user } = useAuthStore();
  const { getConversationsForUser, removeConversation, updateConversation, conversations } = useConversationsStore();
  const { setCurrentConversation } = useChatStore();
  const { getProjectsForUser } = useProjectsStore();

  const [draggedConversation, setDraggedConversation] = useState<string | null>(null);
  const [dragOverProject, setDragOverProject] = useState<string | null>(null);

  const userConversations = user ? getConversationsForUser(user.id) : [];
  const userProjects = user ? getProjectsForUser(user.id) : [];

  const handleOpenConversation = (conversationId: string) => {
    setCurrentConversation(conversationId);
    navigate(`/w/${workspaceId}/chat`);
  };

  const handleDeleteConversation = (conversationId: string) => {
    removeConversation(conversationId);
    toast({
      title: t('common.success'),
      description: 'Conversația a fost ștearsă.',
    });
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const project = userProjects.find(p => p.id === projectId);
    return project?.name;
  };

  const handleDragStart = (e: React.DragEvent, conversationId: string) => {
    e.stopPropagation();
    setDraggedConversation(conversationId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedConversation(null);
    setDragOverProject(null);
  };

  const handleDragOver = (e: React.DragEvent, projectId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverProject(projectId);
  };

  const handleDrop = (e: React.DragEvent, targetProjectId: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedConversation) {
      const conversation = conversations.find(c => c.id === draggedConversation);
      if (conversation && conversation.projectId !== targetProjectId) {
        updateConversation(draggedConversation, { projectId: targetProjectId || undefined });
        toast({
          title: t('common.success'),
          description: targetProjectId 
            ? `Conversația a fost mutată în proiectul "${getProjectName(targetProjectId)}".`
            : 'Conversația a fost scoasă din proiect.',
        });
      }
    }
    
    setDraggedConversation(null);
    setDragOverProject(null);
  };

  // Group conversations by project
  const conversationsByProject = userProjects.map(project => ({
    project,
    conversations: userConversations.filter(c => c.projectId === project.id)
  }));

  const unassignedConversations = userConversations.filter(c => !c.projectId);

  if (userConversations.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <header className="flex items-center h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
          <h1 className="font-semibold">{t('conversations.title')}</h1>
        </header>
        
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <History className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-lg font-medium mb-2">{t('conversations.noConversations')}</h2>
          <p className="text-muted-foreground">{t('conversations.noConversationsDescription')}</p>
        </div>
      </div>
    );
  }

  const ConversationCard = ({ conversation }: { conversation: typeof userConversations[0] }) => {
    const projectName = getProjectName(conversation.projectId);
    
    return (
      <Card 
        key={conversation.id} 
        draggable
        onDragStart={(e) => handleDragStart(e, conversation.id)}
        onDragEnd={handleDragEnd}
        className={`group hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
          draggedConversation === conversation.id ? 'opacity-50 scale-95' : ''
        }`}
        onClick={() => handleOpenConversation(conversation.id)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-medium truncate">{conversation.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {new Date(conversation.updatedAt).toLocaleDateString('ro-RO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    • {conversation.messageCount} {t('conversations.messages')}
                  </span>
                </div>
                {projectName && (
                  <div className="flex items-center gap-1 mt-2">
                    <FolderOpen className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{projectName}</span>
                  </div>
                )}
              </div>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Șterge conversația?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Această acțiune nu poate fi anulată. Conversația va fi ștearsă permanent.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteConversation(conversation.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Șterge
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('conversations.title')}</h1>
        <Badge variant="secondary">{userConversations.length} conversații</Badge>
      </header>
      
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Projects with conversations */}
          {conversationsByProject.map(({ project, conversations }) => (
            <Card 
              key={project.id}
              className={`transition-all ${
                dragOverProject === project.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, project.id)}
              onDragLeave={() => setDragOverProject(null)}
              onDrop={(e) => handleDrop(e, project.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  {project.name}
                  <Badge variant="outline" className="ml-auto">
                    {conversations.length} conversații
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                    Trage o conversație aici pentru a o adăuga
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <ConversationCard key={conversation.id} conversation={conversation} />
                  ))
                )}
              </CardContent>
            </Card>
          ))}

          {/* Unassigned conversations */}
          <Card 
            className={`transition-all ${
              dragOverProject === 'unassigned' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, 'unassigned')}
            onDragLeave={() => setDragOverProject(null)}
            onDrop={(e) => handleDrop(e, null)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Inbox className="h-5 w-5 text-muted-foreground" />
                Fără proiect
                <Badge variant="outline" className="ml-auto">
                  {unassignedConversations.length} conversații
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unassignedConversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                  Trage o conversație aici pentru a o scoate din proiect
                </div>
              ) : (
                unassignedConversations.map((conversation) => (
                  <ConversationCard key={conversation.id} conversation={conversation} />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
