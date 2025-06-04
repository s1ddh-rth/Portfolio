'use client';

import { Chat } from '@/components/chat/Chat';
import { Suspense } from 'react';

export default function ChatPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-4xl h-[80vh]">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse">Loading chat interface...</div>
          </div>
        }>
          <Chat />
        </Suspense>
      </div>
    </main>
  );
} 