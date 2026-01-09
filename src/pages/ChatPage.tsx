import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore, useUIStore, useConversationsStore, useProjectsStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useFilesStore } from '@/store/filesStore';
import { streamChat } from '@/api';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { StreamingStatus } from '@/components/chat/StreamingStatus';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { ScrollToBottom } from '@/components/chat/ScrollToBottom';
import { NoWorkspaceMessage } from '@/components/workspace/NoWorkspaceMessage';
import { ExportButton } from '@/components/export';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { MessageSquarePlus, PanelRightOpen, PanelRightClose, Sparkles } from 'lucide-react';
import type { Message } from '@/types';
import { getFilesWithIndexState } from '@/db/repo';
import { useParams } from 'react-router-dom';

export default function ChatPage() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { sourcesPanelOpen, toggleSourcesPanel } = useUIStore();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const {
    messages,
    isStreaming,
    streamingText,
    currentConversationId,
    sourceSettings,
    selectedDocIds,
    ragSettings,
    addMessage,
    startStreaming,
    setStreamingStatus,
    appendStreamingText,
    stopStreaming,
    setCitations,
    setCurrentConversation,
  } = useChatStore();

  const { currentProjectId, projects, getProjectsForUser } = useProjectsStore();
  const { addConversation, getConversationsForUser, updateConversation } = useConversationsStore();
  const { user } = useAuthStore();
  const { workspaces, currentWorkspaceId } = useWorkspaceStore();
  const { setFiles } = useFilesStore();
  const { workspaceId } = useParams<{ workspaceId?: string }>();
  const effectiveWorkspaceId = workspaceId || currentWorkspaceId || null;

  const userProjects = user ? getProjectsForUser(user.id) : [];
  
  // Check if user has any workspaces assigned
  const hasWorkspace = user?.workspaceIds && user.workspaceIds.length > 0;
  const currentProject = userProjects.find(p => p.id === currentProjectId);

  useEffect(() => {
    if (!effectiveWorkspaceId) return;
    let cancelled = false;

    const loadFiles = async () => {
      try {
        const localFiles = await getFilesWithIndexState(effectiveWorkspaceId);
        if (!cancelled) {
          setFiles(localFiles);
        }
      } catch (error) {
        console.warn('Failed to load files for chat:', error);
      }
    };

    loadFiles();
    return () => {
      cancelled = true;
    };
  }, [effectiveWorkspaceId, setFiles]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  // Track scroll position for scroll-to-bottom button
  useEffect(() => {
    const scrollArea = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollArea) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 200;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const handleSend = useCallback(async (content: string) => {
    // Create new conversation if none exists
    let convId = currentConversationId;
    if (!convId) {
      convId = `conv-${Date.now()}`;
      const newConversation = {
        id: convId,
        userId: user?.id || '',
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messageCount: 1, // Start with 1 for the user message
        projectId: currentProjectId || undefined,
      };
      addConversation(newConversation);
      setCurrentConversation(convId);
    } else {
      // Update existing conversation's messageCount and timestamp
      const existingConv = getConversationsForUser(user?.id || '').find(c => c.id === convId);
      if (existingConv) {
        updateConversation(convId, {
          messageCount: existingConv.messageCount + 1,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: convId,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);
    scrollToBottom();

    // Show typing indicator briefly before streaming starts
    setIsTyping(true);

    const abortController = new AbortController();
    startStreaming(abortController);

    streamChat(
      {
        conversationId: currentConversationId || undefined,
        message: content,
        source: {
          usePdfs: sourceSettings.usePdfs,
          useMemory: sourceSettings.useMemory,
          docIds: selectedDocIds.length > 0 ? selectedDocIds : undefined,
        },
        rag: ragSettings,
      },
      {
        onToken: (text) => {
          setIsTyping(false);
          appendStreamingText(text);
          scrollToBottom();
        },
        onCitations: (event) => {
          setCitations(event.items);
        },
        onStatus: (status) => {
          setStreamingStatus(status);
        },
        onDone: (messageId, finalText) => {
          setIsTyping(false);
          const assistantMessage: Message = {
            id: messageId,
            conversationId: convId,
            role: 'assistant',
            content: finalText,
            createdAt: new Date().toISOString(),
          };
          addMessage(assistantMessage);
          
          // Update conversation messageCount for assistant response
          const existingConv = getConversationsForUser(user?.id || '').find(c => c.id === convId);
          if (existingConv) {
            updateConversation(convId, {
              messageCount: existingConv.messageCount + 1,
              updatedAt: new Date().toISOString(),
            });
          }
          
          stopStreaming();
          scrollToBottom();
        },
        onError: (error) => {
          setIsTyping(false);
          stopStreaming();
          
          if (error.status === 429) {
            toast({
              title: t('errors.rateLimited'),
              description: `${t('errors.rateLimited')} ${error.retryAfter || 60} ${t('errors.seconds')}`,
              variant: 'destructive',
            });
          } else {
            toast({
              title: t('common.error'),
              description: error.message,
              variant: 'destructive',
            });
          }
        },
      },
      abortController
    );
  }, [
    currentConversationId, currentProjectId, sourceSettings, selectedDocIds, ragSettings,
    addMessage, addConversation, setCurrentConversation, startStreaming, setStreamingStatus, 
    appendStreamingText, stopStreaming, setCitations, scrollToBottom, t
  ]);

  const handleRegenerate = useCallback(() => {
    // Get last user message and resend
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      handleSend(lastUserMessage.content);
    }
  }, [messages, handleSend]);

  const showEmptyState = messages.length === 0 && !isStreaming;
  const lastAssistantMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') return messages[i].id;
    }
    return null;
  }, [messages]);

  const renderedMessages = useMemo(
    () =>
      messages.map((msg) => (
        <ChatMessage
          key={msg.id}
          message={msg}
          onRegenerate={msg.id === lastAssistantMessageId ? handleRegenerate : undefined}
        />
      )),
    [messages, lastAssistantMessageId, handleRegenerate]
  );

  // If user has no workspace, show the no-workspace message
  if (!hasWorkspace) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-background">
        <header className="flex items-center justify-between h-14 px-6 border-b bg-white dark:bg-background shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h1 className="font-medium text-foreground">{t('nav.chat')}</h1>
          </div>
        </header>
        <NoWorkspaceMessage />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-background">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 border-b bg-white dark:bg-background shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h1 className="font-medium text-foreground">{t('nav.chat')}</h1>
          {currentProject && (
            <div className="flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-muted/50 border">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: currentProject.color }}
              />
              <span className="text-xs font-medium text-muted-foreground">
                {currentProject.name}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && <ExportButton />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSourcesPanel}
            className="hidden lg:flex hover:bg-muted transition-colors"
          >
            {sourcesPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Messages area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 bg-[#f7f7f8] dark:bg-muted/20">
        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[500px] p-8 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 animate-bounce-subtle">
              <MessageSquarePlus className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold mb-3 text-foreground">{t('chat.emptyState')}</h2>
            <p className="text-muted-foreground max-w-md text-base leading-relaxed">
              {t('chat.emptyStateDescription')}
            </p>
          </div>
        ) : (
          <div>
            {renderedMessages}
            
            {isTyping && !streamingText && (
              <TypingIndicator />
            )}
            
            {isStreaming && streamingText && (
              <ChatMessage
                message={{
                  id: 'streaming',
                  conversationId: '',
                  role: 'assistant',
                  content: streamingText,
                  createdAt: new Date().toISOString(),
                }}
                isStreaming
              />
            )}
            
            <StreamingStatus />
            
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Scroll to bottom button */}
      <ScrollToBottom 
        visible={showScrollButton} 
        onClick={scrollToBottom}
      />

      {/* Composer */}
      <ChatComposer onSend={handleSend} />
    </div>
  );
}
