import { useState, useEffect } from 'react'
import { Project, ProjectMessage } from '@/lib/project-types'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

export function useProject(projectId: string | null, session: Session | null) {
  const [project, setProject] = useState<Project | null>(null)
  const [messages, setMessages] = useState<ProjectMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId || !session) {
      // Clear state when no project is selected
      setProject(null)
      setMessages([])
      setLoading(false)
      return
    }

    setLoading(true)
    // Fetch project details
    const fetchProject = async () => {
      const { data, error } = await supabase!
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (!error && data) {
        setProject(data)
      } else if (error) {
        console.error('Failed to fetch project:', error)
      }
    }

    // Fetch project messages
    const fetchMessages = async () => {
      const { data, error } = await supabase!
        .from('project_messages')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
    }

    fetchProject()
    fetchMessages()

    // Subscribe to new messages
    const channel = supabase!
      .channel(`project_${projectId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'project_messages',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ProjectMessage])
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [projectId, session])

  const saveMessage = async (message: Omit<ProjectMessage, 'id' | 'created_at' | 'project_id'>) => {
    if (!projectId) return

    const { data, error } = await supabase!
      .from('project_messages')
      .insert({
        project_id: projectId,
        ...message
      })
      .select()
      .single()

    if (!error && data) {
      setMessages(prev => [...prev, data])
    }

    return { data, error }
  }

  return {
    project,
    messages,
    loading,
    saveMessage
  }
}

export function useProjects(session: Session | null) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }

    const fetchProjects = async () => {
      const { data, error } = await supabase!
        .from('projects')
        .select('*')
        .order('last_activity', { ascending: false })

      if (!error && data) {
        setProjects(data)
      }
      setLoading(false)
    }

    fetchProjects()

    // Subscribe to project changes
    const channel = supabase!
      .channel('projects')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          fetchProjects()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [session])

  const createProject = async (project: { name: string; description?: string; template_id: string; team_id: string }) => {
    const { data, error } = await supabase!
      .from('projects')
      .insert(project)
      .select()
      .single()

    if (!error && data) {
      setProjects(prev => [data, ...prev])
    }

    return { data, error }
  }

  const deleteProject = async (projectId: string) => {
    const { error } = await supabase!
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (!error) {
      setProjects(prev => prev.filter(p => p.id !== projectId))
    }

    return { error }
  }

  return {
    projects,
    loading,
    createProject,
    deleteProject
  }
}