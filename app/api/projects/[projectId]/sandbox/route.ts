import { FragmentSchema } from '@/lib/schema'
import { ExecutionResultInterpreter, ExecutionResultWeb } from '@/lib/types'
import { SandboxManager } from '@/lib/sandbox-manager'
import { supabase } from '@/lib/supabase'
import { createAuthenticatedClient } from '@/lib/supabase-auth'

export const maxDuration = 60

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  const { projectId } = params
  const {
    fragment,
    operation,
    userID,
    teamID,
    accessToken,
  }: {
    fragment?: FragmentSchema
    operation?: 'execute' | 'pause' | 'resume'
    userID: string | undefined
    teamID: string | undefined
    accessToken: string | undefined
  } = await req.json()

  console.log('Project sandbox operation:', operation || 'execute', projectId)
  console.log('Auth details:', { userID, teamID, hasAccessToken: !!accessToken })

  // Create authenticated Supabase client if we have an access token
  const authClient = accessToken ? createAuthenticatedClient(accessToken) : null
  console.log('Created auth client:', !!authClient)
  
  // Test the authenticated client
  if (authClient) {
    const { data: { user }, error } = await authClient.auth.getUser()
    console.log('Auth client user:', user?.id, 'error:', error)
  }

  // Handle pause/resume operations
  if (operation === 'pause') {
    await SandboxManager.pauseProject(projectId, authClient || undefined)
    return new Response(JSON.stringify({ success: true }))
  }

  if (!fragment) {
    return new Response(JSON.stringify({ error: 'Fragment required' }), { status: 400 })
  }

  // Get or create sandbox
  const sbx = await SandboxManager.getOrCreateProjectSandbox(
    projectId,
    fragment.template,
    teamID,
    accessToken,
    authClient || undefined
  )

  // Install packages if needed
  if (fragment.has_additional_dependencies) {
    await sbx.commands.run(fragment.install_dependencies_command)
    console.log(
      `Installed dependencies: ${fragment.additional_dependencies.join(', ')} in sandbox ${sbx.sandboxId}`,
    )
  }

  // Write the code
  await sbx.files.write(fragment.file_path, fragment.code)
  console.log(`Updated file ${fragment.file_path} in ${sbx.sandboxId}`)

  // Update last activity
  const dbClient = authClient || supabase
  if (dbClient) {
    const { error } = await dbClient
      .from('projects')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', projectId)
    
    if (error) {
      console.error('Failed to update last_activity:', error)
    }
  }

  // Execute code or return URL
  if (fragment.template === 'code-interpreter-v1') {
    const { logs, error, results } = await sbx.runCode(fragment.code || '')

    return new Response(
      JSON.stringify({
        sbxId: sbx?.sandboxId,
        template: fragment.template,
        stdout: logs.stdout,
        stderr: logs.stderr,
        runtimeError: error,
        cellResults: results,
      } as ExecutionResultInterpreter),
    )
  }

  return new Response(
    JSON.stringify({
      sbxId: sbx?.sandboxId,
      template: fragment.template,
      url: `https://${sbx?.getHost(fragment.port || 80)}`,
    } as ExecutionResultWeb),
  )
}