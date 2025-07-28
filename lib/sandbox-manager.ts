import { Sandbox } from '@e2b/code-interpreter'
import { supabase } from './supabase'

const SANDBOX_TIMEOUT = 60 * 60 * 1000 // 1 hour

export class SandboxManager {
  private static activeSandboxes = new Map<string, Sandbox>()

  static async getOrCreateProjectSandbox(
    projectId: string, 
    templateId: string,
    teamId?: string,
    accessToken?: string
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
    const { data: project } = await supabase!
      .from('projects')
      .select('sandbox_id')
      .eq('id', projectId)
      .single()

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
    await supabase!
      .from('projects')
      .update({ 
        sandbox_id: sandbox.sandboxId,
        last_activity: new Date().toISOString()
      })
      .eq('id', projectId)

    this.activeSandboxes.set(projectId, sandbox)
    return sandbox
  }

  static async pauseProject(projectId: string): Promise<void> {
    const sandbox = this.activeSandboxes.get(projectId)
    if (sandbox) {
      try {
        console.log('Pausing sandbox for project:', projectId)
        const sandboxId = await sandbox.pause()
        
        // Update sandbox ID in case it changed
        await supabase!
          .from('projects')
          .update({ sandbox_id: sandboxId })
          .eq('id', projectId)
        
        this.activeSandboxes.delete(projectId)
      } catch (error) {
        console.error('Failed to pause sandbox:', error)
      }
    }
  }

  static async killProject(projectId: string): Promise<void> {
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
    await supabase!
      .from('projects')
      .update({ sandbox_id: null })
      .eq('id', projectId)
  }
}