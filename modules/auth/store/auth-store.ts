import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Session } from '@supabase/supabase-js'
import { UserTeam, ViewType, VIEWS } from '@/modules/auth/types'

interface AuthState {
  // State
  session: Session | null
  userTeam: UserTeam | undefined
  isAuthDialogOpen: boolean
  authView: ViewType
  
  // Actions
  setSession: (session: Session | null) => void
  setUserTeam: (team: UserTeam | undefined) => void
  setAuthDialog: (open: boolean) => void
  setAuthView: (view: ViewType) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      // Initial state
      session: null,
      userTeam: undefined,
      isAuthDialogOpen: false,
      authView: VIEWS.SIGN_IN,
      
      // Actions
      setSession: (session) => set({ session }, false, 'setSession'),
      
      setUserTeam: (team) => set({ userTeam: team }, false, 'setUserTeam'),
      
      setAuthDialog: (open) => set({ isAuthDialogOpen: open }, false, 'setAuthDialog'),
      
      setAuthView: (view) => set({ authView: view }, false, 'setAuthView'),
      
      signOut: () => set({
        session: null,
        userTeam: undefined,
        authView: VIEWS.SIGN_IN
      }, false, 'signOut'),
    }),
    {
      name: 'auth-store',
    }
  )
)