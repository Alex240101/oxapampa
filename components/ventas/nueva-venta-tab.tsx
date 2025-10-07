"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, ShoppingCart, Loader2, Package, DollarSign, FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Producto {
  id: string
  nombre: string
  precio: number
  stock: number
  unidad_medida: string
  sku: string | null
  categoria?: {
    nombre: string
  }
}

interface ItemVenta {
  producto_id: string
  nombre: string
  cantidad: number
  precio_unitario: number
  subtotal: number
  unidad_medida: string
}

export default function NuevaVentaTab() {
  const { toast } = useToast()
  const [productos, setProductos] = useState<Producto[]>([])
  const [items, setItems] = useState<ItemVenta[]>([])
  const [selectedProductoId, setSelectedProductoId] = useState("")
  const [cantidad, setCantidad] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const [clienteNombre, setClienteNombre] = useState("")
  const [clienteTipoDoc, setClienteTipoDoc] = useState("DNI")
  const [clienteNumDoc, setClienteNumDoc] = useState("")
  const [clienteDireccion, setClienteDireccion] = useState("")
  const [clienteEmail, setClienteEmail] = useState("")
  const [tipoComprobante, setTipoComprobante] = useState<"boleta" | "factura">("boleta")
  const [serie, setSerie] = useState("BBB1")

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("productos")
        .select(`
          id, 
          nombre, 
          precio, 
          stock, 
          unidad_medida,
          sku,
          categoria:categorias(nombre)
        `)
        .eq("activa", true)
        .gt("stock", 0)
        .order("nombre")

      if (error) {
        console.error("[v0] Error cargando productos:", error)
        throw error
      }
      setProductos(data || [])
    } catch (error) {
      console.error("[v0] Error cargando productos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    }
  }

  const handleAddItem = () => {
    const cantidadNum = Number.parseFloat(cantidad)

    if (!selectedProductoId || !cantidad || cantidadNum <= 0 || isNaN(cantidadNum)) {
      toast({
        title: "Error",
        description: "Seleccione un producto y cantidad válida",
        variant: "destructive",
      })
      return
    }

    const producto = productos.find((p) => p.id === selectedProductoId)
    if (!producto) return

    if (cantidadNum > producto.stock) {
      toast({
        title: "Stock Insuficiente",
        description: `Solo hay ${producto.stock} ${producto.unidad_medida} disponibles`,
        variant: "destructive",
      })
      return
    }

    const existingItem = items.find((item) => item.producto_id === selectedProductoId)
    if (existingItem) {
      const nuevaCantidad = existingItem.cantidad + cantidadNum
      if (nuevaCantidad > producto.stock) {
        toast({
          title: "Stock Insuficiente",
          description: `Solo hay ${producto.stock} ${producto.unidad_medida} disponibles`,
          variant: "destructive",
        })
        return
      }
      setItems(
        items.map((item) =>
          item.producto_id === selectedProductoId
            ? {
                ...item,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * item.precio_unitario,
              }
            : item,
        ),
      )
    } else {
      const newItem: ItemVenta = {
        producto_id: producto.id,
        nombre: producto.nombre,
        cantidad: cantidadNum,
        precio_unitario: producto.precio,
        subtotal: cantidadNum * producto.precio,
        unidad_medida: producto.unidad_medida,
      }
      setItems([...items, newItem])
    }

    setSelectedProductoId("")
    setCantidad("1")

    toast({
      title: "Producto agregado",
      description: `${cantidadNum} ${producto.unidad_medida} de ${producto.nombre}`,
    })
  }

  const handleRemoveItem = (producto_id: string) => {
    setItems(items.filter((item) => item.producto_id !== producto_id))
  }

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const calcularTotalUnidades = () => {
    return items.reduce((sum, item) => sum + item.cantidad, 0)
  }

  const calcularSubtotal = () => {
    const total = calcularTotal()
    return total / 1.18 // Subtotal sin IGV
  }

  const calcularIGV = () => {
    const total = calcularTotal()
    const subtotal = total / 1.18
    return total - subtotal // IGV (18%)
  }

  const handleFinalizarVenta = async () => {
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Agregue al menos un producto a la venta",
        variant: "destructive",
      })
      return
    }

    if (!clienteNombre.trim()) {
      toast({
        title: "Error",
        description: "Ingrese el nombre del cliente",
        variant: "destructive",
      })
      return
    }

    if (!serie.trim()) {
      toast({
        title: "Error",
        description: "Seleccione una serie para el comprobante",
        variant: "destructive",
      })
      return
    }

    if (tipoComprobante === "factura") {
      if (!clienteNumDoc || clienteTipoDoc !== "RUC") {
        toast({
          title: "Error",
          description: "Para factura se requiere RUC del cliente",
          variant: "destructive",
        })
        return
      }
      if (!clienteDireccion) {
        toast({
          title: "Error",
          description: "Para factura se requiere dirección fiscal",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const total = calcularTotal()

      const { data: invitadoData, error: invitadoError } = await supabase
        .from("invitados")
        .insert({
          nombre: clienteNombre,
          session_id: `venta_${Date.now()}`,
          tipo_documento: clienteTipoDoc,
          numero_documento: clienteNumDoc || null,
          direccion: clienteDireccion || null,
          email: clienteEmail || null,
        })
        .select()
        .single()

      if (invitadoError) throw invitadoError

      const { data: ventaData, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          invitado_id: invitadoData.id,
          total,
          estado: "completada",
          fecha_venta: new Date().toISOString(),
          datos_contacto: {
            nombre: clienteNombre,
            tipo_documento: clienteTipoDoc,
            numero_documento: clienteNumDoc,
            direccion: clienteDireccion,
            email: clienteEmail,
          },
        })
        .select()
        .single()

      if (ventaError) throw ventaError

      const ventaItems = items.map((item) => ({
        venta_id: ventaData.id,
        producto_id: item.producto_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
      }))

      const { error: itemsError } = await supabase.from("venta_items").insert(ventaItems)

      if (itemsError) throw itemsError

      for (const item of items) {
        const producto = productos.find((p) => p.id === item.producto_id)
        if (producto) {
          const nuevoStock = producto.stock - item.cantidad
          const { error: stockError } = await supabase
            .from("productos")
            .update({
              stock: nuevoStock,
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.producto_id)

          if (stockError) throw stockError
        }
      }

      console.log("[v0] Generando comprobante electrónico...")

      try {
        const comprobanteResponse = await fetch("/api/nubefact/generar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            venta_id: ventaData.id,
            tipo_comprobante: tipoComprobante,
            serie: serie,
            cliente: {
              nombre: clienteNombre,
              tipo_documento: clienteTipoDoc,
              numero_documento: clienteNumDoc || "00000000",
              direccion: clienteDireccion || "Lima, Perú",
              email: clienteEmail || "",
            },
          }),
        })

        const comprobanteData = await comprobanteResponse.json()

        if (!comprobanteResponse.ok) {
          console.error("[v0] Error generando comprobante:", comprobanteData)
          toast({
            title: "Venta Registrada",
            description: `Venta registrada pero hubo un error al generar el comprobante: ${comprobanteData.detalles || comprobanteData.error}`,
            variant: "destructive",
          })
        } else {
          console.log("[v0] Comprobante generado:", comprobanteData)
          toast({
            title: "¡Venta Completada!",
            description: `${tipoComprobante === "factura" ? "Factura" : "Boleta"} ${comprobanteData.comprobante.serie}-${comprobanteData.comprobante.numero} generada exitosamente`,
          })
        }
      } catch (comprobanteError) {
        console.error("[v0] Error al generar comprobante:", comprobanteError)
        toast({
          title: "Venta Registrada",
          description: "Venta registrada pero hubo un error al generar el comprobante electrónico",
          variant: "destructive",
        })
      }

      setItems([])
      setClienteNombre("")
      setClienteTipoDoc("DNI")
      setClienteNumDoc("")
      setClienteDireccion("")
      setClienteEmail("")
      setTipoComprobante("boleta")
      setSerie("BBB1")
      loadProductos()
    } catch (error) {
      console.error("[v0] Error registrando venta:", error)
      toast({
        title: "Error",
        description: "No se pudo registrar la venta. Intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedProducto = productos.find((p) => p.id === selectedProductoId)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5" />
              Agregar Productos
            </CardTitle>
            <CardDescription>Seleccione productos y cantidades para la venta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-2">
                <Label>Producto</Label>
                <Select value={selectedProductoId} onValueChange={setSelectedProductoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {productos.map((producto) => (
                      <SelectItem key={producto.id} value={producto.id}>
                        <div className="flex items-center justify-between gap-2">
                          <span>{producto.nombre}</span>
                          <span className="text-xs text-muted-foreground">
                            S/. {producto.precio.toFixed(2)} | Stock: {producto.stock} {producto.unidad_medida}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProducto && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="secondary">SKU: {selectedProducto.sku || "N/A"}</Badge>
                    <Badge variant="outline">{selectedProducto.categoria?.nombre || "Sin categoría"}</Badge>
                    <Badge variant="outline">
                      Stock: {selectedProducto.stock} {selectedProducto.unidad_medida}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Cantidad {selectedProducto && `(${selectedProducto.unidad_medida})`}</Label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="1.00"
                />
              </div>
            </div>
            <Button onClick={handleAddItem} className="w-full" size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Agregar Producto
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Productos en la Venta</CardTitle>
            <CardDescription>
              {items.length} {items.length === 1 ? "producto" : "productos"} agregados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ShoppingCart className="mb-4 h-16 w-16 opacity-20" />
                <p className="text-lg font-medium">Carrito vacío</p>
                <p className="text-sm">Agregue productos para comenzar la venta</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.producto_id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4 transition-colors hover:bg-muted"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.cantidad} {item.unidad_medida} × S/. {item.precio_unitario.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-foreground">S/. {item.subtotal.toFixed(2)}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.producto_id)}
                        className="hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Datos del Cliente</CardTitle>
            <CardDescription>Complete la información para generar el comprobante electrónico</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo de Comprobante *</Label>
                <Select
                  value={tipoComprobante}
                  onValueChange={(value: "boleta" | "factura") => {
                    setTipoComprobante(value)
                    if (value === "factura") {
                      setClienteTipoDoc("RUC")
                      setSerie("FFF1")
                    } else {
                      setClienteTipoDoc("DNI")
                      setSerie("BBB1")
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="boleta">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Boleta de Venta
                      </div>
                    </SelectItem>
                    <SelectItem value="factura">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Factura
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Serie *</Label>
                <Select value={serie} onValueChange={setSerie}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoComprobante === "factura" ? (
                      <SelectItem value="FFF1">FFF1</SelectItem>
                    ) : (
                      <SelectItem value="BBB1">BBB1</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Serie configurada en su cuenta de Nubefact</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nombre / Razón Social *</Label>
              <Input
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
                placeholder="Nombre completo o razón social"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo Doc. {tipoComprobante === "factura" && "*"}</Label>
                <Select value={clienteTipoDoc} onValueChange={setClienteTipoDoc}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="RUC">RUC</SelectItem>
                    <SelectItem value="CE">CE</SelectItem>
                    <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Número {tipoComprobante === "factura" && "*"}</Label>
                <Input
                  value={clienteNumDoc}
                  onChange={(e) => setClienteNumDoc(e.target.value)}
                  placeholder={clienteTipoDoc === "RUC" ? "20..." : "12345678"}
                  maxLength={clienteTipoDoc === "RUC" ? 11 : 8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dirección {tipoComprobante === "factura" && "*"}</Label>
              <Input
                value={clienteDireccion}
                onChange={(e) => setClienteDireccion(e.target.value)}
                placeholder="Dirección fiscal"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={clienteEmail}
                onChange={(e) => setClienteEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5" />
              Resumen de Venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Productos:</span>
                <span className="font-medium text-foreground">{items.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Unidades totales:</span>
                <span className="font-medium text-foreground">{calcularTotalUnidades().toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-medium text-foreground">S/. {calcularSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IGV (18%):</span>
                  <span className="font-medium text-foreground">S/. {calcularIGV().toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-foreground">Total:</span>
                  <span className="text-3xl font-bold text-primary">S/. {calcularTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={handleFinalizarVenta}
              disabled={isLoading || items.length === 0}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Finalizar Venta
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
