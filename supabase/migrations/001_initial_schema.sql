-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users_teams junction table
CREATE TABLE users_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique combination of user and team
  UNIQUE(user_id, team_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_teams_user_id ON users_teams(user_id);
CREATE INDEX idx_users_teams_team_id ON users_teams(team_id);
CREATE INDEX idx_users_teams_is_default ON users_teams(user_id, is_default) WHERE is_default = true;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE
  ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_teams_updated_at BEFORE UPDATE
  ON users_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_teams ENABLE ROW LEVEL SECURITY;

-- Simple non-recursive policies to avoid infinite recursion

-- Users_teams policies
-- Users can view their own team memberships
CREATE POLICY "users_can_see_own_memberships" ON users_teams
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Teams policies  
-- Authenticated users can see all teams (simplified to avoid recursion)
CREATE POLICY "authenticated_can_see_teams" ON teams
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Team owners can update their teams
CREATE POLICY "team_owners_can_update" ON teams
  FOR UPDATE 
  USING (
    id IN (
      SELECT team_id FROM users_teams 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- Team owners can manage team members
CREATE POLICY "team_owners_can_manage_members" ON users_teams
  FOR INSERT 
  USING (
    team_id IN (
      SELECT team_id FROM users_teams 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

CREATE POLICY "team_owners_can_delete_members" ON users_teams
  FOR DELETE 
  USING (
    team_id IN (
      SELECT team_id FROM users_teams 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- Function to create a default team for new users
CREATE OR REPLACE FUNCTION public.create_default_team_for_user()
RETURNS TRIGGER 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Create a personal team for the user
  INSERT INTO public.teams (name, email, tier)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'free'
  );
  
  -- Add user to their personal team as owner and set as default
  INSERT INTO public.users_teams (user_id, team_id, role, is_default)
  VALUES (
    NEW.id,
    (SELECT id FROM public.teams WHERE email = NEW.email LIMIT 1),
    'owner',
    true
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default team on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_team_for_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Additional grants for the anon role (used during signup)
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.teams TO anon;
GRANT INSERT ON public.users_teams TO anon;
GRANT SELECT ON public.teams TO anon;
GRANT SELECT ON public.users_teams TO anon;