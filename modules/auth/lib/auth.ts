import { supabase } from '@/infrastructure/supabase/supabase'
import { UserTeam } from '@/modules/auth/types'
import { Session } from '@supabase/supabase-js'
import { usePostHog } from 'posthog-js/react'
import { useEffect } from 'react'
import { useAuthStore } from '@/modules/auth/store/auth-store'

export async function getUserTeam(
  session: Session,
): Promise<UserTeam | undefined> {
  try {
    const { data: defaultTeam, error } = await supabase!
      .from('users_teams')
      .select('teams (id, name, tier, email)')
      .eq('user_id', session?.user.id)
      .eq('is_default', true)
      .single()

    if (error) {
      console.error('Error fetching user team:', error)
      return undefined
    }

    return defaultTeam?.teams as unknown as UserTeam
  } catch (error) {
    console.error('Unexpected error fetching user team:', error)
    return undefined
  }
}

export function useAuth() {
  const { 
    session, 
    userTeam,
    setSession, 
    setUserTeam, 
    setAuthDialog, 
    setAuthView 
  } = useAuthStore()
  const posthog = usePostHog()

  useEffect(() => {
    if (!supabase) {
      console.warn('Supabase is not initialized')
      return setSession({ user: { email: 'demo@e2b.dev' } } as Session)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        getUserTeam(session).then(setUserTeam)
        if (!session.user.user_metadata.is_fragments_user) {
          supabase?.auth.updateUser({
            data: { is_fragments_user: true },
          })
        }
        posthog.identify(session?.user.id, {
          email: session?.user.email,
          supabase_id: session?.user.id,
        })
        posthog.capture('sign_in')
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)

      if (_event === 'PASSWORD_RECOVERY') {
        setAuthView('update_password')
        setAuthDialog(true)
      }

      if (_event === 'USER_UPDATED') {
        // Password was updated successfully
      }

      if (_event === 'SIGNED_IN') {
        getUserTeam(session as Session).then(setUserTeam)
        setAuthDialog(false)
        if (!session?.user.user_metadata.is_fragments_user) {
          supabase?.auth.updateUser({
            data: { is_fragments_user: true },
          })
        }
        posthog.identify(session?.user.id, {
          email: session?.user.email,
          supabase_id: session?.user.id,
        })
        posthog.capture('sign_in')
      }

      if (_event === 'SIGNED_OUT') {
        setAuthView('sign_in')
        setUserTeam(undefined)
        posthog.capture('sign_out')
        posthog.reset()
      }
    })

    return () => subscription.unsubscribe()
  }, [posthog]) // Remove store setters to avoid infinite loops

  return {
    session,
    userTeam,
  }
}
