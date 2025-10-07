"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Categoria {
  id: string
  nombre: string
}

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    stock_minimo: "",
    sku: "",
    tienda: "",
    unidad_medida: "unidad",
    categoria_id: "default", // Updated default value
  })

  useEffect(() => {
    loadData()
  }, [params.id])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Cargar categorías
      const { data: categoriasData } = await supabase.from("categorias").select("*").order("nombre")
      setCategorias(categoriasData || [])

      // Cargar producto
      const { data: producto, error } = await supabase.from("productos").select("*").eq("id", params.id).single()

      if (error) throw error

      if (producto) {
        setFormData({
          nombre: producto.nombre || "",
          descripcion: producto.descripcion || "",
          precio: producto.precio?.toString() || "",
          stock: producto.stock?.toString() || "",
          stock_minimo: producto.stock_minimo?.toString() || "",
          sku: producto.sku || "",
          tienda: producto.tienda || "",
          unidad_medida: producto.unidad_medida || "unidad",
          categoria_id: producto.categoria_id || "default", // Updated default value
        })
      }
    } catch (error) {
      console.error("[v0] Error cargando datos:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar el producto",
        variant: "destructive",
      })
      router.push("/inventario")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("productos")
        .update({
          nombre: formData.nombre,
          descripcion: formData.descripcion || null,
          precio: Number.parseFloat(formData.precio) || 0,
          stock: Number.parseFloat(formData.stock) || 0,
          stock_minimo: Number.parseFloat(formData.stock_minimo) || 0,
          sku: formData.sku || null,
          tienda: formData.tienda || null,
          unidad_medida: formData.unidad_medida,
          categoria_id: formData.categoria_id || null,
        })
        .eq("id", params.id)

      if (error) throw error

      toast({
        title: "Producto actualizado",
        description: "Los cambios se guardaron correctamente",
      })

      router.push("/inventario")
    } catch (error) {
      console.error("[v0] Error guardando producto:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button variant="ghost" onClick={() => router.push("/inventario")} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al Inventario
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
          <CardDescription>Modifique los datos del producto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU / Código</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="precio">Precio (S/.)</Label>
                <Input
                  id="precio"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select
                  value={formData.categoria_id}
                  onValueChange={(value) => setFormData({ ...formData, categoria_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Sin categoría</SelectItem> {/* Updated value */}
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Actual</Label>
                <Input
                  id="stock"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unidad_medida">Unidad</Label>
                <Select
                  value={formData.unidad_medida}
                  onValueChange={(value) => setFormData({ ...formData, unidad_medida: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unidad">Unidad</SelectItem>
                    <SelectItem value="caja">Caja</SelectItem>
                    <SelectItem value="paquete">Paquete</SelectItem>
                    <SelectItem value="kg">Kilogramo</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tienda">Tienda</Label>
              <Input
                id="tienda"
                value={formData.tienda}
                onChange={(e) => setFormData({ ...formData, tienda: e.target.value })}
                placeholder="Ej: 3001"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/inventario")}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
