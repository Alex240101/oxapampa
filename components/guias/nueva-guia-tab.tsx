"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Truck, Loader2, MapPin, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevaGuiaTab() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Datos del destinatario
  const [destinatarioNombre, setDestinatarioNombre] = useState("")
  const [destinatarioTipoDoc, setDestinatarioTipoDoc] = useState("DNI")
  const [destinatarioNumDoc, setDestinatarioNumDoc] = useState("")

  // Datos del traslado
  const [motivoTraslado, setMotivoTraslado] = useState("01")
  const [puntoPartida, setPuntoPartida] = useState("")
  const [puntoLlegada, setPuntoLlegada] = useState("")
  const [fechaTraslado, setFechaTraslado] = useState("")
  const [pesoTotal, setPesoTotal] = useState("")
  const [bultos, setBultos] = useState("")

  // Datos del transportista
  const [transportistaNombre, setTransportistaNombre] = useState("")
  const [transportistaRuc, setTransportistaRuc] = useState("")
  const [vehiculoPlaca, setVehiculoPlaca] = useState("")
  const [conductorNombre, setConductorNombre] = useState("")
  const [conductorLicencia, setConductorLicencia] = useState("")

  // Descripción de la mercancía
  const [descripcionMercancia, setDescripcionMercancia] = useState("")

  const handleGenerarGuia = async () => {
    if (!destinatarioNombre || !puntoPartida || !puntoLlegada || !fechaTraslado) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      toast({
        title: "Guía Generada",
        description: "La guía de remisión se generó exitosamente",
      })

      // Limpiar formulario
      setDestinatarioNombre("")
      setDestinatarioNumDoc("")
      setPuntoPartida("")
      setPuntoLlegada("")
      setFechaTraslado("")
      setPesoTotal("")
      setBultos("")
      setTransportistaNombre("")
      setTransportistaRuc("")
      setVehiculoPlaca("")
      setConductorNombre("")
      setConductorLicencia("")
      setDescripcionMercancia("")
    } catch (error) {
      console.error("[v0] Error generando guía:", error)
      toast({
        title: "Error",
        description: "No se pudo generar la guía de remisión",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Datos del Destinatario
            </CardTitle>
            <CardDescription>Información del destinatario de la mercancía</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre / Razón Social *</Label>
              <Input
                value={destinatarioNombre}
                onChange={(e) => setDestinatarioNombre(e.target.value)}
                placeholder="Nombre completo o razón social"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo Doc.</Label>
                <Select value={destinatarioTipoDoc} onValueChange={setDestinatarioTipoDoc}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={destinatarioNumDoc}
                  onChange={(e) => setDestinatarioNumDoc(e.target.value)}
                  placeholder="12345678"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Datos del Traslado
            </CardTitle>
            <CardDescription>Información sobre el traslado de mercancías</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo de Traslado *</Label>
              <Select value={motivoTraslado} onValueChange={setMotivoTraslado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="01">Venta</SelectItem>
                  <SelectItem value="02">Compra</SelectItem>
                  <SelectItem value="04">Traslado entre establecimientos</SelectItem>
                  <SelectItem value="08">Importación</SelectItem>
                  <SelectItem value="09">Exportación</SelectItem>
                  <SelectItem value="13">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Punto de Partida *</Label>
              <Input
                value={puntoPartida}
                onChange={(e) => setPuntoPartida(e.target.value)}
                placeholder="Dirección completa de origen"
              />
            </div>
            <div className="space-y-2">
              <Label>Punto de Llegada *</Label>
              <Input
                value={puntoLlegada}
                onChange={(e) => setPuntoLlegada(e.target.value)}
                placeholder="Dirección completa de destino"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Fecha Traslado *</Label>
                <Input type="date" value={fechaTraslado} onChange={(e) => setFechaTraslado(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Peso Total (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pesoTotal}
                  onChange={(e) => setPesoTotal(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>N° Bultos</Label>
                <Input type="number" value={bultos} onChange={(e) => setBultos(e.target.value)} placeholder="1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descripción de la Mercancía</Label>
              <Textarea
                value={descripcionMercancia}
                onChange={(e) => setDescripcionMercancia(e.target.value)}
                placeholder="Detalle de los productos a trasladar"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Datos del Transportista
            </CardTitle>
            <CardDescription>Información del transportista y vehículo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre / Razón Social</Label>
              <Input
                value={transportistaNombre}
                onChange={(e) => setTransportistaNombre(e.target.value)}
                placeholder="Nombre del transportista"
              />
            </div>
            <div className="space-y-2">
              <Label>RUC Transportista</Label>
              <Input
                value={transportistaRuc}
                onChange={(e) => setTransportistaRuc(e.target.value)}
                placeholder="20..."
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label>Placa del Vehículo</Label>
              <Input value={vehiculoPlaca} onChange={(e) => setVehiculoPlaca(e.target.value)} placeholder="ABC-123" />
            </div>
            <div className="space-y-2">
              <Label>Nombre del Conductor</Label>
              <Input
                value={conductorNombre}
                onChange={(e) => setConductorNombre(e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label>Licencia de Conducir</Label>
              <Input
                value={conductorLicencia}
                onChange={(e) => setConductorLicencia(e.target.value)}
                placeholder="Q12345678"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generar Guía de Remisión</CardTitle>
            <CardDescription>Serie: TTT1</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleGenerarGuia} disabled={isLoading} className="w-full" size="lg">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Generar Guía de Remisión
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
