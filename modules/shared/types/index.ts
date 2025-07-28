import { ToastProps } from '@/modules/shared/components/ui/toast'

// Loading state
export interface LoadingStateProps {
  message?: string
}

// Toast types
export type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

export type ToastActionElement = React.ReactElement<typeof import('@/modules/shared/components/ui/toast').ToastAction>

// Duration types
export type Unit = 'ms' | 's' | 'm' | 'h' | 'd'

// Common error types
export interface BaseError {
  message: string
  code?: string
  details?: any
}

// Metadata type for various uses
export type Metadata = Record<string, any>

// Re-export execution result types
export type { ExecutionResult, ExecutionResultStreaming } from '@/modules/shared/lib/types'