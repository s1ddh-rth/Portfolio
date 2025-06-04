'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/chat');
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="animate-pulse">
        Loading chat interface...
      </div>
    </main>
  );
} 