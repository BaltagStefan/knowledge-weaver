import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useConversationsStore, useChatStore, useProjectsStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { History, MessageSquare, Trash2, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const { getConversationsForUser, removeConversation } = useConversationsStore();
  const { setCurrentConversation } = useChatStore();
  const { getProjectsForUser } = useProjectsStore();

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

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('conversations.title')}</h1>
        <Badge variant="secondary">{userConversations.length} conversații</Badge>
      </header>
      
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {userConversations.map((conversation) => {
            const projectName = getProjectName(conversation.projectId);
            
            return (
              <Card 
                key={conversation.id} 
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenConversation(conversation.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <MessageSquare className="h-5 w-5 text-primary" />
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
          })}
        </div>
      </ScrollArea>
    </div>
  );
}