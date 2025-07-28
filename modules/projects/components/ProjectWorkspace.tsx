import { NavBar } from '@/modules/shared/components/navbar'
import { Chat } from '@/modules/chat/components/chat'
import { ChatInput } from '@/modules/chat/components/chat-input'
import { ChatPicker } from '@/modules/chat/components/chat-picker'
import { ChatSettings } from '@/modules/chat/components/chat-settings'
import { Preview } from '@/modules/sandbox/components/preview'
import { ProjectSelector } from './project-selector'
import { Project } from '@/modules/projects/types/project-types'
import { Message } from '@/modules/chat/types/messages'
import { FragmentSchema } from '@/modules/shared/lib/schema'
import { ExecutionResult } from '@/modules/shared/lib/types'
import { LLMModel, LLMModelConfig } from '@/modules/ai/lib/models'
import { Templates, TemplateId } from '@/modules/templates/lib/templates'
import { Session } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'
import { DeepPartial } from 'ai'
import { Dispatch, SetStateAction } from 'react'

interface ProjectWorkspaceProps {
  // Auth
  session: Session | null
  userTeam: { id: string; name: string; tier: string } | undefined
  supabase: SupabaseClient | null | undefined
  onShowLogin: () => void
  
  // Projects
  projects: Project[]
  currentProject: Project | null
  onProjectSelect: (project: Project) => void
  onProjectCreate: (data: any) => Promise<void>
  onProjectDelete: (id: string) => Promise<void>
  
  // Chat state
  messages: Message[]
  fragment: DeepPartial<FragmentSchema> | undefined
  result: ExecutionResult | undefined
  currentTab: 'code' | 'fragment'
  setCurrentTab: Dispatch<SetStateAction<'code' | 'fragment'>>
  setCurrentPreview: (preview: { fragment: DeepPartial<FragmentSchema> | undefined; result: ExecutionResult | undefined }) => void
  onClearChat: () => void
  onUndo: () => void
  
  // Chat input
  chatInput: string
  setChatInput: Dispatch<SetStateAction<string>>
  files: File[]
  setFiles: Dispatch<SetStateAction<File[]>>
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  
  // Chat submission
  isLoading: boolean
  isPreviewLoading: boolean
  error: any
  errorMessage: string
  isRateLimited: boolean
  onRetry: () => void
  onStop: () => void
  
  // Models & Templates
  templates: Templates
  selectedTemplate: 'auto' | TemplateId
  setSelectedTemplate: (template: 'auto' | TemplateId) => void
  filteredModels: LLMModel[]
  languageModel: LLMModelConfig
  setLanguageModel: (config: LLMModelConfig) => void
  currentModel: LLMModel
}

export function ProjectWorkspace({
  session,
  userTeam,
  supabase,
  onShowLogin,
  projects,
  currentProject,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  messages,
  fragment,
  result,
  currentTab,
  setCurrentTab,
  setCurrentPreview,
  onClearChat,
  onUndo,
  chatInput,
  setChatInput,
  files,
  setFiles,
  onSubmit,
  isLoading,
  isPreviewLoading,
  error,
  errorMessage,
  isRateLimited,
  onRetry,
  onStop,
  templates,
  selectedTemplate,
  setSelectedTemplate,
  filteredModels,
  languageModel,
  setLanguageModel,
  currentModel
}: ProjectWorkspaceProps) {
  return (
    <div className="grid w-full md:grid-cols-2">
      <div className={`flex flex-col w-full max-h-full max-w-[800px] mx-auto px-4 overflow-auto ${fragment ? 'col-span-1' : 'col-span-2'}`}>
        <NavBar 
          session={session} 
          showLogin={onShowLogin}
          signOut={() => supabase?.auth.signOut()}
          onClear={onClearChat}
          canClear={messages.length > 0}
          onUndo={onUndo}
          canUndo={messages.length > 1 && !isLoading}
        >
          {userTeam && (
            <ProjectSelector
              projects={projects}
              currentProject={currentProject}
              onProjectSelect={onProjectSelect}
              onProjectCreate={onProjectCreate}
              onProjectDelete={onProjectDelete}
              teamId={userTeam.id}
            />
          )}
        </NavBar>
        <Chat
          messages={messages}
          isLoading={isLoading}
          setCurrentPreview={setCurrentPreview}
        />
        <ChatInput
          retry={onRetry}
          isErrored={error !== undefined}
          errorMessage={errorMessage}
          isLoading={isLoading}
          isRateLimited={isRateLimited}
          stop={onStop}
          input={chatInput}
          handleInputChange={(e) => setChatInput(e.target.value)}
          handleSubmit={onSubmit}
          isMultiModal={currentModel?.multiModal || false}
          files={files}
          handleFileChange={setFiles}
        >
          <ChatPicker
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectedTemplateChange={setSelectedTemplate}
            models={filteredModels}
            languageModel={languageModel}
            onLanguageModelChange={setLanguageModel}
          />
          <ChatSettings
            languageModel={languageModel}
            onLanguageModelChange={setLanguageModel}
            apiKeyConfigurable={process.env.NEXT_PUBLIC_NO_API_KEY_INPUT !== 'true'}
            baseURLConfigurable={process.env.NEXT_PUBLIC_NO_BASE_URL_INPUT !== 'true'}
          />
        </ChatInput>
      </div>
      <Preview
        apiKey={languageModel?.apiKey}
        teamID={userTeam?.id}
        accessToken={session?.access_token}
        selectedTab={currentTab}
        onSelectedTabChange={setCurrentTab}
        isChatLoading={isLoading}
        isPreviewLoading={isPreviewLoading}
        fragment={fragment}
        result={result}
        onClose={() => setCurrentTab('code')}
      />
    </div>
  )
}