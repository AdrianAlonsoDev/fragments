// Re-export template types
export type { Templates, TemplateId } from '@/modules/templates/lib/templates'

// Template selection types
export interface TemplateSelectionProps {
  templates: Templates
  selectedTemplate: 'auto' | TemplateId
  onTemplateChange: (template: 'auto' | TemplateId) => void
}