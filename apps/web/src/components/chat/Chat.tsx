import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { useChatStore } from '@/store/chat';
import { motion, AnimatePresence } from 'framer-motion';

export const Chat: React.FC = () => {
  const { messages, isLoading, addMessage } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    // Add user message
    addMessage({
      role: 'user',
      content,
    });

    try {
      // TODO: Implement API call to backend
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
        }),
      });

      const data = await response.json();
      
      // Add AI response
      addMessage({
        role: 'assistant',
        content: data.response,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Message message={message} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        isVoiceEnabled={false} // TODO: Implement voice feature
        isVideoEnabled={false} // TODO: Implement video feature
      />
    </div>
  );
}; 