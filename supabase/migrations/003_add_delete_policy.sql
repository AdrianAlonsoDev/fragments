-- Add DELETE policy for projects
CREATE POLICY "team_members_can_delete_projects" ON projects
  FOR DELETE 
  USING (
    team_id IN (
      SELECT team_id FROM users_teams 
      WHERE user_id = auth.uid()
    )
  );

-- Add DELETE policy for project messages (cascade delete should handle this, but just in case)
CREATE POLICY "users_can_delete_project_messages" ON project_messages
  FOR DELETE 
  USING (
    project_id IN (
      SELECT id FROM projects WHERE team_id IN (
        SELECT team_id FROM users_teams WHERE user_id = auth.uid()
      )
    )
  );