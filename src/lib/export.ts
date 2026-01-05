import { format } from 'date-fns';
import type { Message, Conversation, Project } from '@/types';

/**
 * Export conversation to Markdown format
 */
export function exportToMarkdown(
  conversation: Conversation,
  messages: Message[],
  project?: Project
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${conversation.title}`);
  lines.push('');

  if (project) {
    lines.push(`**Proiect:** ${project.name}`);
    lines.push('');
  }

  lines.push(`**Creat:** ${format(new Date(conversation.createdAt), 'dd MMM yyyy, HH:mm')}`);
  lines.push(`**Actualizat:** ${format(new Date(conversation.updatedAt), 'dd MMM yyyy, HH:mm')}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Messages
  for (const message of messages) {
    const role = message.role === 'user' ? '👤 **Tu**' : '🤖 **Kotaemon**';
    const time = format(new Date(message.createdAt), 'HH:mm');

    lines.push(`### ${role} _${time}_`);
    lines.push('');
    lines.push(message.content);
    lines.push('');

    // Add citations if present
    if (message.citations && message.citations.length > 0) {
      lines.push('> **Surse:**');
      for (const citation of message.citations) {
        if (citation.type === 'pdf') {
          lines.push(`> - 📄 ${citation.filename}, pagina ${citation.page}`);
        } else {
          lines.push(`> - 🧠 ${citation.memoryTitle}`);
        }
      }
      lines.push('');
    }
  }

  // Footer
  lines.push('---');
  lines.push(`_Exportat din Kotaemon la ${format(new Date(), 'dd MMM yyyy, HH:mm')}_`);

  return lines.join('\n');
}

/**
 * Export conversation to PDF (generates HTML for printing)
 */
export function exportToPDF(
  conversation: Conversation,
  messages: Message[],
  project?: Project
): void {
  const content = generatePDFHtml(conversation, messages, project);

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Could not open print window. Please allow popups.');
  }

  printWindow.document.write(content);
  printWindow.document.close();

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
  };
}

function generatePDFHtml(
  conversation: Conversation,
  messages: Message[],
  project?: Project
): string {
  const messagesHtml = messages
    .map((message) => {
      const isUser = message.role === 'user';
      const time = format(new Date(message.createdAt), 'HH:mm');
      const citationsHtml =
        message.citations && message.citations.length > 0
          ? `
            <div class="citations">
              <strong>Surse:</strong>
              <ul>
                ${message.citations
                  .map((c) =>
                    c.type === 'pdf'
                      ? `<li>📄 ${c.filename}, pagina ${c.page}</li>`
                      : `<li>🧠 ${c.memoryTitle}</li>`
                  )
                  .join('')}
              </ul>
            </div>
          `
          : '';

      return `
        <div class="message ${isUser ? 'user' : 'assistant'}">
          <div class="message-header">
            <span class="role">${isUser ? '👤 Tu' : '🤖 Kotaemon'}</span>
            <span class="time">${time}</span>
          </div>
          <div class="message-content">${escapeHtml(message.content).replace(/\n/g, '<br>')}</div>
          ${citationsHtml}
        </div>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${escapeHtml(conversation.title)} - Kotaemon</title>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #111827;
        }
        .header .meta {
          font-size: 14px;
          color: #6b7280;
        }
        .header .project {
          display: inline-block;
          background: #eff6ff;
          color: #1d4ed8;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .message {
          padding: 16px;
          margin-bottom: 16px;
          border-radius: 12px;
        }
        .message.user {
          background: #f3f4f6;
        }
        .message.assistant {
          background: #eff6ff;
          border: 1px solid #dbeafe;
        }
        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .role {
          font-weight: 600;
          font-size: 14px;
        }
        .time {
          font-size: 12px;
          color: #9ca3af;
        }
        .message-content {
          font-size: 15px;
          white-space: pre-wrap;
        }
        .citations {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px dashed #d1d5db;
          font-size: 13px;
          color: #6b7280;
        }
        .citations ul {
          margin-left: 20px;
          margin-top: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }
        @media print {
          body {
            padding: 20px;
          }
          .message {
            break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        ${project ? `<span class="project">📁 ${escapeHtml(project.name)}</span>` : ''}
        <h1>${escapeHtml(conversation.title)}</h1>
        <div class="meta">
          Creat: ${format(new Date(conversation.createdAt), 'dd MMM yyyy, HH:mm')} • 
          Actualizat: ${format(new Date(conversation.updatedAt), 'dd MMM yyyy, HH:mm')} • 
          ${messages.length} mesaje
        </div>
      </div>
      
      <div class="messages">
        ${messagesHtml}
      </div>
      
      <div class="footer">
        Exportat din Kotaemon la ${format(new Date(), 'dd MMM yyyy, HH:mm')}
      </div>
    </body>
    </html>
  `;
}

/**
 * Download content as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate a safe filename from conversation title
 */
export function sanitizeFilename(title: string): string {
  return title
    .replace(/[^a-z0-9\u00C0-\u024F\s-]/gi, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 50);
}
