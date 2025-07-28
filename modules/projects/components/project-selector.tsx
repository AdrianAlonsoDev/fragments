'use client'

import { Project } from '@/modules/projects/types/project-types'
import { Button } from '@/modules/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/modules/shared/components/ui/dropdown-menu'
import { ChevronDown, Plus, FolderOpen, MoreVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/modules/shared/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/modules/shared/components/ui/alert-dialog'
import { Input } from '@/modules/shared/components/ui/input'
import { Label } from '@/modules/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/modules/shared/components/ui/select'
import templates from '@/modules/templates/lib/templates'

interface ProjectSelectorProps {
  projects: Project[]
  currentProject: Project | null
  onProjectSelect: (project: Project) => void
  onProjectCreate: (project: { name: string; description?: string; template_id: string; team_id: string }) => Promise<void>
  onProjectDelete?: (projectId: string) => Promise<void>
  teamId: string
}

export function ProjectSelector({
  projects,
  currentProject,
  onProjectSelect,
  onProjectCreate,
  onProjectDelete,
  teamId
}: ProjectSelectorProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    template_id: 'code-interpreter-v1'
  })

  const handleCreate = async () => {
    if (!newProject.name.trim()) return

    setIsCreating(true)
    try {
      await onProjectCreate({
        ...newProject,
        team_id: teamId
      })
      // Reset all state before closing
      setNewProject({ name: '', description: '', template_id: 'code-interpreter-v1' })
      setIsCreating(false)
      // Force close dialog
      setIsCreateOpen(false)
    } catch (error) {
      console.error('Failed to create project:', error)
      setIsCreating(false)
      // Keep dialog open on error
    }
  }

  const handleDelete = async () => {
    if (!projectToDelete || !onProjectDelete) return

    setIsDeleting(true)
    try {
      await onProjectDelete(projectToDelete.id)
      // Reset state before closing
      setProjectToDelete(null)
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
    } catch (error) {
      console.error('Failed to delete project:', error)
      setIsDeleting(false)
      // Keep dialog open on error
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation()
    setProjectToDelete(project)
    setDropdownOpen(false)
    setTimeout(() => {
      setDeleteConfirmOpen(true)
    }, 100)
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="min-w-[200px] justify-between">
            <span className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              {currentProject ? currentProject.name : 'Select Project'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {projects.length === 0 ? (
            <DropdownMenuItem disabled>
              No projects yet
            </DropdownMenuItem>
          ) : (
            projects.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => {
                  onProjectSelect(project)
                  setDropdownOpen(false)
                }}
                className="cursor-pointer justify-between group"
              >
                <span className="flex items-center">
                  <FolderOpen className="mr-2 h-4 w-4" />
                  {project.name}
                </span>
                {onProjectDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => handleDeleteClick(e, project)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setDropdownOpen(false)
            setTimeout(() => setIsCreateOpen(true), 100)
          }} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog 
        open={isCreateOpen} 
        modal={true}
        onOpenChange={(open) => {
          if (!isCreating) {
            setIsCreateOpen(open)
            // Reset form when closing
            if (!open) {
              setNewProject({ name: '', description: '', template_id: 'code-interpreter-v1' })
            }
          }
        }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new project with its own persistent sandbox environment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Awesome Project"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="A brief description..."
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select
                value={newProject.template_id}
                onValueChange={(value) => setNewProject(prev => ({ ...prev, template_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(templates).map(([id, template]) => (
                    <SelectItem key={id} value={id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!newProject.name.trim() || isCreating}>
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog 
        open={deleteConfirmOpen} 
        onOpenChange={(open) => {
          if (!isDeleting) {
            setDeleteConfirmOpen(open)
            if (!open) {
              setProjectToDelete(null)
            }
          }
        }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{projectToDelete?.name}"? This will permanently delete the project and its sandbox. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}