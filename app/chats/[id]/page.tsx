import { Suspense } from 'react'
import ChatView from './ChatView'
import Header from './Header'

async function getChatData(id: string) {
  const response = await fetch(
    `https://staging-generative-assets-api.hellopublic.com/api/analytics/chats/${id}`,
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
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-neutral-400 text-lg">Loading chat...</div>
    </div>
  )
}

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getChatData(id)
  
  return (
    <div className="min-h-scree">
      <Header />
      <Suspense fallback={<LoadingState />}>
        <ChatView data={data} />
      </Suspense>
    </div>
  )
} 