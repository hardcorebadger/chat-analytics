'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [chatId, setChatId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (chatId.trim()) {
      setIsLoading(true);
      const env = searchParams.get('env');
      const url = env ? `/chats/${encodeURIComponent(chatId.trim())}?env=${env}` : `/chats/${encodeURIComponent(chatId.trim())}`;
      router.push(url);
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

  const handleHome = () => {
    const env = searchParams.get('env');
    router.push(env ? `/?env=${env}` : '/');
  };

  return (
    <header className="w-full border-b border-neutral-800">
      <div className="w-full max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button
              onClick={handleHome}
              className="text-neutral-400 hover:text-white text-sm transition-colors"
            >
              Home
            </button>
            <form onSubmit={handleSubmit} className="flex items-center space-x-4">
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter chat ID"
                className="px-4 py-2 border border-neutral-800 rounded-lg focus:ring-2 focus:ring-neutral-700 focus:border-transparent bg-neutral-900 text-white placeholder-neutral-600 w-64"
                required
              />
              <button
                type="submit"
                disabled={isLoading || !chatId.trim()}
                className={`font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer ${
                  chatId.trim() 
                    ? 'bg-neutral-800 hover:bg-neutral-700 text-white' 
                    : 'opacity-0'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Loading...' : 'View Chat'}
              </button>
            </form>
          </div>

          <button
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white text-sm transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
} 