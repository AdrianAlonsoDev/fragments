export interface Project {
  id: string
  team_id: string
  name: string
  description?: string
  sandbox_id?: string
  template_id: string
  last_activity: Date
  created_at: Date
  updated_at: Date
}

export interface ProjectMessage {
  id: string
  project_id: string
  role: 'user' | 'assistant' | 'system'
  content: any
  fragment?: any
  result?: any
  created_at: Date
}