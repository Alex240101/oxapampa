"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function HistorialGuiasTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Guías de Remisión</CardTitle>
        <CardDescription>Lista de todas las guías de remisión generadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="mb-4 h-16 w-16 opacity-20" />
          <p className="text-lg font-medium">No hay guías registradas</p>
          <p className="text-sm">Las guías generadas aparecerán aquí</p>
        </div>
      </CardContent>
    </Card>
  )
}
