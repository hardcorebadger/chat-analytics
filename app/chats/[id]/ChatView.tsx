'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type MessageContent = {
  type: string;
  text?: string;
  tool_use_id?: string;
  content?: string;
  name?: string;
  input?: any;
  id?: string;
}

type Message = {
  role: string;
  content: string | MessageContent[];
}

type ToolUse = {
  type: string;
  name: string;
  input: any;
  id: string;
}

function JsonBlock({ json, className = '' }: { json: any; className?: string }) {
  const [isWrapped, setIsWrapped] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(json, null, 2))
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute right-2 top-2 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsWrapped(!isWrapped)}
          className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded cursor-pointer"
        >
          {isWrapped ? 'No Wrap' : 'Wrap'}
        </button>
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs bg-neutral-700 hover:bg-neutral-600 text-white rounded cursor-pointer"
        >
          {copySuccess ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-neutral-950 p-3 text-xs text-white">
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
          wrapLines={isWrapped} 
          customStyle={{
            background: 'transparent',
            padding: 0,
            margin: 0,
          }}
        >
          {JSON.stringify(json, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

function ToolCallBlock({ item, response }: { item: ToolUse; response?: any }) {
  return (
    <div className="w-full bg-neutral-800 rounded-lg p-0 ">
      <div className="font-mono font-bold text-sm text-white p-5">{item.name}</div>
      <div className="flex flex-col gap-0">
        <div>
          <JsonBlock json={item.input} />
        </div>
        {response && (
        <div>
           <div className="text-xs bg-neutral-800 py-3 px-5">Response</div>
           <JsonBlock json={response} className="rounded-b-lg" />
         </div>
        )}
      </div>
    </div>
  )
}

function ChatHistory({ messages }: { messages: Message[] }) {
  // Helper to find tool_result for a given tool_use id
  function findToolResult(toolUseId: string) {
    return messages.find(
      (msg) =>
        Array.isArray(msg.content) &&
        msg.content.some(
          (c: MessageContent) => c.type === 'tool_result' && c.tool_use_id === toolUseId
        )
    )
  }

  const rendered: React.ReactNode[] = []
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    // User message (text)
    if (msg.role === 'user' && typeof msg.content === 'string') {
      rendered.push(
        <div key={i} className="flex justify-end mb-2">
          <div className="bg-neutral-800 text-white rounded-lg p-6 max-w-[70%] text-right">
            {msg.content}
          </div>
        </div>
      )
      continue
    }
    // Assistant message (text)
    if (msg.role === 'assistant' && Array.isArray(msg.content)) {
      // Only render text parts, skip tool_use/tool_result
      const textParts = msg.content.filter((c: MessageContent) => c.type === 'text')
      if (textParts.length > 0) {
        rendered.push(
          <div key={i} className="w-full mb-2">
            <div className=" text-white rounded-md py-6 w-full">
              {textParts.map((c: MessageContent, idx: number) => (
                <div key={idx} className="whitespace-pre-wrap mb-2 last:mb-0">{c.text}</div>
              ))}
            </div>
          </div>
        )
      }
      // Render tool_use + tool_result as a single block
      const toolUses = msg.content.filter((c: MessageContent) => c.type === 'tool_use')
      for (const toolUse of toolUses) {
        // Find the next user message with tool_result for this tool_use
        let responseJson = undefined
        for (let j = i + 1; j < messages.length; j++) {
          const nextMsg = messages[j]
          if (
            nextMsg.role === 'user' &&
            Array.isArray(nextMsg.content)
          ) {
            const toolResult = nextMsg.content.find(
              (c: MessageContent) => c.type === 'tool_result' && c.tool_use_id === toolUse.id
            )
            if (toolResult) {
              try {
                responseJson = JSON.parse(toolResult.content || '')
              } catch {
                responseJson = toolResult.content
              }
              break
            }
          }
        }
        rendered.push(
          <ToolCallBlock key={i + '-tool-' + toolUse.id} item={toolUse as ToolUse} response={responseJson} />
        )
      }
      continue
    }
    // User tool_result message (should only show as part of tool block)
    // Skip rendering these directly
  }
  return <div className="flex flex-col gap-0">{rendered}</div>
}

export default function ChatView({ data }: { data: any }) {
  const [showRaw, setShowRaw] = useState(false)

  return (
    <div className="w-full max-w-7xl mx-auto p-8">
      {/* Header Section */}
      <div className="mb-8 pb-4 border-b border-neutral-800">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Assistant Conversation</h1>
            <div className="mt-2 text-neutral-300">
              <p><span className="font-bold text-neutral-400">Session ID:</span> {data.session_id}</p>
              <p><span className="font-bold text-neutral-400">User ID:</span> {data.user_id}</p>
            </div>
          </div>
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="px-4 py-2 bg-neutral-100 text-neutral-900 text-sm rounded-md hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            {showRaw ? 'Show Chat' : 'Show Raw JSON'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 w-full overflow-hidden">
        {/* Sidebar: Metadata */}
        <div className="w-full md:w-[350px] flex-shrink-0 mb-8 md:mb-0 md:mr-4">
          <div className="bg-neutral-900 ">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Metadata</h2>
            </div>
            <div className="p-4">
              <dl className="grid grid-cols-1 gap-4">
                {Object.entries(data.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-neutral-400 mb-1">{key}</dt>
                    {typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null ? (
                      <dd className="mt-1 text-sm text-white break-all">{String(value)}</dd>
                    ) : (
                      <JsonBlock json={value} />
                    )}
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
        {/* Main Chat Area */}
        <main className="flex-1 min-w-0 max-w-full">
          {showRaw ? (
            <JsonBlock json={data.messages} />
          ) : (
            <ChatHistory messages={data.messages} />
          )}
        </main>
      </div>
    </div>
  )
} 