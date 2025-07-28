import { Button } from '@/modules/shared/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/modules/shared/components/ui/tooltip'
import { ChevronsLeft } from 'lucide-react'

export function PreviewCollapsed({
  onExpand,
  hasFragment,
}: {
  onExpand: () => void
  hasFragment: boolean
}) {
  if (!hasFragment) {
    return null
  }

  return (
    <div className="absolute inset-0 z-10 shadow-2xl md:rounded-tl-3xl md:rounded-bl-3xl md:border-l md:border-y bg-popover flex items-center justify-center">
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground h-full w-full rounded-none md:rounded-tl-3xl md:rounded-bl-3xl"
              onClick={onExpand}
            >
              <ChevronsLeft className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Show preview</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}