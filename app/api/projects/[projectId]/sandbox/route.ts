import { FragmentSchema } from '@/lib/schema'
import { ExecutionResultInterpreter, ExecutionResultWeb } from '@/lib/types'
import { SandboxManager } from '@/lib/sandbox-manager'
import { supabase } from '@/lib/supabase'

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

  // Handle pause/resume operations
  if (operation === 'pause') {
    await SandboxManager.pauseProject(projectId)
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
    accessToken
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
  await supabase!
    .from('projects')
    .update({ last_activity: new Date().toISOString() })
    .eq('id', projectId)

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