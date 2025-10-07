"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Calendar, User, Package, FileText, Download, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import FacturaDialog from "./factura-dialog"

interface VentaDetalle {
  id: string
  fecha_venta: string
  total: number
  estado: string
  tipo_comprobante?: string
  numero_comprobante?: string
  serie_comprobante?: string
  nubefact_enlace?: string
  nubefact_pdf?: string
  nubefact_xml?: string
  invitado?: {
    nombre: string
    numero_documento?: string
    tipo_documento?: string
  }
  venta_items: Array<{
    cantidad: number
    precio_unitario: number
    subtotal: number
    producto: {
      nombre: string
    }
  }>
}

interface DetalleVentaDialogProps {
  open: boolean
  ventaId: string | null
  onClose: () => void
}

export default function DetalleVentaDialog({ open, ventaId, onClose }: DetalleVentaDialogProps) {
  const { toast } = useToast()
  const [venta, setVenta] = useState<VentaDetalle | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [facturaDialogOpen, setFacturaDialogOpen] = useState(false)

  useEffect(() => {
    if (open && ventaId) {
      loadVentaDetalle()
    }
  }, [open, ventaId])

  const loadVentaDetalle = async () => {
    if (!ventaId) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("ventas")
        .select(
          `
          *,
          invitado:invitados(*),
          venta_items(
            cantidad,
            precio_unitario,
            subtotal,
            producto:productos(nombre)
          )
        `,
        )
        .eq("id", ventaId)
        .single()

      if (error) throw error
      setVenta(data)
    } catch (error) {
      console.error("[v0] Error cargando detalle de venta:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el detalle de la venta",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleFacturaDialogClose = () => {
    setFacturaDialogOpen(false)
    loadVentaDetalle() // Reload to get updated comprobante info
  }

  const tieneComprobante = venta?.numero_comprobante && venta?.serie_comprobante

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detalle de Venta
            </DialogTitle>
            <DialogDescription>Información completa de la transacción</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : venta ? (
            <div className="space-y-6">
              {tieneComprobante && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold text-lg">
                            {venta.tipo_comprobante === "factura" ? "Factura Electrónica" : "Boleta de Venta"}
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {venta.serie_comprobante}-{venta.numero_comprobante}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default">Emitido</Badge>
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-2">
                      {venta.nubefact_pdf && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={venta.nubefact_pdf} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </a>
                        </Button>
                      )}
                      {venta.nubefact_xml && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={venta.nubefact_xml} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            XML
                          </a>
                        </Button>
                      )}
                      {venta.nubefact_enlace && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={venta.nubefact_enlace} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver en Nubefact
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información general */}
              <Card>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Cliente:</span>
                    <span className="font-medium">{venta.invitado?.nombre || "Cliente"}</span>
                  </div>
                  {venta.invitado?.numero_documento && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Documento:</span>
                      <span className="font-medium">
                        {venta.invitado.tipo_documento || "DNI"}: {venta.invitado.numero_documento}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Fecha:</span>
                    <span className="font-medium">{formatDate(venta.fecha_venta)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Estado:</span>
                    <Badge variant="default" className="capitalize">
                      {venta.estado}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Productos */}
              <div>
                <h3 className="mb-3 text-lg font-semibold">Productos</h3>
                <div className="space-y-2">
                  {venta.venta_items.map((item, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{item.producto.nombre}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.cantidad} x S/. {Number(item.precio_unitario).toFixed(2)}
                            </p>
                          </div>
                          <p className="text-lg font-semibold">S/. {Number(item.subtotal).toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Total */}
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Subtotal:</span>
                      <span>S/. {(venta.total / 1.18).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>IGV (18%):</span>
                      <span>S/. {(venta.total - venta.total / 1.18).toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold">Total de la Venta</span>
                      <span className="text-3xl font-bold text-primary">S/. {Number(venta.total).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!tieneComprobante && (
                <Button onClick={() => setFacturaDialogOpen(true)} className="w-full" size="lg">
                  <FileText className="mr-2 h-5 w-5" />
                  Generar Comprobante Electrónico
                </Button>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">No se encontró la venta</div>
          )}
        </DialogContent>
      </Dialog>

      {venta && <FacturaDialog open={facturaDialogOpen} venta={venta} onClose={handleFacturaDialogClose} />}
    </>
  )
}
