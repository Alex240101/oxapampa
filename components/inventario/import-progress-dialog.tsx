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
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Importando productos
          </DialogTitle>
          <DialogDescription>Por favor espere mientras se importan los productos...</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">
                {processedCount} / {totalCount}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{Math.round(progress)}%</span>
              <span>Tiempo estimado: {estimatedTimeRemaining}</span>
            </div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Procesando:</p>
            <p className="text-sm font-medium truncate">{currentItem}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
