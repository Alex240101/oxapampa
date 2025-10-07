"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Calendar, User, TrendingUp, DollarSign, ShoppingBag, FileText, Download } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import DetalleVentaDialog from "./detalle-venta-dialog"

interface Venta {
  id: string
  fecha_venta: string
  total: number
  estado: string
  tipo_comprobante?: string
  numero_comprobante?: string
  serie_comprobante?: string
  invitado?: {
    nombre: string
  }
  nubefact_pdf?: string
}

export default function HistorialVentasTab() {
  const { toast } = useToast()
  const [ventas, setVentas] = useState<Venta[]>([])
  const [filteredVentas, setFilteredVentas] = useState<Venta[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVentaId, setSelectedVentaId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const loadVentas = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("ventas")
        .select(`
          *,
          invitado:invitados(nombre)
        `)
        .order("fecha_venta", { ascending: false })

      if (error) throw error
      setVentas(data || [])
      setFilteredVentas(data || [])
    } catch (error) {
      console.error("[v0] Error cargando ventas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadVentas()
  }, [])

  useEffect(() => {
    const filtered = ventas.filter(
      (venta) =>
        venta.invitado?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venta.id.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredVentas(filtered)
  }, [searchTerm, ventas])

  const handleVerDetalle = (ventaId: string) => {
    setSelectedVentaId(ventaId)
    setDialogOpen(true)
  }

  const handleDescargarComprobante = async (venta: Venta) => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("ventas")
        .select("nubefact_pdf, tipo_comprobante, serie_comprobante, numero_comprobante")
        .eq("id", venta.id)
        .single()

      if (error) throw error

      if (data.nubefact_pdf) {
        window.open(data.nubefact_pdf, "_blank")
        toast({
          title: "Descargando comprobante",
          description: `${data.tipo_comprobante === "factura" ? "Factura" : "Boleta"} ${data.serie_comprobante}-${data.numero_comprobante}`,
        })
      } else {
        toast({
          title: "No disponible",
          description: "Esta venta no tiene comprobante electrónico generado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[v0] Error descargando comprobante:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar el comprobante",
        variant: "destructive",
      })
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

  const calcularTotalVentas = () => {
    return filteredVentas.reduce((sum, venta) => sum + Number(venta.total), 0)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando historial...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Total Ventas</CardDescription>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{filteredVentas.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Transacciones registradas</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Monto Total</CardDescription>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">S/. {calcularTotalVentas().toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Ingresos acumulados</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Promedio por Venta</CardDescription>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-chart-2">
              S/. {filteredVentas.length > 0 ? (calcularTotalVentas() / filteredVentas.length).toFixed(2) : "0.00"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Ticket promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda */}
      <Card className="border-border bg-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente o ID de venta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de ventas */}
      {filteredVentas.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-16 w-16 text-muted-foreground opacity-20" />
            <p className="text-lg font-medium text-foreground">
              {searchTerm ? "No se encontraron ventas" : "No hay ventas registradas"}
            </p>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "Intente con otro término de búsqueda" : "Las ventas aparecerán aquí"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredVentas.map((venta) => (
            <Card key={venta.id} className="border-border bg-card hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold text-foreground">{venta.invitado?.nombre || "Cliente"}</p>
                      <Badge variant="secondary">{venta.estado}</Badge>
                      {venta.numero_comprobante && venta.serie_comprobante && (
                        <Badge variant="default" className="gap-1">
                          <FileText className="h-3 w-3" />
                          {venta.serie_comprobante}-{venta.numero_comprobante}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{formatDate(venta.fecha_venta)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">ID: {venta.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-primary">S/. {Number(venta.total).toFixed(2)}</p>
                    </div>
                    {venta.numero_comprobante && venta.serie_comprobante ? (
                      <Button onClick={() => handleDescargarComprobante(venta)} size="sm" variant="default">
                        <Download className="mr-2 h-4 w-4" />
                        Descargar {venta.tipo_comprobante === "factura" ? "Factura" : "Boleta"}
                      </Button>
                    ) : (
                      <Button onClick={() => handleVerDetalle(venta.id)} size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Detalle
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DetalleVentaDialog open={dialogOpen} ventaId={selectedVentaId} onClose={() => setDialogOpen(false)} />
    </div>
  )
}
