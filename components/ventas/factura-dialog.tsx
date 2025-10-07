"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, ExternalLink, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FacturaDialogProps {
  open: boolean
  venta: any
  onClose: () => void
}

export default function FacturaDialog({ open, venta, onClose }: FacturaDialogProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [tipoComprobante, setTipoComprobante] = useState<"boleta" | "factura">("boleta")
  const [tipoDocumento, setTipoDocumento] = useState("DNI")
  const [numeroDocumento, setNumeroDocumento] = useState("")
  const [nombreCliente, setNombreCliente] = useState("")
  const [direccion, setDireccion] = useState("")
  const [email, setEmail] = useState("")
  const [comprobante, setComprobante] = useState<any>(null)

  const handleGenerarComprobante = async () => {
    if (!nombreCliente.trim() || !numeroDocumento.trim()) {
      toast({
        title: "Error",
        description: "Complete los datos del cliente",
        variant: "destructive",
      })
      return
    }

    if (tipoComprobante === "factura" && tipoDocumento !== "RUC") {
      toast({
        title: "Error",
        description: "Para factura debe usar RUC",
        variant: "destructive",
      })
      return
    }

    if (tipoDocumento === "DNI" && numeroDocumento.length !== 8) {
      toast({
        title: "Error",
        description: "El DNI debe tener 8 dígitos",
        variant: "destructive",
      })
      return
    }

    if (tipoDocumento === "RUC" && numeroDocumento.length !== 11) {
      toast({
        title: "Error",
        description: "El RUC debe tener 11 dígitos",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch("/api/nubefact/generar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          venta_id: venta.id,
          tipo_comprobante: tipoComprobante,
          cliente: {
            tipo_documento: tipoDocumento,
            numero_documento: numeroDocumento,
            nombre: nombreCliente,
            direccion: direccion || "Lima, Perú",
            email: email || "",
            telefono: "",
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error generando comprobante")
      }

      const data = await response.json()
      setComprobante(data.comprobante)

      toast({
        title: "¡Comprobante Generado!",
        description: `${tipoComprobante === "factura" ? "Factura" : "Boleta"} ${data.comprobante.serie}-${data.comprobante.numero} generada exitosamente`,
      })
    } catch (error: any) {
      console.error("[v0] Error:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el comprobante. Verifique la configuración de Nubefact.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generar Comprobante Electrónico
          </DialogTitle>
          <DialogDescription>Complete los datos para generar la factura o boleta electrónica</DialogDescription>
        </DialogHeader>

        {!comprobante ? (
          <div className="space-y-6">
            {/* Tipo de Comprobante */}
            <div className="space-y-2">
              <Label>Tipo de Comprobante *</Label>
              <Select value={tipoComprobante} onValueChange={(value: any) => setTipoComprobante(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boleta">Boleta de Venta</SelectItem>
                  <SelectItem value="factura">Factura Electrónica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Datos del Cliente */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Datos del Cliente</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Documento *</Label>
                  <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="RUC">RUC</SelectItem>
                      <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                      <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Número de Documento *</Label>
                  <Input
                    value={numeroDocumento}
                    onChange={(e) => setNumeroDocumento(e.target.value)}
                    placeholder={tipoDocumento === "RUC" ? "20123456789" : "12345678"}
                    maxLength={tipoDocumento === "RUC" ? 11 : 8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nombre / Razón Social *</Label>
                <Input
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  placeholder="Nombre completo o razón social"
                />
              </div>

              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Dirección fiscal"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <Separator />

            {/* Resumen de Venta */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Resumen de la Venta</h3>
              <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">S/. {(venta?.total / 1.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IGV (18%):</span>
                  <span className="font-medium">S/. {(venta?.total - venta?.total / 1.18).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-primary">S/. {venta?.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button onClick={handleGenerarComprobante} disabled={isGenerating} className="w-full" size="lg">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando Comprobante...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generar {tipoComprobante === "factura" ? "Factura" : "Boleta"}
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Comprobante Generado */}
            <div className="flex items-center justify-center py-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {comprobante.aceptada_por_sunat ? (
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                  ) : (
                    <XCircle className="h-16 w-16 text-yellow-500" />
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {tipoComprobante === "factura" ? "Factura" : "Boleta"} Electrónica
                  </h3>
                  <p className="text-3xl font-bold text-primary mt-2">
                    {comprobante.serie}-{comprobante.numero}
                  </p>
                  <Badge variant={comprobante.aceptada_por_sunat ? "default" : "secondary"} className="mt-2">
                    {comprobante.aceptada_por_sunat ? "Aceptada por SUNAT" : "Pendiente de validación"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            {/* Enlaces de descarga */}
            <div className="space-y-3">
              <h3 className="font-semibold">Documentos Generados</h3>

              {comprobante.pdf && (
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href={comprobante.pdf} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </Button>
              )}

              {comprobante.xml && (
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href={comprobante.xml} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar XML
                    <ExternalLink className="ml-auto h-4 w-4" />
                  </a>
                </Button>
              )}

              {comprobante.enlace && (
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <a href={comprobante.enlace} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Ver en Nubefact
                  </a>
                </Button>
              )}
            </div>

            <Button onClick={onClose} className="w-full" size="lg">
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
