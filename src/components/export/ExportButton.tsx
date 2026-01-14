import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useChatStore, useConversationsStore, useProjectsStore } from '@/store/appStore';
import { exportToMarkdown, exportToPDF, downloadFile, sanitizeFilename } from '@/lib/export';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileType } from 'lucide-react';
import type { Message } from '@/types';

interface ExportButtonProps {
  conversationId?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

const EMPTY_MESSAGES: Message[] = [];

export function ExportButton({ conversationId, variant = 'ghost', size = 'icon' }: ExportButtonProps) {
  const { t } = useTranslation();
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const exportMessages = useChatStore((state) => {
    const targetConversationId = conversationId || state.currentConversationId;
    if (!targetConversationId) return EMPTY_MESSAGES;
    return state.messagesById[targetConversationId] || EMPTY_MESSAGES;
  });
  const { conversations } = useConversationsStore();
  const { projects } = useProjectsStore();

  const targetConversationId = conversationId || currentConversationId;
  const conversation = conversations.find((c) => c.id === targetConversationId);
  const project = conversation?.projectId
    ? projects.find((p) => p.id === conversation.projectId)
    : undefined;

  // Use current messages if no specific conversation, otherwise would need to fetch

  const handleExportMarkdown = () => {
    if (!conversation) {
      toast({
        description: t('export.error'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const markdown = exportToMarkdown(conversation, exportMessages, project);
      const filename = `${sanitizeFilename(conversation.title)}.md`;
      downloadFile(markdown, filename, 'text/markdown');
      toast({
        description: t('export.success'),
      });
    } catch (error) {
      toast({
        description: t('export.error'),
        variant: 'destructive',
      });
    }
  };

  const handleExportPDF = () => {
    if (!conversation) {
      toast({
        description: t('export.error'),
        variant: 'destructive',
      });
      return;
    }

    try {
      exportToPDF(conversation, exportMessages, project);
      toast({
        description: t('export.success'),
      });
    } catch (error) {
      toast({
        description: t('export.error'),
        variant: 'destructive',
      });
    }
  };

  const isDisabled = !conversation || exportMessages.length === 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isDisabled}
          className="text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-2">{t('export.title')}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportMarkdown}>
          <FileText className="h-4 w-4 mr-2" />
          {t('export.markdown')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileType className="h-4 w-4 mr-2" />
          {t('export.pdf')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
