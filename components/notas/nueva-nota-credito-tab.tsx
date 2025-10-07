"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Search, FileText, Loader2 } from "lucide-react"

export function NuevaNotaCreditoTab() {
  const [loading, setLoading] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [comprobante, setComprobante] = useState<any>(null)
  const { toast } = useToast()

  const [busqueda, setBusqueda] = useState({
    serie: "",
    numero: "",
  })

  const [formData, setFormData] = useState({
    motivo: "01",
    descripcion: "",
  })

  const motivos = [
    { value: "01", label: "Anulación de la operación" },
    { value: "02", label: "Anulación por error en el RUC" },
    { value: "03", label: "Corrección por error en la descripción" },
    { value: "04", label: "Descuento global" },
    { value: "05", label: "Descuento por ítem" },
    { value: "06", label: "Devolución total" },
    { value: "07", label: "Devolución por ítem" },
    { value: "08", label: "Bonificación" },
    { value: "09", label: "Disminución en el valor" },
    { value: "13", label: "Ajustes de operaciones de exportación" },
  ]

  const buscarComprobante = async () => {
    if (!busqueda.serie || !busqueda.numero) {
      toast({
        title: "Error",
        description: "Ingrese serie y número del comprobante",
        variant: "destructive",
      })
      return
    }

    setBuscando(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase
        .from("ventas")
        .select(`
          *,
          items:venta_items(
            *,
            producto:productos(*)
          )
        `)
        .eq("serie_comprobante", busqueda.serie)
        .eq("numero_comprobante", busqueda.numero)
        .single()

      if (error || !data) {
        toast({
          title: "No encontrado",
          description: "No se encontró el comprobante especificado",
          variant: "destructive",
        })
        return
      }

      setComprobante(data)
      toast({
        title: "Comprobante encontrado",
        description: `${data.tipo_comprobante?.toUpperCase()} ${data.serie_comprobante}-${data.numero_comprobante}`,
      })
    } catch (error) {
      console.error("[v0] Error buscando comprobante:", error)
      toast({
        title: "Error",
        description: "Error al buscar el comprobante",
        variant: "destructive",
      })
    } finally {
      setBuscando(false)
    }
  }

  const generarNotaCredito = async () => {
    if (!comprobante) {
      toast({
        title: "Error",
        description: "Primero busque un comprobante",
        variant: "destructive",
      })
      return
    }

    if (!formData.descripcion) {
      toast({
        title: "Error",
        description: "Ingrese una descripción para la nota de crédito",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/nubefact/generar-nota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo: "credito",
          comprobante_id: comprobante.id,
          motivo: formData.motivo,
          descripcion: formData.descripcion,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al generar nota de crédito")
      }

      toast({
        title: "Nota de crédito generada",
        description: `Nota ${data.comprobante.serie}-${data.comprobante.numero} generada exitosamente`,
      })

      // Limpiar formulario
      setComprobante(null)
      setBusqueda({ serie: "", numero: "" })
      setFormData({ motivo: "01", descripcion: "" })
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
      {/* Buscar comprobante */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Comprobante
          </CardTitle>
          <CardDescription>Ingrese la serie y número del comprobante a modificar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="serie">Serie</Label>
              <Input
                id="serie"
                placeholder="FFF1 o BBB1"
                value={busqueda.serie}
                onChange={(e) => setBusqueda({ ...busqueda, serie: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                placeholder="00000001"
                value={busqueda.numero}
                onChange={(e) => setBusqueda({ ...busqueda, numero: e.target.value })}
              />
            </div>
          </div>

          <Button onClick={buscarComprobante} disabled={buscando} className="w-full">
            {buscando ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar Comprobante
              </>
            )}
          </Button>

          {comprobante && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Comprobante:</span>
                <span className="text-sm">
                  {comprobante.tipo_comprobante?.toUpperCase()} {comprobante.serie_comprobante}-
                  {comprobante.numero_comprobante}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Cliente:</span>
                <span className="text-sm">{comprobante.cliente_nombre}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-sm font-bold">S/. {Number(comprobante.total).toFixed(2)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Datos de la nota */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Datos de la Nota de Crédito
          </CardTitle>
          <CardDescription>Complete la información de la nota de crédito</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo *</Label>
            <Select value={formData.motivo} onValueChange={(value) => setFormData({ ...formData, motivo: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {motivos.map((motivo) => (
                  <SelectItem key={motivo.value} value={motivo.value}>
                    {motivo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              placeholder="Describa el motivo de la nota de crédito..."
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={4}
            />
          </div>

          <Button onClick={generarNotaCredito} disabled={loading || !comprobante} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generar Nota de Crédito
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
