import { useCallback, useEffect } from 'react'
import { Project } from '@/modules/projects/types/project-types'
import { TemplateId } from '@/modules/templates/lib/templates'
import { SandboxManager } from '@/modules/sandbox/lib/sandbox-manager'
import { UseProjectManagementProps } from '@/modules/projects/types'
import { useProjectStore } from '@/modules/projects/store/project-store'

export function useProjectManagement({
  projects,
  createProject,
  deleteProject,
  onStateReset
}: UseProjectManagementProps) {
  const { 
    currentProjectId, 
    selectedTemplate, 
    setCurrentProjectId, 
    setSelectedTemplate,
    setProjects
  } = useProjectStore()
  
  // Keep projects in sync
  useEffect(() => {
    setProjects(projects)
  }, [projects]) // Remove setProjects to avoid infinite loop

  const handleProjectSelect = useCallback((project: Project) => {
    // Clear current state before switching
    if (onStateReset) {
      onStateReset()
    }
    
    setCurrentProjectId(project.id)
    // Update template based on project
    setSelectedTemplate(project.template_id as TemplateId)
  }, [onStateReset]) // Remove setCurrentProjectId to avoid issues

  const handleProjectCreate = useCallback(async (projectData: Parameters<typeof createProject>[0]) => {
    const { data, error } = await createProject(projectData)
    if (data && !error) {
      setCurrentProjectId(data.id)
      setSelectedTemplate(data.template_id as TemplateId)
      // Clear any existing state when creating new project
      if (onStateReset) {
        onStateReset()
      }
    } else if (error) {
      console.error('Failed to create project:', error)
      throw error // Propagate error to ProjectSelector
    }
  }, [createProject, onStateReset]) // Remove store setters

  const handleProjectDelete = useCallback(async (projectId: string) => {
    try {
      // If we're deleting the current project, clear it first
      if (currentProjectId === projectId) {
        // Clear all state first
        if (onStateReset) {
          onStateReset()
        }
        setCurrentProjectId(null) // Clear immediately
      }
      
      // Kill the sandbox - Note: This uses the global client since it's client-side
      // The sandbox will be killed but sandbox_id might not be cleared from DB without auth
      try {
        await SandboxManager.killProject(projectId)
      } catch (sandboxError) {
        console.error('Failed to kill sandbox:', sandboxError)
        // Continue with deletion even if sandbox kill fails
      }
      
      // Delete the project from database
      const { error } = await deleteProject(projectId)
      if (error) {
        console.error('Failed to delete project:', error)
        throw error
      }
      
      // After successful deletion, select next project if we deleted current
      if (currentProjectId === projectId) {
        const remainingProjects = projects.filter(p => p.id !== projectId)
        const nextProject = remainingProjects[0]
        
        if (nextProject) {
          // Use setTimeout to avoid race condition
          setTimeout(() => {
            setCurrentProjectId(nextProject.id)
            setSelectedTemplate(nextProject.template_id as TemplateId)
          }, 100)
        }
      }
    } catch (error) {
      console.error('Error in handleProjectDelete:', error)
      throw error
    }
  }, [currentProjectId, projects, deleteProject, onStateReset]) // Remove store setters

  return {
    currentProjectId,
    selectedTemplate,
    setSelectedTemplate,
    handleProjectSelect,
    handleProjectCreate,
    handleProjectDelete
  }
}