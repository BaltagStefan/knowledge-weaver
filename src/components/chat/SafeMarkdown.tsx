import React, { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { getSafeLinkProps } from '@/lib/validation';
import { Check, Copy } from 'lucide-react';

interface SafeMarkdownProps {
  content: string;
  className?: string;
}

// Custom sanitization schema - very restrictive
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    'p', 'br', 'strong', 'em', 'b', 'i', 'u',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'blockquote',
    'pre', 'code',
    'a',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'hr',
  ],
  attributes: {
    ...defaultSchema.attributes,
    a: ['href', 'title'],
    code: ['className'],
    pre: ['className'],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
  },
};

// Code block component with copy functionality
const CodeBlock = memo(function CodeBlock({ 
  children, 
  className 
}: { 
  children: string; 
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();
  
  const language = className?.replace('language-', '') || 'text';
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="code-block relative group my-3">
      {/* Language label */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b text-xs text-muted-foreground">
        <span className="font-mono">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              {t('common.copied')}
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              {t('common.copy')}
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
});

// Safe link component
const SafeLink = memo(function SafeLink({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  if (!href) return <>{children}</>;
  
  const linkProps = getSafeLinkProps(href);
  
  return (
    <a
      {...linkProps}
      className="text-accent hover:underline"
    >
      {children}
    </a>
  );
});

export const SafeMarkdown = memo(function SafeMarkdown({ 
  content, 
  className 
}: SafeMarkdownProps) {
  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, sanitizeSchema]]}
        skipHtml={true}
        components={{
          // Safe link handling
          a: ({ href, children }) => (
            <SafeLink href={href}>{children}</SafeLink>
          ),
          
          // Code blocks
          pre: ({ children }) => <>{children}</>,
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            const content = String(children).replace(/\n$/, '');
            
            if (isInline) {
              return (
                <code 
                  className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm"
                  {...props}
                >
                  {content}
                </code>
              );
            }
            
            return <CodeBlock className={className}>{content}</CodeBlock>;
          },
          
          // Headings with proper styling
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-3">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
          ),
          
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-accent pl-4 italic my-3 text-muted-foreground">
              {children}
            </blockquote>
          ),
          
          // Table
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 bg-muted text-left font-medium">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
