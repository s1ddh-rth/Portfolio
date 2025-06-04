import React from 'react';
import { Avatar } from '@radix-ui/react-avatar';
import { Message as MessageType } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MessageProps {
  message: MessageType;
}

export const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[80%] gap-3`}>
        <Avatar className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {isUser ? 'You' : 'AI'}
          </span>
        </Avatar>
        
        <div className={`
          px-4 py-2 rounded-lg
          ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}
        `}>
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}; 