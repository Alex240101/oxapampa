"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Package, Upload, Download, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { parseExcelFile, validateExcelData, exportToExcel } from "@/lib/excel-utils"
import { ImportProgressDialog } from "./import-progress-dialog"

interface Producto {
  id: string
  modelo: string | null
  nombre: string
  descripcion: string | null
  precio: number
  stock: number
  stock_minimo: number | null
  categoria: string | null
  unidad: string | null
  created_at: string
  updated_at: string
  tienda: string | null
}

interface ProductosTabProps {
  onProductosChange?: (total: number) => void
}

export default function ProductosTab({ onProductosChange }: ProductosTabProps) {
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [productos, setProductos] = useState<Producto[]>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 50

  const [importProgress, setImportProgress] = useState({
    show: false,
    progress: 0,
    currentItem: "",
    processedCount: 0,
    totalCount: 0,
    estimatedTime: "Calculando...",
  })

  const loadProductos = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("productos").select("*").order("nombre")

      if (error) throw error
      setProductos(data || [])
      setFilteredProductos(data || [])
      if (onProductosChange) {
        onProductosChange(data?.length || 0)
      }
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

  useEffect(() => {
    loadProductos()

    const supabase = createClient()
    const channel = supabase
      .channel("productos-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "productos" }, (payload) => {
        loadProductos()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  useEffect(() => {
    const filtered = productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.modelo?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredProductos(filtered)
    setCurrentPage(1)
  }, [searchTerm, productos])

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Archivo inválido",
        description: "Por favor seleccione un archivo Excel (.xlsx o .xls)",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)

    try {
      const excelData = await parseExcelFile(file)

      if (excelData.length === 0) {
        toast({
          title: "Archivo vacío",
          description: "El archivo Excel no contiene datos",
          variant: "destructive",
        })
        setIsImporting(false)
        return
      }

      const { valid, errors } = validateExcelData(excelData)

      if (errors.length > 0) {
        toast({
          title: "Errores de validación",
          description: `Se encontraron ${errors.length} errores. Revise que la columna "Descripcion" tenga datos en todas las filas.`,
          variant: "destructive",
        })
        console.error("[v0] Errores de validación:", errors.slice(0, 10))
        setIsImporting(false)
        return
      }

      if (valid.length === 0) {
        toast({
          title: "Sin datos válidos",
          description: "No se encontraron productos válidos para importar",
          variant: "destructive",
        })
        setIsImporting(false)
        return
      }

      setImportProgress({
        show: true,
        progress: 0,
        currentItem: "Preparando importación...",
        processedCount: 0,
        totalCount: valid.length,
        estimatedTime: "Calculando...",
      })

      const supabase = createClient()

      let defaultCategoriaId: string | null = null
      const { data: categoriaData } = await supabase
        .from("categorias")
        .select("id")
        .eq("nombre", "Importados")
        .maybeSingle()

      if (categoriaData) {
        defaultCategoriaId = categoriaData.id
      } else {
        const { data: newCategoria } = await supabase
          .from("categorias")
          .insert({ nombre: "Importados", descripcion: "Productos importados desde Excel", activa: true })
          .select("id")
          .single()

        if (newCategoria) {
          defaultCategoriaId = newCategoria.id
        }
      }

      let importados = 0
      let actualizados = 0
      let erroresImport = 0
      const startTime = Date.now()

      const BATCH_SIZE = 10
      for (let i = 0; i < valid.length; i += BATCH_SIZE) {
        const batch = valid.slice(i, i + BATCH_SIZE)
        const batchPromises = batch.map(async (producto, batchIndex) => {
          const currentIndex = i + batchIndex
          const elapsedTime = (Date.now() - startTime) / 1000
          const avgTimePerItem = elapsedTime / (currentIndex + 1)
          const remainingItems = valid.length - currentIndex - 1
          const estimatedSeconds = Math.ceil(avgTimePerItem * remainingItems)
          const estimatedMinutes = Math.floor(estimatedSeconds / 60)
          const estimatedSecondsRemainder = estimatedSeconds % 60

          setImportProgress({
            show: true,
            progress: ((currentIndex + 1) / valid.length) * 100,
            currentItem: producto.nombre,
            processedCount: currentIndex + 1,
            totalCount: valid.length,
            estimatedTime:
              estimatedMinutes > 0
                ? `${estimatedMinutes}m ${estimatedSecondsRemainder}s`
                : `${estimatedSecondsRemainder}s`,
          })

          try {
            const { data: existente, error: searchError } = await supabase
              .from("productos")
              .select("id")
              .eq("modelo", producto.modelo)
              .maybeSingle()

            if (searchError) {
              console.error(`[v0] Error buscando producto ${producto.modelo}:`, searchError)
              erroresImport++
              return
            }

            if (existente) {
              const { error } = await supabase
                .from("productos")
                .update({
                  nombre: producto.nombre,
                  stock: producto.stock,
                  stock_minimo: producto.stock_minimo,
                  tienda: producto.tienda,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", existente.id)

              if (error) {
                console.error(`[v0] Error actualizando producto ${producto.modelo}:`, error)
                erroresImport++
              } else {
                actualizados++
              }
            } else {
              const { error } = await supabase.from("productos").insert({
                modelo: producto.modelo,
                nombre: producto.nombre,
                stock: producto.stock,
                stock_minimo: producto.stock_minimo,
                tienda: producto.tienda,
                categoria_id: defaultCategoriaId,
                precio: 0,
                precio_compra: 0,
                unidad_medida: "Unidad",
                activa: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })

              if (error) {
                console.error(`[v0] Error creando producto ${producto.modelo}:`, error)
                erroresImport++
              } else {
                importados++
              }
            }
          } catch (error) {
            console.error(`[v0] Error procesando producto ${producto.modelo}:`, error)
            erroresImport++
          }
        })

        await Promise.all(batchPromises)
      }

      setImportProgress({
        show: false,
        progress: 0,
        currentItem: "",
        processedCount: 0,
        totalCount: 0,
        estimatedTime: "",
      })

      toast({
        title: "Importación completada",
        description: `${importados} productos nuevos, ${actualizados} actualizados${erroresImport > 0 ? `, ${erroresImport} con errores` : ""}. Los productos importados tienen precio S/. 0.00 - edítalos para agregar precios.`,
      })

      await loadProductos()
    } catch (error) {
      console.error("[v0] Error importando archivo:", error)
      toast({
        title: "Error",
        description: "No se pudo importar el archivo Excel. Verifique el formato.",
        variant: "destructive",
      })
      setImportProgress({
        show: false,
        progress: 0,
        currentItem: "",
        processedCount: 0,
        totalCount: 0,
        estimatedTime: "",
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleExport = async () => {
    setIsExporting(true)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("productos").select("*").order("nombre")

      if (error) throw error

      if (!data || data.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay productos para exportar",
          variant: "destructive",
        })
        return
      }

      const fecha = new Date().toISOString().split("T")[0]
      exportToExcel(data, `productos_${fecha}.xlsx`)

      toast({
        title: "Exportación exitosa",
        description: `Se exportaron ${data.length} productos`,
      })
    } catch (error) {
      console.error("[v0] Error exportando productos:", error)
      toast({
        title: "Error",
        description: "No se pudo exportar el archivo Excel",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este producto?")) return

    try {
      const supabase = createClient()

      const { data: producto, error: fetchError } = await supabase
        .from("productos")
        .select("id, nombre")
        .eq("id", id)
        .single()

      if (fetchError || !producto) {
        toast({
          title: "Error",
          description: "No se encontró el producto",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("productos").delete().eq("id", id)

      if (error) {
        if (error.code === "23503") {
          toast({
            title: "No se puede eliminar",
            description: "Este producto está siendo usado en otras tablas (movimientos, ventas, etc.)",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: `No se pudo eliminar el producto: ${error.message}`,
            variant: "destructive",
          })
        }
        return
      }

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado al eliminar el producto",
        variant: "destructive",
      })
    }
  }

  const totalPages = Math.ceil(filteredProductos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentProducts = filteredProductos.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando productos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ImportProgressDialog
        open={importProgress.show}
        progress={importProgress.progress}
        currentItem={importProgress.currentItem}
        processedCount={importProgress.processedCount}
        totalCount={importProgress.totalCount}
        estimatedTimeRemaining={importProgress.estimatedTime}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar productos por nombre, descripción o modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => router.push("/inventario/productos/nuevo")}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleImportClick} disabled={isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Importar Excel
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleExport} disabled={isExporting || productos.length === 0}>
                {isExporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Excel
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredProductos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron productos" : "No hay productos registrados"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Mostrando {startIndex + 1}-{Math.min(endIndex, filteredProductos.length)} de{" "}
                  {filteredProductos.length} productos
                  {searchTerm && " (filtrados)"}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentProducts.map((producto) => (
              <Card key={producto.id} className="group hover:border-primary transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                      {producto.categoria && <CardDescription>{producto.categoria}</CardDescription>}
                      {producto.modelo && (
                        <p className="text-xs text-muted-foreground mt-1">Modelo: {producto.modelo}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => router.push(`/inventario/productos/${producto.id}`)}
                        className="h-8 w-8"
                        title="Editar producto"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(producto.id)}
                        className="h-8 w-8 hover:text-destructive"
                        title="Eliminar producto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {producto.descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{producto.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <p className="text-2xl font-bold">S/. {Number(producto.precio).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Stock</p>
                      <p
                        className={`text-lg font-semibold ${
                          Number(producto.stock) > 10
                            ? "text-chart-2"
                            : Number(producto.stock) > 0
                              ? "text-chart-3"
                              : "text-destructive"
                        }`}
                      >
                        {Number(producto.stock)} {producto.unidad || "Unidad"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pt-4">
            <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <span className="text-sm font-medium px-4">
              Página {currentPage} de {totalPages}
            </span>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
