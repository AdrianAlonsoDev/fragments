import { Sandbox } from '@e2b/code-interpreter'
import { supabase } from './supabase'
import { SupabaseClient } from '@supabase/supabase-js'

const SANDBOX_TIMEOUT = 60 * 60 * 1000 // 1 hour

export class SandboxManager {
  private static activeSandboxes = new Map<string, Sandbox>()

  static async getOrCreateProjectSandbox(
    projectId: string, 
    templateId: string,
    teamId?: string,
    accessToken?: string,
    supabaseClient?: SupabaseClient
  ): Promise<Sandbox> {
    // Check if we have an active sandbox in memory
    const activeSandbox = this.activeSandboxes.get(projectId)
    if (activeSandbox) {
      try {
        const isRunning = await activeSandbox.isRunning()
        if (isRunning) {
          // Extend timeout
          await activeSandbox.setTimeout(SANDBOX_TIMEOUT)
          return activeSandbox
        }
      } catch (error) {
        console.log('Sandbox no longer running, will create new one')
      }
    }

    // Get project from database
    const dbClient = supabaseClient || supabase
    console.log('Using client:', supabaseClient ? 'authenticated' : 'global')
    if (!dbClient) {
      throw new Error('No Supabase client available')
    }

    const { data: project, error: selectError } = await dbClient
      .from('projects')
      .select('sandbox_id')
      .eq('id', projectId)
      .single()
    
    if (selectError) {
      console.error('Failed to select project:', selectError)
    }

    // Try to resume existing sandbox
    if (project?.sandbox_id) {
      try {
        console.log('Resuming sandbox:', project.sandbox_id)
        const sandbox = await Sandbox.resume(project.sandbox_id, {
          timeoutMs: SANDBOX_TIMEOUT
        })
        
        this.activeSandboxes.set(projectId, sandbox)
        return sandbox
      } catch (error) {
        console.log('Failed to resume sandbox, creating new one:', error)
      }
    }

    // Create new sandbox
    console.log('Creating new sandbox for project:', projectId)
    const sandbox = await Sandbox.create(templateId, {
      metadata: {
        projectId,
        teamId: teamId ?? '',
      },
      timeoutMs: SANDBOX_TIMEOUT,
      ...(teamId && accessToken
        ? {
            headers: {
              'X-Supabase-Team': teamId,
              'X-Supabase-Token': accessToken,
            },
          }
        : {}),
    })

    // Update project with new sandbox ID
    console.log('Updating project with sandbox_id:', sandbox.sandboxId)
    const { error: updateError, data } = await dbClient
      .from('projects')
      .update({ 
        sandbox_id: sandbox.sandboxId,
        last_activity: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()

    if (updateError) {
      console.error('Failed to update project sandbox_id:', updateError)
      // Continue anyway - sandbox is created and cached
    } else {
      console.log('Successfully updated project sandbox_id:', data)
    }

    this.activeSandboxes.set(projectId, sandbox)
    return sandbox
  }

  static async pauseProject(projectId: string, supabaseClient?: SupabaseClient): Promise<void> {
    const sandbox = this.activeSandboxes.get(projectId)
    if (sandbox) {
      try {
        console.log('Pausing sandbox for project:', projectId)
        const sandboxId = await sandbox.pause()
        
        // Update sandbox ID in case it changed
        const dbClient = supabaseClient || supabase
        if (dbClient) {
          const { error } = await dbClient
            .from('projects')
            .update({ sandbox_id: sandboxId })
            .eq('id', projectId)
          
          if (error) {
            console.error('Failed to update paused sandbox_id:', error)
          }
        }
        
        this.activeSandboxes.delete(projectId)
      } catch (error) {
        console.error('Failed to pause sandbox:', error)
      }
    }
  }

  static async killProject(projectId: string, supabaseClient?: SupabaseClient): Promise<void> {
    const sandbox = this.activeSandboxes.get(projectId)
    if (sandbox) {
      try {
        await sandbox.kill()
        this.activeSandboxes.delete(projectId)
      } catch (error) {
        console.error('Failed to kill sandbox:', error)
      }
    }

    // Clear sandbox ID from database
    const dbClient = supabaseClient || supabase
    if (dbClient) {
      const { error } = await dbClient
        .from('projects')
        .update({ sandbox_id: null })
        .eq('id', projectId)
      
      if (error) {
        console.error('Failed to clear sandbox_id from database:', error)
      }
    }
  }
}