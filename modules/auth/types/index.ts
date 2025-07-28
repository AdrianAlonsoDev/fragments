import { Provider, SupabaseClient } from '@supabase/supabase-js'

// User and team types
export type UserTeam = {
  email: string
  id: string
  name: string
  tier: string
}

// View types
export const VIEWS = {
  SIGN_IN: 'sign_in',
  SIGN_UP: 'sign_up',
  FORGOTTEN_PASSWORD: 'forgotten_password',
  MAGIC_LINK: 'magic_link',
  UPDATE_PASSWORD: 'update_password',
} as const

export type ViewType = (typeof VIEWS)[keyof typeof VIEWS]

export type RedirectTo = undefined | string

// Metadata types
export interface AuthMetadata {
  is_fragments_user?: boolean
  [key: string]: any
}

// Component props
export interface AuthProps {
  supabaseClient: SupabaseClient
  socialLayout?: 'horizontal' | 'vertical'
  providers?: Provider[]
  view?: ViewType
  redirectTo?: RedirectTo
  onlyThirdPartyProviders?: boolean
  magicLink?: boolean
  onSignUpValidate?: (email: string, password: string) => Promise<boolean>
  metadata?: AuthMetadata
}

export interface SubComponentProps {
  supabaseClient: SupabaseClient
  setAuthView: (view: ViewType) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setMessage: (message: string | null) => void
  clearMessages: () => void
  loading: boolean
  redirectTo?: RedirectTo
}

export interface SocialAuthProps {
  supabaseClient: SupabaseClient
  providers: Provider[]
  layout?: 'horizontal' | 'vertical'
  redirectTo?: RedirectTo
  setLoading: (loading: boolean) => void
  setError: (error: string) => void
  clearMessages: () => void
  loading: boolean
}

export interface EmailAuthProps extends SubComponentProps {
  view: typeof VIEWS.SIGN_IN | typeof VIEWS.SIGN_UP
  magicLink?: boolean
  onSignUpValidate?: (email: string, password: string) => Promise<boolean>
  metadata?: AuthMetadata
}

export interface UseAuthFormReturn {
  loading: boolean
  error: string | null
  message: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setMessage: (message: string | null) => void
  clearMessages: () => void
}

// Error types
export interface AuthError {
  message: string
  status?: number
  code?: string
}