import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Message } from '@/modules/chat/types/messages'
import { DeepPartial } from 'ai'
import { FragmentSchema } from '@/modules/shared/lib/schema'
import { ExecutionResult } from '@/modules/shared/lib/types'
import { PreviewData } from '@/modules/projects/types'

interface ChatState {
  // State
  messages: Message[]
  fragment: DeepPartial<FragmentSchema> | undefined
  result: ExecutionResult | undefined
  currentTab: 'code' | 'fragment'
  chatInput: string
  files: File[]
  isLoading: boolean
  isPreviewLoading: boolean
  error: Error | null
  errorMessage: string
  isRateLimited: boolean
  
  // Actions
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  updateMessage: (message: Partial<Message>, index?: number) => void
  clearChat: () => void
  undoLastMessage: () => void
  setFragment: (fragment: DeepPartial<FragmentSchema> | undefined) => void
  setResult: (result: ExecutionResult | undefined) => void
  setCurrentTab: (tab: 'code' | 'fragment') => void
  setChatInput: (input: string) => void
  setFiles: (files: File[]) => void
  setCurrentPreview: (preview: PreviewData) => void
  clearPreview: () => void
  setLoadingStates: (states: {
    isLoading?: boolean
    isPreviewLoading?: boolean
    error?: Error | null
    errorMessage?: string
    isRateLimited?: boolean
  }) => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        messages: [],
        fragment: undefined,
        result: undefined,
        currentTab: 'code',
        chatInput: '',
        files: [],
        isLoading: false,
        isPreviewLoading: false,
        error: null,
        errorMessage: '',
        isRateLimited: false,
        
        // Actions
        setMessages: (messages) => set({ messages }, false, 'setMessages'),
        
        addMessage: (message) => set((state) => ({
          messages: [...state.messages, message]
        }), false, 'addMessage'),
        
        updateMessage: (message, index) => set((state) => {
          const updatedMessages = [...state.messages]
          const targetIndex = index ?? state.messages.length - 1
          updatedMessages[targetIndex] = {
            ...state.messages[targetIndex],
            ...message,
          }
          return { messages: updatedMessages }
        }, false, 'updateMessage'),
        
        clearChat: () => set({
          messages: [],
          fragment: undefined,
          result: undefined,
        }, false, 'clearChat'),
        
        undoLastMessage: () => set((state) => ({
          messages: state.messages.slice(0, -2),
          fragment: undefined,
          result: undefined,
        }), false, 'undoLastMessage'),
        
        setFragment: (fragment) => set({ fragment }, false, 'setFragment'),
        
        setResult: (result) => set({ result }, false, 'setResult'),
        
        setCurrentTab: (tab) => set({ currentTab: tab }, false, 'setCurrentTab'),
        
        setChatInput: (input) => set({ chatInput: input }, false, 'setChatInput'),
        
        setFiles: (files) => set({ files }, false, 'setFiles'),
        
        setCurrentPreview: (preview) => set({
          fragment: preview.fragment,
          result: preview.result,
        }, false, 'setCurrentPreview'),
        
        clearPreview: () => set({
          fragment: undefined,
          result: undefined,
          currentTab: 'code',
        }, false, 'clearPreview'),
        
        setLoadingStates: (states) => set(states, false, 'setLoadingStates'),
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({
          chatInput: state.chatInput,
        }),
      }
    ),
    {
      name: 'chat-store',
    }
  )
)