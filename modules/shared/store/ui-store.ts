import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { LLMModelConfig } from '@/modules/ai/lib/models'

type Theme = 'light' | 'dark' | 'system'

interface UIState {
  // State
  languageModel: LLMModelConfig
  theme: Theme
  sidebarOpen: boolean
  previewVisible: boolean
  
  // Actions
  setLanguageModel: (model: LLMModelConfig) => void
  setTheme: (theme: Theme) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setPreviewVisible: (visible: boolean) => void
  togglePreview: () => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        languageModel: { model: 'claude-3-5-sonnet-latest' },
        theme: 'system',
        sidebarOpen: true,
        previewVisible: false,
        
        // Actions
        setLanguageModel: (model) => set({ languageModel: model }, false, 'setLanguageModel'),
        
        setTheme: (theme) => set({ theme }, false, 'setTheme'),
        
        toggleSidebar: () => set((state) => ({ 
          sidebarOpen: !state.sidebarOpen 
        }), false, 'toggleSidebar'),
        
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),
        
        setPreviewVisible: (visible) => set({ previewVisible: visible }, false, 'setPreviewVisible'),
        
        togglePreview: () => set((state) => ({ 
          previewVisible: !state.previewVisible 
        }), false, 'togglePreview'),
      }),
      {
        name: 'ui-store',
        partialize: (state) => ({
          languageModel: state.languageModel,
          theme: state.theme,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
)