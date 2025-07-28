import { NavBar } from '@/modules/shared/components/navbar'
import { ProjectSelector } from './project-selector'
import { Project } from '@/modules/projects/types/project-types'
import { Session } from '@supabase/supabase-js'
import { SupabaseClient } from '@supabase/supabase-js'

interface ProjectEmptyStateProps {
  session: Session | null
  userTeam: { id: string; name: string; tier: string } | undefined
  projects: Project[]
  onProjectSelect: (project: Project) => void
  onProjectCreate: (data: any) => Promise<void>
  onProjectDelete: (id: string) => Promise<void>
  onShowLogin: () => void
  supabase: SupabaseClient | null | undefined
}

export function ProjectEmptyState({
  session,
  userTeam,
  projects,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  onShowLogin,
  supabase
}: ProjectEmptyStateProps) {
  return (
    <div className="grid w-full">
      <div className="flex flex-col w-full max-h-full max-w-[800px] mx-auto px-4 overflow-auto col-span-2">
        <NavBar 
          session={session} 
          showLogin={onShowLogin}
          signOut={() => supabase?.auth.signOut()}
          onClear={() => {}}
          canClear={false}
          onUndo={() => {}}
          canUndo={false}
        >
          {userTeam && (
            <ProjectSelector
              projects={projects}
              currentProject={null}
              onProjectSelect={onProjectSelect}
              onProjectCreate={onProjectCreate}
              onProjectDelete={onProjectDelete}
              teamId={userTeam.id}
            />
          )}
        </NavBar>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-semibold">Welcome to Fragments</h2>
            <p className="text-muted-foreground">Select or create a project to get started</p>
            {userTeam && (
              <ProjectSelector
                projects={projects}
                currentProject={null}
                onProjectSelect={onProjectSelect}
                onProjectCreate={onProjectCreate}
                onProjectDelete={onProjectDelete}
                teamId={userTeam.id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}