import { Suspense } from 'react'
import ChatView from './ChatView'
import Header from './Header'

async function getChatData(id: string, env?: string) {
  const baseUrl = env === 'staging' 
    ? 'https://staging-generative-assets-api.hellopublic.com/api/analytics'
    : 'https://generative-assets-api.hellopublic.com/api/analytics';

  const response = await fetch(
    `${baseUrl}/chats/${id}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
      },
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `Failed to fetch chat data: ${response.status}`)
  }

  return response.json()
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="text-neutral-400 text-lg">Loading chat...</div>
    </div>
  )
}

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ env?: string }>
}

export default async function ChatPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, { env }] = await Promise.all([params, searchParams])
  const data = await getChatData(id, env)
  
  return (
    <div className="min-h-screen ">
      <Header />
      <Suspense fallback={<LoadingState />}>
        <ChatView data={data} />
      </Suspense>
    </div>
  )
} 