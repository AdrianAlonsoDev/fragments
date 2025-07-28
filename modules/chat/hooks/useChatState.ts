import { useState, useEffect, useCallback } from 'react'
import { Message } from '@/modules/chat/types/messages'
import { FragmentSchema } from '@/modules/shared/lib/schema'
import { ExecutionResult } from '@/modules/shared/lib/types'
import { DeepPartial } from 'ai'
import { UseChatStateProps } from '@/modules/chat/types'

export function useChatState({ projectMessages }: UseChatStateProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [fragment, setFragment] = useState<DeepPartial<FragmentSchema>>()
  const [result, setResult] = useState<ExecutionResult>()
  const [currentTab, setCurrentTab] = useState<'code' | 'fragment'>('code')

  // Sync project messages to local state
  useEffect(() => {
    if (projectMessages.length > 0) {
      const formattedMessages: Message[] = projectMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }))
      setMessages(formattedMessages)
    } else {
      setMessages([])
    }
  }, [projectMessages])

  const addMessage = useCallback((message: Message): Message[] => {
    let updatedMessages: Message[] = []
    setMessages((prevMessages) => {
      updatedMessages = [...prevMessages, message]
      return updatedMessages
    })
    return updatedMessages
  }, [])

  const updateMessage = useCallback((message: Partial<Message>, index?: number) => {
    setMessages((previousMessages) => {
      const updatedMessages = [...previousMessages]
      const targetIndex = index ?? previousMessages.length - 1
      updatedMessages[targetIndex] = {
        ...previousMessages[targetIndex],
        ...message,
      }
      return updatedMessages
    })
  }, [])

  const clearChat = useCallback(() => {
    setMessages([])
    setFragment(undefined)
    setResult(undefined)
  }, [])

  const undoLastMessage = useCallback(() => {
    setMessages((prevMessages) => prevMessages.slice(0, -2))
    setFragment(undefined)
    setResult(undefined)
  }, [])

  const setCurrentPreview = useCallback((preview: {
    fragment: DeepPartial<FragmentSchema> | undefined
    result: ExecutionResult | undefined
  }) => {
    setFragment(preview.fragment)
    setResult(preview.result)
  }, [])

  const clearPreview = useCallback(() => {
    setFragment(undefined)
    setResult(undefined)
    setCurrentTab('code')
  }, [])

  return {
    // State
    messages,
    fragment,
    result,
    currentTab,
    // Actions
    setMessages,
    addMessage,
    updateMessage,
    clearChat,
    undoLastMessage,
    setCurrentTab,
    setCurrentPreview,
    clearPreview,
    setFragment,
    setResult
  }
}