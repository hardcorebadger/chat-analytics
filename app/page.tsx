'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [chatId, setChatId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (chatId.trim()) {
      setIsLoading(true);
      router.push(`/chats/${encodeURIComponent(chatId.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black">
      <main className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-white">Chat Viewer</h1>
          <p className="text-neutral-400 mb-8">
            A development tool for viewing AI chat conversations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="Enter chat ID"
              className="w-full px-4 py-2 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-neutral-700 focus:border-transparent bg-neutral-900 text-white placeholder-neutral-600"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-white hover:bg-neutral-100 text-black font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Loading...' : 'View Chat'}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="w-full text-neutral-400 hover:text-white text-sm transition-colors"
        >
          Log out
        </button>
      </main>
    </div>
  );
}
