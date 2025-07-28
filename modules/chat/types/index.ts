import { DeepPartial } from 'ai'
import { FragmentSchema } from '@/modules/shared/lib/schema'
import { ExecutionResult } from '@/modules/shared/lib/types'
import { Message } from '@/modules/chat/types/messages'
import { ProjectMessage } from '@/modules/projects/types/project-types'
import { Session } from '@supabase/supabase-js'
import { LLMModel, LLMModelConfig } from '@/modules/ai/lib/models'
import { Templates, TemplateId } from '@/modules/templates/lib/templates'

// Hook interfaces
export interface UseChatStateProps {
  projectMessages?: ProjectMessage[]
}

export interface UseChatSubmissionProps {
  currentProjectId: string | null
  session: Session | null
  userTeam: { id: string; name: string; tier: string } | undefined
  onFragmentGenerated?: (fragment: DeepPartial<FragmentSchema>) => Promise<void>
}

// Message content types
export type TextContent = {
  type: 'text'
  text: string
}

export type ImageContent = {
  type: 'image'
  image: string
}

export type CodeContent = {
  type: 'code'
  text: string
}

export type MessageContent = (TextContent | ImageContent | CodeContent)[]

// Template configuration
export type TemplateConfig = Templates | Record<string, {
  id: string
  name: string
  description: string
  schema: any
}>

// Chat submission types
export interface ChatSubmitParams {
  chatInput: string
  files: File[]
  messages: Message[]
  currentTemplate: TemplateConfig
  currentModel: LLMModel
  languageModel: LLMModelConfig
  selectedTemplate: string | 'auto'
}