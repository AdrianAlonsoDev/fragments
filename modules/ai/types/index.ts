// Re-export model types
export type { LLMModel, LLMModelConfig } from '@/modules/ai/lib/models'

// Model selection types
export interface ModelSelectionProps {
  models: LLMModel[]
  selectedModel: LLMModel
  languageModel: LLMModelConfig
  onModelChange: (model: LLMModelConfig) => void
}