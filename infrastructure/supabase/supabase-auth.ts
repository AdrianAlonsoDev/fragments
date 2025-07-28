import { createClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates an authenticated Supabase client using the provided access token.
 * This client will have the proper user context for RLS policies.
 */
export function createAuthenticatedClient(accessToken: string): SupabaseClient | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables not configured')
    return null
  }

  if (!accessToken) {
    console.error('No access token provided for authenticated client')
    return null
  }

  try {
    console.log('Creating authenticated client with token:', accessToken.substring(0, 20) + '...')
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      }
    )

    console.log('Authenticated client created successfully')
    return client
  } catch (error) {
    console.error('Failed to create authenticated Supabase client:', error)
    return null
  }
}