"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ThemeToggle } from "@/components/theme-toggle"

interface Categoria {
  id: string
  nombre: string
}

const UNIDADES_MEDIDA = ["Unidad", "Metro", "Kilogramo", "Litro", "Caja", "Paquete", "Rollo", "Bolsa", "Galón", "Pieza"]

export default function NuevoProductoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    sku: "",
    codigo_barras: "",
    categoria_id: "",
    marca: "",
    modelo: "",
    ubicacion: "",
    stock: "",
    stock_minimo: "",
    unidad_medida: "Unidad",
    proveedor: "",
    precio_compra: "",
    precio_venta: "",
  })

  useEffect(() => {
    const hasSession = document.cookie.includes("admin_session")
    if (!hasSession) {
      router.push("/login")
      return
    }
    loadCategorias()
  }, [router])

  const loadCategorias = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("categorias").select("id, nombre").order("nombre")

      if (error) throw error
      setCategorias(data || [])
    } catch (error) {
      console.error("[v0] Error cargando categorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.precio_venta || !formData.stock) {
      toast({
        title: "Error",
        description: "Complete los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("productos").insert({
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        sku: formData.sku || null,
        codigo_barras: formData.codigo_barras || null,
        categoria_id: formData.categoria_id || null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        ubicacion: formData.ubicacion || null,
        stock: Number.parseFloat(formData.stock),
        stock_minimo: formData.stock_minimo ? Number.parseFloat(formData.stock_minimo) : 0,
        unidad_medida: formData.unidad_medida,
        proveedor: formData.proveedor || null,
        precio_compra: formData.precio_compra ? Number.parseFloat(formData.precio_compra) : null,
        precio: Number.parseFloat(formData.precio_venta),
        activa: true,
      })

      if (error) throw error

      toast({
        title: "Producto creado",
        description: "El producto se creó correctamente",
      })
      router.push("/inventario")
    } catch (error) {
      console.error("[v0] Error creando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calcularMargen = () => {
    const compra = Number.parseFloat(formData.precio_compra) || 0
    const venta = Number.parseFloat(formData.precio_venta) || 0
    if (compra > 0 && venta > 0) {
      return (((venta - compra) / compra) * 100).toFixed(2)
    }
    return "0.00"
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Ilumitek</h1>
              <p className="text-xs text-muted-foreground">Nuevo Producto</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/inventario")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Inventario
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos principales del producto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Cable eléctrico 2.5mm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                  >
                    <SelectTrigger id="categoria">
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Ej: Indeco"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ej: THW-90"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identificación */}
          <Card>
            <CardHeader>
              <CardTitle>Identificación y Ubicación</CardTitle>
              <CardDescription>Códigos y ubicación en almacén</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ej: CAB-25-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo_barras">Código de Barras</Label>
                  <Input
                    id="codigo_barras"
                    value={formData.codigo_barras}
                    onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                    placeholder="Ej: 7501234567890"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <Input
                    id="ubicacion"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    placeholder="Ej: Pasillo A-3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventario */}
          <Card>
            <CardHeader>
              <CardTitle>Control de Inventario</CardTitle>
              <CardDescription>Stock y unidades de medida</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Actual *</Label>
                  <Input
                    id="stock"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="Ej: 100 o 15.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                  <Input
                    id="stock_minimo"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    placeholder="Ej: 10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidad_medida">Unidad de Medida *</Label>
                  <Select
                    value={formData.unidad_medida}
                    onValueChange={(value) => setFormData({ ...formData, unidad_medida: value })}
                  >
                    <SelectTrigger id="unidad_medida">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_MEDIDA.map((unidad) => (
                        <SelectItem key={unidad} value={unidad}>
                          {unidad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Nota:</strong> Para productos que se venden por peso o longitud (cables, tubos, etc.), puede
                  ingresar cantidades decimales como 1.5, 2.75, etc.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle>Precios y Proveedor</CardTitle>
              <CardDescription>Costos y márgenes de ganancia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="precio_compra">Precio de Compra</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/.</span>
                    <Input
                      id="precio_compra"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_compra}
                      onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio_venta">Precio de Venta *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">S/.</span>
                    <Input
                      id="precio_venta"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_venta}
                      onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                      className="pl-10"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Margen de Ganancia</Label>
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm font-semibold">
                    {calcularMargen()}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/inventario")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Producto
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
