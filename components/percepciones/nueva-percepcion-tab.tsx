"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Percent, Loader2, DollarSign, User } from "lucide-react"

export function NuevaPercepcionTab() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    cliente_tipo_documento: "RUC",
    cliente_numero_documento: "",
    cliente_nombre: "",
    cliente_direccion: "",
    fecha_emision: new Date().toISOString().split("T")[0],
    total_percibido: "",
    observaciones: "",
  })

  const generarPercepcion = async () => {
    if (!formData.cliente_numero_documento || !formData.cliente_nombre || !formData.total_percibido) {
      toast({
        title: "Error",
        description: "Complete todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/nubefact/generar-percepcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al generar percepción")
      }

      toast({
        title: "Percepción generada",
        description: `Comprobante ${data.comprobante.serie}-${data.comprobante.numero} generado exitosamente`,
      })

      // Limpiar formulario
      setFormData({
        cliente_tipo_documento: "RUC",
        cliente_numero_documento: "",
        cliente_nombre: "",
        cliente_direccion: "",
        fecha_emision: new Date().toISOString().split("T")[0],
        total_percibido: "",
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
            <User className="h-5 w-5" />
            Datos del Cliente
          </CardTitle>
          <CardDescription>Información del cliente sujeto a percepción</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cliente_tipo_documento">Tipo de Documento *</Label>
              <Select
                value={formData.cliente_tipo_documento}
                onValueChange={(value) => setFormData({ ...formData, cliente_tipo_documento: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                  <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_numero_documento">Número de Documento *</Label>
              <Input
                id="cliente_numero_documento"
                placeholder={formData.cliente_tipo_documento === "RUC" ? "20123456789" : "12345678"}
                maxLength={formData.cliente_tipo_documento === "RUC" ? 11 : 8}
                value={formData.cliente_numero_documento}
                onChange={(e) => setFormData({ ...formData, cliente_numero_documento: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_nombre">Nombre / Razón Social *</Label>
            <Input
              id="cliente_nombre"
              placeholder="Nombre completo o razón social"
              value={formData.cliente_nombre}
              onChange={(e) => setFormData({ ...formData, cliente_nombre: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cliente_direccion">Dirección</Label>
            <Input
              id="cliente_direccion"
              placeholder="Dirección fiscal"
              value={formData.cliente_direccion}
              onChange={(e) => setFormData({ ...formData, cliente_direccion: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Datos de la Percepción
          </CardTitle>
          <CardDescription>Información del comprobante de percepción</CardDescription>
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
            <Label htmlFor="total_percibido">Total Percibido (S/.) *</Label>
            <Input
              id="total_percibido"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.total_percibido}
              onChange={(e) => setFormData({ ...formData, total_percibido: e.target.value })}
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

          <Button onClick={generarPercepcion} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Percent className="mr-2 h-4 w-4" />
                Generar Percepción
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
