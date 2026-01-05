import React, { useRef, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore, useUIStore } from '@/store/appStore';
import { streamChat, ApiException } from '@/api';
import { ChatMessage, TypingIndicator } from '@/components/chat/ChatMessage';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { StreamingStatus } from '@/components/chat/StreamingStatus';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { MessageSquarePlus, PanelRightOpen, PanelRightClose } from 'lucide-react';
import type { Message } from '@/types';

export default function ChatPage() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sourcesPanelOpen, toggleSourcesPanel } = useUIStore();
  
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
  } = useChatStore();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleSend = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: currentConversationId || 'temp',
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(userMessage);
    scrollToBottom();

    // Start streaming
    const abortController = new AbortController();
    startStreaming(abortController);

    // Stream response
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
          const assistantMessage: Message = {
            id: messageId,
            conversationId: currentConversationId || 'temp',
            role: 'assistant',
            content: finalText,
            createdAt: new Date().toISOString(),
          };
          addMessage(assistantMessage);
          stopStreaming();
          scrollToBottom();
        },
        onError: (error) => {
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
    currentConversationId, sourceSettings, selectedDocIds, ragSettings,
    addMessage, startStreaming, setStreamingStatus, appendStreamingText,
    stopStreaming, setCitations, scrollToBottom, t
  ]);

  const showEmptyState = messages.length === 0 && !isStreaming;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur shrink-0">
        <h1 className="font-semibold">{t('nav.chat')}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSourcesPanel}
          className="hidden md:flex"
        >
          {sourcesPanelOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>
      </header>

      {/* Messages area */}
      <ScrollArea className="flex-1">
        {showEmptyState ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
              <MessageSquarePlus className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{t('chat.emptyState')}</h2>
            <p className="text-muted-foreground max-w-md">
              {t('chat.emptyStateDescription')}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            
            {/* Streaming message */}
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
            
            {/* Status indicator */}
            <StreamingStatus />
            
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {/* Composer */}
      <ChatComposer onSend={handleSend} />
    </div>
  );
}
