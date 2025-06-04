import React, { useState, KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Send, Mic, Camera } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStartVoice?: () => void;
  onStartVideo?: () => void;
  isVoiceEnabled?: boolean;
  isVideoEnabled?: boolean;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStartVoice,
  onStartVideo,
  isVoiceEnabled = false,
  isVideoEnabled = false,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-2 bg-white p-4 border-t">
      <TextareaAutosize
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        className="flex-1 resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxRows={5}
        disabled={isLoading}
      />
      
      <div className="flex gap-2">
        {isVoiceEnabled && (
          <button
            onClick={onStartVoice}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <Mic className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        {isVideoEnabled && (
          <button
            onClick={onStartVideo}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <Camera className="w-5 h-5 text-gray-600" />
          </button>
        )}
        
        <button
          onClick={handleSend}
          className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors disabled:opacity-50"
          disabled={!message.trim() || isLoading}
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}; 