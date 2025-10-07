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
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  activa: boolean
}

interface CategoriaDialogProps {
  open: boolean
  categoria: Categoria | null
  onClose: (refresh: boolean) => void
}

export default function CategoriaDialog({ open, categoria, onClose }: CategoriaDialogProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  })

  useEffect(() => {
    if (open) {
      if (categoria) {
        setFormData({
          nombre: categoria.nombre,
          descripcion: categoria.descripcion || "",
        })
      } else {
        setFormData({
          nombre: "",
          descripcion: "",
        })
      }
    }
  }, [open, categoria])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const dataToSave = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || null,
        activa: true,
        updated_at: new Date().toISOString(),
      }

      if (categoria) {
        // Actualizar
        const { error } = await supabase.from("categorias").update(dataToSave).eq("id", categoria.id)

        if (error) throw error

        toast({
          title: "Categoría actualizada",
          description: "La categoría se actualizó correctamente",
        })
      } else {
        // Crear
        const { error } = await supabase.from("categorias").insert({
          ...dataToSave,
          created_at: new Date().toISOString(),
        })

        if (error) throw error

        toast({
          title: "Categoría creada",
          description: "La categoría se creó correctamente",
        })
      }

      onClose(true)
    } catch (error) {
      console.error("[v0] Error guardando categoría:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar la categoría",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={() => onClose(false)}>
      <DialogContent className="border-slate-700 bg-slate-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{categoria ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {categoria ? "Modifique los datos de la categoría" : "Complete los datos de la nueva categoría"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                className="border-slate-600 bg-slate-700/50 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="border-slate-600 bg-slate-700/50 text-white"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
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
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
