"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  medidas: string | null
  categoria_id: string | null
  activa: boolean
  sku?: string | null
  codigo_barras?: string | null
  unidad_medida?: string | null
  proveedor?: string | null
  precio_compra?: number | null
  stock_minimo?: number | null
  ubicacion_almacen?: string | null
  marca?: string | null
  modelo?: string | null
  fecha_vencimiento?: string | null
}

interface Categoria {
  id: string
  nombre: string
}

interface ProductoDialogProps {
  open: boolean
  producto: Producto | null
  onClose: (refresh: boolean) => void
}

export default function ProductoDialog({ open, producto, onClose }: ProductoDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    medidas: "",
    categoria_id: "",
    sku: "",
    codigo_barras: "",
    unidad_medida: "Unidad",
    proveedor: "",
    precio_compra: "",
    stock_minimo: "5",
    ubicacion_almacen: "",
    marca: "",
    modelo: "",
    activa: true,
    fecha_vencimiento: "",
  })

  useEffect(() => {
    if (open) {
      loadCategorias()
      if (producto) {
        setFormData({
          nombre: producto.nombre,
          descripcion: producto.descripcion || "",
          precio: producto.precio.toString(),
          stock: producto.stock.toString(),
          medidas: producto.medidas || "",
          categoria_id: producto.categoria_id || "",
          sku: producto.sku || "",
          codigo_barras: producto.codigo_barras || "",
          unidad_medida: producto.unidad_medida || "Unidad",
          proveedor: producto.proveedor || "",
          precio_compra: producto.precio_compra?.toString() || "",
          stock_minimo: producto.stock_minimo?.toString() || "5",
          ubicacion_almacen: producto.ubicacion_almacen || "",
          marca: producto.marca || "",
          modelo: producto.modelo || "",
          activa: producto.activa || true,
          fecha_vencimiento: producto.fecha_vencimiento || "",
        })
      } else {
        setFormData({
          nombre: "",
          descripcion: "",
          precio: "",
          stock: "",
          medidas: "",
          categoria_id: "",
          sku: "",
          codigo_barras: "",
          unidad_medida: "Unidad",
          proveedor: "",
          precio_compra: "",
          stock_minimo: "5",
          ubicacion_almacen: "",
          marca: "",
          modelo: "",
          activa: true,
          fecha_vencimiento: "",
        })
      }
    }
  }, [open, producto])

  const loadCategorias = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("categorias").select("id, nombre").order("nombre")

      if (error) throw error
      setCategorias(data || [])
    } catch (error) {
      console.error("[v0] Error cargando categorías:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const dataToSave = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        precio: Number.parseFloat(formData.precio),
        stock: Number.parseInt(formData.stock),
        medidas: formData.medidas || null,
        categoria_id: formData.categoria_id || null,
        sku: formData.sku || null,
        codigo_barras: formData.codigo_barras || null,
        unidad_medida: formData.unidad_medida,
        proveedor: formData.proveedor || null,
        precio_compra: formData.precio_compra ? Number.parseFloat(formData.precio_compra) : null,
        stock_minimo: Number.parseInt(formData.stock_minimo),
        ubicacion_almacen: formData.ubicacion_almacen || null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        activa: formData.activa,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        updated_at: new Date().toISOString(),
      }

      if (producto) {
        const { error } = await supabase.from("productos").update(dataToSave).eq("id", producto.id)

        if (error) throw error

        toast({
          title: "Producto actualizado",
          description: "El producto se actualizó correctamente",
        })
      } else {
        const { error } = await supabase.from("productos").insert({
          ...dataToSave,
          created_at: new Date().toISOString(),
        })

        if (error) throw error

        toast({
          title: "Producto creado",
          description: "El producto se creó correctamente",
        })
      }

      onClose(true)
    } catch (error) {
      console.error("[v0] Error guardando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calcularMargen = () => {
    if (formData.precio_compra && formData.precio) {
      const compra = Number.parseFloat(formData.precio_compra)
      const venta = Number.parseFloat(formData.precio)
      if (compra > 0) {
        const margen = ((venta - compra) / compra) * 100
        return margen.toFixed(2)
      }
    }
    return "0.00"
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="border-slate-700 bg-slate-800 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{producto ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {producto ? "Modifique los datos del producto" : "Complete los datos del nuevo producto"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-amber-500 uppercase tracking-wide">Información Básica</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="nombre">Nombre del Producto *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    placeholder="Ej: Bombilla LED 9W"
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Descripción detallada del producto..."
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria_id}
                      onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                    >
                      <SelectTrigger className="border-slate-600 bg-slate-700/50 text-white">
                        <SelectValue placeholder="Seleccione categoría" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-700 bg-slate-800">
                        {categorias.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id} className="text-white">
                            {cat.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      value={formData.marca}
                      onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                      placeholder="Ej: Philips"
                      className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wide">Identificación</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ej: LED-9W-001"
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="codigo_barras">Código de Barras</Label>
                  <Input
                    id="codigo_barras"
                    value={formData.codigo_barras}
                    onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                    placeholder="Ej: 7501234567890"
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                    placeholder="Ej: X-9000"
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ubicacion_almacen">Ubicación en Almacén</Label>
                  <Input
                    id="ubicacion_almacen"
                    value={formData.ubicacion_almacen}
                    onChange={(e) => setFormData({ ...formData, ubicacion_almacen: e.target.value })}
                    placeholder="Ej: Pasillo A, Estante 3"
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-green-500 uppercase tracking-wide">Inventario</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock Actual *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    className="border-slate-600 bg-slate-700/50 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
                  <Input
                    id="stock_minimo"
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                    required
                    className="border-slate-600 bg-slate-700/50 text-white"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unidad_medida">Unidad de Medida *</Label>
                  <Select
                    value={formData.unidad_medida}
                    onValueChange={(value) => setFormData({ ...formData, unidad_medida: value })}
                  >
                    <SelectTrigger className="border-slate-600 bg-slate-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-700 bg-slate-800">
                      <SelectItem value="Unidad" className="text-white">
                        Unidad
                      </SelectItem>
                      <SelectItem value="Caja" className="text-white">
                        Caja
                      </SelectItem>
                      <SelectItem value="Paquete" className="text-white">
                        Paquete
                      </SelectItem>
                      <SelectItem value="Metro" className="text-white">
                        Metro
                      </SelectItem>
                      <SelectItem value="Kilogramo" className="text-white">
                        Kilogramo
                      </SelectItem>
                      <SelectItem value="Litro" className="text-white">
                        Litro
                      </SelectItem>
                      <SelectItem value="Rollo" className="text-white">
                        Rollo
                      </SelectItem>
                      <SelectItem value="Juego" className="text-white">
                        Juego
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="medidas">Medidas / Especificaciones</Label>
                  <Input
                    id="medidas"
                    value={formData.medidas}
                    onChange={(e) => setFormData({ ...formData, medidas: e.target.value })}
                    placeholder="Ej: 10x20cm, 5kg, 220V, etc."
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                    className="border-slate-600 bg-slate-700/50 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-purple-500 uppercase tracking-wide">Precios y Proveedor</h3>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    placeholder="Nombre del proveedor"
                    className="border-slate-600 bg-slate-700/50 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="precio_compra">Precio de Compra (S/.)</Label>
                    <Input
                      id="precio_compra"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_compra}
                      onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                      className="border-slate-600 bg-slate-700/50 text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="precio">Precio de Venta (S/.) *</Label>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      required
                      className="border-slate-600 bg-slate-700/50 text-white"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Margen de Ganancia</Label>
                    <div className="flex h-10 items-center rounded-md border border-slate-600 bg-slate-900/50 px-3 text-green-400 font-semibold">
                      {calcularMargen()}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar Producto"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
