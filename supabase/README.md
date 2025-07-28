# Supabase Setup for E2B Fragments

This directory contains the SQL migrations needed to set up Supabase for the E2B Fragments application.

## Schema Overview

The application uses Supabase for authentication and team management with the following structure:

### Tables

1. **teams** - Stores team/organization information
   - `id` (UUID, primary key)
   - `name` (text) - Team name
   - `email` (text, unique) - Team email
   - `tier` (text) - Subscription tier: 'free', 'pro', or 'enterprise'
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

2. **users_teams** - Junction table for many-to-many relationship between users and teams
   - `id` (UUID, primary key)
   - `user_id` (UUID, foreign key to auth.users)
   - `team_id` (UUID, foreign key to teams)
   - `is_default` (boolean) - Whether this is the user's default team
   - `role` (text) - User's role in the team: 'owner', 'admin', or 'member'
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

## Setup Instructions

1. Create a new Supabase project at https://supabase.com

2. Get your project credentials:
   - Go to Settings → API
   - Copy the Project URL (for `SUPABASE_URL`)
   - Copy the anon/public key (for `SUPABASE_ANON_KEY`)

3. Add to your `.env.local`:
   ```env
   NEXT_PUBLIC_ENABLE_SUPABASE=true
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Run the migration:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `migrations/001_initial_schema.sql`
   - Click "Run"

5. Configure authentication providers (optional):
   - Go to Authentication → Providers
   - Enable desired providers (GitHub, Google, etc.)
   - Configure OAuth credentials

## Features

- **Automatic team creation**: When a user signs up, a personal team is automatically created for them
- **Row Level Security (RLS)**: Users can only see and interact with teams they belong to
- **Role-based access**: Different permissions for owners, admins, and members
- **Default team**: Each user has a default team for simplified UX

## Security

The schema includes comprehensive RLS policies:
- Users can only view teams they belong to
- Only team owners can update team details
- Only team owners can add/remove team members
- Team admins can view all team members

## Integration with E2B

When creating sandboxes, the application sends team information to E2B via headers:
- `X-Supabase-Team`: Team ID
- `X-Supabase-Token`: Access token

This allows E2B to track usage and apply team-based quotas/limits.