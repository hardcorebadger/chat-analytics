import ChatPage from './page'

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

export default async function ChatPageServer({
  params,
}: {
  params: { id: string }
}) {
  const data = await getChatData(params.id)
  return <ChatPage data={data} />
} 