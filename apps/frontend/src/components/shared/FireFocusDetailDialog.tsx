import { Dialog, DialogContent } from '@/components/ui/dialog'

import { FireFocusDetailView } from './FireFocusDetailView'

interface FireFocusDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fireId: string | null
}

export const FireFocusDetailDialog = ({ open, onOpenChange, fireId }: FireFocusDetailDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-full max-w-2xl flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {fireId ? <FireFocusDetailView fireId={fireId} /> : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
