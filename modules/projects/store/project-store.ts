import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Project } from '@/modules/projects/types/project-types'
import { TemplateId } from '@/modules/templates/lib/templates'

interface ProjectState {
  // State
  projects: Project[]
  currentProjectId: string | null
  selectedTemplate: 'auto' | TemplateId
  
  // Actions
  setProjects: (projects: Project[]) => void
  setCurrentProjectId: (id: string | null) => void
  setSelectedTemplate: (template: 'auto' | TemplateId) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void
  
  // Computed
  getCurrentProject: () => Project | null
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        projects: [],
        currentProjectId: null,
        selectedTemplate: 'auto',
        
        // Actions
        setProjects: (projects) => set({ projects }, false, 'setProjects'),
        
        setCurrentProjectId: (id) => set({ currentProjectId: id }, false, 'setCurrentProjectId'),
        
        setSelectedTemplate: (template) => set({ selectedTemplate: template }, false, 'setSelectedTemplate'),
        
        addProject: (project) => set((state) => ({
          projects: [...state.projects, project]
        }), false, 'addProject'),
        
        updateProject: (id, data) => set((state) => ({
          projects: state.projects.map(p => 
            p.id === id ? { ...p, ...data } : p
          )
        }), false, 'updateProject'),
        
        removeProject: (id) => set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          // Clear current project if it's the one being removed
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId
        }), false, 'removeProject'),
        
        // Computed
        getCurrentProject: () => {
          const state = get()
          return state.projects.find(p => p.id === state.currentProjectId) || null
        }
      }),
      {
        name: 'project-store',
        partialize: (state) => ({
          currentProjectId: state.currentProjectId,
          selectedTemplate: state.selectedTemplate,
        }),
      }
    ),
    {
      name: 'project-store',
    }
  )
)