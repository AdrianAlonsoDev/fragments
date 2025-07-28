import { useCallback, useEffect } from 'react'
import { experimental_useObject as useObject } from 'ai/react'
import { usePostHog } from 'posthog-js/react'
import { fragmentSchema as schema } from '@/modules/shared/lib/schema'
import { Message, toAISDKMessages, toMessageImage } from '@/modules/chat/types/messages'
import { LLMModel, LLMModelConfig } from '@/modules/ai/lib/models'
import { UseChatSubmissionProps, TemplateConfig } from '@/modules/chat/types'
import { useChatStore } from '@/modules/chat/store/chat-store'

export function useChatSubmission({
  currentProjectId,
  session,
  userTeam,
  onFragmentGenerated
}: UseChatSubmissionProps) {
  const posthog = usePostHog()
  const { setLoadingStates, isPreviewLoading, errorMessage, isRateLimited } = useChatStore()

  const { object, submit: aiSubmit, isLoading, stop, error } = useObject({
    api: currentProjectId ? `/api/projects/${currentProjectId}/chat` : '/api/chat',
    schema,
    onError: (error) => {
      console.error('Error submitting request:', error)
      setLoadingStates({
        isRateLimited: error.message.includes('limit'),
        errorMessage: error.message,
        error: error
      })
    },
    onFinish: async ({ object: fragment, error }) => {
      if (!error && currentProjectId && fragment && onFragmentGenerated) {
        setLoadingStates({ isPreviewLoading: true })
        posthog.capture('fragment_generated', {
          template: fragment?.template,
          projectId: currentProjectId
        })

        await onFragmentGenerated(fragment)
        setLoadingStates({ isPreviewLoading: false })
      }
    },
  })

  // Update loading state only when it changes
  useEffect(() => {
    setLoadingStates({ isLoading })
  }, [isLoading]) // Remove setLoadingStates from deps to avoid infinite loop

  // Stop on error
  useEffect(() => {
    if (error) stop()
  }, [error, stop])

  const submitChat = useCallback(async (
    chatInput: string,
    files: File[],
    messages: Message[],
    currentTemplate: TemplateConfig,
    currentModel: LLMModel,
    languageModel: LLMModelConfig,
    selectedTemplate: string | 'auto'
  ) => {
    if (!session || !currentProjectId) {
      throw new Error('No session or project selected')
    }

    const content: Message['content'] = [{ type: 'text', text: chatInput }]
    const images = await toMessageImage(files)

    if (images.length > 0) {
      images.forEach((image) => {
        content.push({ type: 'image', image })
      })
    }

    const updatedMessages = [...messages, { role: 'user' as const, content }]

    aiSubmit({
      userID: session?.user?.id,
      teamID: userTeam?.id,
      messages: toAISDKMessages(updatedMessages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    })

    posthog.capture('chat_submit', {
      template: selectedTemplate,
      model: languageModel.model,
      projectId: currentProjectId
    })

    return { role: 'user' as const, content }
  }, [session, currentProjectId, userTeam, aiSubmit, posthog])

  const retry = useCallback((
    messages: Message[],
    currentTemplate: TemplateConfig,
    currentModel: LLMModel,
    languageModel: LLMModelConfig
  ) => {
    aiSubmit({
      userID: session?.user?.id,
      teamID: userTeam?.id,
      messages: toAISDKMessages(messages),
      template: currentTemplate,
      model: currentModel,
      config: languageModel,
    })
  }, [session, userTeam, aiSubmit])

  return {
    // State
    object,
    isLoading,
    isPreviewLoading,
    error,
    errorMessage,
    isRateLimited,
    // Actions
    submitChat,
    retry,
    stop
  }
}