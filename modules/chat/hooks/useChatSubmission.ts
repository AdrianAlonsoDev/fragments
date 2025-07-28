import { useCallback, useState, useEffect } from 'react'
import { experimental_useObject as useObject } from 'ai/react'
import { usePostHog } from 'posthog-js/react'
import { FragmentSchema, fragmentSchema as schema } from '@/modules/shared/lib/schema'
import { Message, toAISDKMessages, toMessageImage } from '@/modules/chat/types/messages'
import { LLMModel, LLMModelConfig } from '@/modules/ai/lib/models'
import { Templates, TemplateId } from '@/modules/templates/lib/templates'
import { DeepPartial } from 'ai'
import { Session } from '@supabase/supabase-js'

interface UseChatSubmissionProps {
  currentProjectId: string | null
  session: Session | null
  userTeam: { id: string; name: string; tier: string } | undefined
  onFragmentGenerated?: (fragment: DeepPartial<FragmentSchema>) => Promise<void>
}

export function useChatSubmission({
  currentProjectId,
  session,
  userTeam,
  onFragmentGenerated
}: UseChatSubmissionProps) {
  const posthog = usePostHog()
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const { object, submit: aiSubmit, isLoading, stop, error } = useObject({
    api: currentProjectId ? `/api/projects/${currentProjectId}/chat` : '/api/chat',
    schema,
    onError: (error) => {
      console.error('Error submitting request:', error)
      if (error.message.includes('limit')) {
        setIsRateLimited(true)
      }
      setErrorMessage(error.message)
    },
    onFinish: async ({ object: fragment, error }) => {
      if (!error && currentProjectId && fragment && onFragmentGenerated) {
        setIsPreviewLoading(true)
        posthog.capture('fragment_generated', {
          template: fragment?.template,
          projectId: currentProjectId
        })

        await onFragmentGenerated(fragment)
        setIsPreviewLoading(false)
      }
    },
  })

  // Stop on error
  useEffect(() => {
    if (error) stop()
  }, [error, stop])

  const submitChat = useCallback(async (
    chatInput: string,
    files: File[],
    messages: Message[],
    currentTemplate: Templates | { [key: string]: any },
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
    currentTemplate: Templates | { [key: string]: any },
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
    stop,
    setIsPreviewLoading
  }
}