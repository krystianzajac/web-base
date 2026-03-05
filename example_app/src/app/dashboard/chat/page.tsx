'use client'

import { useState } from 'react'
import { BaseButton, BaseCard } from '@web-base/base-ui'

/**
 * Chat page — placeholder demonstrating base_ui layout components.
 * Echo: typed message appears in the conversation on "Send".
 */
export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<string[]>([])

  function handleSend() {
    const trimmed = message.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, trimmed])
    setMessage('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <main className="min-h-screen p-8 bg-[var(--color-background)]">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">Chat</h1>

      <BaseCard padding="md" className="max-w-2xl">
        {/* Message history */}
        <div
          className="min-h-[200px] max-h-[400px] overflow-y-auto space-y-2 mb-4"
          aria-label="Chat messages"
        >
          {messages.length === 0 ? (
            <p className="text-[var(--color-text-secondary)] text-sm">
              No messages yet. Send one below.
            </p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className="p-3 rounded bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm"
              >
                {msg}
              </div>
            ))
          )}
        </div>

        {/* Input area */}
        <div className="flex gap-2">
          <textarea
            className="flex-1 p-2 rounded border border-[var(--color-divider)] bg-[var(--color-surface)] text-[var(--color-text-primary)] text-sm resize-none"
            rows={2}
            placeholder="Type a message… (Enter to send)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Message input"
          />
          <BaseButton variant="primary" onClick={handleSend}>
            Send
          </BaseButton>
        </div>
      </BaseCard>
    </main>
  )
}
