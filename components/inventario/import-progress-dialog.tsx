"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2 } from "lucide-react"

interface ImportProgressDialogProps {
  open: boolean
  progress: number
  currentItem: string
  processedCount: number
  totalCount: number
  estimatedTimeRemaining: string
}

export function ImportProgressDialog({
  open,
  progress,
  currentItem,
  processedCount,
  totalCount,
  estimatedTimeRemaining,
}: ImportProgressDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-md sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
            Importando productos
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Por favor espere mientras se importan los productos...
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">
                {processedCount} / {totalCount}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span className="text-right">Tiempo estimado: {estimatedTimeRemaining}</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs sm:text-sm text-muted-foreground">Procesando:</p>
            <p className="text-xs sm:text-sm font-medium truncate">{currentItem}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
