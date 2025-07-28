# Project-Based Sandbox Implementation Session

## Overview

This session transformed the E2B Fragments application from a fragment-based system (where each message created a new ephemeral sandbox) into a project-based system with persistent sandboxes that can be paused and resumed.

## Key Changes Implemented

### 1. Database Schema

Created new tables for project management:

- **`projects` table**: Stores project information including sandbox ID, template, and activity tracking
- **`project_messages` table**: Stores chat history per project with fragments and execution results

Key features:
- Row Level Security (RLS) policies for team-based access control
- Cascade delete for cleaning up messages when projects are deleted
- Activity tracking for auto-cleanup of inactive projects

### 2. Sandbox Persistence

Implemented E2B's pause/resume functionality:
- Sandboxes can be paused (saves filesystem and memory state)
- Sandboxes can be resumed from saved state
- 1-hour timeout with auto-extend on activity
- Automatic sandbox management with in-memory cache

**SandboxManager Service** (`lib/sandbox-manager.ts`):
- Handles sandbox lifecycle (create, pause, resume, kill)
- Maintains active sandbox cache
- Updates sandbox IDs in database
- Graceful error handling for expired sandboxes

### 3. Project Management UI

**ProjectSelector Component** (`components/project-selector.tsx`):
- Dropdown selector always visible in navbar
- Create new projects with name, description, and template
- Delete projects with confirmation dialog
- Shows current project and allows switching

### 4. State Management

**Hooks** (`hooks/useProject.ts`):
- `useProject`: Manages single project state and messages
- `useProjects`: Manages list of projects with CRUD operations
- Real-time updates via Supabase subscriptions
- Proper WebSocket cleanup to prevent memory leaks

### 5. API Routes

Created project-scoped API routes:
- `/api/projects/[projectId]/chat`: Chat with project context
- `/api/projects/[projectId]/sandbox`: Execute code in project sandbox
- `/api/projects/[projectId]/messages`: Message history management

### 6. Bug Fixes and Improvements

1. **Fixed WebSocket cleanup issues**: Changed from `removeChannel()` to `unsubscribe()`
2. **Fixed hydration errors**: Proper state clearing on project switch
3. **Fixed delete functionality**: Added missing RLS DELETE policy
4. **Fixed sandbox state persistence**: Each project maintains its own sandbox
5. **Fixed UI state management**: Proper loading of last fragment/result when switching projects

## Architecture Benefits

1. **Persistent Development Environment**: Each project maintains its own sandbox with installed dependencies and file system
2. **Cost Efficient**: Auto-pause inactive sandboxes, resume only when needed
3. **Better UX**: Switch between projects seamlessly, maintain context
4. **Scalable**: Supports multiple concurrent projects per team
5. **Clean Separation**: Each project is isolated with its own chat history and sandbox

## Technical Implementation Details

### E2B Sandbox Lifecycle

```typescript
// Create new sandbox
const sandbox = await Sandbox.create(templateId, {
  metadata: { projectId, teamId },
  timeoutMs: 60 * 60 * 1000 // 1 hour
})

// Pause sandbox (saves state)
const sandboxId = await sandbox.pause()

// Resume sandbox (restores state)
const resumedSandbox = await Sandbox.resume(sandboxId, {
  timeoutMs: 60 * 60 * 1000
})
```

### Project State Flow

1. User selects/creates project
2. System checks for existing sandbox
3. If paused, resume it; if none, create new
4. Execute code in persistent sandbox
5. Save messages with fragments/results to database
6. Auto-extend timeout on activity
7. Auto-pause after inactivity

### Database Migrations

1. `001_initial_schema.sql`: Original fragment-based schema
2. `002_projects_schema.sql`: Added projects and project_messages tables
3. `003_add_delete_policy.sql`: Added DELETE RLS policy (bug fix)

## Known Limitations

1. Sandboxes expire after 30 days of being paused
2. Maximum concurrent sandboxes limited by E2B plan
3. Network services in sandboxes require reconnection after resume

## Future Enhancements

1. Project sharing and collaboration
2. Auto-cleanup script for inactive projects
3. Project templates and cloning
4. Export/import project state
5. Project-level settings and environment variables

## Summary

The refactoring successfully transformed a simple fragment-based chat interface into a full-featured project management system with persistent development environments. Each project now has its own isolated sandbox that maintains state across sessions, providing a much better development experience while optimizing costs through intelligent resource management.