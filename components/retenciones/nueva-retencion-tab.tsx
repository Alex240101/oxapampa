"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Receipt, Loader2, DollarSign } from "lucide-react"

export function NuevaRetencionTab() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    proveedor_ruc: "",
    proveedor_nombre: "",
    proveedor_direccion: "",
    fecha_emision: new Date().toISOString().split("T")[0],
    total_retenido: "",
    observaciones: "",
  })

  const generarRetencion = async () => {
    if (!formData.proveedor_ruc || !formData.proveedor_nombre || !formData.total_retenido) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/nubefact/generar-retencion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al generar retención")
      }

      toast({
        title: "Retención generada",
        description: `Comprobante ${data.comprobante.serie}-${data.comprobante.numero} generado exitosamente`,
      })

      // Limpiar formulario
      setFormData({
        proveedor_ruc: "",
        proveedor_nombre: "",
        proveedor_direccion: "",
        fecha_emision: new Date().toISOString().split("T")[0],
        total_retenido: "",
        observaciones: "",
      })
    } catch (error: any) {
      console.error("[v0] Error:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Datos del Proveedor
          </CardTitle>
          <CardDescription>Información del proveedor sujeto a retención</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proveedor_ruc">RUC del Proveedor *</Label>
            <Input
              id="proveedor_ruc"
              placeholder="20123456789"
              maxLength={11}
              value={formData.proveedor_ruc}
              onChange={(e) => setFormData({ ...formData, proveedor_ruc: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedor_nombre">Razón Social *</Label>
            <Input
              id="proveedor_nombre"
              placeholder="Nombre o razón social del proveedor"
              value={formData.proveedor_nombre}
              onChange={(e) => setFormData({ ...formData, proveedor_nombre: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proveedor_direccion">Dirección</Label>
            <Input
              id="proveedor_direccion"
              placeholder="Dirección fiscal"
              value={formData.proveedor_direccion}
              onChange={(e) => setFormData({ ...formData, proveedor_direccion: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Datos de la Retención
          </CardTitle>
          <CardDescription>Información del comprobante de retención</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fecha_emision">Fecha de Emisión *</Label>
            <Input
              id="fecha_emision"
              type="date"
              value={formData.fecha_emision}
              onChange={(e) => setFormData({ ...formData, fecha_emision: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_retenido">Total Retenido (S/.) *</Label>
            <Input
              id="total_retenido"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.total_retenido}
              onChange={(e) => setFormData({ ...formData, total_retenido: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Input
              id="observaciones"
              placeholder="Observaciones adicionales"
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </div>

          <Button onClick={generarRetencion} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Receipt className="mr-2 h-4 w-4" />
                Generar Retención
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
