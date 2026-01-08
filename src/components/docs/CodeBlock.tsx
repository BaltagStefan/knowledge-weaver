import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

// Custom style based on oneDark but with adjustments
const customStyle = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    margin: 0,
    padding: '1rem',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    fontSize: '0.875rem',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
  },
};

export function CodeBlock({ 
  code, 
  language = 'typescript', 
  title,
  showLineNumbers = false,
  highlightLines = [],
  className 
}: CodeBlockProps) {
  return (
    <div className={cn("rounded-lg overflow-hidden border border-border", className)}>
      {title && (
        <div className="bg-muted px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2">{title}</span>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={customStyle}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        lineProps={(lineNumber) => {
          const style: React.CSSProperties = { display: 'block' };
          if (highlightLines.includes(lineNumber)) {
            style.backgroundColor = 'rgba(255, 255, 0, 0.1)';
            style.borderLeft = '3px solid #fbbf24';
            style.paddingLeft = '0.5rem';
            style.marginLeft = '-0.5rem';
          }
          return { style };
        }}
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
}

// Component for inline code with configurable highlight
interface ConfigHighlightProps {
  children: React.ReactNode;
}

export function ConfigHighlight({ children }: ConfigHighlightProps) {
  return (
    <span className="bg-yellow-500/20 text-yellow-300 px-1 py-0.5 rounded font-bold">
      {children}
    </span>
  );
}

// Pre-formatted code with highlighted configurable parts
interface CodeWithConfigProps {
  code: string;
  language?: string;
  title?: string;
  configs?: { placeholder: string; description: string }[];
}

export function CodeWithConfig({ code, language = 'typescript', title, configs = [] }: CodeWithConfigProps) {
  return (
    <div className="space-y-3">
      <CodeBlock code={code} language={language} title={title} />
      {configs.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-xs font-bold text-yellow-500 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
            CONFIGUREAZĂ PENTRU USE CASE-UL TĂU:
          </p>
          <ul className="text-sm space-y-1">
            {configs.map((config, i) => (
              <li key={i} className="flex gap-2">
                <code className="text-yellow-400 font-bold text-xs bg-yellow-500/20 px-1 rounded">
                  {config.placeholder}
                </code>
                <span className="text-muted-foreground text-xs">→ {config.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
