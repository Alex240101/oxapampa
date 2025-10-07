"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash2, Tag } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import CategoriaDialog from "./categoria-dialog"

interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  activa: boolean
}

export default function CategoriasTab() {
  const { toast } = useToast()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [filteredCategorias, setFilteredCategorias] = useState<Categoria[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)

  const loadCategorias = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("categorias").select("*").order("nombre")

      if (error) throw error
      setCategorias(data || [])
      setFilteredCategorias(data || [])
    } catch (error) {
      console.error("[v0] Error cargando categorías:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCategorias()
  }, [])

  useEffect(() => {
    const filtered = categorias.filter(
      (categoria) =>
        categoria.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categoria.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredCategorias(filtered)
  }, [searchTerm, categorias])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta categoría?")) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from("categorias").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Categoría eliminada",
        description: "La categoría se eliminó correctamente",
      })
      loadCategorias()
    } catch (error) {
      console.error("[v0] Error eliminando categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedCategoria(null)
    setDialogOpen(true)
  }

  const handleDialogClose = (refresh: boolean) => {
    setDialogOpen(false)
    setSelectedCategoria(null)
    if (refresh) {
      loadCategorias()
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Cargando categorías...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y acciones */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Categoría
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de categorías */}
      {filteredCategorias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {searchTerm ? "No se encontraron categorías" : "No hay categorías registradas"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategorias.map((categoria) => (
            <Card key={categoria.id} className="group hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{categoria.nombre}</CardTitle>
                      <CardDescription>{categoria.activa ? "Activa" : "Inactiva"}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => handleEdit(categoria)} className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(categoria.id)}
                      className="h-8 w-8 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {categoria.descripcion && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">{categoria.descripcion}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <CategoriaDialog open={dialogOpen} categoria={selectedCategoria} onClose={handleDialogClose} />
    </div>
  )
}
