interface LoadingStateProps {
  message?: string
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-pulse">{message}</div>
    </div>
  )
}