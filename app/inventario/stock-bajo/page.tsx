"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package, Calendar, ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface ProductoVencer {
  id: string
  modelo: string | null
  nombre: string
  stock: number
  stock_minimo: number | null
  fecha_vencimiento: string | null
  categoria_id: string | null
  precio: number
  unidad_medida: string | null
}

export default function StockBajoPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [productosStockBajo, setProductosStockBajo] = useState<ProductoVencer[]>([])
  const [productosVenciendo, setProductosVenciendo] = useState<ProductoVencer[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      const supabase = createClient()

      const { data: stockBajo, error: stockError } = await supabase
        .from("productos")
        .select("*")
        .not("stock_minimo", "is", null)
        .order("stock", { ascending: true })

      if (stockError) {
        console.error("[v0] Error cargando productos con stock bajo:", stockError)
      }

      // Filter products where stock <= stock_minimo
      const productosFiltrados = (stockBajo || []).filter((p) => p.stock_minimo !== null && p.stock <= p.stock_minimo)

      const hoy = new Date()
      const treintaDias = new Date()
      treintaDias.setDate(hoy.getDate() + 30)

      const { data: venciendo, error: vencimientoError } = await supabase
        .from("productos")
        .select("*")
        .not("fecha_vencimiento", "is", null)
        .lte("fecha_vencimiento", treintaDias.toISOString().split("T")[0])
        .gte("fecha_vencimiento", hoy.toISOString().split("T")[0])
        .order("fecha_vencimiento", { ascending: true })

      if (vencimientoError) {
        console.error("[v0] Error cargando productos venciendo:", vencimientoError)
      }

      setProductosStockBajo(productosFiltrados)
      setProductosVenciendo(venciendo || [])
    } catch (error) {
      console.error("[v0] Error cargando productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getDiasRestantes = (fechaVencimiento: string) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    return diferencia
  }

  const getUrgenciaBadge = (dias: number) => {
    if (dias <= 7) {
      return <Badge variant="destructive">Urgente - {dias} días</Badge>
    } else if (dias <= 15) {
      return <Badge className="bg-orange-500">Pronto - {dias} días</Badge>
    } else {
      return <Badge variant="secondary">{dias} días</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Alertas de Stock Bajo</h1>
          <p className="text-muted-foreground">Productos que necesitan reabastecimiento urgente</p>
        </div>
      </div>

      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-xl">Stock Bajo - Acción Requerida</CardTitle>
          </div>
          <CardDescription>
            Productos con stock igual o menor al stock mínimo ({productosStockBajo.length})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productosStockBajo.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">¡Excelente! Stock en buen estado</h3>
              <p className="text-muted-foreground">
                No hay productos con stock bajo. Todos los productos tienen stock suficiente.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {productosStockBajo.map((producto) => {
                const deficit = Math.max(0, (producto.stock_minimo || 0) - producto.stock)
                const porcentaje = producto.stock_minimo
                  ? Math.round((producto.stock / producto.stock_minimo) * 100)
                  : 0

                return (
                  <Card
                    key={producto.id}
                    className="cursor-pointer hover:border-primary transition-colors border-destructive/30"
                    onClick={() => router.push(`/inventario/productos/${producto.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{producto.nombre}</h3>
                          {producto.modelo && (
                            <p className="text-sm text-muted-foreground">Modelo: {producto.modelo}</p>
                          )}
                        </div>
                        <Badge variant="destructive" className="text-base px-3 py-1">
                          {producto.stock} / {producto.stock_minimo || 0}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Precio: S/. {Number(producto.precio).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground">{producto.unidad_medida || "Unidad"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                porcentaje <= 25
                                  ? "bg-destructive"
                                  : porcentaje <= 50
                                    ? "bg-orange-500"
                                    : "bg-yellow-500"
                              }`}
                              style={{ width: `${Math.min(porcentaje, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground min-w-[3rem] text-right">
                            {porcentaje}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-sm text-muted-foreground">
                            {producto.stock === 0 ? "¡AGOTADO!" : `Faltan ${deficit} unidades`}
                          </span>
                          <span className="text-sm font-semibold text-destructive">Reabastecer urgente</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {productosVenciendo.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              <CardTitle>Información Adicional: Próximos a Vencer</CardTitle>
            </div>
            <CardDescription>
              Productos que vencen en los próximos 30 días ({productosVenciendo.length})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productosVenciendo.map((producto) => {
                const diasRestantes = getDiasRestantes(producto.fecha_vencimiento!)
                return (
                  <Card
                    key={producto.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => router.push(`/inventario/productos/${producto.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold">{producto.nombre}</h3>
                          {producto.modelo && (
                            <p className="text-xs text-muted-foreground">Modelo: {producto.modelo}</p>
                          )}
                        </div>
                        {getUrgenciaBadge(diasRestantes)}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Vence: {new Date(producto.fecha_vencimiento!).toLocaleDateString("es-PE")}
                        </span>
                        <span className="text-muted-foreground">
                          Stock: {producto.stock} {producto.unidad_medida || "Unidad"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
