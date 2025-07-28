#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { SandboxManager } from '../lib/sandbox-manager'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupInactiveProjects() {
  console.log('Starting cleanup of inactive projects...')
  
  // Find projects inactive for more than 24 hours
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - 24)
  
  const { data: inactiveProjects, error } = await supabase
    .from('projects')
    .select('id, name, sandbox_id')
    .lt('last_activity', cutoffTime.toISOString())
    .not('sandbox_id', 'is', null)
  
  if (error) {
    console.error('Error fetching inactive projects:', error)
    return
  }
  
  console.log(`Found ${inactiveProjects?.length || 0} inactive projects`)
  
  for (const project of inactiveProjects || []) {
    try {
      console.log(`Pausing project: ${project.name} (${project.id})`)
      await SandboxManager.pauseProject(project.id)
      console.log(`Successfully paused project: ${project.name}`)
    } catch (error) {
      console.error(`Failed to pause project ${project.name}:`, error)
    }
  }
  
  console.log('Cleanup completed')
}

// Run cleanup
cleanupInactiveProjects()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Cleanup failed:', error)
    process.exit(1)
  })