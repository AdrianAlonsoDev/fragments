import { useEffect } from 'react'
import { UseChatStateProps } from '@/modules/chat/types'
import { useChatStore } from '@/modules/chat/store/chat-store'

export function useChatState({ projectMessages }: UseChatStateProps) {
  const chatStore = useChatStore()

  // Sync project messages to local state
  useEffect(() => {
    if (projectMessages && projectMessages.length > 0) {
      const formattedMessages = projectMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
      chatStore.setMessages(formattedMessages)
    } else {
      chatStore.setMessages([])
    }
  }, [projectMessages]) // Remove chatStore to avoid infinite loop

  // Return all store methods and state
  return chatStore
}